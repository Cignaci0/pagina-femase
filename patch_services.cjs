const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/services/horariosServices.js';
let content = fs.readFileSync(file, 'utf8');

// Update crearHorario
content = content.replace(
    'export const crearHorario = async (hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion) => {',
    'export const crearHorario = async (hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion, marca_colacion) => {'
);

content = content.replace(
    `        body: JSON.stringify({
          hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_inicio_colacion: hora_entrada_colacion, hora_fin_colacion: hora_salida_colacion
        })`,
    `        body: JSON.stringify({
          hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_inicio_colacion: hora_entrada_colacion, hora_fin_colacion: hora_salida_colacion, marca_colacion
        })`
);

// Update modificarHorario
content = content.replace(
    'export const modificarHorario = async (horario_id, hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion) => {',
    'export const modificarHorario = async (horario_id, hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion, marca_colacion) => {'
);

content = content.replace(
    `        body: JSON.stringify({
          hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_inicio_colacion: hora_entrada_colacion, hora_fin_colacion: hora_salida_colacion
        })`,
    `        body: JSON.stringify({
          hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_inicio_colacion: hora_entrada_colacion, hora_fin_colacion: hora_salida_colacion, marca_colacion
        })`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched horariosServices.js");
