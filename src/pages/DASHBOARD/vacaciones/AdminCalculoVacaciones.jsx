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

function CalculoVacaciones() {

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
    const [editAfpCertificado, setEditAfpCertificado] = useState("Ninguna");
    const [editFechaEmision, setEditFechaEmision] = useState(null);
    const [editNumCotizaciones, setEditNumCotizaciones] = useState("");
    const [editDiasEspeciales, setEditDiasEspeciales] = useState("No");
    const [editDiasAdicionales, setEditDiasAdicionales] = useState("0");

    const cerrarDialogEdit = () => {
        setOpenEdit(false);
        setEditAfpCertificado("");
        setEditFechaEmision(null);
        setEditNumCotizaciones("");
        setEditDiasEspeciales("");
        setEditDiasAdicionales("");
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
        const textoBusqueda = `${empresa.run || ''}${empresa.nombres || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        const coincideEmpresa = true;
        return coincideEmpresa && coincideTexto;
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
                    Admin Calculo Vacaciones
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, ml: 2 }}>

                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "200px" }, height: "40px", }}>
                        <TextField placeholder="Buscar..." variant="standard" InputProps={{ disableUnderline: true }} sx={{ ml: 1, flex: 1, px: 1 }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search"><SearchIcon /></IconButton>
                    </Paper>

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
                                    <TableCell width="14.28%" align="center"><strong>Run</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Fecha ultimo calculo</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>fec Inicio Contrato</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>AFP Certificado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dias Progresivos</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Acumulados</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Asignados</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Zona Extrema</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VBA</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Saldo VP</strong></TableCell>
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

           
            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "65vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Vacaciones</DialogTitle>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>AFP Certificado</InputLabel>
                                <Select
                                    label="AFP Certificado"
                                    value={editAfpCertificado}
                                    onChange={(e) => setEditAfpCertificado(e.target.value)}
                                >
                                    <MenuItem value="Ninguna">Ninguna</MenuItem>
                                    <MenuItem value="AFP Modelo">AFP Modelo</MenuItem>
                                    <MenuItem value="AFP Provida">AFP Provida</MenuItem>
                                    <MenuItem value="AFP Cuprum">AFP Cuprum</MenuItem>
                                    <MenuItem value="AFP Habitat">AFP Habitat</MenuItem>
                                    <MenuItem value="AFP PlanVital">AFP PlanVital</MenuItem>
                                    <MenuItem value="AFP Uno">AFP Uno</MenuItem>
                                    <MenuItem value="AFP Capital">AFP Capital</MenuItem>
                                </Select>
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha emisión certificado"
                                        format="DD-MM-YYYY"
                                        value={editFechaEmision}
                                        onChange={(newValue) => setEditFechaEmision(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <TextField
                                label="Num cotizaciones certificado"
                                size="small"
                                fullWidth
                                type="number"
                                sx={{ mb: 2 }}
                                value={editNumCotizaciones}
                                onChange={(e) => setEditNumCotizaciones(e.target.value)}
                            />

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Dias especiales</InputLabel>
                                <Select
                                    label="Dias especiales"
                                    value={editDiasEspeciales}
                                    onChange={(e) => setEditDiasEspeciales(e.target.value)}
                                >
                                    <MenuItem value="No">No</MenuItem>
                                    <MenuItem value="Si">Si</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Dias adicionales"
                                size="small"
                                fullWidth
                                type="number"
                                sx={{ mb: 2 }}
                                value={editDiasAdicionales}
                                onChange={(e) => setEditDiasAdicionales(e.target.value)}
                            />

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button
                        onClick={clickEditar}
                        variant="contained"
                        color="primary"

                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}
export default CalculoVacaciones;