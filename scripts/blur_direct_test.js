const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING/ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg');

async function test(sigmaVal) {
    const outputPath = path.resolve(__dirname, `../scratch/test_direct_sigma_${sigmaVal}.jpg`);
    console.time(`Sigma ${sigmaVal} Time`);
    const buffer = fs.readFileSync(filePath);
    const metadata = await sharp(buffer).metadata();
    const w = metadata.width;
    const h = metadata.height;

    const bottomRatio = 0.150;
    const rightRatio = 0.116;

    const bottomH = Math.round(h * bottomRatio);
    const rightW = Math.round(w * rightRatio);

    // Extract and blur bottom directly
    const bottomRegion = await sharp(buffer)
        .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
        .blur(sigmaVal)
        .toBuffer();

    // Extract and blur right directly
    const rightRegion = await sharp(buffer)
        .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH })
        .blur(sigmaVal)
        .toBuffer();

    // Composite back
    await sharp(buffer)
        .composite([
            { input: bottomRegion, top: h - bottomH, left: 0 },
            { input: rightRegion, top: 0, left: w - rightW }
        ])
        .toFile(outputPath);

    console.timeEnd(`Sigma ${sigmaVal} Time`);
    console.log(`Saved: ${outputPath}`);
}

async function run() {
    await test(30);
    await test(50);
}

run().catch(console.error);
