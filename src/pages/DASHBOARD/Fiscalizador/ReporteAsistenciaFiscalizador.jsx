import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Button, Box, Stack, FormControl, InputLabel,
    Select, MenuItem, List, ListItem, ListItemIcon, Checkbox,
    ListItemText, TextField, IconButton
} from "@mui/material";
import { toast } from "react-hot-toast";
import SearchIcon from '@mui/icons-material/Search';
import dayjs from "dayjs";

import { obtenerEmpleados, obtenerPorRun } from "../../../services/empleadosServices";
import { reporteAsistencia } from "../../../services/reportes";
import { obtenerCargos } from "../../../services/cargosServices";
import { obtenerTurnos } from "../../../services/turnosServices";
import { obtenerEmpresas } from "../../../services/empresasServices";

function ReporteAsistenciaFiscaliza() {

    // Estados base (catalogos)
    const [empresasGlobal, setEmpresasGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);
    const [cargosGlobal, setCargosGlobal] = useState([]);
    const [turnosGlobal, setTurnosGlobal] = useState([]);

    // Opciones filtradas por empresa seleccionado
    const [opcionesCargos, setOpcionesCargos] = useState([]);
    const [opcionesTurnos, setOpcionesTurnos] = useState([]);

    // Filtros superiores
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroTurno, setFiltroTurno] = useState("");
    const [filtroCargo, setFiltroCargo] = useState("");

    // Filtros laterales
    const [searchNombre, setSearchNombre] = useState("");
    const [searchApellido, setSearchApellido] = useState("");
    const [searchRun, setSearchRun] = useState("");

    // Empleados
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);

    // Formulario de abajo
    const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
    const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
    const [filtroPeriodo, setFiltroPeriodo] = useState("");

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [emps, cargos, turnos, empresas] = await Promise.all([
                    obtenerEmpleados(),
                    obtenerCargos(),
                    obtenerTurnos(),
                    obtenerEmpresas()
                ]);

                setEmpleadosGlobal(emps || []);
                setCargosGlobal(cargos || []);
                setTurnosGlobal(turnos || []);
                setEmpresasGlobal(empresas || []);

            } catch (error) {
                toast.error("Error al cargar datos base");
            }
        };
        fetchCatalogos();
    }, []);

    // Cascada: Empresa -> Cargos y Turnos
    useEffect(() => {
        if (filtroEmpresa !== "") {
            // Filtrar cargos por empresa
            const cargosEmp = cargosGlobal.filter(c => {
                const idEmp = c.empresa?.empresa_id || c.empresa_id || c.id_empresa;
                return String(idEmp) === String(filtroEmpresa);
            });
            cargosEmp.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
            setOpcionesCargos(cargosEmp);

            // Filtrar turnos por empresa
            const turnosEmp = turnosGlobal.filter(t => {
                const idEmp = t.empresa?.empresa_id || t.empresa_id || t.id_empresa;
                return String(idEmp) === String(filtroEmpresa);
            });
            turnosEmp.sort((a, b) => (a.nombre || a.nombre_turno || "").localeCompare(b.nombre || b.nombre_turno || ""));
            setOpcionesTurnos(turnosEmp);

        } else {
            setOpcionesCargos([]);
            setOpcionesTurnos([]);
        }
        setFiltroCargo("");
        setFiltroTurno("");
        // Limpiamos búsquedas laterales al cambiar empresa
        setSearchNombre("");
        setSearchApellido("");
        setSearchRun("");
        setEmpleadosSeleccionados([]);
    }, [filtroEmpresa, cargosGlobal, turnosGlobal]);

    // Lógica de filtrado en tiempo real (LOCAL)
    useEffect(() => {
        if (filtroEmpresa === "") {
            setEmpleadosDisponibles([]);
            return;
        }

        // Filtramos sobre empleadosGlobal (que es nuestro cache de todos los empleados del sistema o de la carga inicial)
        let filtrados = empleadosGlobal.filter(e => {
            const idEmp = e.empresa?.empresa_id || e.id_empresa || e.empresa;
            return String(idEmp) === String(filtroEmpresa);
        });

        if (filtroCargo) {
            filtrados = filtrados.filter(e => {
                const cId = e.cargo?.cargo_id || e.cargo?.id || e.cargo;
                return String(cId) === String(filtroCargo);
            });
        }
        if (filtroTurno) {
            filtrados = filtrados.filter(e => {
                const tId = e.turno?.turno_id || e.turno?.id || e.turno;
                return String(tId) === String(filtroTurno);
            });
        }

        if (searchNombre) {
            filtrados = filtrados.filter(e => (e.nombres || "").toLowerCase().includes(searchNombre.toLowerCase()));
        }
        if (searchApellido) {
            filtrados = filtrados.filter(e => 
                ((e.apellido_paterno || "").toLowerCase().includes(searchApellido.toLowerCase())) || 
                ((e.apellido_materno || "").toLowerCase().includes(searchApellido.toLowerCase()))
            );
        }
        if (searchRun) {
            filtrados = filtrados.filter(e => (e.run || "").includes(searchRun));
        }

        filtrados.sort((a, b) => (a.nombres || "").localeCompare(b.nombres || ""));
        setEmpleadosDisponibles(filtrados);
    }, [filtroEmpresa, filtroCargo, filtroTurno, searchNombre, searchApellido, searchRun, empleadosGlobal]);


    // Handler selección de empleados
    const handleToggleEmpleado = (emp) => {
        const empId = emp.empleado_id || emp.run;
        setEmpleadosSeleccionados(prev => {
            const isSelected = prev.some(e => (e.empleado_id || e.run) === empId);
            if (isSelected) {
                return prev.filter(e => (e.empleado_id || e.run) !== empId);
            } else {
                return [...prev, emp];
            }
        });
    }

    // BUSQUEDA GLOBAL POR RUN (Al presionar la lupa)
    const handleBusquedaGlobalRun = async () => {
        if (!searchRun.trim()) {
            toast.error("Ingrese un RUN para buscar");
            return;
        }

        const tId = toast.loading("Buscando empleado...");
        try {
            const emp = await obtenerPorRun(searchRun);
            if (emp) {
                toast.success("Empleado encontrado", { id: tId });
                // Mostramos solo este empleado
                setEmpleadosDisponibles([emp]);
                
                // Si el empleado pertenece a una empresa distinta a la seleccionada, 
                // podríamos opcionalmente cambiar los filtros, pero por ahora solo lo mostramos en la lista.
                // Sin embargo, si el usuario tiene seleccionada una empresa, el useEffect de arriba podría pisar esto.
                // Para evitar que el useEffect pise el resultado global, podríamos usar un flag o simplemente 
                // asegurarnos de que el empleado encontrado se mantenga en pantalla.
                
                // Sincronizamos filtros con la info del empleado encontrado para que el useEffect no lo borre
                if (emp.empresa?.empresa_id) setFiltroEmpresa(emp.empresa.empresa_id);
                if (emp.cargo?.cargo_id) setFiltroCargo(emp.cargo.cargo_id);
                if (emp.turno?.turno_id) setFiltroTurno(emp.turno.turno_id);
                
                // El useEffect se disparará por los cambios de state y el filtro de searchRun coincidirá.
            } else {
                toast.error("Empleado no encontrado", { id: tId });
            }
        } catch (error) {
            toast.error("Error al buscar empleado", { id: tId });
        }
    }

    // Logica periodos rápidos
    const handleCambioPeriodo = (valor) => {
        setFiltroPeriodo(valor);
        if (valor === "ultima_semana") {
            setFechaInicio(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
            setFechaFin(dayjs().format('YYYY-MM-DD'));
        } else if (valor === "ultima_quincena") {
            setFechaInicio(dayjs().subtract(15, 'day').format('YYYY-MM-DD'));
            setFechaFin(dayjs().format('YYYY-MM-DD'));
        } else if (valor === "mes_anterior") {
            const mesAnterior = dayjs().subtract(1, 'month');
            setFechaInicio(mesAnterior.startOf('month').format('YYYY-MM-DD'));
            setFechaFin(mesAnterior.endOf('month').format('YYYY-MM-DD'));
        }
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

                const blob = await reporteAsistencia(numFicha, fechaInicio, fechaFin);
                if (!blob || blob.length === 0) {
                    toast.error(`Error al generar reporte de ${emp.nombres}`);
                    continue;
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `Reporte_Asistencia_${emp.nombres}.pdf`;
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Reporte Asistencia
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Filtros Superiores */}
                <Box sx={{ mb: 3, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select 
                                label="Empresa" 
                                value={filtroEmpresa} 
                                onChange={(e) => setFiltroEmpresa(e.target.value)}
                            >
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {empresasGlobal.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                ))}
                            </Select>   
                        </FormControl>
                        
                        <FormControl size="small" variant="outlined" sx={{ minWidth: 250 }}>
                            <InputLabel>Cargo</InputLabel>
                            <Select 
                                value={filtroCargo} 
                                onChange={(e) => setFiltroCargo(e.target.value)} 
                                label="Cargo"
                                disabled={!filtroEmpresa}
                                sx={{ bgcolor: !filtroEmpresa ? '#f5f5f5' : '#fff' }}
                            >
                                <MenuItem value=""><em>Todos los cargos</em></MenuItem>
                                {opcionesCargos.map((cargo) => (
                                    <MenuItem key={cargo.cargo_id} value={cargo.cargo_id}>{cargo.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" variant="outlined" sx={{ minWidth: 250 }}>
                            <InputLabel>Turno</InputLabel>
                            <Select 
                                value={filtroTurno} 
                                onChange={(e) => setFiltroTurno(e.target.value)} 
                                label="Turno"
                                disabled={!filtroEmpresa}
                                sx={{ bgcolor: !filtroEmpresa ? '#f5f5f5' : '#fff' }}
                            >
                                <MenuItem value=""><em>Todos los turnos</em></MenuItem>
                                {opcionesTurnos.map((turno) => (
                                    <MenuItem key={turno.turno_id} value={turno.turno_id}>{turno.nombre || turno.nombre_turno}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Contenido Central */}
                <Box sx={{ flex: 1, display: 'flex', gap: 4, minHeight: "250px" }}>
                    
                    {/* Filtros Laterales (Izquierda) */}
                    <Box sx={{ width: "300px", display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', pr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Búsqueda de Empleados</Typography>
                        
                        {/* Filtro Nombre */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Nombres</Typography>
                            <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: "100%", height: "40px", mt: 0.5 }}>
                                <TextField 
                                    placeholder="Buscar por nombre..." 
                                    variant="standard" 
                                    InputProps={{ disableUnderline: true }} 
                                    sx={{ ml: 1, flex: 1, px: 1 }} 
                                    value={searchNombre} 
                                    onChange={(e) => setSearchNombre(e.target.value)} 
                                />
                                <IconButton sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Box>

                        {/* Filtro Apellido */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Apellidos</Typography>
                            <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: "100%", height: "40px", mt: 0.5 }}>
                                <TextField 
                                    placeholder="Buscar por apellido..." 
                                    variant="standard" 
                                    InputProps={{ disableUnderline: true }} 
                                    sx={{ ml: 1, flex: 1, px: 1 }} 
                                    value={searchApellido} 
                                    onChange={(e) => setSearchApellido(e.target.value)} 
                                />
                                <IconButton sx={{ p: '10px' }} aria-label="search">
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Box>

                        {/* Filtro Run */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Run</Typography>
                            <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: "100%", height: "40px", mt: 0.5 }}>
                                <TextField 
                                    placeholder="Buscar por run..." 
                                    variant="standard" 
                                    InputProps={{ disableUnderline: true }} 
                                    sx={{ ml: 1, flex: 1, px: 1 }} 
                                    value={searchRun} 
                                    onChange={(e) => setSearchRun(e.target.value)} 
                                />
                                <IconButton 
                                    onClick={handleBusquedaGlobalRun}
                                    sx={{ p: '10px' }} 
                                    aria-label="search"
                                >
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Lista de empleados (Derecha) */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados disponibles</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense sx={{ p: 0 }}>
                                {empleadosDisponibles.map((emp) => {
                                    const eid = emp.empleado_id || emp.run;
                                    const isChecked = empleadosSeleccionados.some(e => (e.empleado_id || e.run) === eid);
                                    return (
                                        <ListItem
                                            key={eid}
                                            dense
                                            button
                                            onClick={() => handleToggleEmpleado(emp)}
                                        >
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={isChecked}
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
                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha inicio</Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    disabled={filtroPeriodo !== ""}
                                    sx={{ minWidth: 180, bgcolor: filtroPeriodo !== "" ? "#f0f0f0" : "#fff" }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha fin</Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    disabled={filtroPeriodo !== ""}
                                    sx={{ minWidth: 180, bgcolor: filtroPeriodo !== "" ? "#f0f0f0" : "#fff" }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'flex-end', pt: 2.5 }}>
                            <FormControl size="small" variant="outlined" sx={{ minWidth: 180 }}>
                                <InputLabel>Periodo Rápido</InputLabel>
                                <Select
                                    sx={{ bgcolor: '#fff' }}
                                    value={filtroPeriodo}
                                    onChange={(e) => handleCambioPeriodo(e.target.value)}
                                    label="Periodo Rápido"
                                >
                                    <MenuItem value=""><em>Personalizado</em></MenuItem>
                                    <MenuItem value="ultima_semana">Última semana</MenuItem>
                                    <MenuItem value="ultima_quincena">Última quincena</MenuItem>
                                    <MenuItem value="mes_anterior">Mes anterior</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                color="primary"
                                disabled={empleadosSeleccionados.length === 0}
                                onClick={handleGenerarReporte}
                                sx={{ height: '40px' }}
                            >
                                Generar Reporte ({empleadosSeleccionados.length})
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper >
        </>
    );
}

export default ReporteAsistenciaFiscaliza;