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
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import { crearFeriado, editarFeriado, obtenerFeriados } from "../../../services/feriadosServices";
import toast from "react-hot-toast";

function AdminFeriados() {

    // Estados de datos
    const [feriados, setFeriados] = useState([])
    const [cargando, setCargando] = useState(true);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroAño, setFiltroAño] = useState("");
    const [filtroMes, setFiltroMes] = useState("");
    const [filtroTipoFeriado, setFiltroTipoFeriado] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
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
    const [editId, setEditId] = useState("")
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
            const respuesta = await obtenerFeriados()
            setFeriados(respuesta)
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    //Crear feriados
    const clickCrearFeriado = async () => {
        try {
            const datos = {
                fecha: nuevoFecha ? nuevoFecha.format("DD-MM-YYYY") : null,
                tipo_feriado: nuevoTipoFeriado,
                nombre: nuevoNombre,
                observacion: nuevoObservacion,
                irrenunciable: nuevoIrrenunciable,
                tipo: nuevoTipo,
                respaldo_legal: nuevoRespaldoLegal,
                region: regiones.find(r => r.id === nuevoRegion)?.nombre || nuevoRegion,
                comuna: nuevoComuna ? nuevoComuna : "no tiene comuna"
            }
            console.log(datos)
            const respuesta = await crearFeriado(datos)
            toast.success("Feriado creado exitosamente")
            closeDialog()
            cargarDatosIniciales()
        } catch (err) {
            toast.error(err.message)
        }
    }

    //Editar feriados
    const clickEditarFeriado = async () => {
        try {
            const datos = {
                fecha: editFecha ? editFecha.format("DD-MM-YYYY") : null,
                tipo_feriado: editTipoFeriado,
                nombre: editNombre,
                observacion: editObservacion,
                irrenunciable: editIrrenunciable,
                tipo: editTipo,
                respaldo_legal: editRespaldoLegal,
                region: regiones.find(r => r.id === editRegion)?.nombre || editRegion,
                comuna: editComuna ? editComuna : "no tiene comuna"
            }
            console.log(datos)
            const respuesta = await editarFeriado(editId, datos)
            toast.success("Feriado editado exitosamente")
            closeDialogEdit()
            cargarDatosIniciales()
        } catch (err) {
            toast.error(err.message)
        }
    }

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
        setNuevoNombre("")
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
    const feriadosFiltrados = feriados.filter((f) => {
        const textoBusqueda = `${f.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term);
        const coincideAno = f.fecha.includes(filtroAño);
        const coincideMes = f.fecha.includes(filtroMes);
        const coincideTipoFeriado = !filtroTipoFeriado || (f.tipo_feriado || "").toLowerCase().includes(filtroTipoFeriado.toLowerCase());
        return coincideTexto && coincideAno && coincideMes && coincideTipoFeriado;
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
        cargarDatosIniciales();
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroAño, filtroMes, filtroTipoFeriado]);

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">Admin Feriados</Typography>
            </Box>

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
                            <MenuItem value="-01-"><em>Enero</em></MenuItem>
                            <MenuItem value="-02-"><em>Febrero</em></MenuItem>
                            <MenuItem value="-03-"><em>Marzo</em></MenuItem>
                            <MenuItem value="-04-"><em>Abril</em></MenuItem>
                            <MenuItem value="-05-"><em>Mayo</em></MenuItem>
                            <MenuItem value="-06-"><em>Junio</em></MenuItem>
                            <MenuItem value="-07-"><em>Julio</em></MenuItem>
                            <MenuItem value="-08-"><em>Agosto</em></MenuItem>
                            <MenuItem value="-09-"><em>Septiembre</em></MenuItem>
                            <MenuItem value="-10-"><em>Octubre</em></MenuItem>
                            <MenuItem value="-11-"><em>Noviembre</em></MenuItem>
                            <MenuItem value="-12-"><em>Diciembre</em></MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtro de tipo feriado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Tipo Feriado</InputLabel>
                        <Select sx={{ width: "20vh" }} label="Estado" value={filtroTipoFeriado} onChange={(e) => setFiltroTipoFeriado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="regional"><em>Regional</em></MenuItem>
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
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
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
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {feriadosFiltrados.length > 0 ? (
                                    feriadosFiltrados.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((f) => (
                                            <TableRow>
                                                <TableCell align="center">
                                                    {f.fecha && f.fecha.includes("T") ? dayjs(f.fecha).format("DD-MM-YYYY") : f.fecha}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.tipo_feriado}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.nombre}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.observacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.irrenunciable ? "si" : "no"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.tipo}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.respaldo_legal}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {regiones.find(r => r.id === f.region || r.nombre === f.region)?.nombre || f.region}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {f.comuna}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setOpenEdit(true)
                                                        setEditId(f.id)
                                                        setEditNombre(f.nombre)

                                                        // Validar qué formato de fecha trae el servidor
                                                        let fechaValida = null;
                                                        if (f.fecha) {
                                                            // Si la fecha incluye la letra 'T', es un formato ISO
                                                            if (f.fecha.includes("T")) {
                                                                fechaValida = dayjs(f.fecha);
                                                            } else {
                                                                // Asume formato "DD-MM-YYYY"
                                                                const partesFecha = f.fecha.split("-");
                                                                if (partesFecha.length === 3 && partesFecha[0].length <= 2) {
                                                                    fechaValida = dayjs(`${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`);
                                                                } else {
                                                                    fechaValida = dayjs(f.fecha);
                                                                }
                                                            }
                                                        }
                                                        setEditFecha(fechaValida);

                                                        setEditTipo(f.tipo ? f.tipo.toLowerCase() : "")
                                                        setEditTipoFeriado(f.tipo_feriado ? f.tipo_feriado.toLowerCase() : "")
                                                        setEditObservacion(f.observacion)
                                                        setEditIrrenunciable(f.irrenunciable)
                                                        setEditRespaldoLegal(f.respaldo_legal)

                                                        const regFound = regiones.find(r => r.nombre === f.region || r.id === f.region);
                                                        if (regFound) {
                                                            setEditRegion(regFound.id);
                                                            setComunasFiltradasEdit(comunas.filter(c => c.regionId === regFound.id));
                                                        } else {
                                                            setEditRegion("");
                                                            setComunasFiltradasEdit([]);
                                                        }

                                                        setEditComuna(f.comuna)
                                                    }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (feriadosFiltrados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ alignItems: "center" }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron Feriados.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={feriadosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
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
                                <TextField fullWidth label="Nombre" size="small" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>

                            {/* Campo observacion */}
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Observación" size="small" value={nuevoObservacion} onChange={(e) => setNuevoObservacion(e.target.value)} />
                            </Box>

                            {/* Campo irrenunciable */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Irrenunciable</InputLabel>
                                <Select label="Irrenunciable" value={nuevoIrrenunciable} onChange={(e) => setNuevoIrrenunciable(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {nuevoIrrenunciable === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo tipo */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo</InputLabel>
                                <Select label="Tipo" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
                                    <MenuItem value={"civil"}>Civil</MenuItem>
                                    <MenuItem value={"religioso"}>Religioso</MenuItem>
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
                                    <MenuItem value={"No tiene region"}>No tiene región</MenuItem>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {nuevoRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>

                            {/* Campo comuna */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={nuevoComuna} onChange={(e) => setNuevoComuna(e.target.value)} disabled={comunasFiltradasCrear.length === 0}>
                                    <MenuItem value={"No tiene comuna"}>No tiene comuna</MenuItem>
                                    {comunasFiltradasCrear.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {nuevoComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrearFeriado} variant="contained" color="primary">Guardar</Button>
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
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {editIrrenunciable === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo tipo */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Tipo</InputLabel>
                                <Select label="Tipo" value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
                                    <MenuItem value={"civil"}>Civil</MenuItem>
                                    <MenuItem value={"religioso"}>Religioso</MenuItem>
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
                                    <MenuItem value={"No tiene region"}>No tiene región</MenuItem>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {editRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>

                            {/* Campo comuna */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={editComuna} onChange={(e) => setEditComuna(e.target.value)} disabled={comunasFiltradasEdit.length === 0}>
                                    <MenuItem value={"No tiene comuna"}>No tiene comuna</MenuItem>
                                    {comunasFiltradasEdit.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {editComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEditarFeriado} variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
export default AdminFeriados;