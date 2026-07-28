const fs = require('fs');

const files = [
    'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminTurnos.jsx',
    'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminAsignacionTurnoRotativo.jsx',
    'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminTurnosRotativo.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1
        content = content.replace(
            /\{h\.hora_entrada\.slice\(0, 5\)\} - \{h\.hora_salida\.slice\(0, 5\)\} \/ col: \{h\.colacion \|\| "00:00:00"\}/g,
            '{h.hora_entrada.slice(0, 5)} - {h.hora_salida.slice(0, 5)} / col: {h.colacion || "00:00:00"} / mar-col: {h.marca_colacion !== false ? "Si" : "No"}'
        );
        
        // 2
        content = content.replace(
            /return `\$\{entrada\} - \$\{salida\} \/ col: \$\{minCol\}`;/g,
            'return `${entrada} - ${salida} / col: ${minCol} / mar-col: ${h.marca_colacion !== false ? "Si" : "No"}`;'
        );
        
        // 3
        content = content.replace(
            /\{h\.hora_entrada\.slice\(0, 5\)\} - \{h\.hora_salida\.slice\(0, 5\)\} \/ col: \{colMins\}/g,
            '{h.hora_entrada.slice(0, 5)} - {h.hora_salida.slice(0, 5)} / col: {colMins} / mar-col: {h.marca_colacion !== false ? "Si" : "No"}'
        );

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Patched ${file}`);
    }
});
