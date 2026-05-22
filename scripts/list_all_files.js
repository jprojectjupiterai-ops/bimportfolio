const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, "../public/PROJECT WORKS/BUILDING INFORMATION MODELING");

function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(fullPath));
        } else {
            results.push(path.relative(baseDir, fullPath));
        }
    }
    return results;
}

const all = getFiles(baseDir);
console.log(`Total files in BIM folder: ${all.length}`);
fs.writeFileSync(path.join(__dirname, "all_bim_files.json"), JSON.stringify(all, null, 2));
console.log("Saved list to all_bim_files.json");
