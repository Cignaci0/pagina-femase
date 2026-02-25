import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress,
    Container, Alert, TablePagination,
    FormHelperText
} from "@mui/material";
import { regiones, comunas } from "../../../utils/dataGeografica"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { obtenerDispositivo } from "../../../services/dispositivosServices"
import { obtenerTiposDispositivo } from "../../../services/tiposDispositivosServices"
import { crearDispositivo } from "../../../services/dispositivosServices"
import { actualizarDispositivo } from "../../../services/dispositivosServices"
import CircleIcon from '@mui/icons-material/Circle';

function AdminDispositivos() {

    // Estados de datos
    const [dispositivos, setDispositivos] = useState([])
    const [TipoDipositivos, setTiposDispositivos] = useState([])
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(6);
    const [busqueda, setBusqueda] = useState("");
    const [tiposFiltro, setTiposFiltro] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nombre, setNombre] = useState("")
    const [tipo, setTipo] = useState()
    const [ubicacion, setUbicacion] = useState("")
    const [region, setRegion] = useState("");
    const [comuna, setComuna] = useState("")
    const [estado, setEstado] = useState("")
    const [modelo, setModelo] = useState("")
    const [fabricante, setFabricante] = useState("")
    const [firmware, setFirmware] = useState("")
    const [direccionIp, setDireccionIp] = useState("")
    const [gateway, setGateway] = useState("")
    const [DNS, setDNS] = useState("")
    const [comunasFiltradasCrear, setComunasFiltradasCrear] = useState([]);

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editTipo, setEditTipo] = useState()
    const [editUbicacion, setEditUbicacion] = useState("")
    const [editRegion, setEditRegion] = useState("");
    const [editComuna, setEditComuna] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editmodelo, setEditModelo] = useState("")
    const [editFabricante, seteditFabricante] = useState("")
    const [editFirmware, setEditFirmware] = useState("")
    const [editDireccionIp, setEditDireccionIp] = useState("")
    const [editGateway, setEditGateway] = useState("")
    const [editDNS, setEditDNS] = useState("")
    const [comunasFiltradasEdit, setComunasFiltradasEdit] = useState([]);

    // Carga de datos
    const cargarDatos = async () => {
        try {
            const datosD = await obtenerDispositivo()
            const datosTD = await obtenerTiposDispositivo()

            setDispositivos(datosD)
            setTiposDispositivos(datosTD)
        } catch (err) {
            setError(err.message);
            setTiposDispositivos([])
            setDispositivos([])
        }
    }

    const cargarDatosParaEditar = (dis) => {
        setEditId(dis.dispositivo_id);
        setEditNombre(dis.nombre);
        setEditTipo(dis.tipo_dispositivo?.tipo_dispositivo_id || dis.tipo_dispositivo_id);
        setEditUbicacion(dis.ubicacion);
        setEditEstado(dis.estado?.estado_id || 1);
        setEditModelo(dis.modelo);
        seteditFabricante(dis.fabricante);
        setEditFirmware(dis.version_firmware);
        setEditDireccionIp(dis.direccion_ip);
        setEditGateway(dis.gateway);
        setEditDNS(dis.dns);

        const comunaEncontrada = comunas.find(c => c.nombre === dis.comuna);

        if (comunaEncontrada) {
            setEditRegion(comunaEncontrada.regionId);
            const comunasDeLaRegion = comunas.filter(c => c.regionId === comunaEncontrada.regionId);
            setComunasFiltradasEdit(comunasDeLaRegion);
            setEditComuna(dis.comuna);
        } else {
            setEditRegion("");
            setComunasFiltradasEdit([]);
            setEditComuna("");
        }

        setMostrarEdit(true);
    }

    // Manejo de dialogs
    const cerrarDialog = () => {
        setOpen(false);
        setNombre("")
        setTipo("")
        setUbicacion("")
        setRegion("")
        setComuna("")
        setEstado("")
        setModelo("")
        setFabricante("")
        setFirmware("")
        setDireccionIp("")
        setGateway("")
        setDNS("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
        setTipo("")
    }

    const clickCrear = async () => {
        if (!tipo || !nombre) {
            alert("El Nombre y el Tipo son obligatorios");
            return;
        }
        try {
            const respuesta = await crearDispositivo(
                ubicacion,
                comuna,
                modelo,
                fabricante,
                firmware,
                direccionIp,
                gateway,
                DNS,
                estado,
                tipo,
                nombre
            );
            setOpen(false);
            setMensajeExito("Dispositivo creado con exito");
            setNombre("");
            setTipo("")
            setRegion("")
            setComuna("")
            setEstado("")
            setModelo("")
            setFabricante("")
            setFirmware("")
            setDireccionIp("")
            setGateway("")
            setDNS("")
            setUbicacion("");
            cargarDatos();
        }
        catch (error) {
            if (error.message === "Failed fetch") {
                setError("Error de conexion");
            } else {
                setError(error.message || "Error al crear el dispositivo");
            }
        }
    }

    const cliclActualizar = async () => {
        try {
            const respuesta = await actualizarDispositivo(editId, editUbicacion, editComuna, editmodelo, editFabricante, editFirmware, editDireccionIp, editGateway, editDNS, editEstado, editTipo, editNombre)
            setMostrarEdit(false)
            setMensajeExito("Se edito con exito")
            cargarDatos()
        } catch (e) {
            setError(e.message)
        }
    }

    // Manejo de regiones y comunas
    const handleCambioRegion = (evento) => {
        const idSeleccionado = evento.target.value
        setRegion(idSeleccionado)

        const filtro = comunas.filter(c => c.regionId === idSeleccionado)
        setComunasFiltradasCrear(filtro)
        setComuna("")
    }

    const handleCambioRegionEdit = (evento) => {
        const idSeleccionadoEdit = evento.target.value
        setEditRegion(idSeleccionadoEdit)

        const filtro = comunas.filter(c => c.regionId === idSeleccionadoEdit)
        setComunasFiltradasEdit(filtro)
        setEditComuna("")
    }

    // Filtrado y paginacion
    const dispositivosFiltrados = dispositivos.filter((dispo) => {
        const textoBusqueda = `${dispo.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)

        const coincideTipo = tiposFiltro
            ? dispo.tipo_dispositivo?.tipo_dispositivo_id === tiposFiltro
            : true;

        const coincideEstado = filtroEstado
            ? dispo.estado?.estado_id === filtroEstado
            : true;

        return coincideTexto && coincideTipo && coincideEstado
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
        cargarDatos()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroEstado]);

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Dispositivos
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
                p: 2,
                width: "100%",
                bgcolor: "#FFFFFD",
                borderRadius: 2,
                maxWidth: "100%",
                height: "70vh",
                display: 'flex',
                flexDirection: 'column',
                overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y botones */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px", }}>
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

                    {/* Filtro de tipos */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130, ml: 1 }}>
                        <InputLabel>Tipos</InputLabel>
                        <Select
                            sx={{ width: "23vh" }}
                            value={tiposFiltro}
                            onChange={(e) => setTiposFiltro(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {TipoDipositivos.map((tipoDis) => (
                                <MenuItem key={tipoDis.tipo_dispositivo_id} value={tipoDis.tipo_dispositivo_id}>
                                    {tipoDis.nombre_tipo}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de estado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            sx={{ width: "23vh" }}
                            label="Estado"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}>Vigente</MenuItem>
                            <MenuItem value={2}>No Vigente</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
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
                    <TableContainer sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflowX: "auto",
                        overflowY: "auto"
                    }}>
                        <Table stickyHeader size="small" sx={{ minWidth: 1650 }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="100" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Tipo</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Fecha Creación</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Ubicacion</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Comuna</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Modelo</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Fabricante</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Firmware</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Direccion IP</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Gateway</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>DNS</strong></TableCell>
                                    <TableCell width="100" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {dispositivosFiltrados
                                    .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                    .map((dis) => {
                                        return (
                                            <TableRow key={dis.dispositivo_id}>
                                                <TableCell align="center">{dis.nombre}</TableCell>
                                                <TableCell align="center">{dis.tipo_dispositivo?.nombre_tipo}</TableCell>
                                                <TableCell align="center">{dis.fecha_creacion}</TableCell>
                                                <TableCell align="center">{dis.fecha_actualizacion}</TableCell>
                                                <TableCell align="center">{dis.ubicacion}</TableCell>
                                                <TableCell align="center">{dis.comuna}</TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: dis.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">{dis.modelo}</TableCell>
                                                <TableCell align="center">{dis.fabricante}</TableCell>
                                                <TableCell align="center">{dis.version_firmware}</TableCell>
                                                <TableCell align="center">{dis.direccion_ip}</TableCell>
                                                <TableCell align="center">{dis.gateway}</TableCell>
                                                <TableCell align="center">{dis.dns}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setEditId(dis.dispositivo_id);
                                                        setMostrarEdit(true);
                                                        cargarDatosParaEditar(dis)
                                                        setTipo(dis.tipo_dispositivo?.nombre_tipo)
                                                    }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={dispositivosFiltrados.length}
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
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Nuevo Dispositivo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Nombre" size="small"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        helperText={nombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo tipo */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Tipo</InputLabel>
                                    <Select label="Tipo" value={tipo || ""} onChange={(e) => setTipo(e.target.value)}>
                                        {TipoDipositivos.map((tipoDis) => (
                                            <MenuItem key={tipoDis.tipo_dispositivo_id} value={tipoDis.tipo_dispositivo_id}>
                                                {tipoDis.nombre_tipo}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {!tipo && <FormHelperText>El tipo es obligatorio</FormHelperText>}
                                </FormControl>

                                {/* Campo ubicacion */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Ubicación" size="small"
                                        value={ubicacion}
                                        onChange={(e) => setUbicacion(e.target.value)}
                                        helperText={ubicacion.trim() === "" ? "La ubicación es obligatoria" : ""}
                                    />
                                </Box>

                                {/* Campo region */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Región</InputLabel>
                                    <Select label="Región" value={region || ""} onChange={handleCambioRegion}>
                                        {regiones.map((reg) => (
                                            <MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {region === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo comuna */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Comuna</InputLabel>
                                    <Select
                                        label="Comuna" value={comuna}
                                        onChange={(e) => setComuna(e.target.value)}
                                        disabled={comunasFiltradasCrear.length === 0}
                                    >
                                        {comunasFiltradasCrear.map((com, index) => (
                                            <MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {comuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo estado */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
                                    </Select>
                                    {estado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                                </FormControl>

                                {/* Campo modelo */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Modelo" size="small"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                        helperText={modelo.trim() === "" ? "El modelo es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo fabricante */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField fullWidth label="Fabricante" size="small"
                                        value={fabricante}
                                        onChange={(e) => setFabricante(e.target.value)}
                                        helperText={fabricante.trim() === "" ? "El Fabricante es obligatorio" : ""} />
                                </Box>

                                {/* Campo firmware */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField fullWidth label="Firmware" size="small"
                                        value={firmware}
                                        onChange={(e) => setFirmware(e.target.value)}
                                        helperText={firmware.trim() === "" ? "El Firmware es obligatorio" : ""} />
                                </Box>

                                {/* Campo direccion IP */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Dirección IP" size="small"
                                        value={direccionIp}
                                        onChange={(e) => setDireccionIp(e.target.value)}
                                        helperText={direccionIp.trim() === "" ? "La Dirección IP es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo gateway */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField fullWidth label="Gateway" size="small"
                                        value={gateway}
                                        onChange={(e) => setGateway(e.target.value)}
                                        helperText={gateway.trim() === "" ? "El Gateway es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo DNS */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField fullWidth label="DNS" size="small"
                                        value={DNS}
                                        onChange={(e) => setDNS(e.target.value)}
                                        helperText={DNS.trim() === "" ? "El DNS es obligatorio" : ""}
                                    />
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrear}
                        variant="contained"
                        disabled={
                            nombre.trim() === "" ||
                            !tipo ||
                            ubicacion.trim() === "" ||
                            region === "" ||
                            comuna === "" ||
                            estado === "" ||
                            modelo.trim() === "" ||
                            firmware.trim() === "" ||
                            direccionIp.trim() === "" ||
                            gateway.trim() === "" ||
                            DNS.trim() == ""
                        }
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Dispositivo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Nombre" size="small"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo tipo */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Tipo</InputLabel>
                                    <Select label="Tipo" value={editTipo || ""} onChange={(e) => setEditTipo(e.target.value)}>
                                        {TipoDipositivos.map((tipoDis) => (
                                            <MenuItem key={tipoDis.tipo_dispositivo_id} value={tipoDis.tipo_dispositivo_id}>
                                                {tipoDis.nombre_tipo}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {!editTipo && <FormHelperText>El tipo es obligatorio</FormHelperText>}
                                </FormControl>

                                {/* Campo ubicacion */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Ubicación" size="small"
                                        value={editUbicacion}
                                        onChange={(e) => setEditUbicacion(e.target.value)}
                                        helperText={editUbicacion.trim() === "" ? "La ubicación es obligatoria" : ""}
                                    />
                                </Box>

                                {/* Campo region */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Región</InputLabel>
                                    <Select label="Región" value={editRegion || ""} onChange={handleCambioRegionEdit}>
                                        {regiones.map((reg) => (
                                            <MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {editRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo comuna */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Comuna</InputLabel>
                                    <Select
                                        label="Comuna" value={editComuna || ""}
                                        onChange={(e) => setEditComuna(e.target.value)}
                                        disabled={comunasFiltradasEdit.length === 0}
                                    >
                                        {comunasFiltradasEdit.map((com, index) => (
                                            <MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {editComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo estado */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={editEstado || ""} onChange={(e) => setEditEstado(e.target.value)}>
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
                                    </Select>
                                    {editEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                                </FormControl>

                                {/* Campo modelo */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Modelo" size="small"
                                        value={editmodelo}
                                        onChange={(e) => setEditModelo(e.target.value)}
                                        helperText={editmodelo.trim() === "" ? "El modelo es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo fabricante */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Fabricante" size="small"
                                        value={editFabricante}
                                        onChange={(e) => seteditFabricante(e.target.value)}
                                        helperText={editFabricante.trim() === "" ? "El Fabricante es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo firmware */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Firmware" size="small"
                                        value={editFirmware}
                                        onChange={(e) => setEditFirmware(e.target.value)}
                                        helperText={editFirmware.trim() === "" ? "El Firmware es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo direccion IP */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Dirección IP" size="small"
                                        value={editDireccionIp}
                                        onChange={(e) => setEditDireccionIp(e.target.value)}
                                        helperText={editDireccionIp.trim() === "" ? "La Dirección IP es obligatoria" : ""}
                                    />
                                </Box>

                                {/* Campo gateway */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="Gateway" size="small"
                                        value={editGateway}
                                        onChange={(e) => setEditGateway(e.target.value)}
                                        helperText={editGateway.trim() === "" ? "El Gateway es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo DNS */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth label="DNS" size="small"
                                        value={editDNS}
                                        onChange={(e) => setEditDNS(e.target.value)}
                                        helperText={editDNS.trim() === "" ? "El DNS es obligatorio" : ""}
                                    />
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button
                        onClick={cliclActualizar}
                        variant="contained"
                        color="primary"
                        disabled={
                            editNombre.trim() === "" ||
                            !editTipo ||
                            editUbicacion.trim() === "" ||
                            editRegion === "" ||
                            editComuna === "" ||
                            editEstado === "" ||
                            editmodelo.trim() === "" ||
                            editFabricante.trim() === "" ||
                            editFirmware.trim() === "" ||
                            editGateway.trim() === "" ||
                            editDireccionIp.trim() === "" ||
                            editDNS.trim() === ""
                        }
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminDispositivos