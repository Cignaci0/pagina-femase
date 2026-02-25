const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const dashboardDir = path.join(__dirname, 'src', 'pages', 'DASHBOARD');

walkDir(dashboardDir, (filePath) => {
    if (filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Check if it already has stickyHeader, if not, add it
        if (content.includes('<Table ') && !content.includes('<Table stickyHeader')) {
            content = content.replace(/<Table /g, '<Table stickyHeader ');
            changed = true;
        }

        // Replace <TableHead> with the styled <TableHead>
        if (content.match(/<TableHead(\s*)(\/?)>/)) {
            content = content.replace(/<TableHead(?:\s*)(?:>)/g, "<TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>");
            // Handle the case where TableHead might already have some props but not sx?
            // For now, replace simple <TableHead>
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
