const sharp = require('sharp');
const path = require('path');

const base = path.join(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');
const files = [
    'CIELA AMENITIES/ADMINISTRATIVE OFFICE AND SECURITY/Admin and Security Column Settingout (Baseplates).png',
    'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-AR-ALL LEVELS-00300(1).png',
    'CIELA AMENITIES/GUARDHOUSE/MDCA210050-BIMD-IFC-ISD-ST-GRND-00122.png',
    'CIELA AMENITIES/MULTI-PURPOSE COURT/MP_ MULTI-PURPOSE COURT GROUND FLOOR COLUMN SETTING OUT.png',
    'CIELA AMENITIES/SOCIAL AND FUNCTION HALL/MDCA210050-BIMD-IFC-ISD-AR-GRND-00523.png',
    'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FE01 ENLARGED DETAILS _page_1.png',
    'EVO CITY RETAIL MALL PH2/FIRE EXIT STAIRS/FIRE EXIT STAIR_02.png',
    'EVO CITY RETAIL MALL PH2/RETAIL MALL/MDCA230119-BIMD-IFC-ISD-AR-GRND-00100.00-GROUND FLOOR ARCHITECTURAL SETTING-OUT PLAN_page_1.png',
    'EVO CITY RETAIL MALL PH2/RETAIL MALL/PMVR (RMU) ROOM, MVSG ROOM, & SERVICE ENTRANCE_REV. 7_page_1.png',
    'ANVAYA COVE N10/FIRE EXIT STAIRS/RFA-ALP0116-AR-SD-13300-011-00 _2 signedA.png',
    'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-5 - MDC-SD-RFA-AR-0037-20.jpg',
    'THE LATTICE - ALVEO BLOOM/FIRE EXIT STAIRS/MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg',
];

(async () => {
    for (const f of files) {
        try {
            const m = await sharp(path.join(base, f)).metadata();
            console.log(path.basename(f) + ': ' + m.width + 'x' + m.height);
        } catch (e) {
            console.log(path.basename(f) + ': ERROR ' + e.message);
        }
    }
})();
