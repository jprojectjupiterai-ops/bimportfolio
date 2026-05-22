const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const baseDir = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');

// ─── TARGET DEFINITIONS ────────────────────────────────────────────
const targets = [
    // 1. ANVAYA COVE N10
    {
        project: "ANVAYA COVE N10",
        subdirs: ["FIRE EXIT STAIRS"],
        layout: "MDC"
    },
    // 2. CIELA AMENITIES
    {
        project: "CIELA AMENITIES",
        subdir: "ADMINISTRATIVE OFFICE AND SECURITY",
        files: ["Admin and Security Column Settingout (Baseplates).png"],
        layout: "MDC_CIELA"
    },
    {
        project: "CIELA AMENITIES",
        subdirs: ["GUARDHOUSE"],
        layout: "MDC_CIELA"
    },
    {
        project: "CIELA AMENITIES",
        subdir: "MULTI-PURPOSE COURT",
        files: [
            "MP_ MULTI-PURPOSE COURT GROUND FLOOR COLUMN SETTING OUT.png",
            "MP_ MULTI-PURPOSE COURT GROUND FLOOR FRAMING PLAN.png"
        ],
        layout: "MDC_CIELA"
    },
    {
        project: "CIELA AMENITIES",
        subdir: "SOCIAL AND FUNCTION HALL",
        files: [
            "MDCA210050-BIMD-IFC-ISD-AR-GRND-00523.png",
            "MDCA210050-BIMD-IFC-ISD-AR-RL-00524.png"
        ],
        layout: "MDC_CIELA"
    },
    // 3. EVO CITY RETAIL MALL PH2
    {
        project: "EVO CITY RETAIL MALL PH2",
        subdirs: ["FIRE EXIT STAIRS"],
        layout: "EVO"
    },
    {
        project: "EVO CITY RETAIL MALL PH2",
        subdir: "RETAIL MALL",
        // 7 plan files, excluding aerials, elevators, iso ramp
        filterFn: (name) => {
            const excluded = ["AERIAL", "ELEVATOR", "PASENGER", "iso123ramp"];
            return !excluded.some(ex => name.includes(ex));
        },
        layout: "EVO"
    },
    // 4. GARDEN COURT RESIDENCES
    {
        project: "GARDEN COURT RESIDENCES",
        subdirs: ["FIRE EXIT STAIRS", "SKY LOUNGE"],
        layout: "MDC"
    },
    // 5. THE LATTICE - ALVEO BLOOM
    {
        project: "THE LATTICE - ALVEO BLOOM",
        subdirs: ["RESIDENTIAL"],
        layout: "MDC"
    },
    {
        project: "THE LATTICE - ALVEO BLOOM",
        subdir: "FIRE EXIT STAIRS",
        files: [
            "MDC - Sheet - A6-101-5 - MDC-SD-RFA-AR-0037-20.jpg",
            "MDC - Sheet - A6-101-7 - MDC-SD-RFA-AR-0037-20.jpg"
        ],
        layout: "MDC"
    },
    {
        project: "THE LATTICE - ALVEO BLOOM",
        subdir: "FIRE EXIT STAIRS",
        files: [
            "MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg",
            "MDC - Sheet - A6-101-9 - MDC-SD-RFA-AR-0037-20.jpg"
        ],
        layout: "MDC_PORTRAIT"
    },
    // 6. WeeComm Centre
    {
        project: "WeeComm Centre",
        subdirs: ["FIRE EXIT STAIRS", "RESIDENTIAL"],
        layout: "WEECOMM"
    }
];

// ─── HELPERS ────────────────────────────────────────────────────────
function getFilesRecursively(dir, filesList = []) {
    if (!fs.existsSync(dir)) return filesList;
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            getFilesRecursively(fullPath, filesList);
        } else {
            const ext = path.extname(item).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
                filesList.push(fullPath);
            }
        }
    }
    return filesList;
}

