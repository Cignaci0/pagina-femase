import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText, Tooltip, Checkbox
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas, crearEmpresa, actualizarEmpresa } from "../../../services/empresasServices";
import { regiones, comunas } from "../../../utils/dataGeografica";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { obtenerVacaciones, crearSolicitudVacaciones, aprobarRechazar, generarreporte } from "../../../services/vacaciones";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DraftsIcon from '@mui/icons-material/Drafts';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TodayIcon from '@mui/icons-material/Today';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';

function AdminVacaciones() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);

    // Info Token
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const decodeToken = () => {
            try {
                const token = window.localStorage.getItem("token");
                if (!token) return {};
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo(payload);
            } catch (e) {
                setUserInfo({});
            }
        };
        decodeToken();
    }, []);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [desdeFecha, setDesdeFecha] = useState(null)
    const [hastaFecha, setHastaFecha] = useState(null)
    const [haBuscado, setHaBuscado] = useState(false);
    const [vacacionesFiltradas, setVacacionesFiltradas] = useState([]);
    const [resumenSaldos, setResumenSaldos] = useState({});
    const [filtroEstado, setFiltroEstado] = useState("");

    // Estados dialogs de detalle (Fechas, Dias, Saldos)
    const [openFechas, setOpenFechas] = useState(false);
    const [openDias, setOpenDias] = useState(false);
    const [openSaldos, setOpenSaldos] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Estados dialog Generar Reporte
    const [openReporte, setOpenReporte] = useState(false);

    // Estados base (catalogos)
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);

    // Opciones cascada reporte
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);

    // Filtros generales
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");

    const [empleadosFiltro, setEmpleadosFiltro] = useState([]);

    // Transfer list
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [checkedIzq, setCheckedIzq] = useState([]);
    const [checkedDer, setCheckedDer] = useState([]);

    // Estado dialog Info Historica
    const [openHistorica, setOpenHistorica] = useState(false);

    // Carga inicial para la transfer list de reportes
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const cencos = await obtenerCentroCostos();
                const emps = await obtenerEmpleados();

                setCencosGlobal(cencos || []);
                setEmpleadosGlobal(emps || []);

                const empresasMap = new Map();
                (cencos || []).forEach(c => {
                    const e = c.departamento?.empresa;
                    if (e && !empresasMap.has(e.empresa_id)) {
                        empresasMap.set(e.empresa_id, e);
                    }
                });
                setOpcionesEmpresas(Array.from(empresasMap.values()));
            } catch (error) {
                toast.error("Error al cargar datos base");
            }
        };
        fetchCatalogos();
    }, []);

    // Cascada: Empresa -> Deptos
    useEffect(() => {
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
        } else {
            setOpcionesDeptos([]);
        }
        setFiltroDepto("");
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
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosFiltro(empsFiltrados);
            setEmpleadosDisponibles(empsFiltrados);
        } else {
            setEmpleadosFiltro([]);
            setEmpleadosDisponibles([]);
        }
        setFiltroEmpleado("");
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);
    }, [filtroCenco, empleadosGlobal]);

    useEffect(() => {
        if (filtroEmpleado && desdeFecha && hastaFecha) {
            handleBuscarVacaciones();
        } else if (!filtroEmpleado) {
            setVacacionesFiltradas([]);
            setResumenSaldos({});
            setHaBuscado(false);
        }
    }, [filtroEmpleado]);

    // Handlers transfer list
    const handleToggleIzq = (empId) => {
        setCheckedIzq(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
    }

    const handleToggleDer = (empId) => {
        setCheckedDer(prev => prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]);
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

    const cerrarDialogReporte = () => {
        setOpenReporte(false);
        setEmpleadosSeleccionados([]);
        setCheckedIzq([]);
        setCheckedDer([]);
        if (filtroCenco !== "") {
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosDisponibles(empsFiltrados);
        } else {
            setEmpleadosDisponibles([]);
        }
    };

    const handleGenerarReporte = async () => {
        if (empleadosSeleccionados.length === 0) {
            toast.error("Debe seleccionar al menos un empleado");
            return;
        }

        const toastId = toast.loading("Generando reportes...");

        try {
            for (const emp of empleadosSeleccionados) {
                const numFicha = emp.num_ficha;
                if (!numFicha) continue;

                const blob = await generarreporte(numFicha);
                if (!blob) {
                    toast.error(`Error al generar reporte de ${emp.nombres}`);
                    continue;
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = `Reporte_Vacaciones_${emp.nombres}_${emp.apellido_paterno}.pdf`;
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

    const handleReporteIndividual = async () => {
        if (!filtroEmpleado) {
            toast.error("Debe seleccionar un empleado");
            return;
        }

        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
        const numFicha = empSel?.num_ficha;

        if (!numFicha) {
            toast.error("El empleado no tiene número de ficha registrado");
            return;
        }

        const toastId = toast.loading("Generando reporte...");
        try {
            const blob = await generarreporte(numFicha);
            if (!blob) {
                toast.error("Error al generar el reporte", { id: toastId });
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `Reporte_Vacaciones_${empSel.nombres}_${empSel.apellido_paterno}.pdf`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Reporte generado exitosamente", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Error al generar el reporte", { id: toastId });
        }
    };

    const handleBuscarVacaciones = async () => {
        if (!filtroEmpleado || !desdeFecha || !hastaFecha) {
            toast.error("Debe seleccionar empleado y rango de fechas");
            return;
        }

        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
        const numFicha = empSel?.num_ficha;

        if (!numFicha) {
            toast.error("El empleado seleccionado no tiene número de ficha registrado");
            return;
        }

        setCargando(true);
        try {
            const fi = desdeFecha.format("YYYY-MM-DD");
            const ff = hastaFecha.format("YYYY-MM-DD");
            const response = await obtenerVacaciones(numFicha, fi, ff);

            if (response && response.vacaciones) {
                setVacacionesFiltradas(response.vacaciones);
                setResumenSaldos(response.resumen || {});
            } else {
                setVacacionesFiltradas([]);
                setResumenSaldos({});
            }
            setHaBuscado(true);
        } catch (error) {
            toast.error("Error al buscar las vacaciones");
        } finally {
            setCargando(false);
            setPagina(0);
        }
    };

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoFechaInicio, setNuevoFechaInicio] = useState(null);
    const [nuevoFechaFin, setNuevoFechaFin] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("A");

    const cerrarDialog = () => {
        setOpen(false);
        setNuevoFechaInicio(null);
        setNuevoFechaFin(null);
        setNuevoEstado("A");
    };

    // Estados de Aprobar/Rechazar
    const [openAprobar, setOpenAprobar] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    const handleAbrirAprobar = (row) => {
        setSolicitudSeleccionada(row);
        setOpenAprobar(true);
    };

    const cerrarDialogAprobar = () => {
        setOpenAprobar(false);
        setSolicitudSeleccionada(null);
    };

    const handleAccionAprobarRechazar = async (estado) => {
        if (!solicitudSeleccionada) return;
        const toastId = toast.loading(estado === "A" ? "Aprobando solicitud..." : "Rechazando solicitud...");
        try {
            await aprobarRechazar(solicitudSeleccionada.id_vacaciones || solicitudSeleccionada.id, estado);
            toast.success(estado === "A" ? "Solicitud aprobada exitosamente" : "Solicitud rechazada exitosamente", { id: toastId });
            cerrarDialogAprobar();
            if (haBuscado && desdeFecha && hastaFecha) {
                await handleBuscarVacaciones();
            }
        } catch (error) {
            toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
        }
    };

    const clickCrear = async () => {
        if (!filtroEmpleado) {
            toast.error("Debe seleccionar un empleado primero");
            return;
        }

        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
        const numFicha = empSel?.num_ficha;

        if (!numFicha) {
            toast.error("El empleado no tiene número de ficha registrado");
            return;
        }

        const toastId = toast.loading("Registrando solicitud...");
        try {
            const fi = nuevoFechaInicio.format("YYYY-MM-DD");
            const ff = nuevoFechaFin.format("YYYY-MM-DD");
            
            await crearSolicitudVacaciones(numFicha, fi, ff, nuevoEstado);
            
            toast.success("Solicitud creada exitosamente", { id: toastId });
            cerrarDialog();
            
            if (haBuscado && desdeFecha && hastaFecha) {
                await handleBuscarVacaciones();
            }
        } catch (error) {
            toast.error("Error al registrar solicitud", { id: toastId });
        }
    };

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const coincideEmpresa = true;
        return coincideEmpresa;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Filtrado de la tabla
    const vacacionesParaMostrar = filtroEstado
        ? vacacionesFiltradas.filter((v) => v.estado === filtroEstado)
        : vacacionesFiltradas;

    // Effects
    useEffect(() => {
        setPagina(0);
    }, [busqueda]);


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Vacaciones
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, ml: 2 }}>

                    {/* Filtros de seleccion */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Depto" value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} disabled={!filtroEmpresa}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesDeptos.map(dep => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Cenco" value={filtroCenco} onChange={(e) => setFiltroCenco(e.target.value)} disabled={!filtroDepto}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesCencos.map(c => (
                                <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empleado" value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)} disabled={!filtroCenco || empleadosFiltro.length === 0}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empleadosFiltro.map(emp => (
                                <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                    {emp.nombres} {emp.apellido_paterno}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                     <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value="P">Pendiente</MenuItem>
                            <MenuItem value="A">Aprobado</MenuItem>
                            <MenuItem value="R">Rechazado</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtros de fecha */}
                    <Box sx={{ mb: 2, maxWidth: "15%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Desde"
                                format="DD-MM-YYYY"
                                value={desdeFecha}
                                onChange={(newValue) => setDesdeFecha(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        required: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ mb: 2, maxWidth: "15%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Hasta"
                                format="DD-MM-YYYY"
                                value={hastaFecha}
                                onChange={(newValue) => setHastaFecha(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        required: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    {(() => {
                        const loggedInEmpleado = empleadosGlobal.find(e => e.num_ficha === userInfo?.num_ficha);
                        const userRole = loggedInEmpleado?.cargo?.tipo_cargo;
                        const empSelBusqueda = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                        const cargoTipoBusqueda = empSelBusqueda?.cargo?.tipo_cargo;
                        const isTipoCargo1Global = userRole === 1;
                        const isTipoCargo1Busqueda = cargoTipoBusqueda === 1;
                        const isSelfRestrictedNuevo = (cargoTipoBusqueda === 2 && empSelBusqueda?.num_ficha === userInfo?.num_ficha);

                        return (
                            <>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<SearchIcon />}
                                    sx={{ height: "40px", mb: 2, ml: 2, minWidth: "120px" }}
                                    onClick={handleBuscarVacaciones}
                                    disabled={!filtroEmpleado || !desdeFecha || !hastaFecha}
                                >
                                    Buscar
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{ height: "40px", mb: 2, ml: 1 }}
                                    onClick={(e) => setOpen(true)}
                                    disabled={!filtroEmpleado || isTipoCargo1Global || isTipoCargo1Busqueda || isSelfRestrictedNuevo}
                                >
                                    Nuevo Registro
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AssessmentIcon />}
                                    sx={{ height: "40px", mb: 2, ml: 1 }}
                                    onClick={handleReporteIndividual}
                                    disabled={!filtroEmpleado || isTipoCargo1Global || isTipoCargo1Busqueda}
                                >
                                    Reporte
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AssessmentIcon />}
                                    sx={{ height: "40px", mb: 2, ml: 1 }}
                                    onClick={() => setOpenReporte(true)}
                                    disabled={!filtroCenco || isTipoCargo1Global}
                                >
                                    Reportes Masivos
                                </Button>
                            </>
                        );
                    })()}

                </Box>

                {/* Tabla principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto", textAlign: "center" }}>

                        {filtroEmpleado && (() => {
                            const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                            return empSel ? (
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                                    <Typography sx={{ fontSize: "20px" }}>
                                        <strong>Nombre:</strong> {empSel.nombres} {empSel.apellido_paterno} ||
                                        <strong> Num Ficha:</strong> <span> {empSel.num_ficha || "-"}</span>
                                    </Typography>
                                </Box>
                            ) : null;
                        })()}

                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fechas</strong></TableCell>
                                    <TableCell align="center"><strong>Ultima Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Dias</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo Vacaciones</strong></TableCell>
                                    <TableCell align="center"><strong>Zona Extrema</strong></TableCell>
                                    <TableCell align="center"><strong>Autorizador</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Info Historica</strong></TableCell>
                                    <TableCell align="center"><strong>Aprobar/Rechazar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                                                <CircularProgress />
                                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                                    Buscando registro...
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : !haBuscado ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione un empleado y un rango de fechas para comenzar la búsqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : vacacionesParaMostrar.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vacacionesParaMostrar.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row, idx) => {
                                        return (
                                            <TableRow key={row.id_vacaciones || idx}>
                                                <TableCell align="center">
                                                    <Tooltip title="Ver Fechas">
                                                        <IconButton onClick={() => {
                                                            setSelectedRow({
                                                                fecIngreso: dayjs(row.fecha_ingreso).format("DD-MM-YYYY"),
                                                                fecInicio: dayjs(row.fecha_inicio).format("DD-MM-YYYY"),
                                                                fecFin: dayjs(row.fecha_fin).format("DD-MM-YYYY")
                                                            });
                                                            setOpenFechas(true);
                                                        }}>
                                                            <CalendarMonthIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="center">{dayjs(row.fecha_ingreso).format("DD-MM-YYYY HH:mm")}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Ver Dias">
                                                        <IconButton onClick={() => {
                                                            setSelectedRow({
                                                                diasAcumulados: row.dias_acumulados,
                                                                diasEfectivos: row.dias_efectivos
                                                            });
                                                            setOpenDias(true);
                                                        }}>
                                                            <TodayIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="center">{row.saldo_vacaciones}</TableCell>
                                                <TableCell align="center">{row.zona_extrema ? "Sí" : "No"}</TableCell>
                                                <TableCell align="center">{row.autorizador || "-"}</TableCell>
                                                <TableCell align="center">
                                                    {row.estado === "A" && <CircleIcon sx={{ color: "green", fontSize: 18 }} />}
                                                    {row.estado === "P" && <CircleIcon sx={{ color: "gold", fontSize: 18 }} />}
                                                    {row.estado === "R" && <CircleIcon sx={{ color: "red", fontSize: 18 }} />}
                                                    {row.estado !== "A" && row.estado !== "P" && row.estado !== "R" && row.estado}
                                                </TableCell>
                                                <TableCell align="center"><IconButton onClick={() => setOpenHistorica(true)}><HistoryIcon /></IconButton></TableCell>
                                                <TableCell align="center">
                                                    {row.estado === "P" && (() => {
                                                        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                                                        const isSelfRestricted = empSel?.num_ficha === userInfo?.num_ficha && empSel?.cargo?.tipo_cargo === 2 || empSel?.cargo?.tipo_cargo === 1;
                                                        
                                                        return (
                                                            <IconButton 
                                                                onClick={() => handleAbrirAprobar(row)}
                                                                disabled={isSelfRestricted}
                                                                sx={{ opacity: isSelfRestricted ? 0.5 : 1 }}
                                                            >
                                                                <EditIcon color={isSelfRestricted ? "disabled" : "inherit"} />
                                                            </IconButton>
                                                        );
                                                    })()}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={haBuscado ? vacacionesParaMostrar.length : 0}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "65vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Solicitud de Vacaciones</DialogTitle>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha de inicio *"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaInicio}
                                        onChange={(newValue) => setNuevoFechaInicio(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !nuevoFechaInicio ? "Ingrese fecha de inicio" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha fin *"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaFin}
                                        onChange={(newValue) => setNuevoFechaFin(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                helperText: !nuevoFechaFin ? "Ingrese fecha fin" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Estado *</InputLabel>
                                <Select label="Estado *" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                    <MenuItem value="A">Aprobado</MenuItem>
                                    <MenuItem value="P">Pendiente</MenuItem>
                                    <MenuItem value="R">Rechazado</MenuItem>
                                </Select>
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrear}
                        variant="contained"
                        color="primary"
                        disabled={!nuevoFechaInicio || !nuevoFechaFin || !nuevoEstado}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Aprobar/Rechazar */}
            <Dialog open={openAprobar} onClose={cerrarDialogAprobar} sx={{ textAlign: "center" }} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>Aprobar o Rechazar Solicitud</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mt: 2 }}>¿Desea aprobar o rechazar esta solicitud de vacaciones?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
                    <Button variant="contained" color="success" onClick={() => handleAccionAprobarRechazar("A")}>
                        Aprobar
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleAccionAprobarRechazar("R")}>
                        Rechazar
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={cerrarDialogAprobar}>
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Fechas */}
            <Dialog open={openFechas} onClose={() => setOpenFechas(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Fechas</DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center"><strong>fec Ingreso</strong></TableCell>
                                <TableCell align="center"><strong>fec Inicio</strong></TableCell>
                                <TableCell align="center"><strong>fec Fin</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">{selectedRow?.fecIngreso || "-"}</TableCell>
                                <TableCell align="center">{selectedRow?.fecInicio || "-"}</TableCell>
                                <TableCell align="center">{selectedRow?.fecFin || "-"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFechas(false)} color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Dias */}
            <Dialog open={openDias} onClose={() => setOpenDias(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Dias</DialogTitle>
                <DialogContent>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center"><strong>Dias Acumulados</strong></TableCell>
                                <TableCell align="center"><strong>Dias Efectivos</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell align="center">{selectedRow?.diasAcumulados || "-"}</TableCell>
                                <TableCell align="center">{selectedRow?.diasEfectivos || "-"}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDias(false)} color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Generar Reporte */}
            <Dialog open={openReporte} onClose={cerrarDialogReporte} sx={{ textAlign: "center" }} maxWidth="md" fullWidth>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Generar Reporte por Cenco</DialogTitle>
                            {/* Transfer list empleados */}
                            <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: "250px" }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', textAlign: "left" }}>Empleados disponibles</Typography>
                                    <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff', maxHeight: "40vh" }}>
                                        <List dense sx={{ p: 0 }}>
                                            {empleadosDisponibles.map((emp) => {
                                                const eid = emp.empleado_id || emp.run;
                                                return (
                                                    <ListItem key={eid} dense button onClick={() => handleToggleIzq(eid)}>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <Checkbox edge="start" checked={checkedIzq.includes(eid)} size="small" tabIndex={-1} disableRipple />
                                                        </ListItemIcon>
                                                        <ListItemText primary={`(${emp.run || emp.num_ficha || "-"}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`} />
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
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', textAlign: "left" }}>Empleados seleccionados</Typography>
                                    <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff', maxHeight: "40vh" }}>
                                        <List dense sx={{ p: 0 }}>
                                            {empleadosSeleccionados.map((emp) => {
                                                const eid = emp.empleado_id || emp.run;
                                                return (
                                                    <ListItem key={eid} dense button onClick={() => handleToggleDer(eid)}>
                                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                                            <Checkbox edge="start" checked={checkedDer.includes(eid)} size="small" tabIndex={-1} disableRipple />
                                                        </ListItemIcon>
                                                        <ListItemText primary={`(${emp.run || emp.num_ficha || "-"}) ${emp.nombres} ${emp.apellido_paterno} ${emp.apellido_materno || ""}`} />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogReporte} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={empleadosSeleccionados.length === 0}
                        onClick={handleGenerarReporte}
                    >
                        Generar Reporte
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Info Historica */}
            <Dialog open={openHistorica} onClose={() => setOpenHistorica(false)} maxWidth="xl" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Información Histórica</DialogTitle>
                <DialogContent>
                    <TableContainer sx={{ maxHeight: 400 }}>
                        <Table stickyHeader sx={{ minWidth: 1400 }} size="small">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Empleado</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha de calculo</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha evento</strong></TableCell>
                                    <TableCell align="center"><strong>Usuario</strong></TableCell>
                                    <TableCell align="center"><strong>F.Ini.Contrato</strong></TableCell>
                                    <TableCell align="center"><strong>AFP Certif</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha certificado AFP</strong></TableCell>
                                    <TableCell align="center"><strong>Num cotiz. certif</strong></TableCell>
                                    <TableCell align="center"><strong>FVP</strong></TableCell>
                                    <TableCell align="center"><strong>Dias Progresivos</strong></TableCell>
                                    <TableCell align="center"><strong>Dias especiales</strong></TableCell>
                                    <TableCell align="center"><strong>Dias adicionales</strong></TableCell>
                                    <TableCell align="center"><strong>Acumulados(+)</strong></TableCell>
                                    <TableCell align="center"><strong>Asignados(-)</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo</strong></TableCell>
                                    <TableCell align="center"><strong>Ini. ult. vac</strong></TableCell>
                                    <TableCell align="center"><strong>Fin ult. vac</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="center" colSpan={17} sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No se encontraron registros históricos
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenHistorica(false)} color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminVacaciones;