const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            // Skip admin folder! Admin stays glassmorphism/dark theme.
            if (!dirFile.includes('admin')) {
                filelist = walkSync(dirFile, filelist);
            }
        } else if (dirFile.endsWith('.jsx')) {
            filelist.push(dirFile);
        }
    });
    return filelist;
};

// Only process files directly in pages/ (user pages)
const files = walkSync('c:/Users/ashri/OneDrive/Documents/car_website/frontend/src/pages');

let modifiedCount = 0;

files.forEach(file => {
    if (file.includes('admin')) return; // Double check skip

    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Revert glassmorphism to solid white
    content = content.replace(/backgroundColor:\s*['"]rgba\(255,255,255,0\.1\)['"],\s*backdropFilter:\s*['"]blur\(10px\)['"],\s*color:\s*['"]white['"]/g, "backgroundColor: '#fff'");
    
    // Revert borders
    content = content.replace(/border:\s*['"]1px solid rgba\(255,255,255,0\.2\)['"]/g, "border: '1px solid #e2e8f0'");

    // Revert translucent dark backgrounds to light grey
    content = content.replace(/backgroundColor:\s*['"]rgba\(0,0,0,0\.3\)['"]/g, "backgroundColor: '#f8fafc'");

    // Revert hardcoded white text to dark text
    content = content.replace(/color:\s*['"]white['"]/g, "color: '#1e293b'");
    
    // Fix specific cases where we don't want color: '#1e293b' if it was a button (heuristic: usually buttons have backgroundColor #007bff or #ef4444)
    // Wait, let's just do a manual check if needed, but changing 'white' to '#1e293b' might break button text.
    // Let's only revert the specific glassmorphism block first.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
    }
});

console.log(`Reverted ${modifiedCount} files in User section.`);
