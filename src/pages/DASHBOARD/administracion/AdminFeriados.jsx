import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    ListItemIcon,
    Checkbox
} from "@mui/material";
import { regiones, comunas } from "../../../utils/dataGeografica";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminFeriados() {

    // Estados de datos
    const [cencos, setCencos] = useState([])
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("");

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroAño, setFiltroAño] = useState("");
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroTipoFeriado, setFiltroTipoFeriado] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setnuevoNombre] = useState("")
    const [nuevoFecha, setNuevoFecha] = useState(null)
    const [nuevoTipo, setNuevoTipo] = useState("")
    const [nuevoTipoFeriado, setNuevoTipoFeriado] = useState("")
    const [nuevoObservacion, setNuevoObservacion] = useState("")
    const [nuevoIrrenunciable, setNuevoIrrenunciable] = useState("")
    const [nuevoRespaldoLegal, setNuevoRespaldoLegal] = useState("")
    const [nuevoRegion, setNuevoRegion] = useState("")
    const [nuevoComuna, setNuevoComuna] = useState("")
    const [comunasFiltradasCrear, setComunasFiltradasCrear] = useState([]);

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editNombre, setEditNombre] = useState("")
    const [editFecha, setEditFecha] = useState(null)
    const [editTipo, setEditTipo] = useState("")
    const [editTipoFeriado, setEditTipoFeriado] = useState("")
    const [editObservacion, setEditObservacion] = useState("")
    const [editIrrenunciable, setEditIrrenunciable] = useState("")
    const [editRespaldoLegal, setEditRespaldoLegal] = useState("")
    const [editRegion, setEditRegion] = useState("")
    const [editComuna, setEditComuna] = useState("")
    const [comunasFiltradasEdit, setComunasFiltradasEdit] = useState([]);

    // Carga de datos
    const cargarDatosIniciales = async () => {
        try {
            const [dataCencos] = await Promise.all([
                obtenerCentroCostos(),
            ]);
            setCencos(dataCencos);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Manejo de region y comuna
    const handleCambioRegion = (evento) => {
        const idSeleccionado = evento.target.value
        setNuevoRegion(idSeleccionado)
        const filtro = comunas.filter(c => c.regionId === idSeleccionado)
        setComunasFiltradasCrear(filtro)
        setNuevoComuna("")
    }

    const handleCambioRegionEdit = (evento) => {
        const idSeleccionadoEdit = evento.target.value
        setEditRegion(idSeleccionadoEdit)
        const filtro = comunas.filter(c => c.regionId === idSeleccionadoEdit)
        setComunasFiltradasEdit(filtro)
        setEditComuna("")
    }

    // Manejo de dialogs
    const closeDialog = () => {
        setOpen(false)
        setNuevoFecha(null)
        setNuevoTipoFeriado("")
        setnuevoNombre("")
        setNuevoObservacion("")
        setNuevoIrrenunciable("")
        setNuevoTipo("")
        setNuevoRespaldoLegal("")
        setNuevoRegion("")
        setNuevoComuna("")
    }

    const closeDialogEdit = () => {
        setOpenEdit(false)
    }

    // Filtrado y paginacion
    const cencosFiltradas = cencos.filter((cenco) => {
        const textoBusqueda = `${cenco.nombre_cenco || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        const coincideDepartamento = filtroMes ? cenco.departamento?.departamento_id === filtroMes : true
        const coincideEstado = filtroTipoFeriado ? cenco.estado?.estado_id === filtroTipoFeriado : true
        return coincideTexto && coincideEstado && coincideDepartamento
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const filasVacias = filaPorPagina - Math.min(filaPorPagina, cencosFiltradas.length - pagina * filaPorPagina);

    // Effects
    useEffect(() => {
        cargarDatosIniciales();
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroAño, filtroTipoFeriado]);

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => setMensajeExito(""), 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">Admin Feriados</Typography>
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
            <Paper elevation={2} sx={{ p: 2, width: "100%", bgcolor: "#FFFFFD", borderRadius: 2, maxWidth: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden", boxSizing: "border-box" }}>

                {/* Barra de busqueda y botones */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px", }}>
                        <TextField placeholder="Buscar..." variant="standard" InputProps={{ disableUnderline: true }} sx={{ ml: 1, flex: 1, px: 1 }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search"><SearchIcon /></IconButton>
                    </Paper>

                    {/* Filtro de año */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130, }}>
                        <InputLabel>Año</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroAño} onChange={(e) => { setFiltroAño(e.target.value); setFiltroMes(""); }} label="Año">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="2021"><em>2021</em></MenuItem>
                            <MenuItem value="2022"><em>2022</em></MenuItem>
                            <MenuItem value="2023"><em>2023</em></MenuItem>
                            <MenuItem value="2024"><em>2024</em></MenuItem>
                            <MenuItem value="2025"><em>2025</em></MenuItem>
                            <MenuItem value="2026"><em>2026</em></MenuItem>
                            <MenuItem value="2027"><em>2027</em></MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtro de mes */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Mes</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="enero"><em>Enero</em></MenuItem>
                            <MenuItem value="febrero"><em>Febrero</em></MenuItem>
                            <MenuItem value="marzo"><em>Marzo</em></MenuItem>
                            <MenuItem value="abril"><em>Abril</em></MenuItem>
                            <MenuItem value="mayo"><em>Mayo</em></MenuItem>
                            <MenuItem value="junio"><em>Junio</em></MenuItem>
                            <MenuItem value="julio"><em>Julio</em></MenuItem>
                            <MenuItem value="agosto"><em>Agosto</em></MenuItem>
                            <MenuItem value="septiembre"><em>Septiembre</em></MenuItem>
                            <MenuItem value="octubre"><em>Octubre</em></MenuItem>
                            <MenuItem value="noviembre"><em>Noviembre</em></MenuItem>
                            <MenuItem value="diciembre"><em>Diciembre</em></MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtro de tipo feriado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Tipo Feriado</InputLabel>
                        <Select sx={{ width: "20vh" }} label="Estado" value={filtroTipoFeriado} onChange={(e) => setFiltroTipoFeriado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="Regional"><em>Regional</em></MenuItem>
                            <MenuItem value="comunal"><em>Comunal</em></MenuItem>
                            <MenuItem value="nacional"><em>Nacional</em></MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>
                        Nuevo Registro
                    </Button>

                </Box>

                {/* Tabla principal */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative", }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 1650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha</strong></TableCell>
                                    <TableCell align="center"><strong>Tipo Feriado</strong></TableCell>
                                    <TableCell align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell align="center"><strong>Observacion</strong></TableCell>
                                    <TableCell align="center"><strong>irrenunciable</strong></TableCell>
                                    <TableCell align="center"><strong>Tipo</strong></TableCell>
                                    <TableCell align="center"><strong>Respaldo Legal</strong></TableCell>
                                    <TableCell align="center"><strong>Región</strong></TableCell>
                                    <TableCell align="center"><strong>Comuna</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">
                                        2026-01-01
                                    </TableCell>
                                    <TableCell align="center">
                                        Nacional
                                    </TableCell>
                                    <TableCell align="center">
                                        Año nuevo
                                    </TableCell>
                                    <TableCell align="center">

                                    </TableCell>
                                    <TableCell align="center">
                                        Si
                                    </TableCell>
                                    <TableCell align="center">
                                        Civil
                                    </TableCell>
                                    <TableCell align="center">
                                        Ley 2.977, Ley 19.973
                                    </TableCell>
                                    <TableCell align="center">
                                        Region Metropolitana
                                    </TableCell>
                                    <TableCell align="center">
                                        Maipu
                                    </TableCell>
                                    <TableCell align="center">
                                        2026-01-06 12:33:00
                                    </TableCell>
                                    <TableCell align="center">
                                        2026-01-06 21:40:47
                                    </TableCell>
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
                    count={cencosFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            <Dialog open={open} onClose={closeDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar feriado</DialogTitle>

                            {/* Campo fecha */}
                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha"
                                        format="DD-MM-YYYY"
                                        value={nuevoFecha}
                                        onChange={(newValue) => {
                                            setNuevoFecha(newValue);
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !nuevoFecha ? "La fecha es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {/* Campo tipo feriado */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo Feriado</InputLabel>
                                <Select label="Departamento" value={nuevoTipoFeriado} onChange={(e) => setNuevoTipoFeriado(e.target.value)}>
                                    <MenuItem value="regional">Regional</MenuItem>
                                    <MenuItem value="comunal">Comunal</MenuItem>
                                    <MenuItem value="nacional">Nacional</MenuItem>
                                </Select>
                                {nuevoTipoFeriado === "" && <FormHelperText>El Tipo Feriado es obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Nombre" size="small" value={nuevoNombre} onChange={(e) => setnuevoNombre(e.target.value)} helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>

                            {/* Campo observacion */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Observación" size="small" value={nuevoObservacion} onChange={(e) => setNuevoObservacion(e.target.value)} />
                            </Box>

                            {/* Campo irrenunciable */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Irrenunciable</InputLabel>
                                <Select label="Irrenunciable" value={nuevoIrrenunciable} onChange={(e) => setNuevoIrrenunciable(e.target.value)}>
                                    <MenuItem value={1}>SI</MenuItem>
                                    <MenuItem value={2}>NO</MenuItem>
                                </Select>
                                {nuevoIrrenunciable === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo tipo */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo</InputLabel>
                                <Select label="Tipo" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
                                    <MenuItem value={1}>Civil</MenuItem>
                                    <MenuItem value={2}>Religioso</MenuItem>
                                </Select>
                                {nuevoTipo === "" && <FormHelperText>El Tipo es obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo respaldo legal */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Respaldo Legal" size="small" value={nuevoRespaldoLegal} onChange={(e) => setNuevoRespaldoLegal(e.target.value)} helperText={nuevoRespaldoLegal ? "" : "El Respaldo es obligatorio"} />
                            </Box>

                            {/* Campo region */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Región</InputLabel>
                                <Select label="Región" value={nuevoRegion} onChange={handleCambioRegion}>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {nuevoRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>

                            {/* Campo comuna */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={nuevoComuna} onChange={(e) => setNuevoComuna(e.target.value)} disabled={comunasFiltradasCrear.length === 0}>
                                    {comunasFiltradasCrear.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {nuevoComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialog} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={closeDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Feriado</DialogTitle>

                            {/* Campo fecha */}
                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha"
                                        format="DD-MM-YYYY"
                                        value={editFecha}
                                        onChange={(newValue) => {
                                            setEditFecha(newValue);
                                        }}
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

                            {/* Campo tipo feriado */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo Feriado</InputLabel>
                                <Select label="Departamento" value={editTipoFeriado} onChange={(e) => setEditTipoFeriado(e.target.value)}>
                                    <MenuItem value="regional">Regional</MenuItem>
                                    <MenuItem value="comunal">Comunal</MenuItem>
                                    <MenuItem value="nacional">Nacional</MenuItem>
                                </Select>
                                {editTipoFeriado === "" && <FormHelperText>El Tipo Feriado es obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Nombre" size="small" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>

                            {/* Campo observacion */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Observación" size="small" value={editObservacion} onChange={(e) => setEditObservacion(e.target.value)} />
                            </Box>

                            {/* Campo irrenunciable */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Irrenunciable</InputLabel>
                                <Select label="Irrenunciable" value={editIrrenunciable} onChange={(e) => setEditIrrenunciable(e.target.value)}>
                                    <MenuItem value={1}>SI</MenuItem>
                                    <MenuItem value={2}>NO</MenuItem>
                                </Select>
                                {editIrrenunciable === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo tipo */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo</InputLabel>
                                <Select label="Tipo" value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
                                    <MenuItem value={1}>Civil</MenuItem>
                                    <MenuItem value={2}>Religioso</MenuItem>
                                </Select>
                                {editTipo === "" && <FormHelperText>El Tipo es obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo respaldo legal */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Respaldo Legal" size="small" value={editRespaldoLegal} onChange={(e) => setEditRespaldoLegal(e.target.value)} helperText={editRespaldoLegal ? "" : "El Respaldo es obligatorio"} />
                            </Box>

                            {/* Campo region */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Región</InputLabel>
                                <Select label="Región" value={editRegion} onChange={handleCambioRegionEdit}>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {editRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>

                            {/* Campo comuna */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={editComuna} onChange={(e) => setEditComuna(e.target.value)} disabled={comunasFiltradasEdit.length === 0}>
                                    {comunasFiltradasEdit.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {editComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialogEdit} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
export default AdminFeriados;