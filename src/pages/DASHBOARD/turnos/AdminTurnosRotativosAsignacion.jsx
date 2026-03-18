import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    Radio,
    Checkbox
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { getTurnosRotativos, actualizarTurnoRotativo, asignarTurnosRotativos } from "../../../services/turnosRotativoService";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { obtenerHorarios } from "../../../services/horariosServices";
import { Grid } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';


function AdminTurnosRotativosAsignacion() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [empresasFiltro, setEmpresasFiltro] = useState("")
    const [filtroDepto, setFiltroDepto] = useState("")
    const [filtroCenco, setFiltroCenco] = useState("")

    const [empleados, setEmpleados] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [cencos, setCencos] = useState([])
    const [asignaciones, setAsignaciones] = useState([])
    const [horarios, setHorarios] = useState([])
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null)

    // Estados para el nuevo diálogo de asignación
    const [dialogAsignar, setDialogAsignar] = useState(false)
    const [duracion, setDuracion] = useState("1 día")
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
    const [horarioId, setHorarioId] = useState("")
    const [cargandoEnvio, setCargandoEnvio] = useState(false)
    const [cargandoEnvioFiltro, setCargandoEnvioFiltro] = useState(false)

    // Helper para formato de horario
    const formatHorarioInfo = (h) => {
        if (!h) return "Descanso";
        const entrada = h.hora_entrada?.slice(0, 5) || "??:??";
        const salida = h.hora_salida?.slice(0, 5) || "??:??";
        let minCol = 0;
        if (h.colacion) {
            const parts = h.colacion.split(':');
            if (parts.length >= 2) {
                minCol = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            }
        }
        return `${entrada} - ${salida} / col: ${minCol}`;
    }
    const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null)

    // Estados crear
    const [crear, setCrear] = useState(false)
    const [detalleCrear, setDetalleCrear] = useState(false)

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [detalleEditar, setDetalleEditar] = useState(false)

    // Carga de datos
    const cargarDatos = async () => {
        setCargando(true)
        try {
            const [dataEmpresas, dataAsignaciones, dataDeptos, dataCencos, dataEmpleados, dataHorarios] = await Promise.all([
                obtenerEmpresas(),
                getTurnosRotativos(),
                obtenerDepartamentos(),
                obtenerCentroCostos(),
                obtenerEmpleados(),
                obtenerHorarios()
            ]);

            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
            setAsignaciones(Array.isArray(dataAsignaciones) ? dataAsignaciones : []);
            setHorarios(Array.isArray(dataHorarios) ? dataHorarios : [dataHorarios]);

            // Filtrar empleados que permiten turnos rotativos
            const empleadosLista = Array.isArray(dataEmpleados) ? dataEmpleados : [];
            const filtradosPermiteRotativo = empleadosLista.filter(emp => emp.permite_rotativo === true);
            setEmpleados(filtradosPermiteRotativo);

            const deptos = dataDeptos?.departamentos || dataDeptos;
            setDepartamentos(Array.isArray(deptos) ? deptos : [deptos]);
            setCencos(Array.isArray(dataCencos) ? dataCencos : [dataCencos]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    const [asignar, setAsignar] = useState("")
    const [detalle, setDetalle] = useState(false)

    const cerrarAsignar = () => { setAsignar(false) }
    const cerrarDetalle = () => { setDetalle(false) }
    const cerrarCrear = () => { setCrear(false) }
    const cerrarEditar = () => { setEditar(false) }
    const cerrarDetallesCrear = () => { setDetalleCrear(false) }
    const cerrarDetalleEditar = () => { setDetalleEditar(false) }

    // Lógica para calcular la fecha de término según la duración
    const handleCambioFechaInicio = (nuevaFecha) => {
        setFechaInicio(nuevaFecha);
        actualizarFechaFin(nuevaFecha, duracion);
    }

    const handleCambioDuracion = (nuevaDuracion) => {
        setDuracion(nuevaDuracion);
        if (nuevaDuracion !== "Personalizado") {
            actualizarFechaFin(fechaInicio, nuevaDuracion);
        }
    }

    const actualizarFechaFin = (inicio, seleccion) => {
        const date = new Date(inicio + "T12:00:00");
        if (seleccion === "1 día") date.setDate(date.getDate());
        else if (seleccion === "5 días") date.setDate(date.getDate() + 5);
        else if (seleccion === "7 días") date.setDate(date.getDate() + 7);
        else if (seleccion === "30 días") date.setDate(date.getDate() + 30);
        else if (seleccion === "12 meses") date.setFullYear(date.getFullYear() + 1);
        else if (seleccion === "5 años") date.setFullYear(date.getFullYear() + 5);

        setFechaFin(date.toISOString().split('T')[0]);
    }

    const handleGuardar = async () => {
        setCargandoEnvio(true);
        try {
            const horarioEnviar = horarioId === "descanso" ? null : horarioId;

            if (asignacionSeleccionada) {
                await actualizarTurnoRotativo(asignacionSeleccionada.id, horarioEnviar);
                toast.success("Turno actualizado exitosamente");
            } else {
                await asignarTurnosRotativos({
                    empleado: empleadoSeleccionado.empleado_id,
                    horario: horarioEnviar,
                    fecha_inicio_turno: fechaInicio,
                    fecha_fin_turno: fechaFin
                });
                toast.success("Turno asignado exitosamente");
            }
            await cargarDatos();
            setDialogAsignar(false);
            setAsignacionSeleccionada(null);
        } catch (error) {
            toast.error(error.message || "Error al guardar el turno");
        } finally {
            setCargandoEnvio(false);
        }
    };

    // Filtrado y paginacion
    const deptosFiltrados = empresasFiltro
        ? departamentos.filter(d => d.empresa?.empresa_id === empresasFiltro)
        : [];

    const cencosFiltrados = filtroDepto
        ? cencos.filter(c => c.departamento_id === filtroDepto && c.permite_turno_r === true)
        : [];

    const empleadosFiltrados = empleados.filter((emp) => {
        const nombreCompleto = `${emp.nombres || ''} ${emp.apellido_paterno || ''} ${emp.apellido_materno || ''}`.toLowerCase();
        const rut = `${emp.run || ''}`.toLowerCase();
        const ficha = `${emp.num_ficha || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();

        const coincideTexto = nombreCompleto.includes(term) || rut.includes(term) || ficha.includes(term);
        const coincideEmpresa = empresasFiltro ? emp.empresa?.empresa_id === empresasFiltro : true;
        const coincideDepto = filtroDepto ? emp.cenco?.departamento_id === filtroDepto : true;
        const coincideCenco = filtroCenco ? emp.cenco?.cenco_id === filtroCenco : true;

        return coincideTexto && coincideEmpresa && coincideDepto && coincideCenco;
    });

    const asignacionesEmpleado = empleadoSeleccionado
        ? asignaciones.filter(asig => asig.empleado?.empleado_id === empleadoSeleccionado.empleado_id)
        : [];

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        setPagina(0);
    }, [busqueda]);

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos Rotativos
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
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
                    <FormControl size="small" variant="standard" sx={{ minWidth: 150 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select
                            label="Empresa"
                            value={empresasFiltro}
                            onChange={(e) => {
                                setEmpresasFiltro(e.target.value);
                                setFiltroDepto("");
                                setFiltroCenco("");
                            }}
                        >
                            <MenuItem value=""><em>Todas</em></MenuItem>
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                    {emp.nombre_empresa}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de departamento */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 150 }}>
                        <InputLabel>Departamento</InputLabel>
                        <Select
                            label="Departamento"
                            value={filtroDepto}
                            onChange={(e) => {
                                setFiltroDepto(e.target.value);
                                setFiltroCenco("");
                            }}
                            disabled={!empresasFiltro}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {deptosFiltrados.map((dep) => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>
                                    {dep.nombre_departamento}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de cenco */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 150 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select
                            label="Cenco"
                            value={filtroCenco}
                            onChange={(e) => setFiltroCenco(e.target.value)}
                            disabled={!filtroDepto}
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {cencosFiltrados.map((c) => (
                                <MenuItem key={c.cenco_id} value={c.cenco_id}>
                                    {c.nombre_cenco}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Box>

                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative",
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <TableContainer sx={{ flex: 1, maxHeight: 'calc(70vh - 120px)', overflowY: 'auto' }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de empleados">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="20%" align="center"><strong>Num Ficha</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Rut</strong></TableCell>
                                    <TableCell width="40%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Asignación</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            <CircularProgress size={24} />
                                        </TableCell>
                                    </TableRow>
                                ) : empleadosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No se encontraron empleados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    empleadosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((emp) => (
                                            <TableRow key={emp.empleado_id}>
                                                <TableCell align="center">{emp.num_ficha || '-'}</TableCell>
                                                <TableCell align="center">{emp.run}</TableCell>
                                                <TableCell align="center">{`${emp.nombres} ${emp.apellido_paterno}`}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            setEmpleadoSeleccionado(emp);
                                                            setEditar(true);
                                                        }}
                                                        sx={{
                                                            fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                                        }}
                                                    >
                                                        Asignación
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
                    rowsPerPageOptions={[]}
                    component="div"
                    count={empleadosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialog editar/asignación */}
            <Dialog open={editar} sx={{ textAlign: "center", }} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "100%", }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Historial de turnos asignados</DialogTitle>
                                <TableContainer component={Paper} variant="outlined" sx={{ flex: 1, minHeight: '366px', width: '100%', overflow: 'auto' }}>
                                    <Table stickyHeader sx={{ minWidth: 650 }} aria-label="tabla de turnos">
                                        <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                            <TableRow>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Seleccionar</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Eliminar</TableCell>
                                                <TableCell width="20%" align="left" sx={{ fontWeight: 'bold' }}>Horario</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Fecha Inicio</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Fecha Fin</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {asignacionesEmpleado.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">Este empleado no posee asignaciones</TableCell>
                                                </TableRow>
                                            ) : (
                                                asignacionesEmpleado.map((asig) => (
                                                    <TableRow key={asig.id} hover onClick={() => setAsignacionSeleccionada(asig)} sx={{ cursor: 'pointer' }}>
                                                        <TableCell align="center">
                                                            <Radio
                                                                size="small"
                                                                checked={asignacionSeleccionada?.id === asig.id}
                                                                onChange={() => setAsignacionSeleccionada(asig)}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Checkbox size="small" />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            {formatHorarioInfo(asig.horario)}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {asig.fecha_inicio_turno ? asig.fecha_inicio_turno.split('T')[0] : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {asig.fecha_fin_turno ? asig.fecha_fin_turno.split('T')[0] : '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box display={"flex"} gap={2} mt={2}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ px: 2, py: 0.5, fontSize: "0.8rem" }}
                                        onClick={() => {
                                            if (asignacionSeleccionada) {
                                                const hid = asignacionSeleccionada.horario ? asignacionSeleccionada.horario.horario_id : "descanso";
                                                setHorarioId(hid);
                                                setDuracion("Personalizado");
                                                setFechaInicio(asignacionSeleccionada.fecha_inicio_turno?.split('T')[0]);
                                                setFechaFin(asignacionSeleccionada.fecha_fin_turno?.split('T')[0]);
                                            } else {
                                                setHorarioId("");
                                                setDuracion("Personalizado");
                                                setFechaInicio(new Date().toISOString().split('T')[0]);
                                                actualizarFechaFin(new Date().toISOString().split('T')[0], "Personalizado");
                                            }
                                            setDialogAsignar(true);
                                        }}
                                    >
                                        Editar Turno Rotativo
                                    </Button>
                                    <Button variant="outlined" color="error" sx={{ px: 2, py: 0.5, fontSize: "0.8rem" }}>Eliminar Seleccionado(S)</Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error" >Salir</Button>
                </DialogActions>
            </Dialog>




            {/* Dialog Modificar/reemplazar asignacion turno */}
            <Dialog open={dialogAsignar} onClose={() => !cargandoEnvio && setDialogAsignar(false)} maxWidth={false}
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '600px',
                    }
                }}>
                <DialogTitle sx={{ bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd', py: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Editar Turno Rotativo
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    {empleadoSeleccionado && (
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {/* Fila 1: Info Empleado */}
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Empresa</Typography>
                                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f9f9f9' }}>
                                    <Typography variant="body2">{empleadoSeleccionado.empresa?.nombre_empresa || '-'}</Typography>
                                </Paper>
                            </Grid>

                            {/* Fila 2: Depto y Cenco */}
                            <Grid item xs={12} md={3}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Departamento</Typography>
                                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f9f9f9', minHeight: '38px' }}>
                                    <Typography variant="body2">
                                        {departamentos.find(d =>
                                            d.departamento_id === (empleadoSeleccionado.cenco?.departamento_id || empleadoSeleccionado.departamento_id || empleadoSeleccionado.cenco?.departamento?.departamento_id)
                                        )?.nombre_departamento ||
                                            empleadoSeleccionado.cenco?.departamento?.nombre_departamento ||
                                            empleadoSeleccionado.departamento?.nombre_departamento || '-'}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Centro de costo</Typography>
                                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f9f9f9', minHeight: '38px' }}>
                                    <Typography variant="body2">{empleadoSeleccionado.cenco?.nombre_cenco || '-'}</Typography>
                                </Paper>
                            </Grid>
                            {/* Fila 2: Rut, Nombre y Horario */}
                            <Grid item xs={12} md={3}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Rut empleado</Typography>
                                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f9f9f9', minHeight: '38px' }}>
                                    <Typography variant="body2">{empleadoSeleccionado.run}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">Nombre</Typography>
                                <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f9f9f9', minHeight: '38px' }}>
                                    <Typography variant="body2">{`${empleadoSeleccionado.nombres} ${empleadoSeleccionado.apellido_paterno}`}</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>Horario</Typography>
                                    <Select
                                        value={horarioId}
                                        onChange={(e) => setHorarioId(e.target.value)}
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value=""><em>Seleccionar horario</em></MenuItem>
                                        <MenuItem value="descanso"><em>Descanso</em></MenuItem>
                                        {horarios
                                            .filter(h => h.empresa?.empresa_id === empleadoSeleccionado.empresa?.empresa_id)
                                            .map((h) => (
                                                <MenuItem key={h.horario_id} value={h.horario_id}>
                                                    {formatHorarioInfo(h)}
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #ddd' }}>
                    <Button onClick={() => setDialogAsignar(false)} color="inherit" variant="outlined" disabled={cargandoEnvio}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGuardar}
                        color="primary"
                        variant="contained"
                        disabled={cargandoEnvio || horarioId === ""}
                        startIcon={cargandoEnvio && <CircularProgress size={20} color="inherit" />}
                    >
                        {cargandoEnvio ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTurnosRotativosAsignacion;