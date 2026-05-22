const fs = require('fs');
const path = require('path');

const src = "\\\\?\\C:\\Users\\John Lloyd Maulion\\Videos\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING";
const dest = "\\\\?\\C:\\Users\\John Lloyd Maulion\\Desktop\\Portfolio\\public\\PROJECT WORKS\\BUILDING INFORMATION MODELING";

try {
    console.log("Removing blurred folder...");
    fs.rmSync(dest, { recursive: true, force: true });
    
    console.log("Copying original backup folder...");
    fs.cpSync(src, dest, { recursive: true });
    
    console.log("Revert complete!");
} catch (e) {
    console.error("Error reverting:", e);
}
