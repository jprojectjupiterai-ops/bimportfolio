const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING');

const targets = [
    {
        project: "ANVAYA COVE N10",
        subdir: "FIRE EXIT STAIRS",
        files: [
            "A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg",
            "A4201-2 - FE-01 SECTION BLOW-UP DETAIL & 3D VIEWS.jpg"
        ],
        layout: "MDC"
    },
    {
        project: "GARDEN COURT RESIDENCES",
        subdirs: ["FIRE EXIT STAIRS", "SKY LOUNGE"],
        layout: "MDC"
    },
    {
        project: "WeeComm Centre",
        subdirs: ["FIRE EXIT STAIRS", "RESIDENTIAL"],
        layout: "WEECOMM"
    },
    {
        project: "THE LATTICE - ALVEO BLOOM",
        subdirs: ["RESIDENTIAL", "FIRE EXIT STAIRS"],
        layout: "MDC"
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

async function main() {
    console.log("Analyzing files...");
    const allFiles = [];

    for (const tgt of targets) {
        const projPath = path.join(baseDir, tgt.project);
        if (!fs.existsSync(projPath)) {
            console.log(`Project not found: ${tgt.project}`);
            continue;
        }

        if (tgt.subdir && tgt.files) {
            const subdirPath = path.join(projPath, tgt.subdir);
            for (const file of tgt.files) {
                const fullPath = path.join(subdirPath, file);
                if (fs.existsSync(fullPath)) {
                    allFiles.push({ filePath: fullPath, layout: tgt.layout, project: tgt.project, type: 'specified' });
                }
            }
        } else if (tgt.subdirs) {
            for (const subdir of tgt.subdirs) {
                const subdirPath = path.join(projPath, subdir);
                if (fs.existsSync(subdirPath)) {
                    const files = getFilesRecursively(subdirPath);
                    for (const f of files) {
                        allFiles.push({ filePath: f, layout: tgt.layout, project: tgt.project, type: 'subdir' });
                    }
                }
            }
        }
    }

    console.log(`Found ${allFiles.length} candidate files.`);
    for (const item of allFiles) {
        const buffer = fs.readFileSync(item.filePath);
        const meta = await sharp(buffer).metadata();
        const rel = path.relative(baseDir, item.filePath);
        console.log(`- ${rel} | ${meta.width}x${meta.height} | Layout: ${item.layout} | ${meta.width > meta.height ? 'landscape' : 'portrait'}`);
    }
}

main().catch(console.error);
