import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Button, Box, Stack, FormControl, InputLabel,
    Select, MenuItem, List, ListItem, ListItemIcon, Checkbox,
    ListItemText, TextField, IconButton
} from "@mui/material";
import { toast } from "react-hot-toast";
import SearchIcon from '@mui/icons-material/Search';
import dayjs from "dayjs";

import { obtenerPorRun, obtenerPorNombre, obtenerPorEmpresa } from "../../../services/empleadosServices";
import { reporteAsistencia, domingoFestivos, jornadaDiaria, reporteTurnos } from "../../../services/reportes";
import { obtenerCargos } from "../../../services/cargosServices";
import { obtenerHorarios } from "../../../services/horariosServices";
import { obtenerEmpresas } from "../../../services/empresasServices";

function ReportesFiscaliza() {

    // Estados base (catalogos)
    const [empresasGlobal, setEmpresasGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);
    const [cargosGlobal, setCargosGlobal] = useState([]);
    const [turnosGlobal, setTurnosGlobal] = useState([]);

    // Opciones filtradas por empresa seleccionado
    const [opcionesCargos, setOpcionesCargos] = useState([]);
    const [opcionesHorarios, setOpcionesHorarios] = useState([]);

    // Filtros superiores
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroTurno, setFiltroTurno] = useState("");
    const [filtroCargo, setFiltroCargo] = useState("");

    // Filtros laterales
    const [searchNombre, setSearchNombre] = useState("");
    const [searchRun, setSearchRun] = useState("");

    // Empleados
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);

    // Formulario de abajo
    const [fechaInicio, setFechaInicio] = useState(dayjs().format('YYYY-MM-DD'));
    const [fechaFin, setFechaFin] = useState(dayjs().format('YYYY-MM-DD'));
    const [filtroPeriodo, setFiltroPeriodo] = useState("");
    const [tipoReporte, setTipoReporte] = useState("");

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const [cargos, horarios, empresas] = await Promise.all([
                    obtenerCargos(),
                    obtenerHorarios(),
                    obtenerEmpresas()
                ]);

                setCargosGlobal(cargos || []);
                setTurnosGlobal(horarios || []); // Usamos turnosGlobal para guardar horarios por ahora para minimizar cambios
                setEmpresasGlobal(empresas || []);

            } catch (error) {
                toast.error("Error al cargar datos base");
            }
        };
        fetchCatalogos();
    }, []);

    // Cascada: Empresa -> Cargos, Horarios y Empleados
    useEffect(() => {
        const handleCambioEmpresa = async () => {
            if (filtroEmpresa !== "") {
                // 1. Filtrar cargos por empresa
                const cargosEmp = cargosGlobal.filter(c => {
                    const idEmp = c.empresa?.empresa_id || c.empresa_id || c.id_empresa;
                    return String(idEmp) === String(filtroEmpresa);
                });
                cargosEmp.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
                setOpcionesCargos(cargosEmp);

                // 2. Filtrar horarios por empresa
                const horariosEmp = turnosGlobal.filter(h => {
                    const idEmp = h.empresa?.empresa_id || h.empresa_id || h.id_empresa;
                    return String(idEmp) === String(filtroEmpresa);
                });
                horariosEmp.sort((a, b) => (a.hora_entrada || "").localeCompare(b.hora_entrada || ""));
                setOpcionesHorarios(horariosEmp);
                try {
                    const emps = await obtenerPorEmpresa(filtroEmpresa);
                    setEmpleadosGlobal(emps || []);
                } catch (error) {
                    toast.error("Error al cargar empleados", { id: tId });
                    setEmpleadosGlobal([]);
                }

            } else {
                setOpcionesCargos([]);
                setOpcionesHorarios([]);
                if (!searchNombre && !searchRun) {
                    setEmpleadosGlobal([]);
                }
            }
            setFiltroCargo("");
            setFiltroTurno("");
            setEmpleadosSeleccionados([]);
        };

        handleCambioEmpresa();
    }, [filtroEmpresa, cargosGlobal, turnosGlobal]);

    useEffect(() => {
        if (filtroEmpresa === "" && !searchNombre && !searchRun) {
            setEmpleadosDisponibles([]);
            return;
        }

        let filtrados = [...empleadosGlobal];

        if (filtroEmpresa !== "") {
            filtrados = filtrados.filter(e => {
                const idEmp = e.empresa?.empresa_id || e.id_empresa || e.empresa;
                return String(idEmp) === String(filtroEmpresa);
            });
        }

        if (filtroCargo) {
            filtrados = filtrados.filter(e => {
                const cId = e.cargo?.cargo_id || e.cargo?.id || e.cargo;
                return String(cId) === String(filtroCargo);
            });
        }
        if (filtroTurno === "rotativo") {
            filtrados = filtrados.filter(e => e.permite_rotativo === true);
        } else if (filtroTurno) {
            const hSel = turnosGlobal.find(h => String(h.horario_id) === String(filtroTurno));
            if (hSel) {
                filtrados = filtrados.filter(e => {
                    const detalles = e.turno?.detalle_turno || [];
                    if (!Array.isArray(detalles)) return false;

                    return detalles.some(dt => {
                        const hObj = dt.horario;
                        if (!hObj) return false;

                        // Caso 1: dt.horario es un ID
                        if (typeof hObj === 'number' || typeof hObj === 'string') {
                            return String(hObj) === String(hSel.horario_id);
                        }

                        // Caso 2: dt.horario es un objeto (comparamos horas o ID)
                        if (hObj.horario_id && String(hObj.horario_id) === String(hSel.horario_id)) {
                            return true;
                        }

                        const hEntrada = (hObj.hora_entrada || "").trim();
                        const hSalida = (hObj.hora_salida || "").trim();
                        const sEntrada = (hSel.hora_entrada || "").trim();
                        const sSalida = (hSel.hora_salida || "").trim();

                        return (hEntrada !== "" && hEntrada.startsWith(sEntrada)) &&
                            (hSalida !== "" && hSalida.startsWith(sSalida));
                    });
                });
            }
        }

        if (searchNombre) {
            filtrados = filtrados.filter(e => {
                const nombreCompleto = `${e.nombres || ""} ${e.apellido_paterno || ""} ${e.apellido_materno || ""}`.toLowerCase();
                return nombreCompleto.includes(searchNombre.toLowerCase());
            });
        }
        if (searchRun) {
            filtrados = filtrados.filter(e => (e.run || "").includes(searchRun));
        }

        filtrados.sort((a, b) => (a.nombres || "").localeCompare(b.nombres || ""));
        setEmpleadosDisponibles(filtrados);
    }, [filtroEmpresa, filtroCargo, filtroTurno, searchNombre, searchRun, empleadosGlobal, turnosGlobal]);


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

    const handleBusquedaGlobalRun = async () => {
        if (!searchRun.trim()) {
            toast.error("Ingrese un RUN para buscar");
            return;
        }

        const tId = toast.loading("Buscando empleado...");
        try {
            const res = await obtenerPorRun(searchRun);
            const results = Array.isArray(res) ? res : (res ? [res] : []);

            if (results.length > 0) {
                toast.success("Empleado(s) encontrado(s)", { id: tId });
                setEmpleadosGlobal(results);
                setFiltroEmpresa("");
                setFiltroCargo("");
                setFiltroTurno("");
                setSearchNombre("");
                setEmpleadosDisponibles(results);
            } else {
                toast.error("Empleado no encontrado", { id: tId });
            }
        } catch (error) {
            toast.error("Error al buscar empleado", { id: tId });
        }
    }

    const handleBusquedaGlobalNombre = async () => {
        if (!searchNombre.trim()) {
            toast.error("Ingrese un nombre o apellido para buscar");
            return;
        }

        const tId = toast.loading("Buscando empleado...");
        try {
            const res = await obtenerPorNombre(searchNombre);
            const results = Array.isArray(res) ? res : (res ? [res] : []);

            if (results.length > 0) {
                toast.success("Empleado(s) encontrado(s)", { id: tId });
                // Sincronizamos empleadosGlobal con los resultados de la búsqueda
                setEmpleadosGlobal(results);
                // Limpiamos filtros superiores y búsqueda por RUN al buscar por nombre
                setFiltroEmpresa("");
                setFiltroCargo("");
                setFiltroTurno("");
                setSearchRun("");
                setEmpleadosDisponibles(results);
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
        if (!tipoReporte) {
            toast.error("Seleccione un tipo de reporte");
            return;
        }

        const reporteFnMap = {
            "1": { fn: reporteAsistencia, nombre: "Asistencia" },
            "2": { fn: domingoFestivos,   nombre: "Domingo_y_Festivos" },
            "3": { fn: jornadaDiaria,      nombre: "Jornada_Diaria" },
            "4": { fn: reporteTurnos,      nombre: "Turno" },
        };

        const { fn: reporteFn, nombre: tipoNombre } = reporteFnMap[tipoReporte] || {};
        if (!reporteFn) {
            toast.error("Tipo de reporte no soportado aún");
            return;
        }

        const toastId = toast.loading("Generando reportes...");

        try {
            for (const emp of empleadosSeleccionados) {
                const numFicha = emp.num_ficha;
                if (!numFicha) continue;

                const blob = await reporteFn(numFicha, fechaInicio, fechaFin);
                if (!blob || blob.length === 0) {
                    toast.error(`Error al generar reporte de ${emp.nombres}`);
                    continue;
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `Reporte_${tipoNombre}_${emp.nombres}.pdf`;
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
                    Reportes Fiscalizador
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
                            <InputLabel>Tipo de reporte</InputLabel>
                            <Select
                                label="Tipo de reporte"
                                value={tipoReporte}
                                onChange={(e) => setTipoReporte(e.target.value)}
                            >
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                <MenuItem value="1"><em>Asistencia</em></MenuItem>
                                <MenuItem value="2"><em>Domingo y Festivos</em></MenuItem>
                                <MenuItem value="3"><em>Jornada Diaria</em></MenuItem>
                                <MenuItem value="4"><em>Turno</em></MenuItem>
                                
                            </Select>
                        </FormControl>


                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select
                                label="Empresa"
                                value={filtroEmpresa}
                                onChange={(e) => {
                                    setFiltroEmpresa(e.target.value);
                                    setSearchNombre("");
                                    setSearchRun("");
                                }}
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
                            <InputLabel>Horario</InputLabel>
                            <Select
                                value={filtroTurno}
                                onChange={(e) => setFiltroTurno(e.target.value)}
                                label="Horario"
                                disabled={!filtroEmpresa}
                                sx={{ bgcolor: !filtroEmpresa ? '#f5f5f5' : '#fff' }}
                            >
                                <MenuItem value=""><em>Todos los horarios</em></MenuItem>
                                <MenuItem value="rotativo">Rotativo</MenuItem>
                                {opcionesHorarios.map((h) => (
                                    <MenuItem key={h.horario_id} value={h.horario_id}>
                                        {h.hora_entrada} - {h.hora_salida}
                                    </MenuItem>
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

                        {/* Filtro Nombre o Apellido */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Nombre o Apellido</Typography>
                            <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: "100%", height: "40px", mt: 0.5 }}>
                                <TextField
                                    placeholder="Buscar por nombre o apellido..."
                                    variant="standard"
                                    InputProps={{ disableUnderline: true }}
                                    sx={{ ml: 1, flex: 1, px: 1 }}
                                    value={searchNombre}
                                    onChange={(e) => setSearchNombre(e.target.value)}
                                />
                                <IconButton
                                    sx={{ p: '10px' }}
                                    aria-label="search"
                                    onClick={handleBusquedaGlobalNombre}
                                >
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
                                                primary={`(${emp.run || emp.num_ficha || "-"}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""} (${emp.empresa?.nombre_empresa || "Sin Empresa"} / cargo: ${emp.cargo?.nombre || "Sin Cargo"} / cenco: ${emp.cenco?.nombre_cenco || "Sin Cenco"} / turno: ${emp.turno?.nombre ? emp.turno.nombre : (emp.permite_rotativo ? "Turno Rotativo" : "Sin Turno")})`}
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

export default ReportesFiscaliza;