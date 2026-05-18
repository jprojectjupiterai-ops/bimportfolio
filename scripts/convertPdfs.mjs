import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf2img from 'pdf-img-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsDir = path.join(__dirname, '..', 'public', 'PROJECT WORKS');

async function convertPdfs(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      await convertPdfs(fullPath);
    } else if (file.toLowerCase().endsWith('.pdf')) {
      console.log(`Converting: ${fullPath}`);
      try {
        const outputImages = await pdf2img.convert(fullPath, {
          width: 2000,
          page_numbers: [1] // Convert only the first page or all? Let's just do page 1 assuming it's single page or they want the first page.
        });

        // The user asked to convert pdf into jpg. Architectural works might have multiple pages.
        // Let's convert all pages.
        const outputImagesAll = await pdf2img.convert(fullPath, {
          width: 2000,
        });

        if (outputImagesAll.length === 1) {
            const outPath = fullPath.replace(/\.pdf$/i, '.jpg');
            fs.writeFileSync(outPath, outputImagesAll[0]);
            console.log(`Saved: ${outPath}`);
        } else {
            for (let i = 0; i < outputImagesAll.length; i++) {
                const outPath = fullPath.replace(/\.pdf$/i, `_page_${i + 1}.jpg`);
                fs.writeFileSync(outPath, outputImagesAll[i]);
                console.log(`Saved: ${outPath}`);
            }
        }
        
        // Delete original PDF
        fs.unlinkSync(fullPath);
        console.log(`Deleted original: ${fullPath}`);
      } catch (err) {
        console.error(`Failed to convert ${fullPath}:`, err);
      }
    }
  }
}

async function run() {
    console.log("Starting PDF conversion...");
    await convertPdfs(projectsDir);
    console.log("Done.");
}

run();
