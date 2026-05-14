import React, { useEffect, useState } from "react";
import {
    Box, Paper, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Divider
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Send as SendIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Services
import { obtenerDocumento, crearDocumento, actualizarDocumento, crearFirma, eliminarDocumento } from "../../../services/documentosYFirmas";
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDeptoPorEmpresa } from "../../../services/departamentosServices";
import { obtenerCencosPorDepto } from "../../../services/centroCostosServices";
import { obtenerPorEmpresa as obtenerEmpleadosPorEmpresa } from "../../../services/empleadosServices";

function Documento() {
    const [documentos, setDocumentos] = useState([]);
    const [editId, setEditId] = useState(null);
    const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
        const stored = localStorage.getItem('empresaId');
        return stored ? parseInt(stored) : "";
    });

    // Pagination states
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    
    // Cascading Filter States
    const [empresas, setEmpresas] = useState([]);
    const [deptos, setDeptos] = useState([]);
    const [cencos, setCencos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    
    const [selectedEmpresa, setSelectedEmpresa] = useState("");
    const [selectedDepto, setSelectedDepto] = useState("");
    const [selectedCenco, setSelectedCenco] = useState("");
    const [selectedEmpleado, setSelectedEmpleado] = useState("");

    // Document States
    const [nombreDoc, setNombreDoc] = useState("");
    const [tipoDoc, setTipoDoc] = useState("Anexos");
    const [contenido, setContenido] = useState("");

    // Quill Configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    // Load initial data
    const fetchDocumentos = async (empresa_id) => {
        if (!empresa_id) {
            setDocumentos([]);
            return;
        }
        const data = await obtenerDocumento(empresa_id);
        setDocumentos(data);
    };

    useEffect(() => {
        if (filtroEmpresa) {
            fetchDocumentos(filtroEmpresa);
        }
    }, [filtroEmpresa]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const data = await obtenerEmpresas();
            setEmpresas(data);
            if (data.length > 0) {
                setFiltroEmpresa(data[0].empresa_id);
            }
        };
        fetchInitialData();
    }, []);

    // Handle Cascading Logic
    useEffect(() => {
        if (selectedEmpresa) {
            obtenerDeptoPorEmpresa(selectedEmpresa).then(setDeptos);
            obtenerEmpleadosPorEmpresa(selectedEmpresa).then(setEmpleados);
        } else {
            setDeptos([]);
            setEmpleados([]);
        }
        setSelectedDepto("");
        setSelectedCenco("");
        setSelectedEmpleado("");
    }, [selectedEmpresa]);

    useEffect(() => {
        if (selectedDepto) {
            obtenerCencosPorDepto(selectedDepto).then(setCencos);
        } else {
            setCencos([]);
        }
        setSelectedCenco("");
        setSelectedEmpleado("");
    }, [selectedDepto]);

    const filteredEmpleados = selectedCenco 
        ? (empleados || []).filter(e => e.cenco?.cenco_id === selectedCenco || e.cenco === selectedCenco)
        : (empleados || []);

    const handleOpenModal = () => {
        setIsAssigning(false); // Nueva plantilla
        setEditId(null);
        setSelectedEmpresa(filtroEmpresa); // Pre-cargar empresa del filtro
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditId(null);
        setSelectedEmpresa("");
        setSelectedDepto("");
        setSelectedCenco("");
        setSelectedEmpleado("");
        setNombreDoc("");
        setTipoDoc("Anexos");
        setContenido("");
    };

    const handleAction = async () => {
        try {
            const token = localStorage.getItem("token");
            let usuario_id = null;
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    usuario_id = payload.usuario_id;
                } catch (e) {
                    console.error("Error decoding token for usuario_id", e);
                }
            }

            if (isAssigning) {
                await crearFirma(nombreDoc, tipoDoc, contenido, selectedEmpresa, selectedEmpleado, usuario_id);
                toast.success("Documento enviado al empleado para firma");
            } else {
                if (editId) {
                    await actualizarDocumento(editId, nombreDoc, tipoDoc, contenido);
                    toast.success("Documento actualizado correctamente");
                } else {
                    await crearDocumento(nombreDoc, tipoDoc, contenido, selectedEmpresa);
                    toast.success("Documento creado correctamente");
                }
                await fetchDocumentos(filtroEmpresa);
            }
            handleCloseModal();
        } catch (error) {
            toast.error(error.message || "Error al procesar la solicitud");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleEdit = (doc) => {
        setIsAssigning(false); // Modo edición de plantilla
        setEditId(doc.id);
        setNombreDoc(doc.nombre);
        setTipoDoc(doc.tipo);
        setContenido(doc.texto || "");
        setSelectedEmpresa(doc.empresa?.empresa_id || doc.empresa || "");
        setOpenModal(true);
    };

    const handleSendIconClick = (doc) => {
        setIsAssigning(true); // Modo asignación/envío
        setEditId(doc.id);
        setNombreDoc(doc.nombre);
        setTipoDoc(doc.tipo);
        setContenido(doc.texto || "");
        setOpenModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Está seguro que desea eliminar este documento?")) {
            try {
                await eliminarDocumento(id);
                toast.success("Documento eliminado con éxito");
                fetchDocumentos(filtroEmpresa);
            } catch (error) {
                toast.error(error.message || "Error al eliminar el documento");
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Documentos
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel>Filtrar por Empresa</InputLabel>
                        <Select
                            value={filtroEmpresa}
                            onChange={(e) => setFiltroEmpresa(e.target.value)}
                            label="Filtrar por Empresa"
                        >
                            {empresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        disableElevation 
                        sx={{ height: "40px", ml: 'auto' }}
                        onClick={handleOpenModal}
                    >
                        Nuevo Registro
                    </Button>
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {documentos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                No tiene registros
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documentos
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow 
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <TableCell>{row.nombre}</TableCell>
                                                <TableCell>{row.tipo}</TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                        <IconButton onClick={() => handleEdit(row)} sx={{ padding: 0 }} title="Editar plantilla">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleSendIconClick(row)} sx={{ padding: 0 }} title="Enviar a empleado" color="primary">
                                                            <SendIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton onClick={() => handleDelete(row.id)} sx={{ padding: 0 }} title="Eliminar documento" color="error">
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
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
                    count={documentos.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialogo Dual (Plantilla / Envío) */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#f5f7f9', minHeight: '80vh' } }}>
                <DialogContent>
                    {!isAssigning ? (
                        /* Modo Plantilla (Nueva o Editar): Empresa, Nombre y Tipo */
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 2 }}>
                                <InputLabel>empresa</InputLabel>
                                <Select value={selectedEmpresa} onChange={(e) => setSelectedEmpresa(e.target.value)} label="empresa">
                                    {empresas.map(emp => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                fullWidth
                                label="nombre"
                                value={nombreDoc}
                                onChange={(e) => setNombreDoc(e.target.value)}
                                sx={{ bgcolor: 'white', borderRadius: 2 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white', borderRadius: 2 }}>
                                <InputLabel>tipo</InputLabel>
                                <Select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)} label="tipo">
                                    <MenuItem value="Anexos">Anexos</MenuItem>
                                    <MenuItem value="Pactos">Pactos</MenuItem>
                                    <MenuItem value="Notificacion">Notificación</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    ) : (
                        /* Modo Asignación (Enviar): Filtros en Cascada */
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <InputLabel>empresa</InputLabel>
                                <Select value={selectedEmpresa} onChange={(e) => setSelectedEmpresa(e.target.value)} label="empresa">
                                    {empresas.map(emp => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} disabled={!selectedEmpresa}>
                                <InputLabel>depto</InputLabel>
                                <Select value={selectedDepto} onChange={(e) => setSelectedDepto(e.target.value)} label="depto">
                                    {deptos.map(dep => (
                                        <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} disabled={!selectedDepto}>
                                <InputLabel>cenco</InputLabel>
                                <Select value={selectedCenco} onChange={(e) => setSelectedCenco(e.target.value)} label="cenco">
                                    {cencos.map(cen => (
                                        <MenuItem key={cen.cenco_id} value={cen.cenco_id}>{cen.nombre_cenco}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }} disabled={!selectedEmpresa}>
                                <InputLabel>empleado</InputLabel>
                                <Select value={selectedEmpleado} onChange={(e) => setSelectedEmpleado(e.target.value)} label="empleado">
                                    {filteredEmpleados.map(emp => (
                                        <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                            {emp.nombres} {emp.apellido_paterno}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* Contenedor del Editor (Común para ambos) */}
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', minHeight: '400px' }}>
                        <ReactQuill 
                            theme="snow"
                            value={contenido}
                            onChange={setContenido}
                            modules={modules}
                            formats={formats}
                            placeholder="Escribe aquí el contenido del documento..."
                            style={{ height: '350px' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
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
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Documento;