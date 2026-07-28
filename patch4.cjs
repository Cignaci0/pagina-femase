const fs = require('fs');
let c = fs.readFileSync('C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminTurnos.jsx', 'utf8');

const effectCode = `    useEffect(() => {
        try {
            const token = window.localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.empresa_id) {
                    setFiltroEmpresaAsignar(payload.empresa_id);
                    setEmpresaCrear(payload.empresa_id);
                }
            }
        } catch(e){}
    }, []);

`;

const idx = c.indexOf('useEffect(() => {');
if (idx !== -1 && !c.includes('setFiltroEmpresaAsignar(payload.empresa_id);')) {
    c = c.substring(0, idx) + effectCode + c.substring(idx);
    fs.writeFileSync('C:/proyectos/pagina-femase/src/pages/DASHBOARD/turnos/AdminTurnos.jsx', c);
    console.log("Patched!");
} else {
    console.log("Not patched. Maybe already patched or no useEffect found.");
}
