const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminHorarios.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'enviarHoraSalidaColacionEdit\n              )',
    'enviarHoraSalidaColacionEdit,\n                  marcaColacionEdit\n              )'
);

content = content.replace(
    'enviarHoraSalidaColacionEdit\r\n              )',
    'enviarHoraSalidaColacionEdit,\r\n                  marcaColacionEdit\r\n              )'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminHorarios.jsx again");
