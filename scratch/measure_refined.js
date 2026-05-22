const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const base = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');
const out = path.resolve(__dirname, '../scratch');

// For missed borders, extract narrow strips at specific px positions and save as images
// to visually verify the exact border location

async function extractAtRatio(file, label, edge, ratios) {
    const fp = path.join(base, file);
    if (!fs.existsSync(fp)) { console.log('NOT FOUND:', file); return; }
    const buf = fs.readFileSync(fp);
    const m = await sharp(buf).metadata();
    const w = m.width, h = m.height;
    console.log(`\n=== ${label} (${w}x${h}) - ${edge} ===`);

    for (const r of ratios) {
        let stripBuf;
        let stripLabel;
        if (edge === 'bottom') {
            const y = Math.round(h * (1 - r));
            // Take a 40px tall strip across the full width at this position
            const stripH = Math.min(40, h - y);
            stripBuf = await sharp(buf)
                .extract({ left: 0, top: y, width: w, height: stripH })
                .resize({ width: 1000 })
                .toBuffer();
            stripLabel = `precise_${label}_bottom_${(r * 1000).toFixed(0)}`;
        } else if (edge === 'right') {
            const x = Math.round(w * (1 - r));
            const stripW = Math.min(40, w - x);
            stripBuf = await sharp(buf)
                .extract({ left: x, top: 0, width: stripW, height: h })
                .resize({ height: 800 })
                .toBuffer();
            stripLabel = `precise_${label}_right_${(r * 1000).toFixed(0)}`;
        } else if (edge === 'top') {
            const y = Math.round(h * r);
            const stripH = Math.min(40, h - y);
            stripBuf = await sharp(buf)
                .extract({ left: 0, top: y, width: w, height: stripH })
                .resize({ width: 1000 })
                .toBuffer();
            stripLabel = `precise_${label}_top_${(r * 1000).toFixed(0)}`;
        }
        
        await sharp(stripBuf).toFile(path.join(out, stripLabel + '.jpg'));
        console.log(`  Saved ${stripLabel}.jpg at ratio ${r}`);
    }
}

(async () => {
    // WeeComm - need to find bottom and right borders
    // From the visual inspection of boundary_bottom_weecomm, the title block is ~9% from bottom
    await extractAtRatio(
        'WeeComm Centre/RESIDENTIAL/WCC ELEVATION 2023 10 25_maulion - Sheet - A-0201-1 - FRONT ELEVATION.jpg',
        'weecomm', 'bottom', [0.070, 0.080, 0.085, 0.090, 0.095, 0.100, 0.105, 0.110]
    );
    await extractAtRatio(
        'WeeComm Centre/RESIDENTIAL/WCC ELEVATION 2023 10 25_maulion - Sheet - A-0201-1 - FRONT ELEVATION.jpg',
        'weecomm', 'right', [0.100, 0.110, 0.115, 0.120, 0.125, 0.130, 0.135, 0.140]
    );

    // WCC FES
    await extractAtRatio(
        'WeeComm Centre/FIRE EXIT STAIRS/WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0754-1 - FES-02 STAIR DETAIL PLANS (B6 LEVEL - UPPER GROUND FLOOR MEZZANINE LEVEL).jpg',
        'wcc_fes', 'bottom', [0.070, 0.080, 0.085, 0.090, 0.095, 0.100]
    );
    await extractAtRatio(
        'WeeComm Centre/FIRE EXIT STAIRS/WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0754-1 - FES-02 STAIR DETAIL PLANS (B6 LEVEL - UPPER GROUND FLOOR MEZZANINE LEVEL).jpg',
        'wcc_fes', 'right', [0.100, 0.110, 0.115, 0.120, 0.125, 0.130]
    );

    // MDC Large right - detected at 0.155, let's verify
    await extractAtRatio(
        'ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg',
        'mdc_large', 'right', [0.150, 0.155, 0.160, 0.165]
    );

    // Garden Court right
    await extractAtRatio(
        'GARDEN COURT RESIDENCES/FIRE EXIT STAIRS/1 - Sheet - P2-A-435-1 - TOWER D - FIRE EXIT STAIR 02 PLAN PART 1.jpg',
        'garden_court', 'right', [0.145, 0.150, 0.155, 0.160, 0.165]
    );

    // CIELA right
    await extractAtRatio(
        'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-ST-GRND-00122.png',
        'ciela_med', 'right', [0.145, 0.150, 0.155, 0.160, 0.165, 0.170, 0.175, 0.180]
    );

    // EVO right - detected at 0.110, verify bottom at 0.090-0.100
    await extractAtRatio(
        'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FE01 ENLARGED DETAILS _page_1.png',
        'evo_med', 'bottom', [0.085, 0.090, 0.095, 0.100, 0.105]
    );
    await extractAtRatio(
        'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FE01 ENLARGED DETAILS _page_1.png',
        'evo_med', 'right', [0.105, 0.110, 0.115, 0.120]
    );

    // MDC portrait - check TOP border 
    await extractAtRatio(
        'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg',
        'mdc_portrait', 'top', [0.095, 0.100, 0.105, 0.110, 0.115, 0.120]
    );

    console.log('\nDone! Check scratch/precise_*.jpg');
})();
