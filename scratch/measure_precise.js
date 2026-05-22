const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const base = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');
const out = path.resolve(__dirname, '../scratch');

// Sample one file per layout category to measure exact title block boundary
const samples = [
    // MDC Large Landscape (15000x10607) - ANVAYA, GARDEN COURT
    { file: 'ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg', label: 'mdc_large', w: 15000, h: 10607 },
    // MDC Medium Landscape (4763x3368) - CIELA ST
    { file: 'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-ST-GRND-00122.png', label: 'ciela_med', w: 4763, h: 3368 },
    // MDC Small Landscape (1680x1188) - CIELA AR
    { file: 'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-AR-ALL LEVELS-00300(1).png', label: 'ciela_small', w: 1680, h: 1188 },
    // EVO (4774x3368)
    { file: 'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FE01 ENLARGED DETAILS _page_1.png', label: 'evo_med', w: 4774, h: 3368 },
    // MDC Portrait (3507x4966) - Lattice FES
    { file: 'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg', label: 'mdc_portrait', w: 3507, h: 4966 },
    // MDC Landscape Lattice FES (4967x3507)
    { file: 'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-5 - MDC-SD-RFA-AR-0037-20.jpg', label: 'lattice_landscape', w: 4967, h: 3507 },
    // WeeComm (15000x10607)
    { file: 'WeeComm Centre/RESIDENTIAL/WCC ELEVATION 2023 10 25_maulion - Sheet - A-0201-1 - FRONT ELEVATION.jpg', label: 'weecomm', w: 15000, h: 10607 },
    // Lattice Residential Small (1439x1019 or 1584x1224)
    { file: 'THE LATTICE - ALVEO BLOOM/RESIDENTIAL/6th-7th, Amenity, 9th - 42nd Floor Level_Tile Setting Out_For Check Print_page_1.png', label: 'lattice_res_small', w: null, h: null },
    // Lattice Residential Medium (2382x1684 or 2168x1531)
    { file: 'THE LATTICE - ALVEO BLOOM/RESIDENTIAL/9th - 42nd Floor Level_Tile Setting Out_For Check Print_page_1.png', label: 'lattice_res_med', w: null, h: null },
    // Garden Court (15000x10607)
    { file: 'GARDEN COURT RESIDENCES/FIRE EXIT STAIRS/1 - Sheet - P2-A-435-1 - TOWER D - FIRE EXIT STAIR 02 PLAN PART 1.jpg', label: 'garden_court', w: 15000, h: 10607 },
    // ANVAYA Signed (2333x1650)
    { file: 'ANVAYA COVE N10/FIRE EXIT STAIRS/RFA-ALP0116-AR-SD-13300-011-00 _2 signedA.png', label: 'anvaya_signed', w: 2333, h: 1650 },
    // Lattice FES WCC
    { file: 'WeeComm Centre/FIRE EXIT STAIRS/WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0754-1 - FES-02 STAIR DETAIL PLANS (B6 LEVEL - UPPER GROUND FLOOR MEZZANINE LEVEL).jpg', label: 'wcc_fes', w: null, h: null },
    // Sky Lounge
    { file: 'GARDEN COURT RESIDENCES/SKY LOUNGE/1 - Sheet - P2-A-830-2 - SKY LOUNGE PLAN (LEVEL 30) & DETAIL 1, 2 & 3.jpg', label: 'sky_lounge', w: null, h: null },
];

// For each sample, extract thin horizontal strips at various % from bottom to find the title block border
async function findBorder(s) {
    const fp = path.join(base, s.file);
    if (!fs.existsSync(fp)) { console.log('NOT FOUND:', s.file); return; }
    const buf = fs.readFileSync(fp);
    const m = await sharp(buf).metadata();
    const w = m.width, h = m.height;
    console.log(`\n=== ${s.label} (${w}x${h}) ===`);

    // Extract thin strips at various ratios from bottom edge
    const bottomRatios = [0.090, 0.100, 0.110, 0.115, 0.120, 0.125, 0.130, 0.135, 0.140, 0.145, 0.150, 0.155, 0.160];
    const rightRatios = [0.090, 0.100, 0.110, 0.115, 0.120, 0.125, 0.130, 0.135, 0.140, 0.145, 0.150, 0.155, 0.160, 0.165, 0.170];
    
    // Bottom: take a strip of 10px at the candidate boundary
    for (const r of bottomRatios) {
        const y = Math.round(h * (1 - r));
        const stripH = Math.min(10, h - y);
        if (y < 0 || y >= h || stripH <= 0) continue;
        const strip = await sharp(buf).extract({ left: 0, top: y, width: w, height: stripH }).raw().toBuffer();
        // Calculate average brightness to detect if this is near a border line (dark line = low brightness)
        let sum = 0, count = 0;
        for (let i = 0; i < strip.length; i += m.channels || 3) {
            sum += strip[i]; // just red channel
            count++;
        }
        const avg = sum / count;
        const isDark = avg < 180;
        if (isDark) {
            console.log(`  BOTTOM border candidate at ratio ${r.toFixed(3)} (y=${y}, avg brightness=${avg.toFixed(1)}) <-- DARK LINE`);
        }
    }

    // Right: take a strip of 10px at the candidate boundary
    for (const r of rightRatios) {
        const x = Math.round(w * (1 - r));
        const stripW = Math.min(10, w - x);
        if (x < 0 || x >= w || stripW <= 0) continue;
        const strip = await sharp(buf).extract({ left: x, top: 0, width: stripW, height: h }).raw().toBuffer();
        let sum = 0, count = 0;
        for (let i = 0; i < strip.length; i += m.channels || 3) {
            sum += strip[i];
            count++;
        }
        const avg = sum / count;
        const isDark = avg < 180;
        if (isDark) {
            console.log(`  RIGHT  border candidate at ratio ${r.toFixed(3)} (x=${x}, avg brightness=${avg.toFixed(1)}) <-- DARK LINE`);
        }
    }

    // For portrait, also check top
    if (s.label.includes('portrait')) {
        const topRatios = [0.090, 0.095, 0.100, 0.105, 0.110, 0.115, 0.120, 0.125, 0.130, 0.135, 0.140];
        for (const r of topRatios) {
            const y = Math.round(h * r);
            const stripH = Math.min(10, h - y);
            if (y < 0 || y >= h || stripH <= 0) continue;
            const strip = await sharp(buf).extract({ left: 0, top: y, width: w, height: stripH }).raw().toBuffer();
            let sum = 0, count = 0;
            for (let i = 0; i < strip.length; i += m.channels || 3) {
                sum += strip[i];
                count++;
            }
            const avg = sum / count;
            const isDark = avg < 180;
            if (isDark) {
                console.log(`  TOP    border candidate at ratio ${r.toFixed(3)} (y=${y}, avg brightness=${avg.toFixed(1)}) <-- DARK LINE`);
            }
        }
    }
}

(async () => {
    for (const s of samples) await findBorder(s);
    console.log('\nDone!');
})();
