const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/sequence');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

(async () => {
  let count = 0;
  // Process in batches of 10 to speed it up and avoid timeouts
  for (let i = 0; i < files.length; i += 10) {
    const batch = files.slice(i, i + 10);
    await Promise.all(batch.map(async (file) => {
      const filePath = path.join(dir, file);
      const newFilePath = filePath.replace('.png', '.webp');
      await sharp(filePath)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 60 })
        .toFile(newFilePath);
      fs.unlinkSync(filePath); // Delete original
      count++;
    }));
    console.log(`Processed ${count}/${files.length}...`);
  }
  console.log(`Done compressing ${count} images!`);
})();
