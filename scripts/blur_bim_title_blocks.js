const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, "../public/PROJECT WORKS/BUILDING INFORMATION MODELING");

// Define the targets based on our research
const targets = [
    {
        project: "ANVAYA COVE N10",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" }
        ],
        layout: "MDC"
    },
    {
        project: "CIELA AMENITIES",
        groups: [
            { subdir: "ADMINISTRATIVE OFFICE AND SECURITY", match: "Admin and Security Column Settingout (Baseplates)" },
            { subdir: "GUARDHOUSE", match: "" },
            { subdir: "MULTI-PURPOSE COURT", files: ["MP_ MULTI-PURPOSE COURT GROUND FLOOR COLUMN SETTING OUT.png", "MP_ MULTI-PURPOSE COURT GROUND FLOOR FRAMING PLAN.png"] },
            { subdir: "SOCIAL AND FUNCTION HALL", files: ["MDCA210050-BIMD-IFC-ISD-AR-GRND-00523.png", "MDCA210050-BIMD-IFC-ISD-AR-RL-00524.png"] }
        ],
        layout: "MDC"
    },
    {
        project: "ePLDT DATA CENTER SITEWIDE",
        groups: [
            { subdir: "ELECTRICAL SITEWIDE", match: "" },
            { subdir: "ICT SITEWIDE", match: "" },
            { subdir: "SANITARY SITEWIDE", match: "" }
        ],
        layout: "NONE"
    },
    {
        project: "EVO CITY RETAIL MALL PH2",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" },
            { subdir: "RETAIL MALL", plansOnly: true }
        ],
        layout: "MDC"
    },
    {
        project: "GARDEN COURT RESIDENCES",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" },
            { subdir: "SKY LOUNGE", match: "" }
        ],
        layout: "MDC"
    },
    {
        project: "THE LATTICE - ALVEO BLOOM",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" },
            { subdir: "RESIDENTIAL", match: "" }
        ],
        layout: "MDC"
    },
    {
        project: "WeeComm Centre",
        groups: [
            { subdir: "FIRE EXIT STAIRS", match: "" },
            { subdir: "RESIDENTIAL", match: "" }
        ],
        layout: "WEECOMM"
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
            const ext = path.extname(item).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
                filesList.push(fullPath);
            }
        }
    }
    return filesList;
}

async function blurTarget(filePath, layout) {
    try {
        if (layout === "NONE") {
            console.log(`Skipping (No Title Block): ${path.relative(baseDir, filePath)}`);
            return;
        }

        const metadata = await sharp(filePath).metadata();
        const w = metadata.width;
        const h = metadata.height;
        
        let bottomRatio = 0;
        let rightRatio = 0;

        if (layout === "MDC") {
            bottomRatio = 0.150;
            rightRatio = 0.116;
        } else if (layout === "WEECOMM") {
            bottomRatio = 0.090;
            rightRatio = 0.127;
        }

        const bottomH = Math.round(h * bottomRatio);
        const rightW = Math.round(w * rightRatio);

        console.log(`Processing: ${path.relative(baseDir, filePath)} (${w}x${h}) [Layout: ${layout}]`);

        // Generate a heavily blurred version of the image
        const blurredBuffer = await sharp(filePath)
            .blur(50)
            .toBuffer();
            
        // Extract the bottom part from blurred
        const bottomRegion = await sharp(blurredBuffer)
            .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
            .toBuffer();
            
        // Extract the right part from blurred, but avoid the overlapping bottom-right corner to prevent double processing errors or we can just extract above the bottomRegion
        const rightRegion = await sharp(blurredBuffer)
            .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH }) 
            .toBuffer();
            
        // Composite them over original
        await sharp(filePath)
            .composite([
                { input: bottomRegion, top: h - bottomH, left: 0 },
                { input: rightRegion, top: 0, left: w - rightW }
            ])
            .toFile(filePath + ".tmp");
            
        fs.renameSync(filePath + ".tmp", filePath);
        
        console.log(`Protected: ${path.basename(filePath)}`);
    } catch (err) {
        console.error(`Error on ${filePath}:`, err.message);
    }
}

async function main() {
    const filesToProcess = [];

    for (const target of targets) {
        const projPath = path.join(baseDir, target.project);
        if (!fs.existsSync(projPath)) continue;

        if (target.groups) {
            for (const grp of target.groups) {
                const subDirPath = path.join(projPath, grp.subdir);
                if (!fs.existsSync(subDirPath)) continue;

                const files = getFilesRecursively(subDirPath);
                
                if (grp.files) {
                    for (const f of files) {
                        if (grp.files.includes(path.basename(f))) {
                            filesToProcess.push({ filePath: f, layout: target.layout });
                        }
                    }
                } else if (grp.match !== undefined) {
                    for (const f of files) {
                        if (path.basename(f).includes(grp.match)) {
                            filesToProcess.push({ filePath: f, layout: target.layout });
                        }
                    }
                } else if (grp.plansOnly) {
                    for (const f of files) {
                        const name = path.basename(f);
                        const isPlan = name.includes("MDCA230119") || name.includes("PMVR") || name.includes("GROUND FLOOR");
                        const isExcluded = name.includes("AERIAL") || name.includes("ELEVATOR") || name.includes("iso123ramp");
                        if (isPlan && !isExcluded) {
                            filesToProcess.push({ filePath: f, layout: target.layout });
                        }
                    }
                }
            }
        }
    }

    console.log(`Found ${filesToProcess.length} target files to process.`);
    
    for (const item of filesToProcess) {
        await blurTarget(item.filePath, item.layout);
    }
    
    console.log("All done!");
}

main();
