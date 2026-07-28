const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminHorarios.jsx';
let content = fs.readFileSync(file, 'utf8');

// For Create Button
content = content.replace(
    'minutoColacionCrear === "" || !colacionValidaCrear}>Guardar</Button>',
    'minutoColacionCrear === "" || horaEntradaColacionCrear === "" || minutoEntradaColacionCrear === "" || horaSalidaColacionCrear === "" || minutoSalidaColacionCrear === "" || !colacionValidaCrear}>Guardar</Button>'
);

// For Edit Button
content = content.replace(
    /minutoColacionEdit === ""\s*\|\|\s*!colacionValidaEdit/,
    'minutoColacionEdit === "" || horaEntradaColacionEdit === "" || minutoEntradaColacionEdit === "" || horaSalidaColacionEdit === "" || minutoSalidaColacionEdit === "" || !colacionValidaEdit'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminHorarios.jsx validation");
