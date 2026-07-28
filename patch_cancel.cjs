const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/Documentos y Firmas/Documentos.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `<DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button 
                        variant="outlined" 
                        color="error"
                        disableElevation
                        sx={{ px: 6, py: 1, borderRadius: 2, mr: 2 }}
                        onClick={handleCloseModal}
                    >
                        CANCELAR
                    </Button>
                    <Button`;

content = content.replace("<DialogActions sx={{ p: 3, justifyContent: 'center' }}>\r\n                    <Button", replacement);
content = content.replace("<DialogActions sx={{ p: 3, justifyContent: 'center' }}>\n                    <Button", replacement);

fs.writeFileSync(file, content, 'utf8');
console.log("Added cancel button");
