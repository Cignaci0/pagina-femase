import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, TablePagination, Stack, Checkbox,
    ListItemIcon,
    FormHelperText, FormControlLabel, Grid
} from "@mui/material";
import { toast } from "react-hot-toast";

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerHorarios } from "../../../services/horariosServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { asignarTurnosRotativos } from "../../../services/turnosRotativoService";

function AdminAsignacionCiclica() {

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
    const [numeroCiclos, setNumeroCiclos] = useState(7)
    const [duracion, setDuracion] = useState("1 Año")

    // Estados dialog definir ciclos
    const [dialogCiclos, setDialogCiclos] = useState(false)
    const [diasGenerados, setDiasGenerados] = useState([])
    const [horariosPorDia, setHorariosPorDia] = useState({})
    const [horarioGlobalCiclo, setHorarioGlobalCiclo] = useState("")

    // Estados Vista Previa y Guardado
    const [dialogPreview, setDialogPreview] = useState(false)
    const [asignacionesGeneradas, setAsignacionesGeneradas] = useState([])
    const [cargandoGuardado, setCargandoGuardado] = useState(false)

    // Estados y helpers para Asignación Rotativa
    const [tipoAsignacion, setTipoAsignacion] = useState("ciclica");
    const [fechaFinRotativa, setFechaFinRotativa] = useState(new Date().toISOString().split('T')[0]);
    const [horarioIdRotativa, setHorarioIdRotativa] = useState("");
    const [duracionRotativa, setDuracionRotativa] = useState("1 día");
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    const handleCambioFechaInicioRotativa = (nuevaFecha) => {
        setFechaInicio(nuevaFecha);
        actualizarFechaFinRotativa(nuevaFecha, duracionRotativa);
    }

    const handleCambioDuracionRotativa = (nuevaDuracion) => {
        setDuracionRotativa(nuevaDuracion);
        if (nuevaDuracion !== "Personalizado") {
            actualizarFechaFinRotativa(fechaInicio, nuevaDuracion);
        }
    }

    const actualizarFechaFinRotativa = (inicio, seleccion) => {
        const date = new Date(inicio + "T12:00:00");
        if (seleccion === "1 día") date.setDate(date.getDate());
        else if (seleccion === "5 días") date.setDate(date.getDate() + 5);
        else if (seleccion === "7 días") date.setDate(date.getDate() + 7);
        else if (seleccion === "30 días") date.setDate(date.getDate() + 30);
        else if (seleccion === "12 meses") date.setFullYear(date.getFullYear() + 1);
        else if (seleccion === "5 años") date.setFullYear(date.getFullYear() + 5);
        setFechaFinRotativa(date.toISOString().split('T')[0]);
    }

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

    const handleGuardarRotativa = async () => {
        if (empleadosSeleccionados.length === 0) {
            toast.error("Seleccione al menos un empleado");
            return;
        }
        if (!fechaInicio || !fechaFinRotativa) {
            toast.error("Seleccione fecha de inicio y término");
            return;
        }
        setCargandoEnvio(true);
        try {
            const horarioSeleccionado = horarioIdRotativa === "descanso" || !horarioIdRotativa
                ? null 
                : horarios.find(h => String(h.horario_id) === String(horarioIdRotativa));
            
            const esNocturno = horarioSeleccionado?.nocturno === true || 
                               horarioSeleccionado?.nocturno === 1 || 
                               horarioSeleccionado?.nocturno === "1" || 
                               horarioSeleccionado?.nocturno === "true" ||
                               String(horarioSeleccionado?.nocturno).toLowerCase() === "si";

            console.log("Horario Seleccionado:", horarioSeleccionado, "/ Es Nocturno:", esNocturno);

            const horarioEnviar = horarioIdRotativa === "descanso" ? null : horarioIdRotativa;
            
            const start = new Date(fechaInicio + "T12:00:00");
            const end = new Date(fechaFinRotativa + "T12:00:00");

            for (const emp of empleadosSeleccionados) {
                let currentDate = new Date(start);
                while (currentDate <= end) {
                    const fechaInicioTurnoStr = currentDate.toISOString().split('T')[0];
                    let fechaFinTurnoStr = fechaInicioTurnoStr;

                    if (esNocturno) {
                        const nextDate = new Date(currentDate);
                        nextDate.setDate(nextDate.getDate() + 1);
                        fechaFinTurnoStr = nextDate.toISOString().split('T')[0];
                    }

                    await asignarTurnosRotativos({
                        empleado: emp.empleado_id,
                        horario: horarioEnviar,
                        fecha_inicio_turno: fechaInicioTurnoStr,
                        fecha_fin_turno: fechaFinTurnoStr
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
            toast.success("Turnos personales asignados exitosamente");
            setEmpleadosSeleccionados([]);
            setHorarioIdRotativa("");
        } catch (error) {
            toast.error(error.message || "Error al asignar asignaciones personales");
        } finally {
            setCargandoEnvio(false);
        }
    }

    // Carga de datos
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [dataEmpresas, dataHorarios, dataDepartamentos, dataCencos, dataEmpleados] = await Promise.all([
                    obtenerEmpresas(),
                    obtenerHorarios(),
                    obtenerDepartamentos(),
                    obtenerCentroCostos(),
                    obtenerEmpleados()
                ]);
                setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
                setHorarios(Array.isArray(dataHorarios) ? dataHorarios : [dataHorarios]);
                const deptos = dataDepartamentos?.departamentos || dataDepartamentos;
                setDepartamentos(Array.isArray(deptos) ? deptos : [deptos]);
                setCencos(Array.isArray(dataCencos) ? dataCencos : [dataCencos]);
                setEmpleados(Array.isArray(dataEmpleados) ? dataEmpleados : [dataEmpleados]);
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
    const handleCambioEmpresa = (valor) => {
        setFiltroEmpresa(valor);
        setFiltroDepartamento("");
        setFiltroCenco("");
        setEmpleadosDisponibles([]);
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);
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
                // Solo mostrar si permite turnos rotativos
                if (emp.permite_rotativo !== true || emp.turno !== null) return false;

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

    // Abrir dialog con fechas generadas
    const abrirDefinirCiclos = () => {
        const nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const dias = [];
        const inicio = new Date(fechaInicio + "T12:00:00");

        for (let i = 0; i < numeroCiclos; i++) {
            const fecha = new Date(inicio);
            fecha.setDate(inicio.getDate() + i);
            const diaSemana = nombresDias[fecha.getDay()];
            const fechaStr = fecha.toISOString().split('T')[0];
            dias.push({
                index: i,
                label: `${diaSemana} ${fechaStr}`,
            });
        }

        setDiasGenerados(dias);
        setHorariosPorDia({});
        setHorarioGlobalCiclo("");
        setDialogCiclos(true);
    }

    const cerrarDialogCiclos = () => {
        setDialogCiclos(false);
        setDiasGenerados([]);
        setHorariosPorDia({});
        setHorarioGlobalCiclo("");
    }

    // Lógica para generar la vista previa basada en la duración
    const generarVistaPrevia = () => {
        if (empleadosSeleccionados.length === 0) {
            toast.error("Seleccione al menos un empleado");
            return;
        }

        const diasCiclo = Object.keys(horariosPorDia).length;
        if (diasCiclo < numeroCiclos) {
        }

        const fechaIni = new Date(fechaInicio + "T12:00:00");
        let fechaFin = new Date(fechaIni);

        // Calcular fecha fin según duración
        if (duracion === "1 Mes") fechaFin.setMonth(fechaIni.getMonth() + 1);
        else if (duracion === "3 Meses") fechaFin.setMonth(fechaIni.getMonth() + 3);
        else if (duracion === "6 Meses") fechaFin.setMonth(fechaIni.getMonth() + 6);
        else if (duracion === "1 Año") fechaFin.setFullYear(fechaIni.getFullYear() + 1);
        else if (duracion === "2 Años") fechaFin.setFullYear(fechaIni.getFullYear() + 2);
        else if (duracion === "3 Años") fechaFin.setFullYear(fechaIni.getFullYear() + 3);
        else if (duracion === "4 Años") fechaFin.setFullYear(fechaIni.getFullYear() + 4);
        else if (duracion === "5 Años") fechaFin.setFullYear(fechaIni.getFullYear() + 5);

        const listaTemp = [];
        let cursorFecha = new Date(fechaIni);
        let diaContador = 0;

        while (cursorFecha < fechaFin) {
            const indexCiclo = diaContador % numeroCiclos;
            const horarioId = horariosPorDia[indexCiclo];
            const fechaStr = cursorFecha.toISOString().split('T')[0];

            let horarioIdFinal = null;
            let textoHorarioFinal = "Descanso";
            let fechaFinStr = fechaStr;

            if (horarioId) {
                const hInfo = horarios.find(h => h.horario_id === horarioId);
                if (hInfo) {
                    horarioIdFinal = horarioId;
                    textoHorarioFinal = `${hInfo.hora_entrada.slice(0, 5)} - ${hInfo.hora_salida.slice(0, 5)}`;
                    const esNocturno = hInfo.nocturno === true
                    if (esNocturno) {
                        const nextDate = new Date(cursorFecha);
                        nextDate.setDate(nextDate.getDate() + 1);
                        fechaFinStr = nextDate.toISOString().split('T')[0];
                    }
                }
            }

            empleadosSeleccionados.forEach(emp => {
                listaTemp.push({
                    fecha: fechaStr,
                    fecha_fin: fechaFinStr,
                    horario_id: horarioIdFinal,
                    horarioTexto: textoHorarioFinal,
                    empleado_id: emp.empleado_id,
                    empleadoNombre: `${emp.nombres} ${emp.apellido_paterno}`
                });
            });

            cursorFecha.setDate(cursorFecha.getDate() + 1);
            diaContador++;
        }

        setAsignacionesGeneradas(listaTemp);
        setDialogPreview(true);
    }

    const guardarTodo = async () => {
        setCargandoGuardado(true);
        try {
            // Guardado secuencial para evitar saturar o por requerimiento de UX
            for (const asig of asignacionesGeneradas) {
                await asignarTurnosRotativos({
                    empleado: asig.empleado_id,
                    horario: asig.horario_id,
                    fecha_inicio_turno: asig.fecha,
                    fecha_fin_turno: asig.fecha_fin
                });
            }
            toast.success("Asignaciones insertadas correctamente");
            setDialogPreview(false);
            setDialogCiclos(false);
        } catch (error) {
            toast.error(error.message || "Error al insertar algunas asignaciones");
        } finally {
            setCargandoGuardado(false);
        }
    }

    // Horarios filtrados por empresa seleccionada
    const horariosFiltrados = horarios.filter(h => h.empresa?.empresa_id === filtroEmpresa);

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos Rotativos
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 3, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", display: 'flex', flexDirection: 'column',
                boxSizing: "border-box"
            }}>
                {/* Filtros */}
                <Box sx={{ mb: 3, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select label="Empresa" value={filtroEmpresa} onChange={(e) => handleCambioEmpresa(e.target.value)}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {empresas.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Departamento</InputLabel>
                            <Select label="Departamento" value={filtroDepartamento} onChange={(e) => handleCambioDepartamento(e.target.value)}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {departamentosFiltrados.map((dep) => (
                                    <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Cenco</InputLabel>
                            <Select label="Cenco" value={filtroCenco} onChange={(e) => handleCambioCenco(e.target.value)}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {cencosFiltrados.map((c) => (
                                    <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Transfer list empleados */}
                <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: "250px" }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados disponibles</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                {empleadosDisponibles.map((emp) => (
                                    <ListItem
                                        key={emp.empleado_id}
                                        dense
                                        button
                                        onClick={() => handleToggleIzq(emp.empleado_id)}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={checkedIzq.includes(emp.empleado_id)}
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`(${emp.run}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    <Stack spacing={1} justifyContent="center">
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
                                        button
                                        onClick={() => handleToggleDer(emp.empleado_id)}
                                    >
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={checkedDer.includes(emp.empleado_id)}
                                                size="small"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`(${emp.run}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                        variant={tipoAsignacion === 'ciclica' ? "contained" : "outlined"} 
                        size="small" 
                        onClick={() => setTipoAsignacion('ciclica')}
                    >
                        Asignación Cíclica
                    </Button>
                    <Button 
                        variant={tipoAsignacion === 'rotativa' ? "contained" : "outlined"} 
                        size="small" 
                        onClick={() => setTipoAsignacion('rotativa')}
                    >
                        Asignación Personalizada
                    </Button>
                </Box>  

                {tipoAsignacion === 'ciclica' && (
                    <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Inicialización de ciclo(s)
                        </Typography>
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>Fecha inicio</Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    sx={{ minWidth: 180 }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>Número de ciclos</Typography>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={numeroCiclos}
                                        onChange={(e) => setNumeroCiclos(e.target.value)}
                                    >
                                        <MenuItem value={7}>1 Semana</MenuItem>
                                        <MenuItem value={8}>8 dias</MenuItem>
                                        <MenuItem value={14}>2 semanas</MenuItem>
                                        <MenuItem value={21}>3 semanas</MenuItem>
                                        <MenuItem value={28}>4 semanas</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>Duración</Typography>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                    <Select
                                        value={duracion}
                                        onChange={(e) => setDuracion(e.target.value)}
                                    >
                                        <MenuItem value="1 Mes">1 Mes</MenuItem>
                                        <MenuItem value="3 Meses">3 Meses</MenuItem>
                                        <MenuItem value="6 Meses">6 Meses</MenuItem>
                                        <MenuItem value="1 Año">1 Año</MenuItem>
                                        <MenuItem value="2 Años">2 Años</MenuItem>
                                        <MenuItem value="3 Años">3 Años</MenuItem>
                                        <MenuItem value="4 Años">4 Años</MenuItem>
                                        <MenuItem value="5 Años">5 Años</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', pt: 2.5 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={abrirDefinirCiclos}
                                    disabled={empleadosSeleccionados.length === 0}
                                >
                                    Definir Ciclo(s)
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                )}

                {tipoAsignacion === 'rotativa' && (
                    <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Asignación Rotativa
                        </Typography>
                        <Grid container spacing={3}>
                            
                            <Grid item xs={12} md={3}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>Fecha de inicio</Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    size="small"
                                    value={fechaInicio}
                                    onChange={(e) => handleCambioFechaInicioRotativa(e.target.value)}
                                    sx={{ bgcolor: '#fff' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>Fecha de término</Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    size="small"
                                    value={fechaFinRotativa}
                                    onChange={(e) => setFechaFinRotativa(e.target.value)}
                                    sx={{ bgcolor: '#fff' }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>Horario</Typography>
                                    <Select
                                        value={horarioIdRotativa}
                                        onChange={(e) => setHorarioIdRotativa(e.target.value)}
                                        sx={{ bgcolor: '#fff' }}
                                    >
                                        <MenuItem value=""><em>Seleccionar horario</em></MenuItem>
                                        <MenuItem value="descanso"><em>Descanso</em></MenuItem>
                                        {horariosFiltrados.map((h) => (
                                            <MenuItem key={h.horario_id} value={h.horario_id}>
                                                {formatHorarioInfo(h)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start', pt: 2 }}>
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={handleGuardarRotativa}
                                disabled={cargandoEnvio || horarioIdRotativa === "" || empleadosSeleccionados.length === 0}
                                startIcon={cargandoEnvio && <CircularProgress size={20} color="inherit" />}
                            >
                                {cargandoEnvio ? "Guardando..." : "Guardar Asignación Personalizada"}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Dialog definir ciclos */}
            <Dialog
                open={dialogCiclos}
                onClose={cerrarDialogCiclos}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 0, pt: 3, px: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Asignar Horarios al Ciclo</Typography>
                </DialogTitle>

                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        {diasGenerados.map((dia) => (
                            <Box key={dia.index} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", gap: 2 }}>
                                <Typography sx={{ width: "200px", fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                    {dia.label}
                                </Typography>

                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel>Horario</InputLabel>
                                    <Select
                                        label="Horario"
                                        value={horariosPorDia[dia.index] || ""}
                                        onChange={(e) => setHorariosPorDia({
                                            ...horariosPorDia,
                                            [dia.index]: e.target.value
                                        })}
                                    >
                                        {horariosFiltrados.map((h) => {
                                            const colMins = h.colacion ? parseInt(h.colacion.split(':')[1], 10) : 0;
                                            return (
                                                <MenuItem key={h.horario_id} value={h.horario_id}>
                                                    {h.hora_entrada.slice(0, 5)} - {h.hora_salida.slice(0, 5)} / col: {colMins}
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                            </Box>
                        ))}
                    </Box>

                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                        Asigne un horario a cada día del ciclo.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
                    <Button onClick={cerrarDialogCiclos} color="error" sx={{ minWidth: 100 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" sx={{ minWidth: 100 }} onClick={generarVistaPrevia}>
                        Ver Asignación
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Vista Previa */}
            <Dialog open={dialogPreview} onClose={() => !cargandoGuardado && setDialogPreview(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Vista Previa de Asignaciones</DialogTitle>
                <DialogContent>
                    {cargandoGuardado ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5, gap: 2 }}>
                            <CircularProgress />
                            <Typography variant="h6">Insertando asignación...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Inicio</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha Fin</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Horario</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {asignacionesGeneradas.map((asig, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{asig.fecha}</TableCell>
                                            <TableCell>{asig.fecha_fin}</TableCell>
                                            <TableCell>{asig.horarioTexto}</TableCell>
                                            <TableCell>{asig.empleadoNombre}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                    <Button onClick={() => setDialogPreview(false)} color="error" disabled={cargandoGuardado}>
                        Atrás
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={guardarTodo}
                        disabled={cargandoGuardado || asignacionesGeneradas.length === 0}
                    >
                        Confirmar y Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminAsignacionCiclica;