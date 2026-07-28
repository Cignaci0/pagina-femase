const fs = require('fs');
const file = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/Documentos y Firmas/Documentos.jsx';
let content = fs.readFileSync(file, 'utf8');

const printFunc = `
    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Imprimir Documento</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(contenido);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handleAction = async () => {`;

content = content.replace('const handleAction = async () => {', printFunc);

const printButton = `<DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button 
                        variant="outlined" 
                        color="secondary"
                        disableElevation
                        sx={{ px: 6, py: 1, borderRadius: 2, mr: 2 }}
                        onClick={handlePrint}
                        disabled={!contenido}
                    >
                        IMPRIMIR
                    </Button>
                    <Button`;

content = content.replace('<DialogActions sx={{ p: 3, justifyContent: \'center\' }}>\r\n                    <Button', printButton);
// Also support \n in case it uses LF
content = content.replace('<DialogActions sx={{ p: 3, justifyContent: \'center\' }}>\n                    <Button', printButton);

fs.writeFileSync(file, content, 'utf8');
console.log("Added print option to Documentos.jsx");
