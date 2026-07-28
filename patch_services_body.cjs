const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/services/horariosServices.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    'hora_fin_colacion: hora_salida_colacion',
    'hora_fin_colacion: hora_salida_colacion,\n      marca_colacion: marca_colacion'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched body in horariosServices.js");
