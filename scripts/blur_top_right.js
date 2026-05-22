const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const files = [
    "c:\\Users\\John Lloyd Maulion\\Desktop\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING\\THE LATTICE - ALVEO BLOOM\\FIRE EXIT STAIRS\\MDC - Sheet - A6-101-8 - MDC-SD-RFA-AR-0037-20.jpg",
    "c:\\Users\\John Lloyd Maulion\\Desktop\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING\\THE LATTICE - ALVEO BLOOM\\FIRE EXIT STAIRS\\MDC - Sheet - A6-101-9 - MDC-SD-RFA-AR-0037-20.jpg"
];

async function fixPortrait() {
    for (const filePath of files) {
        if (!fs.existsSync(filePath)) {
            console.log("Not found:", filePath);
            continue;
        }

        try {
            // Use buffer to avoid any MAX_PATH issues just in case
            const buffer = fs.readFileSync(filePath);
            const metadata = await sharp(buffer).metadata();
            const w = metadata.width;
            const h = metadata.height;
            
            // For Portrait MDC:
            // Top ratio is 11.6% (corresponds to Right in Landscape)
            // Right ratio is 15.0% (corresponds to Bottom in Landscape)
            const topRatio = 0.116;
            const rightRatio = 0.150;
            
            const topH = Math.round(h * topRatio);
            const rightW = Math.round(w * rightRatio);

            console.log(`Processing via buffer: ${path.basename(filePath)} (${w}x${h})`);

            const blurredBuffer = await sharp(buffer)
                .blur(50)
                .toBuffer();
                
            // Extract the top part
            const topRegion = await sharp(blurredBuffer)
                .extract({ left: 0, top: 0, width: w, height: topH })
                .toBuffer();
                
            // Extract the right part (under the top region to avoid overlapping)
            const rightRegion = await sharp(blurredBuffer)
                .extract({ left: w - rightW, top: topH, width: rightW, height: h - topH }) 
                .toBuffer();
                
            const tempPath = path.join(os.tmpdir(), "blur_tmp_portrait.jpg");
            
            await sharp(buffer)
                .composite([
                    { input: topRegion, top: 0, left: 0 },
                    { input: rightRegion, top: topH, left: w - rightW }
                ])
                .toFile(tempPath);
                
            fs.copyFileSync(tempPath, filePath);
            fs.unlinkSync(tempPath);
            
            console.log(`Protected: ${path.basename(filePath)}`);
        } catch (err) {
            console.error(`Error:`, err.message);
        }
    }
}

fixPortrait();
