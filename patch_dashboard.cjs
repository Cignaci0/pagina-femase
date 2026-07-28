const fs = require('fs');

const dashboardPath = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/Dashboard.jsx';
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add import
if (!dashboardContent.includes('AdminFirmasEnviadas')) {
    dashboardContent = dashboardContent.replace(
        'import Firma from "../DASHBOARD/Documentos y Firmas/Firmas";',
        'import Firma from "../DASHBOARD/Documentos y Firmas/Firmas";\nimport AdminFirmasEnviadas from "../DASHBOARD/Documentos y Firmas/AdminFirmasEnviadas";'
    );

    // 2. Add to COMPONENTES_VISTA
    dashboardContent = dashboardContent.replace(
        '"Firmas": <Firma />,',
        '"Firmas": <Firma />,\n  "Firmas Enviadas": <AdminFirmasEnviadas />,'
    );

    // 3. Inject into dynamic menu
    const originalMapping = `
        const data = await obtenerSubMenusPerfil(storedUser);

        if (Array.isArray(data)) {
          const menusFormateados = data.map(m => ({
            title: m.nombre_menu,
            children: m.submenus ? m.submenus.map(sub => sub.nombre_modulo) : []
          }));
          setMenuItems(menusFormateados);
        }`;

    const newMapping = `
        const data = await obtenerSubMenusPerfil(storedUser);

        if (Array.isArray(data)) {
          const menusFormateados = data.map(m => {
            let submenus = m.submenus ? m.submenus.map(sub => sub.nombre_modulo) : [];
            // Inyectar Firmas Enviadas si es admin y esta en menu Documentos y Firmas
            if (m.nombre_menu === "Documentos y Firmas" && storedUser === "1" && !submenus.includes("Firmas Enviadas")) {
              submenus.push("Firmas Enviadas");
            }
            return {
              title: m.nombre_menu,
              children: submenus
            };
          });
          setMenuItems(menusFormateados);
        }`;

    dashboardContent = dashboardContent.replace(originalMapping, newMapping);
    
    // Also support CRLF just in case
    const originalMappingCRLF = `
        const data = await obtenerSubMenusPerfil(storedUser);\r
\r
        if (Array.isArray(data)) {\r
          const menusFormateados = data.map(m => ({\r
            title: m.nombre_menu,\r
            children: m.submenus ? m.submenus.map(sub => sub.nombre_modulo) : []\r
          }));\r
          setMenuItems(menusFormateados);\r
        }`;
        
    dashboardContent = dashboardContent.replace(originalMappingCRLF, newMapping);

    fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
    console.log("Patched Dashboard.jsx");
} else {
    console.log("AdminFirmasEnviadas already imported.");
}
