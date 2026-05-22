const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const scratchDir = path.resolve(__dirname);

async function findDarkest() {
    const files = fs.readdirSync(scratchDir).filter(f => f.startsWith('precise_') && f.endsWith('.jpg'));
    
    // Group by prefix (e.g. precise_weecomm_bottom)
    const groups = {};
    for (const file of files) {
        // e.g. precise_weecomm_bottom_90.jpg
        const match = file.match(/^(precise_.+_(bottom|right|top))_(\d+)\.jpg$/);
        if (match) {
            const groupName = match[1];
            const ratio = parseInt(match[3], 10) / 1000;
            if (!groups[groupName]) groups[groupName] = [];
            
            const buf = fs.readFileSync(path.join(scratchDir, file));
            const m = await sharp(buf).metadata();
            let sum = 0;
            const raw = await sharp(buf).raw().toBuffer();
            for(let i=0; i<raw.length; i+=m.channels) {
                sum += raw[i];
            }
            const avg = sum / (raw.length / m.channels);
            
            groups[groupName].push({ ratio, avg, file });
        }
    }
    
    for (const [groupName, items] of Object.entries(groups)) {
        items.sort((a, b) => a.avg - b.avg); // Sort by darkest first
        console.log(`${groupName}: darkest at ratio ${items[0].ratio.toFixed(3)} (avg ${items[0].avg.toFixed(1)})`);
        // Print top 3 darkest
        for(let i=1; i<Math.min(3, items.length); i++) {
            console.log(`    runner up: ${items[i].ratio.toFixed(3)} (avg ${items[i].avg.toFixed(1)})`);
        }
    }
}

findDarkest().catch(console.error);
