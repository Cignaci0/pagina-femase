import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, TablePagination, Stack, Checkbox,
    ListItemIcon,
    FormHelperText, FormControlLabel
} from "@mui/material";
import { toast } from "react-hot-toast";

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerHorarios } from "../../../services/horariosServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";

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

    // Horarios filtrados por empresa seleccionada
    const horariosFiltrados = horarios.filter(h => h.empresa?.empresa_id === filtroEmpresa);

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Asignación Cíclica Turnos
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

                {/* Inicialización de ciclo(s) */}
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
                            >
                                Definir Ciclo(s)
                            </Button>
                        </Box>
                    </Stack>
                </Box>
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
                    <Button variant="contained" color="primary" sx={{ minWidth: 100 }} onClick={cerrarDialogCiclos}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminAsignacionCiclica;