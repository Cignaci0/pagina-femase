import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { obtenerAutorizacionesHE } from "../../../services/autorizaHorasExtras";
import { regiones, comunas } from "../../../utils/dataGeografica";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DraftsIcon from '@mui/icons-material/Drafts';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");


function AutorizacionHoraExtra() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [desdeFecha, setDesdeFecha] = useState(null)
    const [hastaFecha, setHastaFecha] = useState(null)

    // Datos tabla
    const [datosTabla, setDatosTabla] = useState([]);
    const [haBuscado, setHaBuscado] = useState(false);

    // Estados de catalogos/opciones
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);

    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);
    const [opcionesEmpleados, setOpcionesEmpleados] = useState([]);

    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");


    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editRun, setEditRun] = useState("")
    const [editFecha, setEditFecha] = useState(null)
    const [horaEntradaReal, setHoraEntradaReal] = useState(null)
    const [horaSalidaReal, setHoraSalidaReal] = useState(null)
    const [horaHeEdit, setHoraHeEdit] = useState("")
    const [minutoHeEdit, setMinutoHeEdit] = useState("")
    const [segHeEdit, setSegHeEdit] = useState("")
    const [autoriza, setAutoriza] = useState("")
    const [horaHeAutEdit, setHoraHeAutEdit] = useState("")
    const [minutoHeAutEdit, setMinutoHeAutEdit] = useState("")
    const [segHeAutEdit, setSegHeAutEdit] = useState("")
    const [horaAutEdit, setHoraAutEdit] = useState("")
    const [minutoAutEdit, setMinutoAutEdit] = useState("")
    const [segAutEdit, setSegAutEdit] = useState("")

    // Manejo de dialogs
    const cerrarDialogEdit = () => {
        setOpenEdit(false)
    }

    const handleAbrirEdit = (row) => {
        const cleanT = (timeStr) => timeStr ? timeStr.split('-')[0] : "-";
        
        setEditRun(row.run);
        setEditFecha(dayjs(row.fecha_marca));
        
        const fechaBase = dayjs(row.fecha_marca).format("YYYY-MM-DD");
        const hEntrada = cleanT(row.hora_entrada);
        const hSalida = cleanT(row.hora_salida);
        
        if (hEntrada !== "-") {
            setHoraEntradaReal(dayjs(`${fechaBase} ${hEntrada}`));
        } else {
            setHoraEntradaReal(null);
        }
        
        if (hSalida !== "-") {
            setHoraSalidaReal(dayjs(`${fechaBase} ${hSalida}`));
        } else {
            setHoraSalidaReal(null);
        }

        // Cargar HE autorizadas o sugeridas
        const hExtrasStr = row.horas_extras_autorizadas || row.horas_extras;
        const hExtras = cleanT(hExtrasStr);
        if (hExtras !== "-") {
            const [h, m] = hExtras.split(":");
            setHoraHeAutEdit(h || "00");
            setMinutoHeAutEdit(m || "00");
        } else {
            setHoraHeAutEdit("00");
            setMinutoHeAutEdit("00");
        }
        
        setAutoriza(row.estado === 'A' ? 1 : row.estado === 'R' ? 2 : "");
        setOpenEdit(true);
    }

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

    const calcularDV = (cuerpo) => {
        let suma = 0;
        let multiplicador = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = 11 - (suma % 11);
        if (resto === 11) return '0';
        if (resto === 10) return 'K';
        return resto.toString();
    };

    const esRutValido = (rut) => {
        if (!rut) return false;
        const valor = rut.replace(/[^0-9kK]/g, "");
        if (valor.length < 8 || valor.length > 9) return false;
        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1).toUpperCase();
        return /^\d+$/.test(cuerpo) && calcularDV(cuerpo) === dv;
    };

    const formatearRut = (rut) => {
        let value = rut.replace(/[^0-9kK]/g, "");
        value = value.replace(/k(?!$)/gi, "");
        if (value.length > 9) {
            value = value.slice(0, 9);
        }
        if (value.length > 1) {
            const cuerpo = value.slice(0, -1);
            const dv = value.slice(-1).toUpperCase();
            return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, "")}-${dv}`;
        }
        return value;
    };

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const textoBusqueda = `${empresa.nombre_empresa || ''} ${empresa.rut_empresa || ''} ${empresa.direccion_empresa || ''} ${empresa.rut_empresa || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        return coincideTexto;
    });

    const handleBuscarHE = async () => {
        if (!filtroEmpleado || !desdeFecha || !hastaFecha) {
            toast.error("Seleccione empleado y rango de fechas");
            return;
        }
        setCargando(true);
        try {
            // En una implementación real pasaríamos filtros al service, 
            // por ahora usamos el service tal cual fue definido.
            const data = await obtenerAutorizacionesHE();
            setDatosTabla(data);
            setHaBuscado(true);
            setPagina(0);
        } catch (error) {
            toast.error("Error al buscar autorizaciones");
        } finally {
            setCargando(false);
        }
    };

    const getStatusIcon = (estado) => {
        let color = "#BDC3C7"; // Default gris
        if (estado === "P") color = "#FFC107"; // Amarillo/Ambar
        if (estado === "A") color = "#4CAF50"; // Verde
        if (estado === "R") color = "#F44336"; // Rojo

        return <CircleIcon sx={{ color, fontSize: 16 }} />;
    };

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects


    // --- EFECTOS DE CARGA Y CASCADA ---
    useEffect(() => {
        const fetchCatalogos = async () => {
            setCargando(true);
            try {
                const cencos = await obtenerCentroCostos();
                const emps = await obtenerEmpleados();

                setCencosGlobal(cencos || []);
                setEmpleadosGlobal(emps || []);

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

    // Cascada: Cenco -> Empleados
    useEffect(() => {
        if (filtroCenco !== "") {
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setOpcionesEmpleados(empsFiltrados);
        } else {
            setOpcionesEmpleados([]);
        }
        setFiltroEmpleado("");
    }, [filtroCenco, cencosGlobal, empleadosGlobal]);

    useEffect(() => {
        setPagina(0);
    }, [busqueda]);

    // Renderizado condicional
    if (cargando) return;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Autorización Horas Extras
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, ml: 2 }}>
                    {/* Filtros de seleccion */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "15vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "15vh" }} value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} disabled={!filtroEmpresa}>
                            {opcionesDeptos.map(dep => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "15vh" }} value={filtroCenco} onChange={(e) => setFiltroCenco(e.target.value)} disabled={!filtroDepto}>
                            {opcionesCencos.map(cen => (
                                <MenuItem key={cen.cenco_id} value={cen.cenco_id}>{cen.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "15vh" }} value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)}>
                            <MenuItem value="">Seleccione</MenuItem>
                            {opcionesEmpleados.map(emp => (
                                <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                    {emp.nombres} {emp.apellido_paterno}
                                </MenuItem>
                            ))}
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
                    <Box>
                        <Button variant="contained" color="primary" onClick={handleBuscarHE}>
                            Buscar
                        </Button>
                    </Box>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "200px" }, height: "40px", }}>
                        <TextField
                            placeholder="Buscar..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Box>

                {filtroEmpleado && (() => {
                    const empSel = opcionesEmpleados.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                    return empSel ? (
                        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
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
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto", textAlign: "center" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="14.28%" align="center"><strong>Cargo</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>F.Marca Entrada</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Marca Entrada</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Marca Entrada Teorica</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Marca Salida</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>H.Marca Salida Teorica</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Duración Turno</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Hrs.Presenciales</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Observacion</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Horas Extras</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {haBuscado && datosTabla.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} align="center">
                                            No se encontraron registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    datosTabla.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row) => {
                                        const empSel = opcionesEmpleados.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                                        const cleanTime = (timeStr) => timeStr ? timeStr.split('-')[0] : "-";
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell align="center">{row.cargo?.nombre || "-"}</TableCell>
                                                <TableCell align="center">{row.fecha_marca ? dayjs(row.fecha_marca).format("DD-MM-YYYY") : "-"}</TableCell>
                                                <TableCell align="center">{cleanTime(row.hora_entrada)}</TableCell>
                                                <TableCell align="center">{cleanTime(row.hora_entrada_teorica)}</TableCell>
                                                <TableCell align="center">{cleanTime(row.hora_salida)}</TableCell>
                                                <TableCell align="center">{cleanTime(row.hora_salida_teorica)}</TableCell>
                                                <TableCell align="center">{cleanTime(row.duracion_turno)}</TableCell>
                                                <TableCell align="center">{cleanTime(row.horas_presenciales)}</TableCell>
                                                <TableCell align="center">{row.observacion || "-"}</TableCell>
                                                <TableCell align="center">{cleanTime(row.horas_extras)}</TableCell>
                                                <TableCell align="center">
                                                    {getStatusIcon(row.estado)}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => handleAbrirEdit(row)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
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
                    count={datosTabla.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Autorización de Horas Extras</DialogTitle>


                            {/* Campo fecha */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Fecha"
                                    fullWidth
                                    size="small"
                                    value={editFecha ? editFecha.format("DD-MM-YYYY") : "-"}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                    sx={{ bgcolor: "#f5f5f5" }}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Hora entrada (Real)"
                                    fullWidth
                                    size="small"
                                    value={horaEntradaReal ? horaEntradaReal.format("HH:mm") : "-"}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                    sx={{ bgcolor: "#f5f5f5" }}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    label="Hora salida (Real)"
                                    fullWidth
                                    size="small"
                                    value={horaSalidaReal ? horaSalidaReal.format("HH:mm") : "-"}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                    sx={{ bgcolor: "#f5f5f5" }}
                                />
                            </Box>

                           

                            {/* Campo HE AUT */}
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                HORAS EXTRAS
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={3}>
                                <TextField
                                    value={horaHeAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setHoraHeAutEdit, 23)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setHoraHeAutEdit)}
                                    placeholder="HH"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                                <Typography variant="h6">:</Typography>
                                <TextField
                                    value={minutoHeAutEdit}
                                    onChange={(e) => handleChangeTime(e.target.value, setMinutoHeAutEdit, 59)}
                                    onBlur={(e) => handleBlurTime(e.target.value, setMinutoHeAutEdit)}
                                    placeholder="MM"
                                    size="small"
                                    sx={{ width: '70px' }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                />
                            </Stack>

                             {/* Campo autorizacion */}
                            <FormControl
                                size="small" variant="outlined" fullWidth>
                                <InputLabel id="autoriza-label">Autoriza Hrs Extra</InputLabel>
                                <Select labelId="autoriza-label" label="Autoriza Hrs Extra" value={autoriza} onChange={(e) => setAutoriza(e.target.value)}>
                                    <MenuItem value={1}>Si</MenuItem>
                                    <MenuItem value={2}>No</MenuItem>
                                </Select>
                                {autoriza === "" && (<FormHelperText>Campo obligatorio</FormHelperText>)}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AutorizacionHoraExtra;