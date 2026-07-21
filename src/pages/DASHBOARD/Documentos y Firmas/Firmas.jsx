import React, { useEffect, useState } from "react";
import {
    Box, Paper, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TablePagination,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Divider
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Send as SendIcon } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Services
import { obtenerFirma, aprobarRechazarFirma } from "../../../services/documentosYFirmas";
import { obtenerEmpresas } from "../../../services/empresasServices";

function Firma() {
    const [firmas, setFirmas] = useState([]);
    const [editId, setEditId] = useState(null);
    const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
        const stored = localStorage.getItem('empresaId');
        return stored ? parseInt(stored) : "";
    });
    const [idEmpleado, setIdEmpleado] = useState(null);
    const [pin, setPin] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [selectedFirmaEstado, setSelectedFirmaEstado] = useState(null);
    const [selectedFirmaTipo, setSelectedFirmaTipo] = useState(null);
    
    // Motivo Rechazo
    const [openMotivo, setOpenMotivo] = useState(false);
    const [motivo, setMotivo] = useState("");

    // Pagination states
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);

    // Modal State
    const [openModal, setOpenModal] = useState(false);

    const [empresas, setEmpresas] = useState([]);

    // Document States
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

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("Token payload en Firmas:", payload);
                const uId = payload.usuario_id
                setIdEmpleado(uId);

                if (payload.empresa_id) {
                    setFiltroEmpresa(payload.empresa_id);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    // Load initial data
    const fetchFirmas = async (empresa_id, empleado_id) => {
        if (!empresa_id || !empleado_id) {
            setFirmas([]);
            return;
        }
        const data = await obtenerFirma(empresa_id, empleado_id);
        setFirmas(data);
    };

    useEffect(() => {
        if (filtroEmpresa && idEmpleado) {
            fetchFirmas(filtroEmpresa, idEmpleado);
        }
    }, [filtroEmpresa, idEmpleado]);

    useEffect(() => {
        const fetchInitialData = async () => {
            const data = await obtenerEmpresas();
            setEmpresas(data);
            setFiltroEmpresa((prevFiltro) => {
                if (!prevFiltro && data.length > 0) {
                    return data[0].empresa_id;
                }
                return prevFiltro;
            });
        };
        fetchInitialData();
    }, []);

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditId(null);
        setContenido("");
        setPin("");
        setSelectedFirmaEstado(null);
        setSelectedFirmaTipo(null);
    };

    const handleAprobar = async (estado, motivoRechazo = null) => {
        try {
            await aprobarRechazarFirma(editId, idEmpleado, parseInt(pin), estado, motivoRechazo);
            toast.success(estado === "A" ? (selectedFirmaTipo === "Notificacion" ? "Notificación aceptada" : "Documento aprobado correctamente") : "Documento rechazado correctamente");
            await fetchFirmas(filtroEmpresa, idEmpleado);
            handleCloseModal();
        } catch (error) {
            toast.error(error.message || "Error al procesar la firma");
        }
    };

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleAbrir = (firma) => {
        setEditId(firma.id);
        setContenido(firma.texto || "");
        setSelectedFirmaEstado(firma.estado);
        setSelectedFirmaTipo(firma.tipo);
        setOpenModal(true);
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Firmas
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

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            label="Estado"
                        >
                            <MenuItem value="TODOS">Todos</MenuItem>
                            <MenuItem value="P">Pendiente</MenuItem>
                            <MenuItem value="A">Aprobada</MenuItem>
                            <MenuItem value="R">Rechazada</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell align="center"><strong>estado</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {firmas.filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                No tiene registros
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    firmas
                                        .filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado)
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <TableCell>{row.nombre}</TableCell>
                                                <TableCell>{row.tipo}</TableCell>
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
                                                    <Button variant="outlined" size="small" onClick={() => handleAbrir(row)}>
                                                        abrir
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
                    count={firmas.filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado).length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialogo para Aprobar/Rechazar Firma */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#f5f7f9', minHeight: '60vh' } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Revisión de Firma</DialogTitle>
                <DialogContent>
                    {/* Contenedor del Editor Solo Lectura */}
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', minHeight: '300px', mb: 4, p: 2 }}>
                        <ReactQuill
                            theme="bubble"
                            value={contenido}
                            readOnly={true}
                        />
                    </Box>
                    {selectedFirmaEstado === "P" && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <TextField
                                label="PIN de firma"
                                type="password"
                                size="small"
                                value={pin}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^\d*$/.test(val) && val.length <= 4) {
                                        setPin(val);
                                    }
                                }}
                                inputProps={{ maxLength: 4, style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' } }}
                                sx={{ width: 200, bgcolor: 'white', borderRadius: 2 }}
                                placeholder="****"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    {selectedFirmaEstado === "P" ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                disableElevation
                                sx={{ px: 4, py: 1, borderRadius: 2 }}
                                disabled={pin.length !== 4}
                                onClick={() => handleAprobar("A")}
                            >
                                {selectedFirmaTipo === "Notificacion" ? "aceptar" : "aprobar"}
                            </Button>
                            {selectedFirmaTipo !== "Notificacion" && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    disableElevation
                                    sx={{ px: 4, py: 1, borderRadius: 2 }}
                                    disabled={pin.length !== 4}
                                    onClick={() => setOpenMotivo(true)}
                                >
                                    rechazar
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button onClick={handleCloseModal} variant="contained" sx={{ px: 4, borderRadius: 2 }}>
                            Cerrar
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Dialogo para el Motivo de Rechazo */}
            <Dialog open={openMotivo} onClose={() => setOpenMotivo(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Motivo de Rechazo</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Por favor, indique la razón por la cual está rechazando este documento.
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="Escriba el motivo aquí..."
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenMotivo(false)}>Cancelar</Button>
                    <Button 
                        onClick={() => {
                            handleAprobar("R", motivo);
                            setOpenMotivo(false);
                            setMotivo("");
                        }} 
                        variant="contained" 
                        color="error"
                        disabled={!motivo.trim()}
                    >
                        Confirmar Rechazo
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Firma;