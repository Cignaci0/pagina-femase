const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminHorarios.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \[\, mH\] = \(row\.holgura_mins \|\| "00:00:00"\)\.split\(':'\);\s*setMinutoHolguraEdit\(mH \|\| "00"\);\s*const \[\, mC\] = \(row\.colacion \|\| "00:00:00"\)\.split\(':'\);\s*setMinutoColacionEdit\(mC \|\| "00"\);/g;

const replacement = `const [hH, mH] = (row.holgura_mins || "00:00:00").split(':');
                                                            const totalHolgura = parseInt(hH || "0", 10) * 60 + parseInt(mH || "0", 10);
                                                            setMinutoHolguraEdit(totalHolgura.toString());

                                                            const [hC, mC] = (row.colacion || "00:00:00").split(':');
                                                            const totalColacion = parseInt(hC || "0", 10) * 60 + parseInt(mC || "0", 10);
                                                            setMinutoColacionEdit(totalColacion.toString());`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched AdminHorarios.jsx time parsing");
