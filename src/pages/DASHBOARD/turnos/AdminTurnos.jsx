import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    Radio,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Tab,
    Menu
} from "@mui/material";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDepartamentos, crearDepto, actualizarDepto } from "../../../services/departamentosServices";
import { obtenerCargos, crearCargo, actualizarCargo } from "../../../services/cargosServices";
import { obtenerTurnos, crearTurno, actualizarTurno} from "../../../services/turnosServices";
import { obtenerHorarios } from "../../../services/horariosServices"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { Label } from "@mui/icons-material";
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';

function AdminTurnos() {

    // Estados de datos
    const [turnos, setTurnos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [horarios, setHorarios] = useState([])
    const [perfiles, setperfiles] = useState([]) // Del código original
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [empresasFiltro, setEmpresasFiltro] = useState("")
    const [filtroestado, setFiltroEstado] = useState("")

    // Estados crear
    const [crear, setCrear] = useState(false)
    const [empresaCrear, setEmpresaCrear] = useState("")
    const [nombreCrear, setNombreCrear] = useState("")
    const [rotativoCrear, setRotativoCrear] = useState("")
    const [estadoCrear, setEstadoCrear] = useState("")
    const [horarioCrear, setHorarioCrear] = useState("")
    const [filtroEmpresaCrear, setFiltroEmpresaCrear] = useState([])
    const [filtroHorarioCrear, setFiltroHorarioCrear] = useState([])

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [idEdit, setIdEdit] = useState("")
    const [empresaEdit, setEmpresaEdit] = useState("")
    const [nombreEdit, setNombreEdit] = useState("")
    const [rotativoEdit, setRotativoEdit] = useState("")
    const [estadoEdit, setEstadoEdit] = useState("")
    const [horarioEdit, setHorarioEdit] = useState("")
    const [filtroEmpresaEdit, setFiltroEmpresaEdit] = useState([])
    const [filtroHorarioEdit, setFiltroHorarioEdit] = useState([])

    // Carga de datos
    const cargarTurnos = async () => {
        setCargando(true)
        try {
            const respuesta = await obtenerTurnos()
            setTurnos(respuesta)
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const cargarEmpresasFiltro = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarEmpresasFiltroCrear = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setFiltroEmpresaCrear(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarHorariosFiltrosCrear = async () => {
        setCargando(true)
        try {
            const respuesta = await obtenerHorarios()
            setHorarios(respuesta)
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const cargarEmpresasFiltroEdit = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setFiltroEmpresaEdit(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarHorariosFiltrosEdit = async () => {
        setCargando(true)
        try {
            const respuesta = await obtenerHorarios()
            setHorarios(respuesta)
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    const [asignar, setAsignar] = useState("")
    const [detalle, setDetalle] = useState(false)
    const [detalleCrear, setDetalleCrear] = useState(false)
    const [detalleEditar, setDetalleEditar] = useState(false)

    const cerrarAsignar = () => { setAsignar(false) }
    const cerrarDetalle = () => { setDetalle(false) }
    const cerrarCrear = () => {
        setCrear(false)
        setEmpresaCrear("")
        setNombreCrear("")
        setRotativoCrear("")
        setEstadoCrear("")
        setHorarioCrear("")
    }
    const cerrarEditar = () => { setEditar(false) }
    const cerrarDetallesCrear = () => { setDetalleCrear(false) }
    const cerrarDetalleEditar = () => { setDetalleEditar(false) }

    const clickCrear = async () => {
        setCargando(true)
        try {
            const respuesta = await crearTurno(nombreCrear, rotativoCrear, empresaCrear, estadoCrear, horarioCrear)
            setCrear(false)
            setEmpresaCrear("")
            setMensajeExito("Turno creado con exito")
            setNombreCrear("")
            setRotativoCrear("")
            setEstadoCrear("")
            setHorarioCrear("")
            cargarTurnos()
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const clickEdit = async () => {
        setCargando(true)
        try {
            const respuesta = await actualizarTurno(idEdit, nombreEdit, rotativoEdit, empresaEdit, estadoEdit, horarioEdit)
            setEditar(false)
            setMensajeExito("Turno Actualizado con exito")
            cargarTurnos()
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    // Filtrado y paginacion
    const turnosFiltrados = turnos.filter((tur) => {
        const nombreTurno = `${tur.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreTurno.includes(term);
        const coincideEstado = filtroestado ? tur.estado?.estado_id === filtroestado : true;
        const coincideEmpresa = empresasFiltro ? tur.empresa?.empresa_id === empresasFiltro : true
        return coincideTexto && coincideEstado && coincideEmpresa;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const filasVacias = filaPorPagina - Math.min(filaPorPagina, turnosFiltrados.length - pagina * filaPorPagina);

    // Effects
    useEffect(() => {
        cargarTurnos();
    }, []);

    useEffect(() => {
        cargarEmpresasFiltro();
    }, []);

    useEffect(() => {
        cargarEmpresasFiltroCrear();
    }, []);

    useEffect(() => {
        cargarHorariosFiltrosCrear();
    }, []);

    useEffect(() => {
        if (empresaCrear) {
            const filtrados = horarios.filter(horario => horario.empresa?.empresa_id == empresaCrear)
            setFiltroHorarioCrear(filtrados)
        } else {
            setFiltroHorarioCrear([]);
        }
    }, [empresaCrear, horarios]);

    useEffect(() => {
        cargarEmpresasFiltroEdit();
    }, []);

    useEffect(() => {
        cargarHorariosFiltrosEdit();
    }, []);

    useEffect(() => {
        if (empresaEdit) {
            const filtrados = horarios.filter(horario => horario.empresa?.empresa_id == empresaEdit)
            setFiltroHorarioEdit(filtrados)
        } else {
            setFiltroHorarioEdit([]);
        }
    }, [empresaEdit, horarios]);

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito]);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado]);

    // Renderizado condicional
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos
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

                    {/* Filtro de empresa */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "26vh" }} label="Empresa" value={empresasFiltro} onChange={(e) => setEmpresasFiltro(e.target.value)}>
                            <MenuItem>Todos</MenuItem>
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                    {emp.nombre_empresa}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de estado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroestado} onChange={(e) => setFiltroEstado(e.target.value)} label="Estado">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}> Vigente </MenuItem>
                            <MenuItem value={2}> No Vigente </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={() => setCrear(true)} >
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
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="20%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Rotativo</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Detalle</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Asignar</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody >
                                {turnosFiltrados.length > 0 ? (
                                    turnosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((tur) => (
                                            <TableRow key={tur.turno_id}>
                                                <TableCell align="center">
                                                    {tur.empresa?.nombre_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tur.nombre}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tur.es_rotativo ? "SI" : "NO"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: tur.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tur.fecha_creacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tur.fecha_actualizacion}
                                                </TableCell>
                                                < TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                                        }}
                                                        onClick={() => {
                                                            setDetalle(true)
                                                        }}
                                                    >
                                                        Asignar Días
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => setAsignar(true)}
                                                        sx={{
                                                            fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                                        }}
                                                    >
                                                        Asignar
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setEditar(true)
                                                        setIdEdit(tur.turno_id)
                                                        setEmpresaEdit(tur.empresa?.empresa_id)
                                                        setNombreEdit(tur.nombre)
                                                        setRotativoEdit(tur.es_rotativo)
                                                        setEstadoEdit(tur.estado?.estado_id)
                                                        setHorarioEdit(tur.horario?.horario_id)
                                                    }} >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell align="center" colSpan={9}>
                                            <Typography variant="body1" color="text.secondary">
                                                {turnosFiltrados
                                                    ? "No se encontraron turnos"
                                                    : "No se encontraron turnos. "}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filasVacias > 0 && (
                                    <TableRow style={{ height: 53 * filasVacias }}>
                                        <TableCell colSpan={9} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={turnosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            < Dialog open={crear} sx={{ textAlign: "center", }
            }>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "45vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Agregar Nuevo Turno</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"
                                        value={empresaCrear}
                                        onChange={(e) => setEmpresaCrear(e.target.value)}
                                    >
                                        {filtroEmpresaCrear.map((fec) => (
                                            <MenuItem key={fec.empresa_id} value={fec.empresa_id}>
                                                {fec.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                                <Box sx={{ mb: 2 }}>

                                    <TextField
                                        value={nombreCrear}
                                        onChange={(e) => setNombreCrear(e.target.value)}
                                        fullWidth label="Nombre" size="small"
                                    />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Rotativo</InputLabel>
                                    <Select label="Rotativo" value={rotativoCrear}
                                        onChange={(e) => setRotativoCrear(e.target.value)}>
                                        <MenuItem value={true}>
                                            Si
                                        </MenuItem>

                                        <MenuItem value={false}>
                                            No
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoCrear}
                                        onChange={(e) => setEstadoCrear(e.target.value)}>
                                        <MenuItem value={1}>
                                            Activo
                                        </MenuItem>
                                        <MenuItem value={2}>
                                            Inactivo
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Horario</InputLabel>
                                    <Select label="Estado" value={horarioCrear}
                                        onChange={(e) => setHorarioCrear(e.target.value)}>
                                        {filtroHorarioCrear.map((hor) => (
                                            <MenuItem key={hor.horario_id} value={hor.horario_id}>
                                                {`${hor.hora_entrada} - ${hor.hora_salida}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarCrear} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog editar */}
            < Dialog open={editar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Editar Turno</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"
                                        value={empresaEdit}
                                        onChange={(e) => setEmpresaEdit(e.target.value)}
                                    >
                                        {filtroEmpresaEdit.map((fec) => (
                                            <MenuItem key={fec.empresa_id} value={fec.empresa_id}>
                                                {fec.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                                <Box sx={{ mb: 2 }}>

                                    <TextField
                                        value={nombreEdit}
                                        onChange={(e) => setNombreEdit(e.target.value)}
                                        fullWidth label="Nombre" size="small"
                                    />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Rotativo</InputLabel>
                                    <Select label="Rotativo" value={rotativoEdit}
                                        onChange={(e) => setRotativoEdit(e.target.value)}>
                                        <MenuItem value={true}>
                                            Si
                                        </MenuItem>

                                        <MenuItem value={false}>
                                            No
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoEdit}
                                        onChange={(e) => setEstadoEdit(e.target.value)}>
                                        <MenuItem value={1}>
                                            Activo
                                        </MenuItem>
                                        <MenuItem value={2}>
                                            Inactivo
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Horario</InputLabel>
                                    <Select label="Estado" value={horarioEdit}
                                        onChange={(e) => setHorarioEdit(e.target.value)}>
                                        {filtroHorarioEdit.map((hor) => (
                                            <MenuItem key={hor.horario_id} value={hor.horario_id}>
                                                {`${hor.hora_entrada} - ${hor.hora_salida}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error">Cancelar</Button>
                    <Button onClick={clickEdit} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog asignar */}
            < Dialog
                open={asignar}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Asignar turno</DialogTitle>

                                <Box sx={{ mb: 4, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <FormControl size="small" sx={{ minWidth: 170 }}>
                                            <InputLabel>Empresa</InputLabel>
                                            <Select label="Perfil de usuario">
                                                <MenuItem>hola</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }}>
                                            <InputLabel>Departamento</InputLabel>
                                            <Select label="Perfil de usuario">
                                                <MenuItem>hola</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }}>
                                            <InputLabel>Centro de costo</InputLabel>
                                            <Select label="Perfil de usuario">
                                                <MenuItem>hola</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }}>
                                            <InputLabel>Cargo</InputLabel>
                                            <Select label="Perfil de usuario">
                                                <MenuItem>hola</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Box>


                                <Box sx={{ display: 'flex', flex: 1, gap: 2, height: "250px" }}>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Empleados disponibles
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            <List dense>
                                                <ListItemText primary="Izquierda" sx={{ pl: 2 }} />
                                            </List>
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} justifyContent="center">
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>&gt;&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>&lt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }}>&lt;&lt;</Button>
                                    </Stack>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Empleados asignados
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            <List dense>
                                                <ListItemText primary="Derecha" sx={{ pl: 2 }} />
                                            </List>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={cerrarAsignar} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog asignar dias */}
            < Dialog
                open={detalle}
                onClose={cerrarDetalle}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", pb: 0 }}>
                    Asignar Días
                </DialogTitle>

                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>

                        <FormGroup
                            row
                            sx={{
                                justifyContent: "center",
                                gap: 1.5
                            }}
                        >
                            {["L", "M", "M", "J", "V", "S", "D"].map((dia, index) => (
                                <FormControlLabel
                                    key={index}
                                    labelPlacement="top"
                                    control={
                                        <Checkbox
                                            size="small"
                                            sx={{
                                                padding: 0.5,
                                                '&.Mui-checked': { color: '#1976d2' }
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'text.secondary',
                                                width: '20px', 
                                                textAlign: 'center'
                                            }}
                                        >
                                            {dia}
                                        </Typography>
                                    }
                                    sx={{ margin: 0 }}
                                />
                            ))}
                        </FormGroup>

                    </Box>

                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                        Seleccione los días laborales para este turno.
                    </Typography>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
                    <Button onClick={cerrarDetalle} color="error" sx={{ minWidth: 100 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" sx={{ minWidth: 100 }}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >
        </>
    );
}
export default AdminTurnos;