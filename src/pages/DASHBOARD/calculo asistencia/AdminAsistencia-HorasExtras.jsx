import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";

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


function AdminAsisHorasExtras() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

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
    // (No definidos en este archivo)

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editRun, setEditRun] = useState("")
    const [editFecha, setEditFecha] = useState(null)
    const [horaHeEdit, setHoraHeEdit] = useState("")
    const [minutoHeEdit, setMinutoHeEdit] = useState("")
    const [segHeEdit, setSegHeEdit] = useState("")
    const [autoriza, setAutoriza] = useState("")
    const [horaHeAutEdit, setHoraHeAutEdit] = useState("")
    const [minutoHeAutEdit, setMinutoHeAutEdit] = useState("")
    const [segHeAutEdit, setSegHeAutEdit] = useState("")
    const [horaAutEdit, setHoraAutEdit] = useState("")
    const [minutoAutEdit, setMinutoAutEdit] = useState("")
    const [segAutEdit, setSegAutEdit] = useState("")

    // Carga de datos
    // (Lógica de servicios no invocada explícitamente en el original)

    // Exportacion
    // (Lógica de exportación no definida explícitamente en el original para esta vista)

    // Manejo de dialogs
    const cerrarDialogEdit = () => {
        setOpenEdit(false)
    }

    const handleChangeTime = (val, setter, max) => {
        if (/^\d{0,2}$/.test(val)) {
            if (val === "" || parseInt(val) <= max) {
                setter(val);
            }
        }
    };

    const handleBlurTime = (val, setter) => {
        if (val.length === 1) {
            setter("0" + val);
        } else if (val === "") {
            setter("00");
        }
    };

    const calcularDV = (cuerpo) => {
        let suma = 0;
        let multiplicador = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = 11 - (suma % 11);
        if (resto === 11) return '0';
        if (resto === 11) return 'K';
        return resto.toString();
    };

    const esRutValido = (rut) => {
        if (!rut) return false;
        const valor = rut.replace(/[^0-9kK]/g, "");
        if (valor.length < 8 || valor.length > 9) return false;
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1).toUpperCase();
        return /^\d+$/.test(cuerpo) && calcularDV(cuerpo) === dv;
    };

    const formatearRut = (rut) => {
        let value = rut.replace(/[^0-9kK]/g, "");
        value = value.replace(/k(?!$)/gi, "");
        if (value.length > 9) {
            value = value.slice(0, 9);
        }
        if (value.length > 1) {
            const cuerpo = value.slice(0, -1);
            const dv = value.slice(-1).toUpperCase();
            return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, "")}-${dv}`;
        }
        return value;
    };

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const textoBusqueda = `${empresa.nombre_empresa || ''} ${empresa.rut_empresa || ''} ${empresa.direccion_empresa || ''} ${empresa.rut_empresa || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        return coincideTexto;
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
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    useEffect(() => {
        setPagina(0);
    }, [busqueda]);

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Asistencia Horas Extras
                </Typography>
            </Box>

            {/* Alerta de exito */}
            {mensajeExito && (
                <Container sx={{ mb: 2 }}>
                    <Alert severity="success" onClose={() => setMensajeExito("")}>
                        {mensajeExito}
                    </Alert>
                </Container>
            )}

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "200px" }, height: "40px", }}>
                        <TextField
                            placeholder="Buscar..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
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
                                    <TableCell width="14.28%" align="center"><strong>Rut</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>F.Entrada</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Entrada</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>F.Salida</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Salida</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Ent.Turno</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Sal.Turno</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Hrs.Pres</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Feriado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Atraso</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Hrs.Justif</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>HE</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Autoriza Hrs.Extras</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>HE.aut</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Observacion</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">10397800-9</TableCell>
                                    <TableCell align="center">Jue. 01/01/2026</TableCell>
                                    <TableCell align="center">06:45:08</TableCell>
                                    <TableCell align="center">Jue. 01/01/2026</TableCell>
                                    <TableCell align="center">15:36:53</TableCell>
                                    <TableCell align="center">00:00:00</TableCell>
                                    <TableCell align="center">00:00:00</TableCell>
                                    <TableCell align="center">08:51</TableCell>
                                    <TableCell align="center">Si</TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center"></TableCell>
                                    <TableCell align="center">00:00</TableCell>
                                    <TableCell align="center">No</TableCell>
                                    <TableCell align="center">00:00</TableCell>
                                    <TableCell align="center">Sin turno</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => setOpenEdit(true)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
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
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Departamento</DialogTitle>

                            {/* Campo rut */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Rut"
                                    placeholder="12345678-K"
                                    value={editRun}
                                    onChange={(e) => setEditRun(formatearRut(e.target.value))}
                                    inputProps={{ maxLength: 12 }}
                                    error={editRun.length > 0 && !esRutValido(editRun)}
                                    helperText={
                                        editRun.trim() === ""
                                            ? "El Rut es obligatorio"
                                            : (!esRutValido(editRun) ? "RUT inválido" : "")
                                    }
                                />
                            </Box>

                            {/* Campo fecha */}
                            <Box sx={{ mb: 2, }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha"
                                        format="DD-MM-YYYY"
                                        value={editFecha}
                                        onChange={(newValue) => setEditFecha(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !editFecha ? "La fecha es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
               
                            {/* Campo autorizacion */}
                            <FormControl
                                size="small" variant="outlined" fullWidth sx={{mb:2,}}>
                                <InputLabel id="autoriza-label">Autoriza Hrs Extra</InputLabel>
                                <Select labelId="autoriza-label" label="Autoriza Hrs Extra" value={autoriza} onChange={(e) => setAutoriza(e.target.value)}>
                                    <MenuItem value={1}>Si</MenuItem>
                                    <MenuItem value={2}>No</MenuItem>
                                </Select>
                                {autoriza === "" && (<FormHelperText>Campo obligatorio</FormHelperText>)}
                            </FormControl>

                            {/* Campo HE */}
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                HE
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                <TextField
                                    value={horaHeEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setHoraHeEdit, 23)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setHoraHeEdit)}
                                    placeholder="HH"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={minutoHeEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setMinutoHeEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setMinutoHeEdit)}
                                    placeholder="MM"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={segHeEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setSegHeEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setSegHeEdit)}
                                    placeholder="SS"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                            </Stack>

                            {/* Campo HE AUT */}
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                HE AUT
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                <TextField
                                    value={horaHeAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setHoraHeAutEdit, 23)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setHoraHeAutEdit)}
                                    placeholder="HH"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={minutoHeAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setMinutoHeAutEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setMinutoHeAutEdit)}
                                    placeholder="MM"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={segHeAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setSegHeAutEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setSegHeAutEdit)}
                                    placeholder="SS"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                            </Stack>

                            {/* Campo HORAS AUTORIZADAS */}
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                HORAS AUTORIZADAS
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                <TextField
                                    value={horaAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setHoraAutEdit, 23)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setHoraAutEdit)}
                                    placeholder="HH"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={minutoAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setMinutoAutEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setMinutoAutEdit)}
                                    placeholder="MM"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={segAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setSegAutEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setSegAutEdit)}
                                    placeholder="SS"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                            </Stack>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminAsisHorasExtras;