const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = [
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg',
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-9 - MDC-SD-RFA-AR-0037-20.jpg',
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg',
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-2 - FE-01 SECTION BLOW-UP DETAIL & 3D VIEWS.jpg',
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/WeeComm Centre/FIRE EXIT STAIRS/WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0754-1 - FES-02 STAIR DETAIL PLANS (B6 LEVEL - UPPER GROUND FLOOR MEZZANINE LEVEL).jpg',
  'public/PROJECT WORKS/BUILDING INFORMATION MODELING/THE LATTICE - ALVEO BLOOM/RESIDENTIAL/6th-7th, Amenity, 9th - 42nd Floor Level_Tile Setting Out_For Check Print_page_1.png'
];

async function main() {
  for (const f of files) {
    const fullPath = path.resolve(__dirname, '..', f);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const m = await sharp(buffer).metadata();
      console.log(`${path.basename(f)}: ${m.width}x${m.height} (${m.width > m.height ? 'landscape' : 'portrait'})`);
    } else {
      console.log(`Not found: ${f}`);
    }
  }
}

main().catch(console.error);