// ─── BLUR PROCESSOR ────────────────────────────────────────────────
async function processFile(filePath, layout) {
    try {
        const buffer = fs.readFileSync(filePath);
        const metadata = await sharp(buffer).metadata();
        const w = metadata.width;
        const h = metadata.height;

        let bottomRatio = 0;
        let rightRatio = 0;
        let topRatio = 0;
        let isPortrait = false;

        // Perfect fit ratios derived from pixel-level measurements
        if (layout === "MDC") {
            bottomRatio = 0.160;
            rightRatio = 0.160;
        } else if (layout === "MDC_CIELA") {
            bottomRatio = 0.160;
            rightRatio = 0.180;
        } else if (layout === "MDC_PORTRAIT") {
            topRatio = 0.115;
            rightRatio = 0.160;
            isPortrait = true;
        } else if (layout === "EVO") {
            bottomRatio = 0.105;
            rightRatio = 0.115;
        } else if (layout === "WEECOMM") {
            bottomRatio = 0.100;
            rightRatio = 0.120;
        }

        console.log(`Processing: ${path.relative(baseDir, filePath)}`);
        console.log(`  Dimensions: ${w}x${h} | Layout: ${layout}`);

        // Dynamic sigma: scale with image width for consistent blur quality
        const sigmaVal = Math.min(50, Math.max(20, Math.round(w / 350)));
        let compositedImage;

        if (isPortrait) {
            const topH = Math.round(h * topRatio);
            const rightW = Math.round(w * rightRatio);

            const topRegion = await sharp(buffer)
                .extract({ left: 0, top: 0, width: w, height: topH })
                .blur(sigmaVal)
                .toBuffer();

            const rightRegion = await sharp(buffer)
                .extract({ left: w - rightW, top: topH, width: rightW, height: h - topH })
                .blur(sigmaVal)
                .toBuffer();

            compositedImage = sharp(buffer)
                .composite([
                    { input: topRegion, top: 0, left: 0 },
                    { input: rightRegion, top: topH, left: w - rightW }
                ]);
        } else {
            const bottomH = Math.round(h * bottomRatio);
            const rightW = Math.round(w * rightRatio);

            const bottomRegion = await sharp(buffer)
                .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
                .blur(sigmaVal)
                .toBuffer();

            const rightRegion = await sharp(buffer)
                .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH })
                .blur(sigmaVal)
                .toBuffer();

            compositedImage = sharp(buffer)
                .composite([
                    { input: bottomRegion, top: h - bottomH, left: 0 },
                    { input: rightRegion, top: 0, left: w - rightW }
                ]);
        }

        const ext = path.extname(filePath).toLowerCase();
        const tempPath = path.join(os.tmpdir(), `blur_${Math.random().toString(36).substring(7)}${ext}`);

        await compositedImage.toFile(tempPath);
        fs.copyFileSync(tempPath, filePath);
        fs.unlinkSync(tempPath);

        console.log(`  ✓ Protected (Perfect fit blur applied)`);
    } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
    }
}

// ─── MAIN ───────────────────────────────────────────────────────────
async function main() {
    const filesToProcess = [];

    for (const tgt of targets) {
        const projPath = path.join(baseDir, tgt.project);
        if (!fs.existsSync(projPath)) {
            console.log(`Project folder not found: ${tgt.project}`);
            continue;
        }

        if (tgt.subdir && tgt.files) {
            // Specific files in a specific subdirectory
            const subdirPath = path.join(projPath, tgt.subdir);
            for (const file of tgt.files) {
                const fullPath = path.join(subdirPath, file);
                if (fs.existsSync(fullPath)) {
                    filesToProcess.push({ filePath: fullPath, layout: tgt.layout });
                } else {
                    console.log(`File not found: ${fullPath}`);
                }
            }
        } else if (tgt.subdir && tgt.filterFn) {
            // Filtered files in a subdirectory
            const subdirPath = path.join(projPath, tgt.subdir);
            if (fs.existsSync(subdirPath)) {
                const files = getFilesRecursively(subdirPath);
                for (const f of files) {
                    if (tgt.filterFn(path.basename(f))) {
                        filesToProcess.push({ filePath: f, layout: tgt.layout });
                    }
                }
            }
        } else if (tgt.subdirs) {
            // All files in these subdirectories
            for (const subdir of tgt.subdirs) {
                const subdirPath = path.join(projPath, subdir);
                if (fs.existsSync(subdirPath)) {
                    const files = getFilesRecursively(subdirPath);
                    for (const f of files) {
                        filesToProcess.push({ filePath: f, layout: tgt.layout });
                    }
                } else {
                    console.log(`Subdir not found: ${subdirPath}`);
                }
            }
        }
    }

    console.log(`\n========================================`);
    console.log(`Total files to process: ${filesToProcess.length}`);
    console.log(`========================================\n`);

    for (let i = 0; i < filesToProcess.length; i++) {
        const item = filesToProcess[i];
        console.log(`[${i + 1}/${filesToProcess.length}]`);
        await processFile(item.filePath, item.layout);
    }

    console.log(`\n========================================`);
    console.log(`All ${filesToProcess.length} sheets processed successfully!`);
    console.log(`========================================`);
}

main().catch(console.error);
