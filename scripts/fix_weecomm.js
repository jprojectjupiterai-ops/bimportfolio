const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

const failedFiles = [
    "C:\\Users\\John Lloyd Maulion\\Desktop\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING\\WeeComm Centre\\FIRE EXIT STAIRS\\WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0756-1 (2-3) - FES-02 STAIR DETAIL SECTIONS & BLOW-UP SECTION (TYP- 5TH-5TH - LOWER ROOF DECK LEVEL).jpg",
    "C:\\Users\\John Lloyd Maulion\\Desktop\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING\\WeeComm Centre\\FIRE EXIT STAIRS\\WC FE STAIR_FES 2_23-0929_maulion - Sheet - A-0756-1 (3-3) - FES-02 STAIR DETAIL 3D VIEWS (B6 LEVEL - LOWER ROOF DECK LEVEL).jpg"
];

async function fixFailed() {
    for (const filePath of failedFiles) {
        if (!fs.existsSync(filePath)) {
            console.log("Not found:", filePath);
            continue;
        }

        try {
            const metadata = await sharp(filePath).metadata();
            const w = metadata.width;
            const h = metadata.height;
            
            const bottomRatio = 0.090;
            const rightRatio = 0.127;
            
            const bottomH = Math.round(h * bottomRatio);
            const rightW = Math.round(w * rightRatio);

            console.log(`Processing: ${path.basename(filePath)} (${w}x${h})`);

            const blurredBuffer = await sharp(filePath)
                .blur(50)
                .toBuffer();
                
            const bottomRegion = await sharp(blurredBuffer)
                .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
                .toBuffer();
                
            const rightRegion = await sharp(blurredBuffer)
                .extract({ left: w - rightW, top: 0, width: rightW, height: h - bottomH }) 
                .toBuffer();
                
            const tempPath = path.join(os.tmpdir(), "blur_tmp_weecomm.jpg");
            
            await sharp(filePath)
                .composite([
                    { input: bottomRegion, top: h - bottomH, left: 0 },
                    { input: rightRegion, top: 0, left: w - rightW }
                ])
                .toFile(tempPath);
                
            fs.copyFileSync(tempPath, filePath);
            fs.unlinkSync(tempPath);
            
            console.log(`Protected: ${path.basename(filePath)}`);
        } catch (err) {
            console.error(`Error on ${filePath}:`, err.message);
        }
    }
}

fixFailed();
