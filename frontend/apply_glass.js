const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else if (dirFile.endsWith('.jsx')) {
            filelist.push(dirFile);
        }
    });
    return filelist;
};

const files = walkSync('c:/Users/ashri/OneDrive/Documents/car_website/frontend/src/pages');

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Replace solid white backgrounds with glassmorphism
    content = content.replace(/backgroundColor:\s*['"]#fff['"]/g, "backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white'");
    content = content.replace(/backgroundColor:\s*['"]white['"]/g, "backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white'");
    
    // Replace light gray backgrounds with translucent dark
    content = content.replace(/backgroundColor:\s*['"]#f8f9fa['"]/g, "backgroundColor: 'rgba(0,0,0,0.3)'");
    content = content.replace(/backgroundColor:\s*['"]#f8fafc['"]/g, "backgroundColor: 'rgba(0,0,0,0.3)'");
    content = content.replace(/backgroundColor:\s*['"]#eef2ff['"]/g, "backgroundColor: 'rgba(0,0,0,0.3)'");
    content = content.replace(/backgroundColor:\s*['"]#e9ecef['"]/g, "backgroundColor: 'rgba(0,0,0,0.3)'");

    // Replace solid borders with translucent borders
    content = content.replace(/border:\s*['"]1px solid #ddd['"]/g, "border: '1px solid rgba(255,255,255,0.2)'");
    content = content.replace(/border:\s*['"]1px solid #e2e8f0['"]/g, "border: '1px solid rgba(255,255,255,0.2)'");
    content = content.replace(/border:\s*['"]1px solid #f1f5f9['"]/g, "border: '1px solid rgba(255,255,255,0.2)'");

    // Remove text color overrides that force dark text
    content = content.replace(/color:\s*['"]#333['"]/g, "color: 'white'");
    content = content.replace(/color:\s*['"]#555['"]/g, "color: 'white'");
    content = content.replace(/color:\s*['"]#64748b['"]/g, "color: 'white'");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Modified ${modifiedCount} files.`);
