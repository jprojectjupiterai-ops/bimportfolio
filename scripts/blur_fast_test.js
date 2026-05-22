const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../public/PROJECT WORKS/BUILDING INFORMATION MODELING/ANVAYA COVE N10/FIRE EXIT STAIRS/A4201-1 - FE-01 ENLARGED PLANS & SECTIONS.jpg');
const outputPath = path.resolve(__dirname, '../scratch/test_out.jpg');

async function test() {
    console.time("ProcessTime");
    const buffer = fs.readFileSync(filePath);
    const metadata = await sharp(buffer).metadata();
    const w = metadata.width;
    const h = metadata.height;
    console.log(`Dimensions: ${w}x${h}`);

    const bottomRatio = 0.150;
    const rightRatio = 0.116;

    const bottomH = Math.round(h * bottomRatio);
    const rightW = Math.round(w * rightRatio);

    console.log(`Extracting: bottomH=${bottomH}, rightW=${rightW}`);

    const downscaleFactor = 16;

    // Process bottom region: downscale, blur, upscale
    const bottomRegion = await sharp(buffer)
        .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
        .resize({
            width: Math.max(1, Math.round(w / downscaleFactor)),
            height: Math.max(1, Math.round(bottomH / downscaleFactor))
        })
        .blur(10)
        .resize({ width: w, height: bottomH, kernel: sharp.kernel.cubic })
        .toBuffer();

    console.log("Processed bottom region");

    // Process right region: downscale, blur, upscale
    const rightRegion = await sharp(buffer)
        .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH })
        .resize({
            width: Math.max(1, Math.round(rightW / downscaleFactor)),
            height: Math.max(1, Math.round((h - bottomH) / downscaleFactor))
        })
        .blur(10)
        .resize({ width: rightW, height: h - bottomH, kernel: sharp.kernel.cubic })
        .toBuffer();

    console.log("Processed right region");

    // Composite back
    await sharp(buffer)
        .composite([
            { input: bottomRegion, top: h - bottomH, left: 0 },
            { input: rightRegion, top: 0, left: w - rightW }
        ])
        .toFile(outputPath);

    console.timeEnd("ProcessTime");
    console.log(`Output saved to: ${outputPath}`);
}

test().catch(console.error);
