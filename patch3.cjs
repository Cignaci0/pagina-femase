const fs = require('fs');
const path = require('path');

const dirPath = "C:\\proyectos\\pagina-femase\\src\\pages\\DASHBOARD";
let files = [];

function traverse(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            traverse(file);
        } else {
            if (file.endsWith('.jsx')) files.push(file);
        }
    });
}
traverse(dirPath);

const targetSetters = ['setNuevoEmpresa', 'setNuevaEmpresa', 'setIdEmpresaCrear', 'setEmpresaCrear'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    let settersToInject = [];
    for (const setter of targetSetters) {
        if (content.includes(setter)) {
            settersToInject.push(`${setter}(payload.empresa_id);`);
            
            // Replace setter("") with setter(filtroEmpresa || "")
            // Notice: sometimes it's setter('') or setter( "")
            const regex = new RegExp(setter + '\\(\\s*(["\']{2})\\s*\\)', 'g');
            if (regex.test(content)) {
                content = content.replace(regex, `${setter}(filtroEmpresa || "")`);
                changed = true;
            }
        }
    }

    if (settersToInject.length > 0) {
        const insertion = settersToInject.join('\n                    ');
        
        if (content.includes('if (payload.empresa_id) {') && !content.includes(settersToInject[0])) {
            content = content.replace(
                'if (payload.empresa_id) {', 
                `if (payload.empresa_id) {\n                    ${insertion}`
            );
            changed = true;
        }
    }
    
    // Also check for state initialization, e.g. const [nuevoEmpresa, setNuevoEmpresa] = useState("")
    // We can replace it with const [nuevoEmpresa, setNuevoEmpresa] = useState(filtroEmpresa || "")
    // But filtroEmpresa might not be defined before this line. So it's better to just let the useEffect handle it.

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log("Patched token decode and clearing for create:", file);
    }
}
