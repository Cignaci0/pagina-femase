import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel,
    Typography, List, ListItem, ListItemText, Stack, Checkbox,
    ListItemIcon, Grid
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerHorarios } from "../../../services/horariosServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerPorEmpresa } from "../../../services/empleadosServices";
import { asignarTeletrabajo } from "../../../services/asignaciones/asignacionesServices";

function AsignacionTeletrabajos() {
    // Datos cargados
    const [empresas, setEmpresas] = useState([])
    const [horarios, setHorarios] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [cencos, setCencos] = useState([])
    const [empleados, setEmpleados] = useState([])

    // Estados filtros
    const [filtroEmpresa, setFiltroEmpresa] = useState("")
    const [filtroDepartamento, setFiltroDepartamento] = useState("")
    const [filtroCenco, setFiltroCenco] = useState("")

    // Transfer list
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([])
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([])
    const [checkedIzq, setCheckedIzq] = useState([])
    const [checkedDer, setCheckedDer] = useState([])

    // Estados inicialización de ciclos
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])

    const [cargando, setCargando] = useState(false)

    // Carga de datos
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [dataEmpresas, dataHorarios, dataDepartamentos, dataCencos] = await Promise.all([
                    obtenerEmpresas(),
                    obtenerHorarios(),
                    obtenerDepartamentos(),
                    obtenerCentroCostos()
                ]);
                setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
                setHorarios(Array.isArray(dataHorarios) ? dataHorarios : [dataHorarios]);
                const deptos = dataDepartamentos?.departamentos || dataDepartamentos;
                setDepartamentos(Array.isArray(deptos) ? deptos : [deptos]);
                setCencos(Array.isArray(dataCencos) ? dataCencos : [dataCencos]);
            } catch (err) {
                toast.error(err.message);
            }
        };
        cargarDatos();
    }, []);

    // Filtros en cascada: departamentos filtrados por empresa
    const departamentosFiltrados = filtroEmpresa
        ? departamentos.filter(d => d.empresa?.empresa_id === filtroEmpresa)
        : [];

    // Cencos filtrados por departamento + permite_turno_r === true
    const cencosFiltrados = filtroDepartamento
        ? cencos.filter(c => c.departamento_id === filtroDepartamento && c.permite_turno_r === true)
        : [];

    // Cuando cambia empresa, resetear departamento y cenco
    const handleCambioEmpresa = async (valor) => {
        setFiltroEmpresa(valor);
        setFiltroDepartamento("");
        setFiltroCenco("");
        setEmpleadosDisponibles([]);
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);

        if (valor) {
            const tId = toast.loading("Cargando empleados...");
            try {
                const results = await obtenerPorEmpresa(valor);
                setEmpleados(results || []);
                toast.success("Empleados cargados", { id: tId });
            } catch (error) {
                toast.error("Error al cargar empleados de la empresa", { id: tId });
                setEmpleados([]);
            }
        } else {
            setEmpleados([]);
        }
    }

    // Cuando cambia departamento, resetear cenco
    const handleCambioDepartamento = (valor) => {
        setFiltroDepartamento(valor);
        setFiltroCenco("");
        setEmpleadosDisponibles([]);
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);
    }

    // Cuando cambia cenco, cargar empleados de ese cenco
    const handleCambioCenco = (valor) => {
        setFiltroCenco(valor);
        setCheckedIzq([]);
        setCheckedDer([]);
        setEmpleadosSeleccionados([]);

        if (valor) {
            const empsFiltrados = empleados.filter(emp => {
                // Revisar si el empleado pertenece al cenco seleccionado (cenco principal o cencos[])
                if (emp.cenco?.cenco_id === valor) return true;
                if (emp.cencos && emp.cencos.some(c => c.cenco_id === valor)) return true;
                return false;
            });
            setEmpleadosDisponibles(empsFiltrados);
        } else {
            setEmpleadosDisponibles([]);
        }
    }

    // Transfer list handlers
    const handleToggleIzq = (empId) => {
        setCheckedIzq(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    }

    const handleToggleDer = (empId) => {
        setCheckedDer(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    }

    // Mover seleccionados a la derecha
    const moverDerecha = () => {
        const mover = empleadosDisponibles.filter(e => checkedIzq.includes(e.empleado_id));
        setEmpleadosSeleccionados(prev => [...prev, ...mover]);
        setEmpleadosDisponibles(prev => prev.filter(e => !checkedIzq.includes(e.empleado_id)));
        setCheckedIzq([]);
    }

    // Mover todos a la derecha
    const moverTodosDerecha = () => {
        setEmpleadosSeleccionados(prev => [...prev, ...empleadosDisponibles]);
        setEmpleadosDisponibles([]);
        setCheckedIzq([]);
    }

    // Mover seleccionados a la izquierda
    const moverIzquierda = () => {
        const mover = empleadosSeleccionados.filter(e => checkedDer.includes(e.empleado_id));
        setEmpleadosDisponibles(prev => [...prev, ...mover]);
        setEmpleadosSeleccionados(prev => prev.filter(e => !checkedDer.includes(e.empleado_id)));
        setCheckedDer([]);
    }

    // Mover todos a la izquierda
    const moverTodosIzquierda = () => {
        setEmpleadosDisponibles(prev => [...prev, ...empleadosSeleccionados]);
        setEmpleadosSeleccionados([]);
        setCheckedDer([]);
    }

    const handleGenerarAsignacion = async () => {
        if (empleadosSeleccionados.length === 0) {
            toast.error("Seleccione al menos un empleado");
            return;
        }

        if (new Date(fechaInicio) > new Date(fechaFin)) {
            toast.error("La fecha de inicio debe ser menor o igual a la fecha de fin");
            return;
        }

        setCargando(true);
        const tId = toast.loading("Asignando teletrabajo...");

        try {
            for (const emp of empleadosSeleccionados) {
                await asignarTeletrabajo(emp.empleado_id, fechaInicio, fechaFin);
            }
            toast.success("Teletrabajo asignado correctamente para todos los empleados", { id: tId });
            setEmpleadosSeleccionados([]);
            setCheckedDer([]);
        } catch (error) {
            toast.error(error.message || "Error al asignar teletrabajo", { id: tId });
        } finally {
            setCargando(false);
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Asignación Teletrabajo
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 180px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Filtros */}
                <Box sx={{ mb: 2, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <FormControl size="small" sx={{ width: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select label="Empresa" value={filtroEmpresa} onChange={(e) => handleCambioEmpresa(e.target.value)}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {empresas.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: 250 }}>
                            <InputLabel>Departamento</InputLabel>
                            <Select label="Departamento" value={filtroDepartamento} onChange={(e) => handleCambioDepartamento(e.target.value)} disabled={!filtroEmpresa}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {departamentosFiltrados.map((dep) => (
                                    <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ width: 250 }}>
                            <InputLabel>Cenco</InputLabel>
                            <Select label="Cenco" value={filtroCenco} onChange={(e) => handleCambioCenco(e.target.value)} disabled={!filtroDepartamento}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {cencosFiltrados.map((c) => (
                                    <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Transfer list empleados */}
                <Box sx={{ display: 'flex', flexDirection: { xs: "column", md: "row" }, gap: 2, flex: 1, minHeight: 0, mb: 2, overflow: 'hidden' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados disponibles</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                {empleadosDisponibles.map((emp) => (
                                    <ListItem
                                        key={emp.empleado_id}
                                        dense
                                        onClick={() => handleToggleIzq(emp.empleado_id)}
                                        sx={{ py: 0 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={checkedIzq.includes(emp.empleado_id)}
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`(${emp.run}) ${emp.nombres} ${emp.apellido_paterno}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    <Stack spacing={1} justifyContent="center" direction={{ xs: "row", md: "column" }} sx={{ py: { xs: 1, md: 0 } }}>
                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={moverTodosDerecha}>&gt;&gt;</Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={moverDerecha}>&gt;</Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={moverIzquierda}>&lt;</Button>
                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={moverTodosIzquierda}>&lt;&lt;</Button>
                    </Stack>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados seleccionados</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                {empleadosSeleccionados.map((emp) => (
                                    <ListItem
                                        key={emp.empleado_id}
                                        dense
                                        onClick={() => handleToggleDer(emp.empleado_id)}
                                        sx={{ py: 0 }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={checkedDer.includes(emp.empleado_id)}
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`(${emp.run}) ${emp.nombres} ${emp.apellido_paterno}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ mt: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Inicialización de ciclo(s)
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Fecha inicio"
                                type="date"
                                size="small"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Fecha fin"
                                type="date"
                                size="small"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={empleadosSeleccionados.length === 0 || cargando}
                                sx={{ height: '40px' }}
                                onClick={handleGenerarAsignacion}
                            >
                                {cargando ? 'Asignando...' : 'Generar Asignación'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </>
    );
}

export default AsignacionTeletrabajos;