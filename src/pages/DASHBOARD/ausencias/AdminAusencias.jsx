import React, { useEffect, useState } from "react";
import {
    Box, Paper, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress, TablePagination, Tooltip,
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerPorEmpresa } from "../../../services/empleadosServices";
import { obtenerAusencias, editarAusencia, reporteAusencia } from "../../../services/ausencias";
import { getTipoAusencia } from "../../../services/tiposAusencia";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Stack, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminAusencia() {

    // Estados de datos
    const [cargando, setCargando] = useState(false);
    const [ausencias, setAusencias] = useState([]);
    const [haBuscado, setHaBuscado] = useState(false);

    // Estados de paginacion
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Estados de filtrado
    const [desdeFecha, setDesdeFecha] = useState(null);
    const [hastaFecha, setHastaFecha] = useState(null);
    const [filtroTodoDia, setFiltroTodoDia] = useState("");

    // Estados base (catalogos)
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);
    const [tiposAusencia, setTiposAusencia] = useState([]);

    // Opciones cascada
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);

    // Filtros generales
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");

    const [empleadosFiltro, setEmpleadosFiltro] = useState([]);

    // Estado dialog editar
    const [openEditar, setOpenEditar] = useState(false);
    const [rowSeleccionada, setRowSeleccionada] = useState(null);

    // Estados campos editar
    const [editFechaInicio, setEditFechaInicio] = useState(null);
    const [editFechaFin, setEditFechaFin] = useState(null);
    const [editHoraInicioHH, setEditHoraInicioHH] = useState("00");
    const [editHoraInicioMM, setEditHoraInicioMM] = useState("00");
    const [editHoraFinHH, setEditHoraFinHH] = useState("00");
    const [editHoraFinMM, setEditHoraFinMM] = useState("00");
    const [editDiaCompleto, setEditDiaCompleto] = useState(true);
    const [editTipoAusencia, setEditTipoAusencia] = useState("");

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const cencos = await obtenerCentroCostos();
                const tipos = await getTipoAusencia();

                setCencosGlobal(cencos || []);
                setTiposAusencia(tipos || []);

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
                    const empsRes = await obtenerPorEmpresa(filtroEmpresa);
                    setEmpleadosGlobal(empsRes || []);
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
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosFiltro(empsFiltrados);
        } else {
            setEmpleadosFiltro([]);
        }
        setFiltroEmpleado("");
        setAusencias([]);
        setHaBuscado(false);
    }, [filtroCenco, empleadosGlobal]);

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleReporteIndividual = async () => {
        if (!filtroEmpleado) {
            toast.error("Debe seleccionar un empleado");
            return;
        }

        if (!desdeFecha || !hastaFecha) {
            toast.error("Debe seleccionar un rango de fechas");
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
            const fi = desdeFecha.format("YYYY-MM-DD");
            const ff = hastaFecha.format("YYYY-MM-DD");
            
            const blob = await reporteAusencia(numFicha, ff, fi);
            if (!blob || Array.isArray(blob)) {
                toast.error("Error al generar el reporte", { id: toastId });
                return;
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `Reporte_Ausencias_${empSel.nombres}_${empSel.apellido_paterno}.pdf`;
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

    const handleBuscar = async () => {
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
            const response = await obtenerAusencias(numFicha, fi, ff);
            setAusencias(response || []);
            setHaBuscado(true);
        } catch (error) {
            toast.error(error.message || "Error al buscar ausencias");
        } finally {
            setCargando(false);
            setPagina(0);
        }
    };

    // Filtrado por "todo el día"
    const ausenciasParaMostrar = filtroTodoDia !== ""
        ? ausencias.filter(a => String(a.dia_completo) === String(filtroTodoDia))
        : ausencias;

    const handleAbrirEditar = (row) => {
        setRowSeleccionada(row);
        setEditFechaInicio(row.fecha_inicio ? dayjs(row.fecha_inicio) : null);
        setEditFechaFin(row.fecha_fin ? dayjs(row.fecha_fin) : null);
        setEditDiaCompleto(row.dia_completo === true);
        setEditTipoAusencia(row.tipo_ausencia?.id || "");

        // Procesar horas
        const [hI, mI] = (row.hora_inicio || "00:00").split(":");
        setEditHoraInicioHH(hI || "00");
        setEditHoraInicioMM(mI || "00");

        const [hF, mF] = (row.hora_fin || "00:00").split(":");
        setEditHoraFinHH(hF || "00");
        setEditHoraFinMM(mF || "00");

        setOpenEditar(true);
    };

    const handleActualizar = async () => {
        if (!rowSeleccionada) return;

        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
        const numFicha = empSel?.num_ficha;

        if (!numFicha) {
            toast.error("No se pudo determinar el número de ficha del empleado");
            return;
        }

        const toastId = toast.loading("Actualizando ausencia...");
        try {
            const dataToUpdate = {
                fecha_inicio: editFechaInicio?.format("YYYY-MM-DD"),
                fecha_fin: editFechaFin?.format("YYYY-MM-DD"),
                hora_inicio: editDiaCompleto ? null : `${editHoraInicioHH}:${editHoraInicioMM}:00`,
                hora_fin: editDiaCompleto ? null : `${editHoraFinHH}:${editHoraFinMM}:00`,
                dia_completo: editDiaCompleto,
                tipo_ausencia: editTipoAusencia,
                num_ficha: numFicha
            };

            await editarAusencia(rowSeleccionada.id, dataToUpdate);
            toast.success("Ausencia actualizada correctamente", { id: toastId });
            cerrarEditar();
            handleBuscar(); // Refrescar tabla
        } catch (error) {
            toast.error(error.message || "Error al actualizar la ausencia", { id: toastId });
        }
    };

    const cerrarEditar = () => {
        setOpenEditar(false);
        setRowSeleccionada(null);
    };

    // Funciones auxiliares para tiempo (estilo AdminHorario)
    const handleChangeTime = (val, setter, max) => {
        if (/^\d{0,2}$/.test(val)) {
            if (val === "" || parseInt(val) <= max) {
                setter(val);
            }
        }
    };

    const handleBlurTime = (val, setter) => {
        if (val.length === 1) {
            setter("0" + val);
        } else if (val === "") {
            setter("00");
        }
    };

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Ausencias
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
                        <InputLabel>Todo el día</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Todo el día" value={filtroTodoDia} onChange={(e) => setFiltroTodoDia(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={true}>Sí</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
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

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SearchIcon />}
                        sx={{ height: "40px", mb: 2, ml: 2, minWidth: "120px" }}
                        onClick={handleBuscar}
                        disabled={!filtroEmpleado || !desdeFecha || !hastaFecha}
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        sx={{ height: "40px", mb: 2, ml: 1 }}
                        onClick={handleReporteIndividual}
                        disabled={!filtroEmpleado || !desdeFecha || !hastaFecha}
                    >
                        Reporte
                    </Button>

                </Box>

                {/* Tabla principal */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto", textAlign: "center" }}>

                        {filtroEmpleado && (() => {
                            const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                            return empSel ? (
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography sx={{ fontSize: "20px" }}>
                                        <strong>Nombre:</strong> {empSel.nombres} {empSel.apellido_paterno} &nbsp;||&nbsp;
                                        <strong>Num Ficha:</strong> <span>{empSel.num_ficha || "-"}</span>
                                    </Typography>
                                </Box>
                            ) : null;
                        })()}

                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de ausencias">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha Inicio</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Fin</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Inicio</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Fin</strong></TableCell>
                                    <TableCell align="center"><strong>Día Completo</strong></TableCell>
                                    <TableCell align="center"><strong>Motivo Ausencia</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                                                <CircularProgress />
                                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                                    Buscando registros...
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : !haBuscado ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione un empleado y un rango de fechas para comenzar la búsqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : ausenciasParaMostrar.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ausenciasParaMostrar
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row, idx) => (
                                            <TableRow key={row.id || idx}>
                                                <TableCell align="center">
                                                    {row.fecha_inicio ? dayjs(row.fecha_inicio).format("DD-MM-YYYY") : "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.fecha_fin ? dayjs(row.fecha_fin).format("DD-MM-YYYY") : "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.hora_inicio || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.hora_fin || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.dia_completo ? "Sí" : "No"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.tipo_ausencia?.nombre || "-"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Editar">
                                                        <IconButton onClick={() => handleAbrirEditar(row)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={haBuscado ? ausenciasParaMostrar.length : 0}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialog Editar */}
            <Dialog open={openEditar} onClose={cerrarEditar} sx={{ textAlign: "center" }} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>Editar Ausencia</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Motivo Ausencia</InputLabel>
                            <Select
                                label="Motivo Ausencia"
                                value={editTipoAusencia}
                                onChange={(e) => setEditTipoAusencia(e.target.value)}
                            >
                                {tiposAusencia.map(t => (
                                    <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                <DatePicker
                                    label="Fecha Inicio"
                                    format="DD-MM-YYYY"
                                    value={editFechaInicio}
                                    onChange={(val) => setEditFechaInicio(val)}
                                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                                />
                                <DatePicker
                                    label="Fecha Fin"
                                    format="DD-MM-YYYY"
                                    value={editFechaFin}
                                    onChange={(val) => setEditFechaFin(val)}
                                    slotProps={{ textField: { fullWidth: true, size: "small" } }}
                                />
                            </LocalizationProvider>
                        </Box>

                        <FormControl fullWidth size="small">
                            <InputLabel>¿Día Completo?</InputLabel>
                            <Select
                                label="¿Día Completo?"
                                value={editDiaCompleto}
                                onChange={(e) => setEditDiaCompleto(e.target.value)}
                            >
                                <MenuItem value={true}>Sí</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: 2, 
                            p: 2, 
                            bgcolor: "#f9f9f9", 
                            borderRadius: 1,
                            opacity: editDiaCompleto ? 0.6 : 1,
                            pointerEvents: editDiaCompleto ? "none" : "auto"
                        }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORARIO INICIO (HH:MM)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                    <TextField
                                        value={editHoraInicioHH}
                                        onChange={(e) => handleChangeTime(e.target.value, setEditHoraInicioHH, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setEditHoraInicioHH)}
                                        placeholder="HH"
                                        size="small"
                                        disabled={editDiaCompleto}
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <Typography variant="h6">:</Typography>
                                    <TextField
                                        value={editHoraInicioMM}
                                        onChange={(e) => handleChangeTime(e.target.value, setEditHoraInicioMM, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setEditHoraInicioMM)}
                                        placeholder="MM"
                                        size="small"
                                        disabled={editDiaCompleto}
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORARIO FIN (HH:MM)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                    <TextField
                                        value={editHoraFinHH}
                                        onChange={(e) => handleChangeTime(e.target.value, setEditHoraFinHH, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setEditHoraFinHH)}
                                        placeholder="HH"
                                        size="small"
                                        disabled={editDiaCompleto}
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <Typography variant="h6">:</Typography>
                                    <TextField
                                        value={editHoraFinMM}
                                        onChange={(e) => handleChangeTime(e.target.value, setEditHoraFinMM, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setEditHoraFinMM)}
                                        placeholder="MM"
                                        size="small"
                                        disabled={editDiaCompleto}
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>
                            </Box>
                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center", gap: 2 }}>
                    <Button variant="outlined" color="error" onClick={cerrarEditar}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleActualizar}>
                        Actualizar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminAusencia;