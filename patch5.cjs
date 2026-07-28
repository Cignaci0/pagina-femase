const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/teletrabajo/AsignacionTeletrabajo.jsx';
let content = fs.readFileSync(file, 'utf8');

// The goal is to change `onChange={(e) => handleCambioEmpresa(e.target.value)}` to `onChange={(e) => setFiltroEmpresa(e.target.value)}`
content = content.replace('onChange={(e) => handleCambioEmpresa(e.target.value)}', 'onChange={(e) => setFiltroEmpresa(e.target.value)}');

// And replace handleCambioEmpresa declaration with a useEffect on filtroEmpresa
const searchFor = `    // Cuando cambia empresa, resetear departamento y cenco
    const handleCambioEmpresa = async (valor) => {
        setFiltroEmpresa(valor);
        setFiltroDepartamento("");
        setFiltroCenco("");
        setEmpleadosDisponibles([]);
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);

        if (valor) {
            try {
                const results = await obtenerPorEmpresa(valor);
                setEmpleados(results || []);
            } catch (error) {
                toast.error("Error al cargar empleados de la empresa", { id: tId });
                setEmpleados([]);
            }
        } else {
            setEmpleados([]);
        }
    }`;

const replaceWith = `    // Cuando cambia empresa, resetear departamento y cenco
    useEffect(() => {
        const cargarEmpleados = async () => {
            setFiltroDepartamento("");
            setFiltroCenco("");
            setEmpleadosDisponibles([]);
            setEmpleadosSeleccionados([]);
            setCheckedIzq([]);
            setCheckedDer([]);

            if (filtroEmpresa) {
                try {
                    const results = await obtenerPorEmpresa(filtroEmpresa);
                    setEmpleados(results || []);
                } catch (error) {
                    toast.error("Error al cargar empleados de la empresa");
                    setEmpleados([]);
                }
            } else {
                setEmpleados([]);
            }
        };
        cargarEmpleados();
    }, [filtroEmpresa]);`;

if (content.includes('const handleCambioEmpresa = async (valor) => {')) {
    content = content.replace(searchFor, replaceWith);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Patched AsignacionTeletrabajo.jsx successfully");
} else {
    console.log("Could not find handleCambioEmpresa to replace.");
}
