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
import { obtenerSolicitudes, getByEmpleado, crearSolicitud, actualizarEstadoSolicitud } from "../../../services/solicitudesServices";
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerAdminPorEmpresa } from "../../../services/usuariosServices";

function Solicitud() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [editId, setEditId] = useState(null);
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [idEmpleado, setIdEmpleado] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [selectedFirmaId, setSelectedFirmaId] = useState(null);
    const [selectedFirmaEstado, setSelectedFirmaEstado] = useState(null);
    const [selectedFirmaTipo, setSelectedFirmaTipo] = useState(null);
    const [perfilId, setPerfilId] = useState(null);
    
    // Cascading filters for new request
    const [administradores, setAdministradores] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState("");
    const [selectedEmpleado, setSelectedEmpleado] = useState("");
    const [idEmpresaToken, setIdEmpresaToken] = useState(null);
    const [asuntoSeleccionado, setAsuntoSeleccionado] = useState("");
    const [nombreSolicitudManual, setNombreSolicitudManual] = useState("");
    const [tipoSolicitud, setTipoSolicitud] = useState("Permisos");
    const [contenidoSolicitud, setContenidoSolicitud] = useState("");
    
    // Motivo Rechazo
    const [openMotivo, setOpenMotivo] = useState(false);
    const [motivo, setMotivo] = useState("");

    // Pagination states
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [openModalCrear, setOpenModalCrear] = useState(false);

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
                // Robust JWT decode for unicode characters
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                
                console.log("Token payload decodificado:", payload);
                const uId = payload.usuario_id || payload.sub;
                setIdEmpleado(uId);

                if (payload.empresa_id) {
                    setFiltroEmpresa(payload.empresa_id);
                    setIdEmpresaToken(payload.empresa_id);
                }
                setPerfilId(payload.profile || payload.perfil_id || parseInt(localStorage.getItem('perfilId') || '0'));
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    // Load initial data
    const fetchSolicitudes = async (empresa_id, empleado_id, currentPerfilId) => {
        let data = [];
        if (currentPerfilId === 8) {
            if (empleado_id) {
                data = await getByEmpleado(empleado_id);
            }
        } else {
            if (empresa_id) {
                data = await obtenerSolicitudes(empresa_id);
            }
        }
        setSolicitudes(data || []);
    };

    useEffect(() => {
        // Wait for token variables to be populated
        if (perfilId !== null && idEmpleado) {
            fetchSolicitudes(filtroEmpresa, idEmpleado, perfilId);
        }
    }, [filtroEmpresa, idEmpleado, perfilId]);

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

    // Load administrators
    useEffect(() => {
        if (idEmpresaToken) {
            obtenerAdminPorEmpresa(idEmpresaToken)
                .then(setAdministradores)
                .catch(err => console.error("Error loading admins:", err));
        }
    }, [idEmpresaToken]);

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditId(null);
        setContenido("");
        setSelectedFirmaEstado(null);
        setSelectedFirmaTipo(null);
    };

    const handleAprobar = async (estado, motivoRechazo = null) => {
        try {
            await actualizarEstadoSolicitud(editId, estado, motivoRechazo);
            toast.success(estado === "A" ? "Solicitud aprobada correctamente" : "Solicitud rechazada correctamente");
            await fetchSolicitudes(filtroEmpresa, idEmpleado);
            handleCloseModal();
        } catch (error) {
            toast.error(error.message || "Error al procesar la solicitud");
        }
    };

    const handleEnviarSolicitud = async () => {
        try {
            const tipo = asuntoSeleccionado === "otro" ? nombreSolicitudManual : asuntoSeleccionado;
            const texto = contenidoSolicitud;
            const idUsuario = idEmpleado;
            const estado = "P";
            const id_usuario_empleador = selectedEmpleado;

            await crearSolicitud(tipo, texto, idUsuario, estado, id_usuario_empleador);
            toast.success("Solicitud enviada correctamente");
            setOpenModalCrear(false);
            await fetchSolicitudes(filtroEmpresa, idEmpleado);
            
            // Reset fields
            setAsuntoSeleccionado("");
            setNombreSolicitudManual("");
            setContenidoSolicitud("");
            setSelectedEmpleado("");
        } catch (error) {
            toast.error(error.message || "Error al enviar la solicitud");
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Solicitudes
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

                    {perfilId === 8 && (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            startIcon={<SendIcon />}
                            sx={{ ml: 'auto', height: '40px' }}
                            onClick={() => {
                                setSelectedEmpresa(filtroEmpresa);
                                setOpenModalCrear(true);
                            }}
                        >
                            enviar solicitud
                        </Button>
                    )}
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell><strong>Tipo De Solicitud</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {perfilId !== 8 && !filtroEmpresa ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                Seleccione una empresa para realizar la busqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : solicitudes.filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado).length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                No tiene registros
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    solicitudes
                                        .filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado)
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
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
                    count={solicitudes.filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado).length}
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
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                    {perfilId !== 8 && selectedFirmaEstado === "P" ? (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                disableElevation
                                sx={{ px: 4, py: 1, borderRadius: 2 }}
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

            {/* Dialogo para Enviar Solicitud (Nuevo) */}
            <Dialog open={openModalCrear} onClose={() => setOpenModalCrear(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: '#f5f7f9', minHeight: '80vh' } }}>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Enviar Nueva Solicitud</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 1 }}>
                        <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }}>
                            <InputLabel>destinatario (administrador)</InputLabel>
                            <Select 
                                value={selectedEmpleado} 
                                onChange={(e) => setSelectedEmpleado(e.target.value)} 
                                label="destinatario (administrador)"
                            >
                                {administradores.map(admin => (
                                    <MenuItem key={admin.usuario_id} value={admin.usuario_id}>
                                        {admin.nombres} {admin.apellido_paterno}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl size="small" fullWidth sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <InputLabel>Tipo de solicitud</InputLabel>
                                <Select
                                    value={asuntoSeleccionado}
                                    onChange={(e) => setAsuntoSeleccionado(e.target.value)}
                                    label="Tipo de solicitud"
                                >
                                    <MenuItem value="uso de feriado">uso de feriado</MenuItem>
                                    <MenuItem value="permisos con goce de remuneracion">Permisos con goce de remuneracion</MenuItem>
                                    <MenuItem value="permisos sin goce de remuneracion">Permisos sin goce de remuneracion</MenuItem>
                                    <MenuItem value="compensación de horas extraordinarias por días de descanso adicional">Compensación de horas extraordinarias por días de descanso adicional</MenuItem>
                                    <MenuItem value="cambio de turnos">Cambio de turnos</MenuItem>
                                    <MenuItem value="otro">Otro</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {asuntoSeleccionado === "otro" && (
                            <TextField
                                size="small"
                                fullWidth
                                label="especifique el tipo de solicitud"
                                value={nombreSolicitudManual}
                                onChange={(e) => setNombreSolicitudManual(e.target.value)}
                                sx={{ bgcolor: 'white', borderRadius: 2 }}
                            />
                        )}
                    </Box>

                    {/* Contenedor del Editor */}
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', minHeight: '400px' }}>
                        <ReactQuill 
                            theme="snow"
                            value={contenidoSolicitud}
                            onChange={setContenidoSolicitud}
                            modules={modules}
                            formats={formats}
                            placeholder="Escribe aquí el detalle de tu solicitud..."
                            style={{ height: '350px' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button onClick={() => setOpenModalCrear(false)} variant="outlined" sx={{ px: 4, borderRadius: 2 }}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        disableElevation
                        sx={{ px: 6, py: 1, borderRadius: 2 }}
                        disabled={(!asuntoSeleccionado || (asuntoSeleccionado === "otro" && !nombreSolicitudManual)) || !selectedEmpleado || !contenidoSolicitud}
                        onClick={handleEnviarSolicitud}
                    >
                        enviar
                    </Button>
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

export default Solicitud;