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

        // 1. Remove filasVacias calculation
        // const filasVacias = filaPorPagina - Math.min(filaPorPagina, data.length - pagina * filaPorPagina);
        const filasVaciasRegex = /const\s+filasVacias\s*=\s*(?:[a-zA-Z0-9_]+)\s*-\s*Math\.min\([^)]+\);\s*/g;
        if (content.match(filasVaciasRegex)) {
            content = content.replace(filasVaciasRegex, '');
            changed = true;
        }

        // 2. Remove the JSX rendering the empty rows
        /*
          {filasVacias > 0 && (
              <TableRow style={{ height: 53 * (empresasFiltradas.length === 0 ? Math.max(0, filasVacias - 1) : filasVacias) }}>
                  <TableCell colSpan={10} />
              </TableRow>
          )}
        */
        const emptyRowsJsxRegex = /\{\s*filasVacias\s*>\s*0\s*&&\s*\([\s\S]*?<TableRow[\s\S]*?<\/TableRow>\s*\)\s*\}/g;
        if (content.match(emptyRowsJsxRegex)) {
            content = content.replace(emptyRowsJsxRegex, '');
            changed = true;
        }

        // 3. Remove fixed height from main wrapper to allow it to shrink
        // height: "70vh" -> minHeight: "70vh" or just remove it. Let's change height: "70vh" to minHeight: "400px" maybe?
        // Actually, setting it to display flex and removing height might be better, or just removing height entirely
        // so it grows with content up to whatever max
        // Let's just find `height: "70vh"` or similar `height: '70vh'` and change to `height: "100%", maxHeight: "70vh"` or `height: "100%", minHeight: "400px"`
        // We will just change `height: "70vh"` to `height: "100%", minHeight: "70vh"` to not break the layout for now 
        // Wait, the user said it scrolls inside the table box. The table box itself should adapt. 
        // Table container has `position: "absolute", top: 0, left: 0, right: 0, bottom: 0`. This forces it to take exactly the height of the parent.
        // Let's test just removing `filasVacias` first.

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Removed empty rows from:', filePath);
        }
    }
});
