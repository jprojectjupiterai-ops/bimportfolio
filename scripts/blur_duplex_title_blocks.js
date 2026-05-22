const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const targetFiles = [
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/FACADE PESPECTIVE.png",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ARCHITECTURAL DESIGN/Architectural_01.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ARCHITECTURAL DESIGN/Architectural_02.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ARCHITECTURAL DESIGN/Architectural_03.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ARCHITECTURAL DESIGN/Architectural_04.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ARCHITECTURAL DESIGN/Architectural_05.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ELECTRICAL DESIGN/Electrical_01.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/ELECTRICAL DESIGN/Electrical_02.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/PLUMBING AND SANITARY DESIGN/Plumbing and Sanitary_01.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/PLUMBING AND SANITARY DESIGN/Plumbing and Sanitary_02.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/STRUCTURAL DESIGN/Structural_01.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/STRUCTURAL DESIGN/Structural_02.jpg",
    "ARCHITECTURAL DESIGN AND LAYOUTS/COMISSIONED PROJECTS/TWO-STOREY DUPLEX HOUSE_A/STRUCTURAL DESIGN/Structural_03.jpg"
];

const baseDir = path.join(__dirname, "../public/PROJECT WORKS");

async function blurTitleBlock(filePath) {
    try {
        const metadata = await sharp(filePath).metadata();
        const w = metadata.width;
        const h = metadata.height;
        
        // Skip renderings/images that don't have sheets title blocks
        if (h < 2000 || filePath.includes("FACADE PESPECTIVE")) {
            console.log(`Skipping rendering: ${path.basename(filePath)}`);
            return;
        }

        console.log(`Processing: ${filePath} (${w}x${h})`);
        
        // Title block is exactly the bottom ~6.94% (200px out of 2880px)
        const bottomH = Math.round(h * (200 / 2880));
        
        // Generate a heavily blurred version of the image
        const blurredBuffer = await sharp(filePath)
            .blur(50)
            .toBuffer();
            
        // Extract the bottom part from blurred
        const bottomRegion = await sharp(blurredBuffer)
            .extract({ left: 0, top: h - bottomH, width: w, height: bottomH })
            .toBuffer();
            
        // Composite it over original
        await sharp(filePath)
            .composite([
                { input: bottomRegion, top: h - bottomH, left: 0 }
            ])
            .toFile(filePath + ".tmp");
            
        fs.renameSync(filePath + ".tmp", filePath);
        
        console.log(`Protected: ${path.basename(filePath)}`);
    } catch (err) {
        console.error(`Error on ${filePath}:`, err.message);
    }
}

async function main() {
    for (const relPath of targetFiles) {
        const fullPath = path.join(baseDir, relPath);
        if (fs.existsSync(fullPath)) {
            await blurTitleBlock(fullPath);
        } else {
            console.log(`File not found: ${fullPath}`);
        }
    }
    console.log("All done!");
}

main();
