import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText, Tooltip, Checkbox
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas, crearEmpresa, actualizarEmpresa } from "../../../services/empresasServices";
import { regiones, comunas } from "../../../utils/dataGeografica";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DraftsIcon from '@mui/icons-material/Drafts';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import AssessmentIcon from '@mui/icons-material/Assessment';

function AdminSolicitudVacaciones() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("")
    const [filtroEstado, setfiltroEstado] = useState("")
    const [filtrojustificaHrs, setFiltrojustificaHrs] = useState("")
    const [filtroPagada, setFiltroPagada] = useState("")
    const [desdeFecha, setDesdeFecha] = useState(null)
    const [hastaFecha, setHastaFecha] = useState(null)

    // Estados dialogs de detalle (Fechas, Dias, Saldos)
    const [openFechas, setOpenFechas] = useState(false);
    const [openDias, setOpenDias] = useState(false);
    const [openSaldos, setOpenSaldos] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Estados dialog Aceptar/Rechazar
    const [openAccion, setOpenAccion] = useState(false);
    const [observacion, setObservacion] = useState("");
    const [accionSeleccionada, setAccionSeleccionada] = useState(null); // 'aceptar' | 'rechazar' | null

    const cerrarDialogAccion = () => {
        setOpenAccion(false);
        setObservacion("");
        setAccionSeleccionada(null);
    };

    // Estados dialog Generar Reporte
    const [openReporte, setOpenReporte] = useState(false);
    const [selectedEmpleados, setSelectedEmpleados] = useState([]);

    // Lista de empleados (demo)
    const listaEmpleados = [
        { id: 1, nombre: "NICOLE ABRIL QUIÑONES" },
        { id: 2, nombre: "ADRIANA MARJORIE MORENO" },
        { id: 3, nombre: "CRISTOPHER IGNACIO ESCOBAR" },
        { id: 4, nombre: "JUAN CARLOS PÉREZ" },
        { id: 5, nombre: "MARÍA JOSÉ GONZÁLEZ" },
    ];

    const handleToggleEmpleado = (id) => {
        setSelectedEmpleados((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
        );
    };

    const cerrarDialogReporte = () => {
        setOpenReporte(false);
        setSelectedEmpleados([]);
    };

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoEmpresa, setNuevoEmpresa] = useState("");
    const [nuevoDepartamento, setNuevoDepartamento] = useState("");
    const [nuevoCenco, setNuevoCenco] = useState("");
    const [nuevoEmpleado, setNuevoEmpleado] = useState("");
    const [nuevoFechaInicio, setNuevoFechaInicio] = useState(null);
    const [nuevoFechaFin, setNuevoFechaFin] = useState(null);
    const [nuevoAutorizador, setNuevoAutorizador] = useState("");

    const cerrarDialog = () => {
        setOpen(false);
        setNuevoEmpresa("");
        setNuevoDepartamento("");
        setNuevoCenco("");
        setNuevoEmpleado("");
        setNuevoFechaInicio(null);
        setNuevoFechaFin(null);
        setNuevoAutorizador("");
    };

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false);
    const [editId, setEditId] = useState("");
    const [editEmpresa, setEditEmpresa] = useState("");
    const [editDepartamento, setEditDepartamento] = useState("");
    const [editCenco, setEditCenco] = useState("");
    const [editEmpleado, setEditEmpleado] = useState("");
    const [editFechaInicio, setEditFechaInicio] = useState(null);
    const [editFechaFin, setEditFechaFin] = useState(null);
    const [editAutorizador, setEditAutorizador] = useState("");

    const cerrarDialogEdit = () => {
        setOpenEdit(false);
        setEditEmpresa("");
        setEditDepartamento("");
        setEditCenco("");
        setEditEmpleado("");
        setEditFechaInicio(null);
        setEditFechaFin(null);
        setEditAutorizador("");
    };

    const handleAbrirEditar = (row) => {
        setOpenEdit(true)
    };

    const clickEditar = async () => {

    };

    const clickCrear = async () => {

    };

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const coincideEmpresa = true;
        return coincideEmpresa;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        setPagina(0);
    }, [busqueda]);

    // Renderizado condicional
    if (cargando) return;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Solicitud Vacaciones
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, ml: 2 }}>

                    {/* Filtros de seleccion */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} values={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Tipo" >
                            <MenuItem value="">Todos</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} values={filtroEstado} onChange={(e) => setfiltroEstado(e.target.value)}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Estado" >
                            <MenuItem value="">Todos</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} values={filtrojustificaHrs} onChange={(e) => setFiltrojustificaHrs(e.target.value)}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empresa" >
                            <MenuItem value="">Todos</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} values={filtroPagada} onChange={(e) => setFiltroPagada(e.target.value)}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empresa" >
                            <MenuItem value="">Todos</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} values={filtroPagada} onChange={(e) => setFiltroPagada(e.target.value)}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empresa" >
                            <MenuItem value="">Todos</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtros de fecha */}
                    <Box sx={{ mb: 2, maxWidth: "15%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Desde"
                                format="DD-MM-YYYY"
                                value={desdeFecha}
                                onChange={(newValue) => setDesdeFecha(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        required: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ mb: 2, maxWidth: "15%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Hasta"
                                format="DD-MM-YYYY"
                                value={hastaFecha}
                                onChange={(newValue) => setHastaFecha(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        required: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>


                </Box>

                {/* Tabla principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto", textAlign: "center" }}>

                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Run</strong></TableCell>
                                    <TableCell align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell align="center"><strong>Fec. Generacion</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Inicio vacaciones</strong></TableCell>
                                    <TableCell align="center"><strong>Fin vacaciones</strong></TableCell>
                                    <TableCell align="center"><strong>Dias solicitados</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo Vacaciones</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha hora cancelacion</strong></TableCell>
                                    <TableCell align="center"><strong>Fec. hora aprueba/rechaza</strong></TableCell>
                                    <TableCell align="center"><strong>Aprueba/Rechaza</strong></TableCell>
                                    <TableCell align="center"><strong>Observacion</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"> </TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"><IconButton onClick={() => setOpenAccion(true)}><EditIcon /></IconButton></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={empresasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog Aceptar/Rechazar */}
            <Dialog open={openAccion} onClose={cerrarDialogAccion} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Aprobar / Rechazar Solicitud</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, mt: 1 }}>

                        <Box sx={{ display: "flex", gap: 3 }}>
                            <Button
                                variant={accionSeleccionada === 'aceptar' ? "contained" : "outlined"}
                                color={accionSeleccionada === 'aceptar' ? "success" : "inherit"}
                                size="large"
                                sx={{ px: 4, py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
                                onClick={() => setAccionSeleccionada('aceptar')}
                            >
                                Aceptar
                            </Button>
                            <Button
                                variant={accionSeleccionada === 'rechazar' ? "contained" : "outlined"}
                                color={accionSeleccionada === 'rechazar' ? "error" : "inherit"}
                                size="large"
                                sx={{ px: 4, py: 1.5, fontWeight: "bold", fontSize: "1rem" }}
                                onClick={() => setAccionSeleccionada('rechazar')}
                            >
                                Rechazar
                            </Button>
                        </Box>

                        {accionSeleccionada && (
                            <Typography variant="body2" sx={{ color: accionSeleccionada === 'aceptar' ? "green" : "red", fontStyle: "italic" }}>
                                Estás {accionSeleccionada === 'aceptar' ? "aceptando" : "rechazando"} esta solicitud
                            </Typography>
                        )}

                        <TextField
                            label="Observación"
                            multiline
                            rows={3}
                            fullWidth
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            placeholder="Escriba una observación..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogAccion} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary" disabled={!accionSeleccionada}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminSolicitudVacaciones;