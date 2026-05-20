import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress, TablePagination, Alert, FormHelperText
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerPorEmpresa } from "../../../services/empleadosServices";
import { buscarHorasCompensacionPendientes, aprobarRechazarHorasCompensacion } from "../../../services/horasCompensacion";

import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AutorizaDiasCompensacion() {

    // Estados de datos
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
    const [haBuscado, setHaBuscado] = useState(false);
    const [compensacionesFiltradas, setCompensacionesFiltradas] = useState([]);

    // Estados base (catalogos)
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);

    // Opciones cascada
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);

    // Filtros generales
    const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
        const stored = localStorage.getItem('empresaId');
        return stored ? parseInt(stored) : "";
    });
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");

    const [empleadosFiltro, setEmpleadosFiltro] = useState([]);

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const cencos = await obtenerCentroCostos();

                setCencosGlobal(cencos || []);

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

                try {
                    const empsRes = await obtenerPorEmpresa(filtroEmpresa);
                    const emps = empsRes || [];
                    setEmpleadosGlobal(emps);
                    
                    if (userInfo?.num_ficha && filtroDepto === "" && filtroCenco === "" && filtroEmpleado === "") {
                        const me = emps.find(e => e.num_ficha === userInfo.num_ficha);
                        if (me) {
                            const myCencoId = me.cenco?.cenco_id || me.cenco;
                            let myDeptoId = me.departamento?.departamento_id;

                            if (!myDeptoId && myCencoId) {
                                const miCencoGlobal = cencosGlobal.find(c => c.cenco_id === myCencoId);
                                if (miCencoGlobal?.departamento?.departamento_id) {
                                    myDeptoId = miCencoGlobal.departamento.departamento_id;
                                }
                            }

                            if (myDeptoId) setFiltroDepto(myDeptoId);
                            if (myCencoId) setFiltroCenco(myCencoId);
                            setFiltroEmpleado(me.empleado_id || me.run);
                        }
                    }
                } catch (error) {
                    toast.error("Error al cargar empleados");
                    setEmpleadosGlobal([]);
                }
            } else {
                setOpcionesDeptos([]);
                setEmpleadosGlobal([]);
            }
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
    }, [filtroDepto, cencosGlobal]);

    // Cascada: Cenco -> Empleados
    useEffect(() => {
        if (filtroCenco !== "") {
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosFiltro(empsFiltrados);
        } else {
            setEmpleadosFiltro([]);
        }
    }, [filtroCenco, empleadosGlobal]);

    useEffect(() => {
        if (filtroEmpleado) {
            handleBuscar();
        } else {
            setCompensacionesFiltradas([]);
            setHaBuscado(false);
        }
    }, [filtroEmpleado]);

    const handleBuscar = async () => {
        if (!filtroEmpleado) {
            toast.error("Debe seleccionar empleado");
            return;
        }

        setCargando(true);
        try {
            const data = await buscarHorasCompensacionPendientes(filtroEmpleado);
            if (Array.isArray(data)) {
                setCompensacionesFiltradas(data);
            } else {
                setCompensacionesFiltradas([]);
            }
            setHaBuscado(true);
        } catch (error) {
            toast.error("Error al buscar las horas de compensación");
        } finally {
            setCargando(false);
            setPagina(0);
        }
    };

    // Estados de Aprobar/Rechazar
    const [openAprobar, setOpenAprobar] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [accionSeleccionada, setAccionSeleccionada] = useState("");

    const handleAbrirAprobar = (row) => {
        setSolicitudSeleccionada(row);
        setAccionSeleccionada("");
        setOpenAprobar(true);
    };

    const cerrarDialogAprobar = () => {
        setOpenAprobar(false);
        setSolicitudSeleccionada(null);
        setAccionSeleccionada("");
    };

    const handleGuardarAccion = async () => {
        if (!solicitudSeleccionada) return;
        if (accionSeleccionada === "") {
            toast.error("Debe seleccionar si aprueba o rechaza la solicitud");
            return;
        }

        const estadoToSend = accionSeleccionada === "A" ? "A" : null;
        const toastId = toast.loading(accionSeleccionada === "A" ? "Aprobando solicitud..." : "Rechazando solicitud...");
        
        try {
            await aprobarRechazarHorasCompensacion(solicitudSeleccionada.id, estadoToSend);
            toast.success(accionSeleccionada === "A" ? "Solicitud aprobada exitosamente" : "Solicitud rechazada exitosamente", { id: toastId });
            cerrarDialogAprobar();
            await handleBuscar();
        } catch (error) {
            toast.error(error.message || "Error al procesar la solicitud", { id: toastId });
        }
    };

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Autorización Días Compensación
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
                        <Select sx={{ width: "15vh" }} label="Empresa" value={filtroEmpresa} onChange={(e) => { setFiltroEmpresa(e.target.value); setFiltroDepto(""); setFiltroCenco(""); setFiltroEmpleado(""); }} disabled={[1, 2, 3].includes(userInfo?.cargo)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Depto" value={filtroDepto} onChange={(e) => { setFiltroDepto(e.target.value); setFiltroCenco(""); setFiltroEmpleado(""); }} disabled={userInfo?.cargo === 1 || !filtroEmpresa}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesDeptos.map(dep => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Cenco" value={filtroCenco} onChange={(e) => { setFiltroCenco(e.target.value); setFiltroEmpleado(""); }} disabled={userInfo?.cargo === 1 || !filtroDepto}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesCencos.map(c => (
                                <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empleado" value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)} disabled={userInfo?.cargo === 1 || !filtroCenco || empleadosFiltro.length === 0}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empleadosFiltro.map(emp => (
                                <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                    {emp.nombres} {emp.apellido_paterno}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SearchIcon />}
                        sx={{ height: "40px", ml: 2, minWidth: "120px" }}
                        onClick={handleBuscar}
                        disabled={!filtroEmpleado}
                    >
                        Buscar
                    </Button>
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
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography sx={{ fontSize: "20px" }}>
                                        <strong>Nombre:</strong> {empSel.nombres} {empSel.apellido_paterno} ||
                                        <strong> Num Ficha:</strong> <span> {empSel.num_ficha || "-"}</span>
                                    </Typography>
                                </Box>
                            ) : null;
                        })()}

                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de compensacion">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha Generación</strong></TableCell>
                                    <TableCell align="center"><strong>Horas Extras Base</strong></TableCell>
                                    <TableCell align="center"><strong>Horas Solicitadas</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Inicio Descanso</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Fin Descanso</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Aprobar/Rechazar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
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
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione un empleado para buscar solicitudes pendientes.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : compensacionesFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados pendientes.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    compensacionesFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row) => {
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell align="center">{dayjs(row.fecha).format("DD-MM-YYYY")}</TableCell>
                                                <TableCell align="center">{row.horas_extras}</TableCell>
                                                <TableCell align="center">{row.horas_solicitadas || "00:00:00"}</TableCell>
                                                <TableCell align="center">{row.fecha_inicio_descanso ? dayjs(row.fecha_inicio_descanso + 'T12:00:00').format("DD-MM-YYYY") : "-"}</TableCell>
                                                <TableCell align="center">{row.fecha_fin_descanso ? dayjs(row.fecha_fin_descanso + 'T12:00:00').format("DD-MM-YYYY") : "-"}</TableCell>
                                                <TableCell align="center">
                                                    {row.estado === "P" && <CircleIcon sx={{ color: "gold", fontSize: 18 }} />}
                                                    {row.estado === "A" && <CircleIcon sx={{ color: "green", fontSize: 18 }} />}
                                                    {row.estado === "R" && <CircleIcon sx={{ color: "red", fontSize: 18 }} />}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.estado === "P" && (() => {
                                                        const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                                                        const isSelfRestricted = empSel?.num_ficha === userInfo?.num_ficha && (empSel?.cargo?.tipo_cargo === 2 || empSel?.cargo?.tipo_cargo === 1);

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
                    count={haBuscado ? compensacionesFiltradas.length : 0}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog Aprobar/Rechazar */}
            <Dialog open={openAprobar} onClose={cerrarDialogAprobar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "40vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 2 }}>Aprobar/Rechazar Días de Compensación</DialogTitle>
                            {solicitudSeleccionada && (
                                <Box sx={{ mb: 2, textAlign: 'left' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Horas solicitadas:</strong> {solicitudSeleccionada.horas_solicitadas || "00:00:00"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Período:</strong>{" "}
                                        {solicitudSeleccionada.fecha_inicio_descanso
                                            ? dayjs(solicitudSeleccionada.fecha_inicio_descanso + 'T12:00:00').format("DD-MM-YYYY")
                                            : "-"}
                                        {" → "}
                                        {solicitudSeleccionada.fecha_fin_descanso
                                            ? dayjs(solicitudSeleccionada.fecha_fin_descanso + 'T12:00:00').format("DD-MM-YYYY")
                                            : "-"}
                                    </Typography>
                                </Box>
                            )}
                            <FormControl fullWidth size="small">
                                <InputLabel>Acción</InputLabel>
                                <Select
                                    value={accionSeleccionada}
                                    label="Acción"
                                    onChange={(e) => setAccionSeleccionada(e.target.value)}
                                >
                                    <MenuItem value="A">Aprobar</MenuItem>
                                    <MenuItem value="R">Rechazar</MenuItem>
                                </Select>
                                {accionSeleccionada === "" && <FormHelperText>Seleccione una acción</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogAprobar} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleGuardarAccion}>Confirmar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AutorizaDiasCompensacion;
