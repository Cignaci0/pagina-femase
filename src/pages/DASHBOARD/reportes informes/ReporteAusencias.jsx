import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Button, Box, Stack, FormControl, InputLabel,
    Select, MenuItem, List, ListItem, ListItemIcon, Checkbox,
    ListItemText, TextField
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados, obtenerPorEmpresa } from "../../../services/empleadosServices";
import { reporteAusencia } from "../../../services/reportes";
import { obtenerEmpresas } from "../../../services/empresasServices";

function ReporteAusencia() {

    // Estados base (catalogos)
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);

    // Opciones cascada
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);

    // Filtros
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");

    // Transfer list
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [checkedIzq, setCheckedIzq] = useState([]);
    const [checkedDer, setCheckedDer] = useState([]);

    // Formulario de abajo
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const cencos = await obtenerCentroCostos();
                const empresas = await obtenerEmpresas();

                setCencosGlobal(cencos || []);
                setOpcionesEmpresas(empresas || []);
            } catch (error) {
                toast.error("Error al cargar datos base");
            }
        };
        fetchCatalogos();
    }, []);

    // Cascada: Empresa -> Deptos
    useEffect(() => {
        const actualizarDatosEmpresa = async () => {
            if (filtroEmpresa !== "") {
                const deptosMap = new Map();
                cencosGlobal.forEach(c => {
                    if (c.departamento?.empresa?.empresa_id === filtroEmpresa && c.departamento) {
                        if (!deptosMap.has(c.departamento.departamento_id)) {
                            deptosMap.set(c.departamento.departamento_id, c.departamento);
                        }
                    }
                });
                setOpcionesDeptos(Array.from(deptosMap.values()));

                const tId = toast.loading("Cargando empleados...");
                try {
                    const resEmps = await obtenerPorEmpresa(filtroEmpresa);
                    setEmpleadosGlobal(resEmps || []);
                    toast.success("Empleados cargados", { id: tId });
                } catch (error) {
                    toast.error("Error al cargar empleados", { id: tId });
                    setEmpleadosGlobal([]);
                }
            } else {
                setOpcionesDeptos([]);
                setEmpleadosGlobal([]);
            }
            setFiltroDepto("");
        };
        actualizarDatosEmpresa();
    }, [filtroEmpresa, cencosGlobal]);

    // Cascada: Depto -> Cencos
    useEffect(() => {
        if (filtroDepto !== "") {
            const cencosValidos = cencosGlobal.filter(c => c.departamento?.departamento_id === filtroDepto);
            setOpcionesCencos(cencosValidos);
        } else {
            setOpcionesCencos([]);
        }
        setFiltroCenco("");
    }, [filtroDepto, cencosGlobal]);

    // Cascada: Cenco -> Empleados
    useEffect(() => {
        if (filtroCenco !== "") {
            // Empleados filtrados por Cenco
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosDisponibles(empsFiltrados);
        } else {
            setEmpleadosDisponibles([]);
        }
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);
    }, [filtroCenco, empleadosGlobal]);


    // Handlers transfer list
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

    const moverDerecha = () => {
        const mover = empleadosDisponibles.filter(e => checkedIzq.includes(e.empleado_id || e.run));
        setEmpleadosSeleccionados(prev => [...prev, ...mover]);
        setEmpleadosDisponibles(prev => prev.filter(e => !checkedIzq.includes(e.empleado_id || e.run)));
        setCheckedIzq([]);
    }

    const moverTodosDerecha = () => {
        setEmpleadosSeleccionados(prev => [...prev, ...empleadosDisponibles]);
        setEmpleadosDisponibles([]);
        setCheckedIzq([]);
    }

    const moverIzquierda = () => {
        const mover = empleadosSeleccionados.filter(e => checkedDer.includes(e.empleado_id || e.run));
        setEmpleadosDisponibles(prev => [...prev, ...mover]);
        setEmpleadosSeleccionados(prev => prev.filter(e => !checkedDer.includes(e.empleado_id || e.run)));
        setCheckedDer([]);
    }

    const moverTodosIzquierda = () => {
        setEmpleadosDisponibles(prev => [...prev, ...empleadosSeleccionados]);
        setEmpleadosSeleccionados([]);
        setCheckedDer([]);
    }

    const handleGenerarReporte = async () => {
        if (empleadosSeleccionados.length === 0) {
            toast.error("Seleccione al menos un empleado");
            return;
        }

        const toastId = toast.loading("Generando reportes...");

        try {
            for (const emp of empleadosSeleccionados) {
                const numFicha = emp.num_ficha;
                if (!numFicha) continue;

                const blob = await reporteAusencia(numFicha, fechaFin, fechaInicio);
                if (!blob || blob.length === 0) {
                    toast.error(`Error al generar reporte de ${emp.nombres}`);
                    continue;
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `Reporte_Ausencia_${emp.nombres}.pdf`;
                document.body.appendChild(a);
                a.click();
                await new Promise(resolve => setTimeout(resolve, 600));

                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
            toast.success("Reportes generados exitosamente", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Error al generar reportes", { id: toastId });
        }
    };

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Reporte Ausencias
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Filtros */}
                <Box sx={{ mb: 3, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>

                            <Select label="Empresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {opcionesEmpresas.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                ))}
                            </Select>
                            
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Depto</InputLabel>
                            <Select label="Depto" value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} disabled={!filtroEmpresa}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {opcionesDeptos.map((dep) => (
                                    <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Cenco</InputLabel>
                            <Select label="Cenco" value={filtroCenco} onChange={(e) => setFiltroCenco(e.target.value)} disabled={!filtroDepto}>
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {opcionesCencos.map((c) => (
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
                            <List dense sx={{ p: 0 }}>
                                {empleadosDisponibles.map((emp) => {
                                    const eid = emp.empleado_id || emp.run;
                                    return (
                                        <ListItem
                                            key={eid}
                                            dense
                                            button
                                            onClick={() => handleToggleIzq(eid)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={checkedIzq.includes(eid)}
                                                    size="small"
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`(${emp.run || emp.num_ficha || "-"}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`}
                                            />
                                        </ListItem>
                                    );
                                })}
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
                            <List dense sx={{ p: 0 }}>
                                {empleadosSeleccionados.map((emp) => {
                                    const eid = emp.empleado_id || emp.run;
                                    return (
                                        <ListItem
                                            key={eid}
                                            dense
                                            button
                                            onClick={() => handleToggleDer(eid)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={checkedDer.includes(eid)}
                                                    size="small"
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`(${emp.run || emp.num_ficha || "-"}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </Box>
                </Box>

                {/* Formulario Inferior */}
                <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha inicio</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                sx={{ minWidth: 180, bgcolor: '#fff' }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha fin</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                sx={{ minWidth: 180, bgcolor: '#fff' }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', pt: 2.5, ml: 'auto' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={empleadosSeleccionados.length === 0}
                                onClick={handleGenerarReporte}
                            >
                                Generar Reporte
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper >
        </>
    );
}

export default ReporteAusencia;