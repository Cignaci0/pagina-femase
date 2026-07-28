const fs = require('fs');

const files = [
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminCargos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminCentroCosto.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminDepartamentos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\administracion\\AdminEmpleados.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\ausencias\\AdminAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\ausencias\\IngresarAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\calculo asistencia\\AutorizacionHorasExtras.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Documentos y Firmas\\Documentos.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\Fiscalizador\\ReportesFiscalizador.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteAsistencia.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteAusencias.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\Reporteconexiones.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\reportes informes\\ReporteVacaciones.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\teletrabajo\\AsignacionTeletrabajo.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\turnos\\AdminAsignacionTurnoRotativo.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\turnos\\AdminHorarios.jsx",
    "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD\\usuarios\\AdminUsuario.jsx"
];

const patchEffect = `
    useEffect(() => {
        try {
            const token = window.localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.empresa_id) {
                    setFiltroEmpresa(payload.empresa_id);
                }
            }
        } catch (e) {}
    }, []);
`;

for (const file of files) {
    if (!fs.existsSync(file)) continue;

    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('setFiltroEmpresa(payload.empresa_id)') && !content.includes('setUserInfo(payload);')) {
        console.log("Already patched (custom):", file);
        continue;
    }

    // Try finding the exact line where setFiltroEmpresa state ends
    // Usually it's either:
    // const [filtroEmpresa, setFiltroEmpresa] = useState("");
    // or
    // const [filtroEmpresa, setFiltroEmpresa] = useState(() => { ... });
    
    // We can just find `const [filtroEmpresa, setFiltroEmpresa] = useState`
    // And inject the useEffect after the first `useEffect` found or after the state declaration if simple.
    // Actually, finding the FIRST `useEffect` is safest.
    
    const useEffectIndex = content.indexOf('useEffect(() => {');
    if (useEffectIndex !== -1) {
        content = content.substring(0, useEffectIndex) + patchEffect + content.substring(useEffectIndex);
        fs.writeFileSync(file, content, 'utf8');
        console.log("Patched by inserting useEffect:", file);
    } else {
        // if no useEffect at all, inject before return (
        const returnIndex = content.indexOf('return (');
        if (returnIndex !== -1) {
            content = content.substring(0, returnIndex) + patchEffect + content.substring(returnIndex);
            fs.writeFileSync(file, content, 'utf8');
            console.log("Patched by inserting before return:", file);
        } else {
            console.log("Failed to patch:", file);
        }
    }
}
