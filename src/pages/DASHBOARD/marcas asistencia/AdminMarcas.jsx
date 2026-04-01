import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress,
    TablePagination, Stack, FormHelperText, DialogContentText
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { obtenerTiposMarcas } from "../../../services/tipoMarcaService";
import { getMarcas, crearMarca, actualizarMarcas, historialMarcas, eliminarMarca } from "../../../services/marcasServices";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminMarcas() {

    const perfilId = localStorage.getItem("perfilId");

    // --- ESTADOS BASE (CATÁLOGOS) ---
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);
    const [tiposMarcas, setTiposMarcas] = useState([]);
    const [cargando, setCargando] = useState(false);

    // --- ESTADOS DE OPCIONES EN CASCADA ---
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);
    const [opcionesEmpleados, setOpcionesEmpleados] = useState([]);
    const [opcionesDispositivos, setOpcionesDispositivos] = useState([]);

    // --- ESTADOS DE SELECCIÓN DE FILTROS ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");
    const [filtroDispositivo, setFiltroDispositivo] = useState("");
    const [desdeFecha, setDesdeFecha] = useState(null);
    const [hastaFecha, setHastaFecha] = useState(null);

    // Paginacion
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Datos reales
    const [marcas, setMarcas] = useState([]);
    const [haBuscado, setHaBuscado] = useState(false);

    // --- HISTORIAL (AUDITORÍA) ---
    const [openHistorial, setOpenHistorial] = useState(false);
    const [historialData, setHistorialData] = useState([]);

    const handleBuscarMarcas = async (mantenerPag) => {
        if (!filtroEmpleado || !desdeFecha || !hastaFecha) {
            toast.error("Seleccione empleado, y fechas desde/hasta");
            return;
        }
        setCargando(true);
        try {
            const emp = opcionesEmpleados.find(e => (e.empleado_id === filtroEmpleado || e.run === filtroEmpleado));
            const numFicha = emp?.num_ficha || emp?.run || filtroEmpleado;
            const fi = desdeFecha.format("YYYY-MM-DD");
            const ff = hastaFecha.format("YYYY-MM-DD");
            const res = await getMarcas(numFicha, fi, ff);
            setMarcas(res);
            setHaBuscado(true);
            if (mantenerPag !== true) {
                setPagina(0);
            }
        } catch (error) {
            toast.error("Error al buscar marcas");
        } finally {
            setCargando(false);
        }
    };

    const formatTurno = (empleado) => {
        if (!empleado?.turno?.detalle_turno?.horario) return "-";
        const { hora_entrada, hora_salida } = empleado.turno.detalle_turno.horario;
        if (hora_entrada && hora_salida) {
            return `${hora_entrada} - ${hora_salida}`;
        } else if (hora_entrada) {
            return hora_entrada;
        }
        return "-";
    };

    const marcasFiltradas = marcas.filter(m => {
        if (!busqueda) return true;
        const term = busqueda.toLowerCase();
        return (
            m.fecha_marca?.toLowerCase().includes(term) ||
            m.info_adicional?.toLowerCase().includes(term) ||
            m.hora_marca?.toLowerCase().includes(term) ||
            m.hashcode?.toLowerCase().includes(term)
        );
    });

    // --- EFECTOS DE CARGA Y CASCADA ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            setCargando(true);
            try {
                const cencos = await obtenerCentroCostos();
                const emps = await obtenerEmpleados();
                const tipos = await obtenerTiposMarcas();

                setCencosGlobal(cencos || []);
                setEmpleadosGlobal(emps || []);
                setTiposMarcas(tipos || []);

                // Extraer empresas únicas
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
            } finally {
                setCargando(false);
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

    // Cascada: Cenco -> Empleados & Dispositivos
    useEffect(() => {
        if (filtroCenco !== "") {
            // Dispositivos vienen embebidos en el JSON del Cenco indicado
            const cencoSeleccionado = cencosGlobal.find(c => c.cenco_id === filtroCenco);
            setOpcionesDispositivos(cencoSeleccionado?.dispositivos || []);

            // Empleados filtrados por Cenco
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setOpcionesEmpleados(empsFiltrados);
        } else {
            setOpcionesDispositivos([]);
            setOpcionesEmpleados([]);
        }
        setFiltroEmpleado("");
        setFiltroDispositivo("");
    }, [filtroCenco, cencosGlobal, empleadosGlobal]);


    // Funciones Hora y Mins (para inputs de hora locales)
    const handleChangeTime = (val, setter, max) => {
        if (/^\d{0,2}$/.test(val)) {
            if (val === "" || parseInt(val) <= max) {
                setter(val);
            }
        }
    };
    const handleBlurTime = (val, setter) => {
        if (val.length === 1) setter("0" + val);
        else if (val === "") setter("00");
    };

    const getNombreDispositivo = () => {
        const d = opcionesDispositivos.find(x => x.dispositivo_id === filtroDispositivo);
        return d ? d.nombre : "";
    };

    const getNombreEmpresa = () => {
        const emp = opcionesEmpresas.find(e => e.empresa_id === filtroEmpresa);
        return emp ? emp.nombre_empresa : "";
    };

    // --- MODAL CREAR ---
    const [openCrear, setOpenCrear] = useState(false);
    const [crearNumFicha, setCrearNumFicha] = useState("");
    const [crearFecha, setCrearFecha] = useState(null);
    const [crearHora, setCrearHora] = useState("");
    const [crearMins, setCrearMins] = useState("");
    const [crearEvento, setCrearEvento] = useState(1);
    const [crearIdTipo, setCrearIdTipo] = useState("");
    const [crearComentario, setCrearComentario] = useState("");

    const openDialogCrear = () => {
        if (filtroEmpleado) {
            const empleadoActual = opcionesEmpleados.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
            if (empleadoActual) setCrearNumFicha(empleadoActual.num_ficha || empleadoActual.run);
        } else {
            setCrearNumFicha("");
        }
        setCrearFecha(dayjs());
        setCrearHora("");
        setCrearMins("");
        setCrearEvento(1);
        setCrearIdTipo("");
        setCrearComentario("");
        setOpenCrear(true);
    };

    const handleGuardarCreacion = async () => {
        setCargando(true);
        const toastId = toast.loading("Guardando registro...");
        try {
            const datosMarca = {
                fecha_marca: crearFecha.format("YYYY-MM-DD"),
                hora_marca: `${crearHora}:${crearMins}:00`,
                evento: crearEvento,
                dispositivo_id: filtroDispositivo,
                num_ficha: crearNumFicha,
                comentario: crearComentario,
                tipo_marca_id: crearIdTipo,
            };

            await crearMarca(datosMarca);
            toast.success("Marca creada exitosamente", { id: toastId });
            setOpenCrear(false);
            if (desdeFecha && hastaFecha && filtroEmpleado) {
                handleBuscarMarcas(true);
            }
        } catch (error) {

            toast.error("Error al crear la marca", { id: toastId });

        } finally {
            setCargando(false);
        }
    };

    // --- MODAL EDITAR ---
    const [openEdit, setOpenEdit] = useState(false);
    const [editIdMarca, setEditIdMarca] = useState(null);
    const [editRut, setEditRut] = useState("");
    const [editFecha, setEditFecha] = useState(null);
    const [editHora, setEditHora] = useState("");
    const [editMins, setEditMins] = useState("");
    const [editEvento, setEditEvento] = useState(1);
    const [editComentario, setEditComentario] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const openDialogEdit = (row) => {
        setEditIdMarca(row.id_marca);
        setEditRut(row.empleado?.num_ficha || "");
        const datePart = row.fecha_marca.split(" ").pop();
        const [d, m, y] = datePart.split("-");
        setEditFecha(dayjs(`${y}-${m}-${d}`));
        if (row.hora_marca) {
            const partes = row.hora_marca.split(":");
            setEditHora(partes[0] || "00");
            setEditMins(partes[1] || "00");
        } else {
            setEditHora("");
            setEditMins("");
        }
        setEditEvento(row.evento !== null ? Number(row.evento) : 1);
        setEditComentario(row.comentario);
        setOpenEdit(true);
    };

    const handleGuardarEdicion = async () => {
        setCargando(true);
        const toastId = toast.loading("Guardando cambios...");
        try {
            const fechaEnviar = editFecha.format("YYYY-MM-DD");
            const horaEnviar = `${editHora}:${editMins}:00`;
            await actualizarMarcas(editIdMarca, fechaEnviar, horaEnviar, editEvento, editComentario);
            toast.success("Registro editado exitosamente", { id: toastId });
            setOpenEdit(false);
            if (desdeFecha && hastaFecha && filtroEmpleado) {
                await handleBuscarMarcas(true);
            }
        } catch (error) {
            toast.error("Error al editar la marca", { id: toastId });
        } finally {
            setCargando(false);
        }
    };

    const handleOpenDeleteDialog = () => {
        setDeleteConfirmText("");
        setOpenDeleteDialog(true);
    };

    const handleEliminarMarca = async () => {
        if (deleteConfirmText !== "ELIMINAR") return;

        setCargando(true);
        const toastId = toast.loading("Eliminando registro...");
        try {
            await eliminarMarca(editIdMarca);
            toast.success("Registro eliminado exitosamente", { id: toastId });
            setOpenDeleteDialog(false);
            setOpenEdit(false);
            if (desdeFecha && hastaFecha && filtroEmpleado) {
                await handleBuscarMarcas(true);
            }
        } catch (error) {
            toast.error("Error al eliminar la marca", { id: toastId });
        } finally {
            setCargando(false);
        }
    };

    const handleChangePage = (event, newPage) => setPagina(newPage);
    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleVerHistorial = async (idMarca) => {
        setCargando(true);
        try {
            const res = await historialMarcas(idMarca);
            setHistorialData(res);
            setOpenHistorial(true);
        } catch (error) {
            toast.error("Error al obtener historial");
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Marcas
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Controles y Filtros Inferiores */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>


                    <FormControl size="small" variant="standard" sx={{ minWidth: 120, ml: 2 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "16vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "16vh" }} value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} disabled={!filtroEmpresa}>
                            {opcionesDeptos.map(dep => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "16vh" }} value={filtroCenco} onChange={(e) => setFiltroCenco(e.target.value)} disabled={!filtroDepto}>
                            {opcionesCencos.map(cen => (
                                <MenuItem key={cen.cenco_id} value={cen.cenco_id}>{cen.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "16vh" }} value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)} disabled={!filtroCenco}>
                            {opcionesEmpleados.map(emp => (
                                // Dependiendo del mapeo, usar run o empleado_id
                                <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                    {emp.nombres} {emp.apellido_paterno}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Dispositivo</InputLabel>
                        <Select sx={{ width: "16vh" }} value={filtroDispositivo} onChange={(e) => setFiltroDispositivo(e.target.value)} disabled={!filtroCenco}>
                            {opcionesDispositivos.map(disp => (
                                <MenuItem key={disp.dispositivo_id} value={disp.dispositivo_id}>{disp.nombre}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Desde"
                                format="DD-MM-YYYY"
                                value={desdeFecha}
                                onChange={(val) => setDesdeFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Hasta"
                                format="DD-MM-YYYY"
                                value={hastaFecha}
                                onChange={(val) => setHastaFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Button variant="contained" color="secondary" onClick={handleBuscarMarcas} disabled={!filtroEmpleado || !desdeFecha || !hastaFecha}>
                        Buscar
                    </Button>

                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", ml: 2, alignItems: "center", width: { xs: "100%", md: "160px" }, height: "40px", }}>
                        <TextField
                            placeholder="Buscar..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '5px' }}>
                            <SearchIcon />
                        </IconButton>
                    </Paper>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ ml: 'auto' }}
                        onClick={openDialogCrear}
                        disabled={!filtroDispositivo || !filtroEmpleado}
                    >
                        Nuevo Registro
                    </Button>
                </Box>
                {filtroEmpleado && (() => {
                    const empSel = opcionesEmpleados.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                    return empSel ? (
                        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: "20px" }}>
                                <strong>Nombre:</strong> {empSel.nombres} {empSel.apellido_paterno} ||
                                <strong> Num Ficha:</strong> <span> {empSel.num_ficha || "-"}</span>
                            </Typography>
                        </Box>
                    ) : null;
                })()}



                {/* Tabla principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>

                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de marcas">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Evento</strong></TableCell>
                                    <TableCell align="center"><strong>Turno</strong></TableCell>
                                    <TableCell align="center"><strong>Más Info</strong></TableCell>
                                    <TableCell align="center"><strong>Hashcode</strong></TableCell>
                                    <TableCell align="center"><strong>Tipo Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Comentario</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!haBuscado ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione un empleado y un rango de fechas para comenzar la búsqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : marcasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    marcasFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row, idx) => {
                                        const esRoja = (row.id_marca === null && row.tieneTurno === true && row.info_adicional?.trim() === "Sin marca") || row.info_adicional?.trim() === "Falta Marca Salida" || row.info_adicional?.trim() === "Faltan ambas marcas" || row.info_adicional?.trim() === "Falta Marca Entrada";
                                        return (
                                            <TableRow key={idx} sx={{ backgroundColor: esRoja ? "#cf4c60ff" : "inherit", "& .MuiTableCell-root": { color: esRoja ? "white" : "inherit" } }}>
                                                <TableCell align="center">{row.fecha_marca}</TableCell>
                                                <TableCell align="center">{row.hora_marca || "-"}</TableCell>
                                                <TableCell align="center">{row.evento === 1 ? "Entrada" : !row.evento ? "-" : "Salida"}</TableCell>
                                                <TableCell align="center">{formatTurno(row.empleado)}</TableCell>
                                                <TableCell align="center">{row.info_adicional || "-"}</TableCell>
                                                <TableCell align="center">{row.hashcode || "-"}</TableCell>
                                                <TableCell align="center">{row.tipo_marca?.nombre}</TableCell>
                                                <TableCell align="center">{row.id_marca !== null && <Button variant="contained" color="primary" size="small" onClick={() => handleVerHistorial(row.id_marca)}>Historial</Button>}</TableCell>
                                                <TableCell align="center">{row.comentario}</TableCell>
                                                <TableCell align="center">
                                                    {row.id_marca !== null && (
                                                        <IconButton size="small" onClick={() => openDialogEdit(row)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={marcasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >


            {/* Dialog crear */}
            <Dialog open={openCrear} onClose={() => setOpenCrear(false)} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "40vh", minWidth: "40vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Crear nuevo registro</DialogTitle>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Num ficha" value={crearNumFicha} disabled InputLabelProps={{ shrink: true }} />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Empresa" value={getNombreEmpresa()} disabled InputLabelProps={{ shrink: true }} />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                        <DatePicker label="Fecha marca" format="YYYY-MM-DD" value={crearFecha} onChange={(val) => setCrearFecha(val)} slotProps={{ textField: { size: "small", fullWidth: true, InputLabelProps: { shrink: true } } }} />
                                    </LocalizationProvider>
                                </Box>

                                <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                                    <TextField size="small" fullWidth label="Hora marca" placeholder="HH" InputLabelProps={{ shrink: true }} value={crearHora} onChange={(e) => handleChangeTime(e.target.value, setCrearHora, 23)} onBlur={(e) => handleBlurTime(e.target.value, setCrearHora)} />
                                    <TextField size="small" fullWidth label="Mins marca" placeholder="MM" InputLabelProps={{ shrink: true }} value={crearMins} onChange={(e) => handleChangeTime(e.target.value, setCrearMins, 59)} onBlur={(e) => handleBlurTime(e.target.value, setCrearMins)} />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel shrink>Evento</InputLabel>
                                    <Select value={crearEvento} onChange={(e) => setCrearEvento(e.target.value)} label="Evento" notched>
                                        <MenuItem value={1}>Entrada</MenuItem>
                                        <MenuItem value={2}>Salida</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Cod dispositivo" value={getNombreDispositivo()} disabled InputLabelProps={{ shrink: true }} />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel shrink>Tipo Marca</InputLabel>
                                    <Select value={crearIdTipo} onChange={(e) => setCrearIdTipo(e.target.value)} label="Tipo Marca" notched>
                                        {tiposMarcas.map(t => (
                                            <MenuItem key={t.tipo_marca_id} value={t.tipo_marca_id}>{t.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Comentario" multiline rows={2} value={crearComentario} onChange={(e) => setCrearComentario(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenCrear(false)} color="error">Cancelar</Button>
                    <Button
                        onClick={handleGuardarCreacion}
                        variant="contained"
                        color="primary"
                        disabled={!crearNumFicha || !crearFecha || !crearHora || !crearMins || !crearEvento || !filtroDispositivo}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "40vh", minWidth: "40vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Editar registro</DialogTitle>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Rut" value={editRut} disabled InputLabelProps={{ shrink: true }} />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                        <DatePicker label="Fecha marca" format="YYYY-MM-DD" value={editFecha} onChange={(val) => setEditFecha(val)} slotProps={{ textField: { size: "small", fullWidth: true, InputLabelProps: { shrink: true } } }} />
                                    </LocalizationProvider>
                                </Box>

                                <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
                                    <TextField size="small" fullWidth label="Hora marca" placeholder="HH" InputLabelProps={{ shrink: true }} value={editHora} onChange={(e) => handleChangeTime(e.target.value, setEditHora, 23)} onBlur={(e) => handleBlurTime(e.target.value, setEditHora)} />
                                    <TextField size="small" fullWidth label="Mins marca" placeholder="MM" InputLabelProps={{ shrink: true }} value={editMins} onChange={(e) => handleChangeTime(e.target.value, setEditMins, 59)} onBlur={(e) => handleBlurTime(e.target.value, setEditMins)} />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel shrink>Evento</InputLabel>
                                    <Select value={editEvento} onChange={(e) => setEditEvento(e.target.value)} label="Evento" notched>
                                        <MenuItem value={1}>Entrada</MenuItem>
                                        <MenuItem value={2}>Salida</MenuItem>
                                    </Select>
                                </FormControl>

                                <Box sx={{ mb: 2 }}>
                                    <TextField size="small" fullWidth label="Comentario" multiline rows={2} value={editComentario} onChange={(e) => setEditComentario(e.target.value)} InputLabelProps={{ shrink: true }} />
                                </Box>
                                {perfilId === "2" && (
                                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                                        <Button size="small" variant="contained" color="error" onClick={handleOpenDeleteDialog}>
                                            Eliminar
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpenEdit(false)} color="error">Cancelar</Button>
                    <Button onClick={handleGuardarEdicion} variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Historial Auditoría */}
            <Dialog open={openHistorial} onClose={() => setOpenHistorial(false)} maxWidth="l" fullWidth>
                <DialogTitle sx={{ textAlign: "center" }}>Historial de Auditoría</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} sx={{ mt: 1, maxHeight: 400, overflowY: "auto" }}>
                        <Table size="small" stickyHeader>
                            <TableHead sx={{ '& th': { bgcolor: '#f5f5f5', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Correlativo</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Evento</strong></TableCell>
                                    <TableCell align="center"><strong>Hashcode</strong></TableCell>
                                    <TableCell align="center"><strong>Num Ficha</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Usuario Actualizador</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historialData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
                                                No hay historial disponible
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historialData.map((h, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell align="center">{h.correlativo}</TableCell>
                                            <TableCell align="center">{h.fecha_marca ? dayjs(h.fecha_marca).format("YYYY-MM-DD") : "-"}</TableCell>
                                            <TableCell align="center">{h.hora_marca || "-"}</TableCell>
                                            <TableCell align="center">{h.evento === 1 ? "Entrada" : h.evento === 2 ? "Salida" : "-"}</TableCell>
                                            <TableCell align="center">{h.hashcode || "-"}</TableCell>
                                            <TableCell align="center">{h.num_ficha || "-"}</TableCell>
                                            <TableCell align="center">{h.fecha_actualizacion ? dayjs(h.fecha_actualizacion).format("YYYY-MM-DD HH:mm") : "-"}</TableCell>
                                            <TableCell align="center">{h.usuario_actualizador || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistorial(false)} color="error">Cerrar</Button>
                </DialogActions>
            </Dialog>

            {/* Alerta de eliminar */}
            <Dialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                maxWidth="xs"
                fullWidth
            >
                <Box sx={{ textAlign: 'center', pt: 3 }}>
                    <WarningAmberRoundedIcon sx={{ fontSize: 60, color: 'error.main' }} />
                </Box>

                <DialogTitle sx={{ textAlign: "center", fontWeight: 'bold' }}>
                    ¿Eliminar Registro?
                </DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ textAlign: "center", mb: 3 }}>
                        Esta acción es irreversible. Para confirmar que desea borrar este registro, por favor escriba <strong>ELIMINAR</strong> en el cuadro de abajo.
                    </DialogContentText>

                    <TextField
                        autoFocus
                        fullWidth
                        variant="outlined"
                        placeholder="Escriba ELIMINAR"
                        color="error"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        sx={{ bgcolor: '#fff' }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
                    <Button
                        onClick={() => setOpenDeleteDialog(false)}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleEliminarMarca}
                        variant="contained"
                        color="error"
                        disabled={deleteConfirmText !== "ELIMINAR" || cargando}
                        startIcon={cargando ? <CircularProgress size={20} color="inherit" /> : <WarningAmberRoundedIcon />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}

export default AdminMarcas;