const fs = require('fs');

const servicePath = 'C:/proyectos/pagina-femase/src/services/documentosYFirmas.js';
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const obtenerFirmasAdmin = `
//Obtener firmas admin
export const obtenerFirmasAdmin = async (empresa_id) => {
    try {
        const response = await fetch(\`\${API_URL}/firmas/admin/\${empresa_id}\`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        return [];
    }
};

//Obtener firmas`;

if (!serviceContent.includes('obtenerFirmasAdmin')) {
    serviceContent = serviceContent.replace('//Obtener firmas', obtenerFirmasAdmin);
    fs.writeFileSync(servicePath, serviceContent, 'utf8');
    console.log("Added obtenerFirmasAdmin to documentosYFirmas.js");
}
