const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminHorarios.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /enviarHoraSalidaColacionEdit\s*\)/,
    'enviarHoraSalidaColacionEdit,\n                  marcaColacionEdit\n              )'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminHorarios.jsx with regex");
