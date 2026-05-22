import fs from 'fs';
import path from 'path';

// Master ordering array for all projects, subgroups, and disciplines
const MASTER_ORDER = [
  // Commissioned Projects hierarchy
  "TWO-STOREY DUPLEX HOUSE_A",
  "TWO-STOREY DUPLEX HOUSE_B",
  "TWO-STOREY DUPLEX HOUSE_C",
  "TWO-STOREY HOUSE_A",
  "TWO-STOREY HOUSE_B",
  "TWO-STOREY HOUSE_C",
  "BUNGALOW HOUSE_A",
  "BUNGALOW HOUSE_B",
  "BUNGALOW HOUSE_C",
  "HOSPITAL",
  "THESIS PROJECT - MALL",
  "THESIS PROJECT - MIXED USED COMPLEX",
  "MINI STORE",
  "SIMPLE HOUSE",
  // Building Information Modeling hierarchy
  "ANVAYA COVE N10",
  "THE LATTICE - ALVEO BLOOM",
  "EVO CITY RETAIL MALL PH2",
  "CIELA AMENITIES",
  "GARDEN COURT RESIDENCES",
  "WeeComm Centre",
  "ePLDT DATA CENTER SITEWIDE",
  // Disciplines hierarchy
  "ARCHITECTURAL DESIGN",
  "STRUCTURAL DESIGN",
  "ELECTRICAL DESIGN",
  "PLUMBING AND SANITARY DESIGN"
];

export interface ProjectImage {
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'youtube';
  isLogo?: boolean;
}

export interface ProjectGroup {
  name: string;
  items: ProjectImage[];
  subGroups: ProjectGroup[];
}

export interface ProjectCategory {
  name: string;
  groups: ProjectGroup[];
  standaloneItems: ProjectImage[];
}

function parseDirectory(dirPath: string, publicDir: string): ProjectGroup {
  const items: ProjectImage[] = [];
  const subGroups: ProjectGroup[] = [];

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    if (file === 'Thumbs.db') continue;
    const fullPath = path.join(dirPath, file);
    const isDir = fs.statSync(fullPath).isDirectory();

    if (isDir) {
      subGroups.push(parseDirectory(fullPath, publicDir));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.txt') {
        const content = fs.readFileSync(fullPath, 'utf8').trim();
        if (content.startsWith('http')) {
          items.push({
            name: file.replace(ext, ''),
            url: content,
            type: 'youtube',
            isLogo: false
          });
        }
      } else if (['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.webm'].includes(ext)) {
        const nameLower = file.toLowerCase();
        let type: ProjectImage['type'] = 'image';
        if (ext === '.pdf') type = 'pdf';
        if (ext === '.mp4' || ext === '.webm') type = 'video';
        
        items.push({
          name: file.replace(ext, ''),
          url: fullPath.replace(publicDir, '').replace(/\\/g, '/'),
          type,
          isLogo: nameLower.includes('title') || nameLower.includes('logo')
        });
      }
    }
  }

  // Sort items: logos first
  items.sort((a, b) => {
    if (a.isLogo && !b.isLogo) return -1;
    if (!a.isLogo && b.isLogo) return 1;
    return a.name.localeCompare(b.name);
  });


  // Sort subgroups
  subGroups.sort((a, b) => {
    const aIndex = MASTER_ORDER.indexOf(a.name);
    const bIndex = MASTER_ORDER.indexOf(b.name);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.name.localeCompare(b.name);
  });

  return {
    name: path.basename(dirPath),
    items,
    subGroups
  };
}

export function getProjects(): ProjectCategory[] {
  const publicDir = path.join(process.cwd(), 'public');
  const projectsDir = path.join(publicDir, 'PROJECT WORKS');
  
  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const categoryFolders = fs.readdirSync(projectsDir).filter(dir => 
    fs.statSync(path.join(projectsDir, dir)).isDirectory()
  );

  const categories: ProjectCategory[] = categoryFolders.map(category => {
    const categoryPath = path.join(projectsDir, category);
    const groups: ProjectGroup[] = [];
    const standaloneItems: ProjectImage[] = [];

    const itemsInDir = fs.readdirSync(categoryPath);
    
    for (const item of itemsInDir) {
      if (item === 'Thumbs.db') continue;
      const fullPath = path.join(categoryPath, item);
      const isDir = fs.statSync(fullPath).isDirectory();
      
      if (isDir) {
        groups.push(parseDirectory(fullPath, publicDir));
      } else {
        const ext = path.extname(item).toLowerCase();
        
        if (ext === '.txt') {
          // Read the txt file to get external URL (e.g. YouTube)
          const content = fs.readFileSync(fullPath, 'utf8').trim();
          if (content.startsWith('http')) {
            standaloneItems.push({
              name: item.replace(ext, ''),
              url: content,
              type: 'youtube',
              isLogo: false
            });
          }
        } else if (['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.webm'].includes(ext)) {
          const nameLower = item.toLowerCase();
          let type: ProjectImage['type'] = 'image';
          if (ext === '.pdf') type = 'pdf';
          if (ext === '.mp4' || ext === '.webm') type = 'video';

          standaloneItems.push({
            name: item.replace(ext, ''),
            url: fullPath.replace(publicDir, '').replace(/\\/g, '/'),
            type,
            isLogo: nameLower.includes('title') || nameLower.includes('logo')
          });
        }
      }
    }

    // Sort top level groups
    groups.sort((a, b) => {
      // Custom order to ensure Commissioned Projects comes before Academic Plates
      if (a.name === "COMISSIONED PROJECTS" && b.name !== "COMISSIONED PROJECTS") return -1;
      if (b.name === "COMISSIONED PROJECTS" && a.name !== "COMISSIONED PROJECTS") return 1;

      // Ensure BIM Family comes last in its specific context
      const aIsBimFamily = a.name.toLowerCase().includes("bim family") || a.name.toLowerCase().includes("bim_family") || a.name.toLowerCase().includes("bimd family") || a.name.toLowerCase().includes("bimd_family");
      const bIsBimFamily = b.name.toLowerCase().includes("bim family") || b.name.toLowerCase().includes("bim_family") || b.name.toLowerCase().includes("bimd family") || b.name.toLowerCase().includes("bimd_family");
      if (aIsBimFamily && !bIsBimFamily) return 1;
      if (!aIsBimFamily && bIsBimFamily) return -1;

      // Apply master custom order
      const aIndex = MASTER_ORDER.indexOf(a.name);
      const bIndex = MASTER_ORDER.indexOf(b.name);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return a.name.localeCompare(b.name);
    });

    return {
      name: category,
      groups,
      standaloneItems
    };
  });

  // Sort categories according to requested order
  const order = [
    "ARCHITECTURAL DESIGN AND LAYOUTS",
    "BUILDING INFORMATION MODELING",
    "PROJECT SITE WALKTHROUGH"
  ];

  categories.sort((a, b) => {
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  return categories;
}
