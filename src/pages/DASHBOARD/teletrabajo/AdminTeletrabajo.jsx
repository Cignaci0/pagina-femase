import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress,
    TablePagination, Radio, Checkbox, Pagination, Grid
} from "@mui/material";
import { toast } from "react-hot-toast";
import SearchIcon from '@mui/icons-material/Search';

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerTeletrabajos, editarTeletrabajo, eliminarTeletrabajo } from "../../../services/teletrabajo";
import { obtenerHorarios } from "../../../services/horariosServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";

function AdminTeletrabajos() {
    // Estados de datos
    const [empresas, setEmpresas] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [cencos, setCencos] = useState([]);
    const [horarios, setHorarios] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [busqueda, setBusqueda] = useState("");
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");

    // Estados para Dialogs
    const [editar, setEditar] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [asignacionesEmpleado, setAsignacionesEmpleado] = useState([]);
    const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
    const [dialogAsignar, setDialogAsignar] = useState(false);
    const [dialogEliminar, setDialogEliminar] = useState(false);
    const [horarioIdEdicion, setHorarioIdEdicion] = useState("");
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    // Carga inicial de datos base
    useEffect(() => {
        const cargarDatosBase = async () => {
            try {
                const [dataEmp, dataDep, dataCen, dataHor] = await Promise.all([
                    obtenerEmpresas(),
                    obtenerDepartamentos(),
                    obtenerCentroCostos(),
                    obtenerHorarios()
                ]);
                setEmpresas(Array.isArray(dataEmp) ? dataEmp : [dataEmp]);
                const deptos = dataDep?.departamentos || dataDep;
                setDepartamentos(Array.isArray(deptos) ? deptos : [deptos]);
                setCencos(Array.isArray(dataCen) ? dataCen : [dataCen]);
                setHorarios(Array.isArray(dataHor) ? dataHor : [dataHor]);
            } catch (err) {
                toast.error("Error al cargar datos base");
            }
        };
        cargarDatosBase();
    }, []);

    // Manejo de cambio de empresa
    const handleCambioEmpresa = async (idEmpresa) => {
        setEmpresaSeleccionada(idEmpresa);
        setFiltroDepto("");
        setFiltroCenco("");
        setPagina(0);
        if (!idEmpresa) {
            setEmpleados([]);
            return;
        }

        setCargando(true);
        const tId = toast.loading("Cargando registros de teletrabajo...");
        try {
            const data = await obtenerTeletrabajos(idEmpresa);
            setEmpleados(data || []);
            toast.success("Datos cargados", { id: tId });
        } catch (error) {
            toast.error("Error al obtener teletrabajos", { id: tId });
            setEmpleados([]);
        } finally {
            setCargando(false);
        }
    };

    // Filtros en cascada
    const deptosFiltrados = empresaSeleccionada
        ? departamentos.filter(d => d.empresa?.empresa_id === empresaSeleccionada)
        : [];

    const cencosFiltrados = filtroDepto
        ? cencos.filter(c => c.departamento_id === filtroDepto)
        : [];

    // Filtrado de empleados en el cliente
    const empleadosFiltrados = empleados.filter((emp) => {
        const term = busqueda.toLowerCase();
        const run = (emp.run || "").toLowerCase();
        const ficha = (emp.num_ficha || "").toLowerCase();
        const nombre = `${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`.toLowerCase();
        
        const coincideBusqueda = run.includes(term) || ficha.includes(term) || nombre.includes(term);
        const coincideDepto = filtroDepto ? emp.cenco?.departamento_id === filtroDepto : true;
        const coincideCenco = filtroCenco ? emp.cenco?.cenco_id === filtroCenco : true;

        return coincideBusqueda && coincideDepto && coincideCenco;
    });

    // Handlers para Dialogs (Solo visuales por ahora)
    const handleAbrirAsignacion = (emp) => {
        setEmpleadoSeleccionado(emp);
        const normales = (emp.teletrabajo_normal || []).map(t => ({
            id: t.id,
            horario: t.horario_id,
            fecha_inicio_turno: t.fecha_actual,
            fecha_fin_turno: t.fecha_actual,
            tipo: 'Normal'
        }));
        const rotativos = (emp.teletrabajo_rotativo || []).map(t => ({
            id: t.id,
            horario: t.horario,
            fecha_inicio_turno: t.fecha_inicio_turno,
            fecha_fin_turno: t.fecha_fin_turno,
            tipo: 'Rotativo'
        }));
        setAsignacionesEmpleado([...normales, ...rotativos]);
        setEditar(true);
    };

    const cerrarEditar = () => {
        setEditar(false);
        setAsignacionSeleccionada(null);
    };

    const handleAbrirEdicion = () => {
        if (!asignacionSeleccionada) {
            toast.error("Por favor seleccione un registro del historial");
            return;
        }
        setHorarioIdEdicion(asignacionSeleccionada.horario?.horario_id || "");
        setDialogAsignar(true);
    };

    const handleGuardarEdicion = async () => {
        if (!horarioIdEdicion) {
            toast.error("Seleccione un horario");
            return;
        }
        setCargandoEnvio(true);
        const tId = toast.loading("Actualizando registro...");
        try {
            await editarTeletrabajo(
                empleadoSeleccionado.empleado_id,
                asignacionSeleccionada.id,
                horarioIdEdicion
            );
            toast.success("Registro actualizado correctamente", { id: tId });
            handleCambioEmpresa(empresaSeleccionada);
            setDialogAsignar(false);
            setEditar(false);
        } catch (error) {
            toast.error("Error al actualizar: " + error.message, { id: tId });
        } finally {
            setCargandoEnvio(false);
        }
    };

    const handleEliminar = async () => {
        if (!asignacionSeleccionada) {
            toast.error("Seleccione un registro para eliminar");
            return;
        }
        setDialogEliminar(true);
    };

    const handleConfirmarEliminacion = async () => {
        setCargandoEnvio(true);
        const tId = toast.loading("Eliminando registro...");
        try {
            await eliminarTeletrabajo(
                empleadoSeleccionado.empleado_id,
                asignacionSeleccionada.id
            );
            toast.success("Registro eliminado correctamente", { id: tId });
            handleCambioEmpresa(empresaSeleccionada);
            setDialogEliminar(false);
            setEditar(false);
        } catch (error) {
            toast.error("Error al eliminar: " + error.message, { id: tId });
        } finally {
            setCargandoEnvio(false);
        }
    };

    const formatHorarioInfo = (h) => {
        if (!h) return "Descanso";
        const entrada = h.hora_entrada?.slice(0, 5) || "??:??";
        const salida = h.hora_salida?.slice(0, 5) || "??:??";
        return `${entrada} - ${salida}`;
    };

    const handleChangePage = (event, newPage) => setPagina(newPage);
    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Teletrabajos
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 180px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2 }}>
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px" }}>
                        <TextField
                            placeholder="Buscar por RUT, Ficha o Nombre..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '10px' }}><SearchIcon /></IconButton>
                    </Paper>

                    <FormControl size="small" variant="standard" sx={{ width: 180 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select
                            value={empresaSeleccionada}
                            onChange={(e) => handleCambioEmpresa(e.target.value)}
                            label="Empresa"
                        >
                            <MenuItem value=""><em>Seleccione una empresa</em></MenuItem>
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ width: 180 }} disabled={!empresaSeleccionada}>
                        <InputLabel>Departamento</InputLabel>
                        <Select
                            value={filtroDepto}
                            onChange={(e) => {
                                setFiltroDepto(e.target.value);
                                setFiltroCenco("");
                                setPagina(0);
                            }}
                            label="Departamento"
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {deptosFiltrados.map((dep) => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ width: 180 }} disabled={!filtroDepto}>
                        <InputLabel>Cenco</InputLabel>
                        <Select
                            value={filtroCenco}
                            onChange={(e) => {
                                setFiltroCenco(e.target.value);
                                setPagina(0);
                            }}
                            label="Cenco"
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {cencosFiltrados.map((c) => (
                                <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", display: 'flex', flexDirection: 'column' }}>
                    <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
                        <Table stickyHeader aria-label="tabla de teletrabajos">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>N° Ficha</strong></TableCell>
                                    <TableCell align="center"><strong>RUT</strong></TableCell>
                                    <TableCell align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cargando ? (
                                    <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                                ) : !empresaSeleccionada ? (
                                    <TableRow><TableCell colSpan={4} align="center">Seleccione una empresa para ver los registros</TableCell></TableRow>
                                ) : empleadosFiltrados.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} align="center">No se encontraron empleados con teletrabajo</TableCell></TableRow>
                                ) : (
                                    empleadosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((emp) => (
                                            <TableRow key={emp.empleado_id} hover>
                                                <TableCell align="center">{emp.num_ficha || '-'}</TableCell>
                                                <TableCell align="center">{emp.run}</TableCell>
                                                <TableCell align="center">{`${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`}</TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleAbrirAsignacion(emp)}
                                                        sx={{ fontSize: "0.7rem", bgcolor: "rgb(241, 241, 241)", color: "black" }}
                                                    >
                                                        Detalles
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
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={empleadosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Paper>

            {/* Dialog Historial (Visual) */}
            <Dialog open={editar} onClose={cerrarEditar} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ textAlign: 'center' }}>Historial de Teletrabajo - {empleadoSeleccionado?.nombres}</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Seleccionar</TableCell>
                                    <TableCell align="center">Horario</TableCell>
                                    <TableCell align="center">Fecha</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {asignacionesEmpleado.map((asig) => (
                                    <TableRow key={asig.id} hover onClick={() => setAsignacionSeleccionada(asig)}>
                                        <TableCell align="center">
                                            <Radio checked={asignacionSeleccionada?.id === asig.id} onChange={() => setAsignacionSeleccionada(asig)} size="small" />
                                        </TableCell>
                                        <TableCell align="center">{formatHorarioInfo(asig.horario)}</TableCell>
                                        <TableCell align="center">{asig.fecha_inicio_turno?.split('T')[0]}</TableCell>
                                    </TableRow>
                                ))}
                                {asignacionesEmpleado.length === 0 && (
                                    <TableRow><TableCell colSpan={5} align="center">Sin registros</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button variant="contained" size="small" onClick={handleAbrirEdicion}>Editar Seleccionado</Button>
                        <Button variant="outlined" color="error" size="small" onClick={handleEliminar}>Eliminar Seleccionado</Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="primary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Confirmar Eliminación */}
            <Dialog open={dialogEliminar} onClose={() => !cargandoEnvio && setDialogEliminar(false)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>¿Está seguro que desea eliminar este registro de teletrabajo? Esta acción no se puede deshacer.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogEliminar(false)} disabled={cargandoEnvio}>Cancelar</Button>
                    <Button onClick={handleConfirmarEliminacion} color="error" variant="contained" disabled={cargandoEnvio}>
                        {cargandoEnvio ? <CircularProgress size={20} color="inherit" /> : "Confirmar y Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Editar (Funcional) */}
            <Dialog open={dialogAsignar} onClose={() => !cargandoEnvio && setDialogAsignar(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Asignación de Teletrabajo</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, mt: 1 }}>
                        Empleado: {empleadoSeleccionado?.nombres} {empleadoSeleccionado?.apellido_paterno}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth size="small">
                                <InputLabel shrink>Horario</InputLabel>
                                <Select
                                    value={horarioIdEdicion}
                                    onChange={(e) => setHorarioIdEdicion(e.target.value)}
                                    label="Horario"
                                    notched
                                >
                                    <MenuItem value=""><em>Seleccione horario</em></MenuItem>
                                    {horarios
                                        .filter(h => h.empresa?.empresa_id === empresaSeleccionada)
                                        .map((h) => (
                                            <MenuItem key={h.horario_id} value={h.horario_id}>
                                                {formatHorarioInfo(h)}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                fullWidth 
                                label="Fecha Inicio" 
                                type="date" 
                                InputLabelProps={{ shrink: true }} 
                                value={asignacionSeleccionada?.fecha_inicio_turno?.split('T')[0] || ""} 
                                size="small" 
                                disabled 
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField 
                                fullWidth 
                                label="Fecha Fin" 
                                type="date" 
                                InputLabelProps={{ shrink: true }} 
                                value={asignacionSeleccionada?.fecha_fin_turno?.split('T')[0] || ""} 
                                size="small" 
                                disabled 
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogAsignar(false)} disabled={cargandoEnvio}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleGuardarEdicion}
                        disabled={cargandoEnvio || !horarioIdEdicion}
                        startIcon={cargandoEnvio && <CircularProgress size={20} color="inherit" />}
                    >
                        {cargandoEnvio ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminTeletrabajos;