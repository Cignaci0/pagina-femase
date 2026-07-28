const fs = require('fs');
const path = require('path');

const files = [
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminCargos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminCentroCosto.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminDepartamentos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminEmpleados.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\ausencias\\AdminAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\ausencias\\IngresarAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\calculo asistencia\\AutorizacionHorasExtras.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\calculo asistencia\\AutorizaDiasCompensacion.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Documentos y Firmas\\Documentos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Documentos y Firmas\\Firmas.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Documentos y Firmas\\Solicitudes.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Fiscalizador\\ReportesFiscalizador.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\marcas asistencia\\AdminMarcas.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteAsistencia.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\Reporteconexiones.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteVacaciones.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\teletrabajo\\AsignacionTeletrabajo.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\turnos\\AdminAsignacionTurnoRotativo.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\turnos\\AdminHorarios.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\usuarios\\AdminUsuario.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\vacaciones\\VacacionesProgresivas.jsx"
];

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log("Missing:", file);
        continue;
    }

    let content = fs.readFileSync(file, 'utf8');

    // Check if setFiltroEmpresa exists
    if (!content.includes('setFiltroEmpresa(')) {
        continue; // Doesn't have the state
    }
    
    // Check if we already patched it
    if (content.includes('setFiltroEmpresa(payload.empresa_id)')) {
        console.log("Already patched:", file);
        continue;
    }

    // Replace setUserInfo(payload); with the patch
    const patch = `setUserInfo(payload);
                if (payload.empresa_id) {
                    setFiltroEmpresa(payload.empresa_id);
                }`;

    // There might be different spacing, let's use a regex
    const regex = /setUserInfo\(\s*payload\s*\)\s*;/g;
    if (regex.test(content)) {
        content = content.replace(regex, patch);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Patched:", file);
    } else {
        console.log("Could not find setUserInfo(payload); in", file);
    }
}
