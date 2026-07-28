const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminHorarios.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
const state1 = `    const [nocturno, setNocturno] = useState(false)`;
const state1_replace = `    const [nocturno, setNocturno] = useState(false)\n    const [marcaColacionCrear, setMarcaColacionCrear] = useState(true)`;
if (!content.includes('setMarcaColacionCrear')) {
    content = content.replace(state1, state1_replace);
}

const state2 = `    const [nocturnoEdit, setNocturnoEdit] = useState(false)`;
const state2_replace = `    const [nocturnoEdit, setNocturnoEdit] = useState(false)\n    const [marcaColacionEdit, setMarcaColacionEdit] = useState(true)`;
if (!content.includes('setMarcaColacionEdit')) {
    content = content.replace(state2, state2_replace);
}

// 2. Add to crearHorario
content = content.replace(
    /crearHorario\(\s*enviarHoraEntradaCrear,\s*enviarHoraSalidaCrear,\s*idEmpresaCrear,\s*enviarHolguraCrear,\s*enviarColacionCrear,\s*nocturno,\s*enviarHoraEntradaColacionCrear,\s*enviarHoraSalidaColacionCrear\s*\)/,
    `crearHorario(
                  enviarHoraEntradaCrear,
                  enviarHoraSalidaCrear,
                  idEmpresaCrear,
                  enviarHolguraCrear,
                  enviarColacionCrear,
                  nocturno,
                  enviarHoraEntradaColacionCrear,
                  enviarHoraSalidaColacionCrear,
                  marcaColacionCrear
              )`
);

// 3. Add to modificarHorario
content = content.replace(
    /modificarHorario\(\s*horarioSelected,\s*enviarHoraEntradaEdit,\s*enviarHoraSalidaEdit,\s*idEmpresaEdit,\s*enviarHolguraEdit,\s*enviarColacionEdit,\s*nocturnoEdit,\s*enviarHoraEntradaColacionEdit,\s*enviarHoraSalidaColacionEdit\s*\)/,
    `modificarHorario(
                  horarioSelected,
                  enviarHoraEntradaEdit,
                  enviarHoraSalidaEdit,
                  idEmpresaEdit,
                  enviarHolguraEdit,
                  enviarColacionEdit,
                  nocturnoEdit,
                  enviarHoraEntradaColacionEdit,
                  enviarHoraSalidaColacionEdit,
                  marcaColacionEdit
              )`
);

// 4. Reset state on error/success
content = content.replace(/setNocturno\(false\)/g, `setNocturno(false)\n            setMarcaColacionCrear(true)`);

// 5. Add to onClick (edit)
content = content.replace(
    /setNocturnoEdit\(row\.nocturno\);/g,
    `setNocturnoEdit(row.nocturno);\n                                                            setMarcaColacionEdit(row.marca_colacion !== false);` // Default to true if undefined
);

// 6. Table Header
content = content.replace(
    /<TableCell width="15%" align="center"><strong>Nocturno<\/strong><\/TableCell>/g,
    `<TableCell width="15%" align="center"><strong>Nocturno</strong></TableCell>\n                                    <TableCell width="15%" align="center"><strong>Marca Colación</strong></TableCell>`
);

// 7. Table Body
content = content.replace(
    /<TableCell align="center">{row\.nocturno \? "Si" : "No"}<\/TableCell>/g,
    `<TableCell align="center">{row.nocturno ? "Si" : "No"}</TableCell>\n                                                <TableCell align="center">{row.marca_colacion !== false ? "Si" : "No"}</TableCell>`
);

// 8. Crear UI
const selectCrear = `
                                <FormControl size="small" sx={{ mb: 2, width: "40vh", mx: "auto" }}>
                                    <InputLabel>Marca Colación</InputLabel>
                                    <Select value={marcaColacionCrear} onChange={(e) => setMarcaColacionCrear(e.target.value)} label="Marca Colación">
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
`;
content = content.replace(
    /<TextField\s*size="small"\s*label="Nocturno"\s*value=\{nocturno === true \? "Si" : nocturno === false \? "No" : ""\}\s*disabled\s*InputLabelProps=\{\{\s*shrink: true\s*\}\}\s*sx=\{\{ mb: 2, width: "40vh", mx: "auto" \}\}\s*\/>/,
    `$&${selectCrear}`
);

// 9. Edit UI
const selectEdit = `
                                <FormControl size="small" sx={{ mb: 2, width: "40vh", mx: "auto" }}>
                                    <InputLabel>Marca Colación</InputLabel>
                                    <Select value={marcaColacionEdit} onChange={(e) => setMarcaColacionEdit(e.target.value)} label="Marca Colación">
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>
`;
content = content.replace(
    /<TextField\s*size="small"\s*label="Nocturno"\s*value=\{nocturnoEdit === true \? "Si" : nocturnoEdit === false \? "No" : ""\}\s*disabled\s*InputLabelProps=\{\{\s*shrink: true\s*\}\}\s*sx=\{\{ mb: 2, width: "40vh", mx: "auto" \}\}\s*\/>/,
    `$&${selectEdit}`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminHorarios.jsx");
