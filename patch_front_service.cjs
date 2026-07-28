const fs = require('fs');

const servicePath = 'C:/proyectos/pagina-femase/src/services/documentosYFirmas.js';
let serviceContent = fs.readFileSync(servicePath, 'utf8');

if (!serviceContent.includes('obtenerMisFirmasEnviadas')) {
    const newService = `
//Obtener mis firmas enviadas
export const obtenerMisFirmasEnviadas = async () => {
    try {
        const response = await fetch(\`\${API_URL}/firmas/enviados\`, {
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
    
    serviceContent = serviceContent.replace('//Obtener firmas', newService);
    fs.writeFileSync(servicePath, serviceContent, 'utf8');
    console.log("Patched documentosYFirmas.js");
}
