const sharp = require('sharp');
const path = require('path');

const imgPath = path.join(__dirname, "../public/PROJECT WORKS/BUILDING INFORMATION MODELING/WeeComm Centre/RESIDENTIAL/WCC ELEVATION 2023 10 25_maulion - Sheet - A-0201-1 - FRONT ELEVATION.jpg");

async function main() {
    const metadata = await sharp(imgPath).metadata();
    const h = metadata.height;
    const w = metadata.width;
    console.log(`Dimensions: ${w}x${h}`);
    
    const rawPixels = await sharp(imgPath)
        .raw()
        .toBuffer();
        
    const channels = metadata.channels;
    
    // Scan bottom rows (around 15% height)
    console.log("--- BOTTOM ROWS SCAN ---");
    let darkRows = [];
    const searchRangeBottom = Math.round(h * 0.2);
    for (let y = h - searchRangeBottom; y < h - 100; y++) {
        let sum = 0;
        for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * channels;
            const r = rawPixels[idx];
            const g = rawPixels[idx + 1];
            const b = rawPixels[idx + 2];
            const brightness = (r + g + b) / 3;
            sum += brightness;
        }
        const avg = sum / w;
        if (avg < 200) {
            darkRows.push({ y, fromBottom: h - y, avg, percent: (h - y) / h });
        }
    }
    
    darkRows.sort((a, b) => a.avg - b.avg);
    console.log("Darkest rows:");
    darkRows.slice(0, 15).forEach(r => {
        console.log(`Row ${r.y} (from bottom: ${r.fromBottom}, ${Math.round(r.percent * 1000) / 10}%): avg = ${r.avg}`);
    });

    // Scan right columns (around 11.6% width)
    console.log("--- RIGHT COLUMNS SCAN ---");
    let darkCols = [];
    const searchRangeRight = Math.round(w * 0.2);
    for (let x = w - searchRangeRight; x < w - 100; x++) {
        let sum = 0;
        for (let y = 0; y < h; y++) {
            const idx = (y * w + x) * channels;
            const r = rawPixels[idx];
            const g = rawPixels[idx + 1];
            const b = rawPixels[idx + 2];
            const brightness = (r + g + b) / 3;
            sum += brightness;
        }
        const avg = sum / h;
        if (avg < 200) {
            darkCols.push({ x, fromRight: w - x, avg, percent: (w - x) / w });
        }
    }
    
    darkCols.sort((a, b) => a.avg - b.avg);
    console.log("Darkest columns:");
    darkCols.slice(0, 15).forEach(c => {
        console.log(`Col ${c.x} (from right: ${c.fromRight}, ${Math.round(c.percent * 1000) / 10}%): avg = ${c.avg}`);
    });
}

main();
