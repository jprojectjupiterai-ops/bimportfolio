const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const base = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');
const out = path.resolve(__dirname, '../scratch');

// Sample files for each layout type
const samples = [
    // MDC Landscape large (15000x10607)
    { file: 'ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg', label: 'mdc_large' },
    // MDC Landscape small (1680x1188)
    { file: 'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-AR-ALL LEVELS-00300(1).png', label: 'ciela_small' },
    // MDC Landscape medium (4763x3368)
    { file: 'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-ST-GRND-00122.png', label: 'ciela_med' },
    // EVO medium (4774x3368)
    { file: 'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FE01 ENLARGED DETAILS _page_1.png', label: 'evo_med' },
    // MDC Portrait (3507x4966)
    { file: 'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg', label: 'mdc_portrait' },
    // MDC Landscape (4967x3507) - the landscape lattice sheets
    { file: 'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-5 - MDC-SD-RFA-AR-0037-20.jpg', label: 'lattice_landscape' },
    // WeeComm (15000x10607)
    { file: 'WeeComm Centre/RESIDENTIAL/WCC ELEVATION 2023 10 25_maulion - Sheet - A-0201-1 - FRONT ELEVATION.jpg', label: 'weecomm' },
    // ANVAYA signed (2333x1650)
    { file: 'ANVAYA COVE N10/FIRE EXIT STAIRS/RFA-ALP0116-AR-SD-13300-011-00 _2 signedA.png', label: 'anvaya_signed' },
    // Lattice Residential PNG (1584x1224)
    { file: 'THE LATTICE - ALVEO BLOOM/RESIDENTIAL/6th-7th, Amenity, 9th - 42nd Floor Level_Tile Setting Out_For Check Print_page_1.png', label: 'lattice_res_small' },
    // Lattice Residential PNG (2382x1684) 
    { file: 'THE LATTICE - ALVEO BLOOM/RESIDENTIAL/9th - 42nd Floor Level_Tile Setting Out_For Check Print_page_1.png', label: 'lattice_res_med' },
    // Garden Court (15000x10607)
    { file: 'GARDEN COURT RESIDENCES/FIRE EXIT STAIRS/1 - Sheet - P2-A-435-1 - TOWER D - FIRE EXIT STAIR 02 PLAN PART 1.jpg', label: 'garden_court' },
];

async function measure(s) {
    const fp = path.join(base, s.file);
    if (!fs.existsSync(fp)) { console.log('NOT FOUND: ' + s.file); return; }
    const buf = fs.readFileSync(fp);
    const m = await sharp(buf).metadata();
    const w = m.width, h = m.height;
    console.log(`\n=== ${s.label} (${w}x${h}) ===`);

    // Extract bottom boundary strip (from 10% to 18% from bottom) - resize to viewable
    const bStart = Math.round(h * 0.82);
    const bH = h - bStart;
    await sharp(buf)
        .extract({ left: 0, top: bStart, width: w, height: bH })
        .resize({ width: 800 })
        .toFile(path.join(out, `boundary_bottom_${s.label}.jpg`));

    // Extract right boundary strip (from 10% to 18% from right)
    const rStart = Math.round(w * 0.82);
    const rW = w - rStart;
    await sharp(buf)
        .extract({ left: rStart, top: 0, width: rW, height: h })
        .resize({ height: 800 })
        .toFile(path.join(out, `boundary_right_${s.label}.jpg`));

    // For portrait, also extract top boundary
    if (s.label.includes('portrait')) {
        const tH = Math.round(h * 0.18);
        await sharp(buf)
            .extract({ left: 0, top: 0, width: w, height: tH })
            .resize({ width: 800 })
            .toFile(path.join(out, `boundary_top_${s.label}.jpg`));
    }

    console.log('  Saved boundary strips.');
}

(async () => {
    for (const s of samples) await measure(s);
    console.log('\nDone! Check scratch/ for boundary_*.jpg');
})();
