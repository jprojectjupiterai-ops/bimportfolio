const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, "../public/PROJECT WORKS/BUILDING INFORMATION MODELING");

// We'll recursively search for files that match the requested paths
const targets = [
    {
        project: "ANVAYA COVE N10",
        subdir: "FIRE EXIT STAIRS",
        files: [
            "A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg",
            "A4201-2 - FE-01 SECTION BLOW-UP DETAIL & 3D VIEWS.jpg",
            "RFA-ALP0116-AR-SD-13300-011-00 _2 signedA.png",
            "RFA-ALP0116-AR-SD-13300-011-00 _2 signedB.png"
        ]
    },
    {
        project: "CIELA AMENITIES",
        groups: [
            { subdir: "ADMIN OFFICE & SECURITY", match: "Admin and Security Column Settingout (Baseplates)" },
            { subdir: "GUARDHOUSE", match: "" }, // all 8 files
            { subdir: "MULTI-PURPOSE COURT", files: ["MP_ MULTI-PURPOSE COURT GROUND FLOOR COLUMN SETTING OUT.png", "MP_ MULTI-PURPOSE COURT GROUND FLOOR FRAMING PLAN.png"] },
            { subdir: "SOCIAL AND FUNCTION HALL", files: ["MDCA210050-BIMD-IFC-ISD-AR-GRND-00523.png", "MDCA210050-BIMD-IFC-ISD-AR-RL-00524.png"] }
        ]
    },
    {
        project: "ePLDT DATA CENTER SITEWIDE",
        groups: [
            { subdir: "ELECTRICAL SITEWIDE", match: "" }, // 10 files
            { subdir: "ICT SITEWIDE", match: "" }, // 4 files
            { subdir: "SANITARY SITEWIDE", match: "" } // 8 files
        ]
    },
    {
        project: "EVO CITY RETAIL MALL PH2",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" }, // 4 files
            { subdir: "RETAIL MALL", plansOnly: true } // 7 plans
        ]
    },
    {
        project: "GARDEN COURT RESIDENCES",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" }, // 7 files
            { subdir: "SKY LOUNGE", match: "" } // 3 files
        ]
    },
    {
        project: "THE LATTICE - ALVEO BLOOM",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" }, // 4 files
            { subdir: "RESIDENTIAL", match: "" } // 6 files
        ]
    },
    {
        project: "WeeComm Centre",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" }, // 3 files
            { subdir: "RESIDENTIAL", match: "" } // 7 files
        ]
    }
];

function getFilesRecursively(dir, filesList = []) {
    if (!fs.existsSync(dir)) return filesList;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getFilesRecursively(fullPath, filesList);
        } else {
            // Check if it's an image
            const ext = path.extname(item).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
                filesList.push(fullPath);
            }
        }
    }
    return filesList;
}

async function inspect() {
    const allFoundFiles = [];

    // Let's resolve target files based on rules
    for (const target of targets) {
        const projPath = path.join(baseDir, target.project);
        if (!fs.existsSync(projPath)) {
            console.log(`Project directory not found: ${projPath}`);
            continue;
        }

        if (target.subdir && target.files) {
            const subDirPath = path.join(projPath, target.subdir);
            for (const file of target.files) {
                const fullPath = path.join(subDirPath, file);
                if (fs.existsSync(fullPath)) {
                    allFoundFiles.push(fullPath);
                } else {
                    console.log(`File not found: ${fullPath}`);
                }
            }
        } else if (target.groups) {
            for (const grp of target.groups) {
                const subDirPath = path.join(projPath, grp.subdir);
                if (!fs.existsSync(subDirPath)) {
                    console.log(`Subdir not found: ${subDirPath}`);
                    continue;
                }
                const files = getFilesRecursively(subDirPath);
                
                if (grp.files) {
                    // Exact files matching
                    for (const f of files) {
                        if (grp.files.includes(path.basename(f))) {
                            allFoundFiles.push(f);
                        }
                    }
                } else if (grp.match !== undefined) {
                    for (const f of files) {
                        if (path.basename(f).includes(grp.match)) {
                            allFoundFiles.push(f);
                        }
                    }
                } else if (grp.plansOnly) {
                    // 7 plans in Retail Mall
                    // exclude passenger elevators, aerial, iso123ramp
                    for (const f of files) {
                        const name = path.basename(f);
                        const isPlan = name.includes("MDCA230119") || name.includes("PMVR") || name.includes("GROUND FLOOR");
                        const isExcluded = name.includes("AERIAL") || name.includes("ELEVATOR") || name.includes("iso123ramp");
                        if (isPlan && !isExcluded) {
                            allFoundFiles.push(f);
                        }
                    }
                }
            }
        }
    }

    console.log(`Found ${allFoundFiles.length} files to inspect.`);
    
    // Print first 5 files and their dimensions as sample
    for (let i = 0; i < Math.min(5, allFoundFiles.length); i++) {
        const f = allFoundFiles[i];
        const meta = await sharp(f).metadata();
        console.log(`- ${path.relative(baseDir, f)}: ${meta.width}x${meta.height}`);
    }
}

inspect();
