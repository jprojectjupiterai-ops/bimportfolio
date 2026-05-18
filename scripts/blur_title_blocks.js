const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, "../public/PROJECT WORKS/BUILDING INFORMATION MODELING");

async function blurTitleBlock(filePath) {
    if (!filePath.match(/\.(jpg|jpeg|png)$/i)) return;
    
    try {
        const metadata = await sharp(filePath).metadata();
        const w = metadata.width;
        const h = metadata.height;
        
        // Skip small images, likely not sheets
        if (w < 1000 || h < 1000) return;

        console.log(`Processing: ${filePath}`);
        
        // Bottom 15% and Right 15% to cover title blocks
        const bottomH = Math.floor(h * 0.15);
        const rightW = Math.floor(w * 0.15);
        
        // Generate a heavily blurred version of the image
        const blurredBuffer = await sharp(filePath)
            .blur(50)
            .toBuffer();
            
        // Extract the bottom part from blurred
        const bottomRegion = await sharp(blurredBuffer)
            .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
            .toBuffer();
            
        // Extract the right part from blurred
        const rightRegion = await sharp(blurredBuffer)
            .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH }) // avoid overlap
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

async function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            await walk(fullPath);
        } else {
            await blurTitleBlock(fullPath);
        }
    }
}

console.log("Starting title block obfuscation with Sharp...");
walk(baseDir).then(() => console.log("Done!"));
