const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/administracion/AdminEmpleados.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all instances of `variable.trim()` with `(variable || "").trim()`
// Only matching simple variables, not expressions.
const regex = /([a-zA-Z0-9_]+)\.trim\(\)/g;

content = content.replace(regex, (match, p1) => {
    return `(${p1} || "").trim()`;
});

fs.writeFileSync(file, content, 'utf8');
console.log("Patched trim() calls in AdminEmpleados.jsx");
