const fs = require('fs');

const docPath = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/Documentos y Firmas/Documentos.jsx';
let docContent = fs.readFileSync(docPath, 'utf8');

// Add new imports
if (!docContent.includes('VisibilityIcon')) {
    docContent = docContent.replace(
        'import { Add as AddIcon, Edit as EditIcon, Send as SendIcon, Delete as DeleteIcon } from "@mui/icons-material";',
        'import { Add as AddIcon, Edit as EditIcon, Send as SendIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";'
    );
}

if (!docContent.includes('Tabs')) {
    docContent = docContent.replace(
        'Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Divider',
        'Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Divider, Tabs, Tab'
    );
}

if (!docContent.includes('obtenerMisFirmasEnviadas')) {
    docContent = docContent.replace(
        'obtenerDocumento, crearDocumento, actualizarDocumento, crearFirma, eliminarDocumento',
        'obtenerDocumento, crearDocumento, actualizarDocumento, crearFirma, eliminarDocumento, obtenerMisFirmasEnviadas'
    );
}

// Add state for Tabs and MisFirmas
if (!docContent.includes('const [tabValue, setTabValue] = useState(0);')) {
    docContent = docContent.replace(
        'const [documentos, setDocumentos] = useState([]);',
        'const [documentos, setDocumentos] = useState([]);\n    const [misFirmas, setMisFirmas] = useState([]);\n    const [tabValue, setTabValue] = useState(0);'
    );
}

// Fetch Mis Firmas Effect
if (!docContent.includes('fetchMisFirmas')) {
    docContent = docContent.replace(
        'const fetchInitialData = async () => {',
        `const fetchMisFirmas = async () => {\n        const data = await obtenerMisFirmasEnviadas();\n        setMisFirmas(data);\n    };\n\n    useEffect(() => {\n        if (tabValue === 1) {\n            fetchMisFirmas();\n        }\n    }, [tabValue]);\n\n    const fetchInitialData = async () => {`
    );
}

// Update Tabs and Conditional Rendering
const originalTitleBox = `<Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Documentos
                    </Typography>
                </Box>

            <Paper elevation={2} sx={{`;

const newTitleBox = `<Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Documentos
                    </Typography>
                    <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                        <Tab label="Plantillas" />
                        <Tab label="Mis Envíos" />
                    </Tabs>
                </Box>

            {tabValue === 0 && (
            <Paper elevation={2} sx={{`;

docContent = docContent.replace(originalTitleBox, newTitleBox);

// Close Paper and add second tab
const endPaperRegex = /<\/Paper>\s*\{\/\* Dialogo Dual/;
const secondTabJSX = `</Paper>
            )}

            {tabValue === 1 && (
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell><strong>Empleado</strong></TableCell>
                                    <TableCell><strong>Nombre Doc</strong></TableCell>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell align="center"><strong>Visto en Correo</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Ver</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {misFirmas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                No hay documentos enviados por ti
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    misFirmas
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow 
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <TableCell>{row.empleado?.nombres} {row.empleado?.apellido_paterno}</TableCell>
                                                <TableCell>{row.nombre}</TableCell>
                                                <TableCell>{row.tipo}</TableCell>
                                                <TableCell align="center">
                                                    {row.leido ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#4caf50' }}>
                                                            <VisibilityIcon fontSize="small" /> Sí
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#9e9e9e' }}>
                                                            <VisibilityOffIcon fontSize="small" /> No
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: row.estado === "A" ? "#4caf50" : row.estado === "R" ? "#f44336" : "#ffeb3b",
                                                                boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                                                            }}
                                                        />
                                                        <Typography variant="body2">
                                                            {row.estado === "A" ? "Aprobada" : row.estado === "R" ? "Rechazada" : "Pendiente"}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button variant="outlined" size="small" onClick={() => {
                                                        setNombreDoc(row.nombre);
                                                        setContenido(row.texto || "");
                                                        setEditId(null);
                                                        setIsAssigning(false); // We can just use the modal as read-only or a custom view
                                                        setOpenModal(true);
                                                    }}>
                                                        Ver
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={misFirmas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => \`\${from}-\${to} de \${count}\`}
                />
            </Paper>
            )}

            {/* Dialogo Dual`;

docContent = docContent.replace(endPaperRegex, secondTabJSX);

// For the read-only view in the Modal when viewing sent doc, we can disable saving.
const saveButtonRegex = /<Button \n\s*variant="contained" \n\s*color="primary"[\s\S]*?\{isAssigning \? "enviar" : "guardar"\}\n\s*<\/Button>/;
const saveButtonReplacement = `{tabValue === 0 && (
                    <Button 
                        variant="contained" 
                        color="primary"
                        disableElevation
                        sx={{ px: 6, py: 1, borderRadius: 2 }}
                        disabled={!isAssigning ? (!nombreDoc || !selectedEmpresa) : !selectedEmpleado}
                        onClick={handleAction}
                    >
                        {isAssigning ? "enviar" : "guardar"}
                    </Button>
                    )}`;
docContent = docContent.replace(saveButtonRegex, saveButtonReplacement);

fs.writeFileSync(docPath, docContent, 'utf8');
console.log("Patched Documentos.jsx");
