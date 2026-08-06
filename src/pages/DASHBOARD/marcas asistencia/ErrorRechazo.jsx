import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress,
    TablePagination, DialogContentText
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { getRechazos } from "../../../services/marcasServices";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function ErrorRechazos() {
    const [cargando, setCargando] = useState(false);
    
    // --- ESTADOS BASE ---
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    
    // --- ESTADOS DE SELECCIÓN DE FILTROS ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
        const stored = localStorage.getItem('empresaId');
        return stored ? parseInt(stored) : "";
    });
    const [desdeFecha, setDesdeFecha] = useState(null);
    const [hastaFecha, setHastaFecha] = useState(null);

    // Paginacion
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Datos reales
    const [marcas, setMarcas] = useState([]);
    const [haBuscado, setHaBuscado] = useState(false);

    // Dialog state
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogCode, setDialogCode] = useState("");

    const handleBuscarMarcas = async () => {
        if (!desdeFecha || !hastaFecha) {
            toast.error("Seleccione fechas desde/hasta");
            return;
        }
        setCargando(true);
        try {
            const fi = desdeFecha.format("YYYY-MM-DD");
            const ff = hastaFecha.format("YYYY-MM-DD");
            const res = await getRechazos(fi, ff, filtroEmpresa);
            setMarcas(res);
            setHaBuscado(true);
            setPagina(0);
        } catch (error) {
            toast.error("Error al buscar rechazos");
        } finally {
            setCargando(false);
        }
    };

    const marcasFiltradas = marcas.filter(m => {
        if (!busqueda) return true;
        const term = busqueda.toLowerCase();
        return (
            m.fecha_marca?.toLowerCase().includes(term) ||
            m.info_adicional?.toLowerCase().includes(term) ||
            m.hora_marca?.toLowerCase().includes(term) ||
            m.hashcode?.toLowerCase().includes(term) ||
            m.num_ficha?.toLowerCase().includes(term)
        );
    });

    useEffect(() => {
        const fetchCatalogos = async () => {
            setCargando(true);
            try {
                const empresas = await obtenerEmpresas();
                setOpcionesEmpresas(empresas || []);
            } catch (error) {
                toast.error("Error al cargar datos base");
            } finally {
                setCargando(false);
            }
        };
        fetchCatalogos();
    }, []);

    const handleChangePage = (event, newPage) => setPagina(newPage);
    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleOpenCode = (infoAdicional) => {
        if (!infoAdicional) return;
        const partes = infoAdicional.split(" - ");
        if (partes.length > 1) {
            setDialogCode(partes.slice(1).join(" - "));
        } else {
            setDialogCode(infoAdicional);
        }
        setOpenDialog(true);
    };

    const formatEvento = (evento) => {
        if (evento === 1) return "Entrada";
        if (evento === 2) return "Salida";
        return "-";
    };

    const getButtonText = (infoAdicional) => {
        if (!infoAdicional) return "-";
        return infoAdicional.split(" - ")[0] || "Ver Código";
    };

    return (
        <>
            {/* Card 1: Titulo y Filtros */}
            <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", boxSizing: "border-box" }}>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Error Rechazos
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 1 }}>
                    <FormControl size="small" variant="outlined" sx={{ minWidth: 120, ml: 2 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Desde"
                                format="DD-MM-YYYY"
                                value={desdeFecha}
                                onChange={(val) => setDesdeFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Hasta"
                                format="DD-MM-YYYY"
                                value={hastaFecha}
                                onChange={(val) => setHastaFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Button variant="contained" color="secondary" onClick={handleBuscarMarcas} disabled={!desdeFecha || !hastaFecha || cargando}>
                        {cargando ? <CircularProgress size={24} /> : "Buscar"}
                    </Button>

                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", ml: 2, alignItems: "center", width: { xs: "100%", md: "160px" }, height: "40px", }}>
                        <TextField
                            placeholder="Buscar..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '5px' }}>
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Box>
            </Paper>

            {/* Card 2: Tabla principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", flex: 1, minHeight: "calc(100vh - 280px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de rechazos">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Ficha</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Evento</strong></TableCell>
                                    <TableCell align="center"><strong>Información</strong></TableCell>
                                    <TableCell align="center"><strong>Hashcode</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!haBuscado ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione fechas para comenzar la búsqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : marcasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    marcasFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell align="center">{row.num_ficha || "-"}</TableCell>
                                            <TableCell align="center">{row.fecha_marca ? dayjs(row.fecha_marca).format("YYYY-MM-DD") : "-"}</TableCell>
                                            <TableCell align="center">{row.hora_marca || "-"}</TableCell>
                                            <TableCell align="center">{formatEvento(row.evento)}</TableCell>
                                            <TableCell align="center">
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleOpenCode(row.info_adicional)}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    {getButtonText(row.info_adicional)}
                                                </Button>
                                            </TableCell>
                                            <TableCell align="center">{row.hashcode || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={marcasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Código de Rechazo</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ wordBreak: 'break-all', mt: 2 }}>
                        {dialogCode}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary" variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ErrorRechazos;