import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
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
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminVacaciones() {

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
                    Admin Vacaciones
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

                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>
                        Nuevo Registro
                    </Button>


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
                                    <TableCell width="14.28%" align="center"><strong>Empleado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>fec Ingreso</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Ultima Actualización</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>fec Inicio</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>fec Fin</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Acum.Vac Asignadas</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Efectivos</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo Vac Asignadas</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Especiales</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Zona Extrema</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Autorizador</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Efectivos VBA</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Efectivos VP</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VBA Pre Vacaciones</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VP Pre Vacaciones</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VBA Post Vacaciones</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VP Post Vacaciones</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"><IconButton onClick={() => handleAbrirEditar()}><EditIcon /></IconButton></TableCell>

                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={empresasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "65vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Vacaciones</DialogTitle>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empresa *</InputLabel>
                                <Select label="Empresa *" value={nuevoEmpresa} onChange={(e) => setNuevoEmpresa(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Empresa</em></MenuItem>
                                    <MenuItem value="1">Empresa Demo</MenuItem>
                                </Select>
                                {nuevoEmpresa === "" && <FormHelperText >La Empresa es obligatoria</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Departamento *</InputLabel>
                                <Select label="Departamento *" value={nuevoDepartamento} onChange={(e) => setNuevoDepartamento(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Departamento</em></MenuItem>
                                    <MenuItem value="1">Depto Sistemas</MenuItem>
                                </Select>
                                {nuevoDepartamento === "" && <FormHelperText >El Departamento es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Centro de Costo *</InputLabel>
                                <Select label="Centro de Costo *" value={nuevoCenco} onChange={(e) => setNuevoCenco(e.target.value)}>
                                    <MenuItem value=""><em>----------</em></MenuItem>
                                    <MenuItem value="1">Sistema</MenuItem>
                                </Select>
                                {nuevoCenco === "" && <FormHelperText >El Centro de Costo es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empleado *</InputLabel>
                                <Select label="Empleado *" value={nuevoEmpleado} onChange={(e) => setNuevoEmpleado(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Empleado</em></MenuItem>
                                    <MenuItem value="1">NICOLE ABRIL QUIÑONES...</MenuItem>
                                </Select>
                                {nuevoEmpleado === "" && <FormHelperText >El Empleado es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha de inicio *"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaInicio}
                                        onChange={(newValue) => setNuevoFechaInicio(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !nuevoFechaInicio ? "Ingrese fecha de inicio" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha fin *"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaFin}
                                        onChange={(newValue) => setNuevoFechaFin(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !nuevoFechaFin ? "Ingrese fecha fin" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Autorizador *</InputLabel>
                                <Select label="Autorizador *" value={nuevoAutorizador} onChange={(e) => setNuevoAutorizador(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Autorizador</em></MenuItem>
                                    <MenuItem value="1">ADRIANA MARJORIE MORENO [Región Metropolitana-PIE 24 HRS EL BOSQUE]</MenuItem>
                                </Select>
                                {nuevoAutorizador === "" && <FormHelperText >El Autorizador es obligatorio</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrear}
                        variant="contained"
                        color="primary"
                        disabled={
                            nuevoEmpresa === "" ||
                            nuevoDepartamento === "" ||
                            nuevoCenco === "" ||
                            nuevoEmpleado === "" ||
                            !nuevoFechaInicio ||
                            !nuevoFechaFin ||
                            nuevoAutorizador === ""
                        }
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "65vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Vacaciones</DialogTitle>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empresa *</InputLabel>
                                <Select label="Empresa *" value={editEmpresa} onChange={(e) => setEditEmpresa(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Empresa</em></MenuItem>
                                    <MenuItem value="1">Empresa Demo</MenuItem>
                                </Select>
                                {editEmpresa === "" && <FormHelperText>La Empresa es obligatoria</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Departamento *</InputLabel>
                                <Select label="Departamento *" value={editDepartamento} onChange={(e) => setEditDepartamento(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Departamento</em></MenuItem>
                                    <MenuItem value="1">Depto Sistemas</MenuItem>
                                </Select>
                                {editDepartamento === "" && <FormHelperText>El Departamento es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Centro de Costo *</InputLabel>
                                <Select label="Centro de Costo *" value={editCenco} onChange={(e) => setEditCenco(e.target.value)}>
                                    <MenuItem value=""><em>----------</em></MenuItem>
                                    <MenuItem value="1">Sistema</MenuItem>
                                </Select>
                                {editCenco === "" && <FormHelperText>El Centro de Costo es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empleado *</InputLabel>
                                <Select label="Empleado *" value={editEmpleado} onChange={(e) => setEditEmpleado(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Empleado</em></MenuItem>
                                    <MenuItem value="1">NICOLE ABRIL QUIÑONES...</MenuItem>
                                </Select>
                                {editEmpleado === "" && <FormHelperText>El Empleado es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha de inicio *"
                                        format="DD-MM-YYYY"
                                        value={editFechaInicio}
                                        onChange={(newValue) => setEditFechaInicio(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !editFechaInicio ? "Ingrese fecha de inicio" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha fin *"
                                        format="DD-MM-YYYY"
                                        value={editFechaFin}
                                        onChange={(newValue) => setEditFechaFin(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !editFechaFin ? "Ingrese fecha fin" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Autorizador *</InputLabel>
                                <Select label="Autorizador *" value={editAutorizador} onChange={(e) => setEditAutorizador(e.target.value)}>
                                    <MenuItem value=""><em>Seleccione Autorizador</em></MenuItem>
                                    <MenuItem value="1">ADRIANA MARJORIE MORENO [Región Metropolitana-PIE 24 HRS EL BOSQUE]</MenuItem>
                                </Select>
                                {editAutorizador === "" && <FormHelperText>El Autorizador es obligatorio</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button
                        onClick={clickEditar}
                        variant="contained"
                        color="primary"
                        disabled={
                            editEmpresa === "" ||
                            editDepartamento === "" ||
                            editCenco === "" ||
                            editEmpleado === "" ||
                            !editFechaInicio ||
                            !editFechaFin ||
                            editAutorizador === ""
                        }
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}
export default AdminVacaciones;