import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    Radio,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Tab,
    Menu,
    Switch
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas, obtenerHorarioLegal } from "../../../services/empresasServices";
import { obtenerTurnos, crearTurno, actualizarTurno, asignarEmpleados, asignarTurnoACenco, asignarHorario, obtenerHorariosTurno } from "../../../services/turnosServices";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { obtenerEmpleados, obtenerPorEmpresa } from "../../../services/empleadosServices"
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { obtenerCentroCostos } from "../../../services/centroCostosServices"
import { obtenerCargos } from "../../../services/cargosServices"
import { obtenerHorarios } from "../../../services/horariosServices"


function AdminTurnos() {

    //VARIABLE IMPORTANTE (Ahorra dinamica)
    const [usarHorarioEmpresa, setUsarHorarioEmpresa] = useState(false);
    const [empresaActual, setEmpresaActual] = useState(null);
    const [horarioLegalGlobal, setHorarioLegalGlobal] = useState(44);

    const getHorasLímite = () => {
        if (usarHorarioEmpresa && empresaActual?.horario) {
            return empresaActual.horario;
        }
        return horarioLegalGlobal;
    };

    const parseTimeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    };

    const calcularHorasSemanales = () => {
        let totalMinutos = 0;
        diasSeleccionados.forEach(dia => {
            const hId = horariosSeleccionados[dia];
            if (hId) {
                const h = horarios.find(hor => hor.horario_id === hId);
                if (h && h.hora_entrada && h.hora_salida) {
                    const minEntrada = parseTimeToMinutes(h.hora_entrada);
                    let minSalida = parseTimeToMinutes(h.hora_salida);
                    if (minSalida < minEntrada) {
                        minSalida += 24 * 60;
                    }
                    let diff = minSalida - minEntrada;
                    if (h.colacion) {
                        diff -= parseTimeToMinutes(h.colacion);
                    }
                    totalMinutos += diff;
                }
            }
        });
        return totalMinutos / 60;
    };

    // Estados de datos
    const [turnos, setTurnos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [horarios, setHorarios] = useState([])
    const [empleados, setEmpleados] = useState([])
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [empresasFiltro, setEmpresasFiltro] = useState("")
    const [filtroestado, setFiltroEstado] = useState("")

    // Estados crear
    const [crear, setCrear] = useState(false)
    const [empresaCrear, setEmpresaCrear] = useState("")
    const [nombreCrear, setNombreCrear] = useState("")
    const [estadoCrear, setEstadoCrear] = useState("")
    const [filtroEmpresaCrear, setFiltroEmpresaCrear] = useState([])
    const [filtroHorarioCrear, setFiltroHorarioCrear] = useState([])

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [idEdit, setIdEdit] = useState("")
    const [empresaEdit, setEmpresaEdit] = useState("")
    const [nombreEdit, setNombreEdit] = useState("")
    const [estadoEdit, setEstadoEdit] = useState("")
    const [horarioEdit, setHorarioEdit] = useState("")
    const [filtroEmpresaEdit, setFiltroEmpresaEdit] = useState([])
    const [filtroHorarioEdit, setFiltroHorarioEdit] = useState([])

    // Carga de datos
    const cargarTurnos = async () => {
        setCargando(true)
        try {
            const respuesta = await obtenerTurnos()
            setTurnos(respuesta)
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    }

    const cargarEmpresasFiltro = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarEmpresasFiltroCrear = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setFiltroEmpresaCrear(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarEmpleados = async () => {
        try {
            const respuesta = await obtenerEmpleados()
            setEmpleados(respuesta)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCargando(false)
        }
    }



    const cargarEmpresasFiltroEdit = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(),
            ]);
            setFiltroEmpresaEdit(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };





    // Manejo de dialogs
    const [asignar, setAsignar] = useState(false)
    const [detalle, setDetalle] = useState(false)
    const [idTurnoDias, setIdTurnoDias] = useState(null)
    const [diasSeleccionados, setDiasSeleccionados] = useState([])
    const [horariosSeleccionados, setHorariosSeleccionados] = useState({})
    const [empresaIdHorarios, setEmpresaIdHorarios] = useState(null)
    const [horarioGlobal, setHorarioGlobal] = useState("")

    const [idTurnoAsignar, setIdTurnoAsignar] = useState(null);
    const [empleadosDisponibles, setEmpleadosDisponibles] = useState([]);
    const [empleadosAsignados, setEmpleadosAsignados] = useState([]);
    const [checkedEmpleados, setCheckedEmpleados] = useState([]);

    // Estados de confirmación de asignación
    const [confirmacionVisible, setConfirmacionVisible] = useState(false);
    const [empleadosAConfirmar, setEmpleadosAConfirmar] = useState([]);
    const [cencoAConfirmar, setCencoAConfirmar] = useState("");

    // Filtros de asignacion
    const [departamentos, setDepartamentos] = useState([]);
    const [cencos, setCencos] = useState([]);
    const [cargos, setCargos] = useState([]);

    const [filtroEmpresaAsignar, setFiltroEmpresaAsignar] = useState("");
    const [filtroDepartamentoAsignar, setFiltroDepartamentoAsignar] = useState("");
    const [filtroCencoAsignar, setFiltroCencoAsignar] = useState("");
    const [filtroCargoAsignar, setFiltroCargoAsignar] = useState("");

    const cargarDatosFiltrosAsignacion = async () => {
        try {
            const [dataDeptos, dataCencos, dataCargos, dataHorarios] = await Promise.all([
                obtenerDepartamentos(),
                obtenerCentroCostos(),
                obtenerCargos(),
                obtenerHorarios()
            ]);
            setDepartamentos(Array.isArray(dataDeptos) ? dataDeptos : [dataDeptos]);
            setCencos(Array.isArray(dataCencos) ? dataCencos : [dataCencos]);
            setCargos(Array.isArray(dataCargos) ? dataCargos : [dataCargos]);
            setHorarios(Array.isArray(dataHorarios) ? dataHorarios : [dataHorarios]);
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        cargarDatosFiltrosAsignacion();
    }, []);

    const cerrarAsignar = () => {
        setAsignar(false);
        setIdTurnoAsignar(null);
        setEmpleadosDisponibles([]);
        setEmpleadosAsignados([]);
        setCheckedEmpleados([]);
        setFiltroEmpresaAsignar("");
        setFiltroDepartamentoAsignar("");
        setFiltroCencoAsignar("");
        setFiltroCargoAsignar("");
    }
    const cerrarDetalle = () => {
        setDetalle(false)
        setIdTurnoDias(null)
        setDiasSeleccionados([])
        setHorariosSeleccionados({})
        setEmpresaIdHorarios(null)
        setHorarioGlobal("")
    }
    const cerrarCrear = () => {
        setCrear(false)
        setEmpresaCrear("")
        setNombreCrear("")
        setEstadoCrear("")
    }
    const cerrarEditar = () => { setEditar(false) }

    const clickCrear = async () => {
        setCargando(true)
        try {
            const respuesta = await crearTurno(nombreCrear, empresaCrear, estadoCrear)
            setCrear(false)
            setEmpresaCrear("")
            toast.success("Turno creado con exito")
            setNombreCrear("")
            setEstadoCrear("")
            cargarTurnos()
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    }

    const clickEdit = async () => {
        setCargando(true)
        try {
            const respuesta = await actualizarTurno(idEdit, nombreEdit, empresaEdit, estadoEdit)
            setEditar(false)
            toast.success("Turno Actualizado con exito")
            cargarTurnos()
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    }

    const clickGuardarDias = async () => {
        setCargando(true)
        try {
            const diasValidos = diasSeleccionados.filter(d => typeof d === 'number' && d >= 1 && d <= 7).sort((a, b) => a - b);

            if (diasValidos.length >= 7) {
                throw new Error("Debe quedar al menos un día sin marcar (día de descanso)");
            }

            const idsDiasPayload = [];
            const idsHorariosPayload = [];

            for (const d of diasValidos) {
                if (horariosSeleccionados[d]) {
                    idsDiasPayload.push(d);
                    idsHorariosPayload.push(horariosSeleccionados[d]);
                } else {
                    throw new Error(`Debe seleccionar un horario para el día ${["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][d - 1]}`);
                }
            }

            await asignarHorario(idTurnoDias, idsDiasPayload, idsHorariosPayload)
            toast.success("Días y horarios asignados correctamente")
            cerrarDetalle()
            cargarTurnos()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setCargando(false)
        }
    }

    const abrirAsignarHorarios = async (tur) => {
        setCargando(true)
        setHorarioGlobal("")
        try {
            const emp = empresas.find(e => e.empresa_id === tur.empresa?.empresa_id);
            setEmpresaActual(emp);
            setUsarHorarioEmpresa(false); // Por defecto usar legal al abrir
            
            setDetalle(true)
            setIdTurnoDias(tur.turno_id)
            setEmpresaIdHorarios(tur.empresa?.empresa_id)

            const data = await obtenerHorariosTurno(tur.turno_id)

            if (data && Array.isArray(data)) {
                const diasExtraidos = [];
                const horariosPrevios = {};
                for (let i = 0; i < data.length; i++) {
                    if (data[i].dia && data[i].dia.cod_dia) {
                        const codDia = data[i].dia.cod_dia;
                        diasExtraidos.push(codDia);
                        if (data[i].horario && data[i].horario.horario_id) {
                            horariosPrevios[codDia] = data[i].horario.horario_id;
                        }
                    }
                }
                setDiasSeleccionados(diasExtraidos);
                setHorariosSeleccionados(horariosPrevios);
            } else {
                setDiasSeleccionados([]);
                setHorariosSeleccionados({});
            }
        } catch (err) {
            toast.error(err.message)
            setDiasSeleccionados([]);
            setHorariosSeleccionados({});
        } finally {
            setCargando(false)
        }
    }

    const iniciarGuardadoAsignacion = () => {
        const nombresEmpleados = empleadosAsignados.map(emp => `${emp.nombres} ${emp.apellido_paterno}`);
        setEmpleadosAConfirmar(nombresEmpleados);

        if (filtroCencoAsignar) {
            const cencoSeleccionado = cencos.find(c => c.cenco_id === filtroCencoAsignar);
            setCencoAConfirmar(cencoSeleccionado ? cencoSeleccionado.nombre_cenco : "Ninguno");
        } else {
            setCencoAConfirmar("Ninguno");
        }

        setConfirmacionVisible(true);
    };

    const confirmarYGuardar = () => {
        setConfirmacionVisible(false); // Cierra este modal de confirmacion
        clickGuardarAsignacion();      // Ejecuta el guardado y el cierre del modal padre
    };

    const clickGuardarAsignacion = async () => {
        setCargando(true);
        try {
            const empleadosIds = empleadosAsignados.map(emp => emp.empleado_id);
            await asignarEmpleados(idTurnoAsignar, empleadosIds);

            if (filtroCencoAsignar) {
                await asignarTurnoACenco(idTurnoAsignar, filtroCencoAsignar);
            }

            toast.success("Asignación guardada correctamente");
            cerrarAsignar();
            cargarEmpleados();
            cargarTurnos();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    const handleToggleEmpleado = (value) => {
        const currentIndex = checkedEmpleados.indexOf(value);
        const newChecked = [...checkedEmpleados];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setCheckedEmpleados(newChecked);
    };

    const empleadosDisponiblesFiltrados = empleadosDisponibles.filter(emp => {
        const matchEmpresa = filtroEmpresaAsignar ? emp.empresa?.empresa_id == filtroEmpresaAsignar : true;
        const matchCenco = filtroCencoAsignar ? emp.cenco?.cenco_id == filtroCencoAsignar : true;
        const matchDepartamento = filtroDepartamentoAsignar ? emp.cenco?.departamento_id == filtroDepartamentoAsignar : true;
        const matchCargo = filtroCargoAsignar ? emp.cargo?.cargo_id == filtroCargoAsignar : true;

        return matchEmpresa && matchCenco && matchDepartamento && matchCargo;
    });

    const empleadosAsignadosFiltrados = empleadosAsignados.filter(emp => {
        const matchEmpresa = filtroEmpresaAsignar ? emp.empresa?.empresa_id == filtroEmpresaAsignar : true;
        const matchCenco = filtroCencoAsignar ? emp.cenco?.cenco_id == filtroCencoAsignar : true;
        const matchDepartamento = filtroDepartamentoAsignar ? emp.cenco?.departamento_id == filtroDepartamentoAsignar : true;
        const matchCargo = filtroCargoAsignar ? emp.cargo?.cargo_id == filtroCargoAsignar : true;

        return matchEmpresa && matchCenco && matchDepartamento && matchCargo;
    });

    const handleAllRight = () => {
        setEmpleadosAsignados(empleadosAsignados.concat(empleadosDisponiblesFiltrados));
        setEmpleadosDisponibles(empleadosDisponibles.filter(emp => !empleadosDisponiblesFiltrados.includes(emp)));
    };

    const handleCheckedRight = () => {
        const leftChecked = empleadosDisponiblesFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id));
        setEmpleadosDisponibles(empleadosDisponibles.filter(emp => !leftChecked.includes(emp)));
        setEmpleadosAsignados(empleadosAsignados.concat(leftChecked));
        setCheckedEmpleados(checkedEmpleados.filter(id => !leftChecked.map(e => e.empleado_id).includes(id)));
    };

    const handleCheckedLeft = () => {
        const rightChecked = empleadosAsignadosFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id));
        setEmpleadosAsignados(empleadosAsignados.filter(emp => !rightChecked.map(e => e.empleado_id).includes(emp.empleado_id)));
        setEmpleadosDisponibles(empleadosDisponibles.concat(rightChecked));
        setCheckedEmpleados(checkedEmpleados.filter(id => !rightChecked.map(e => e.empleado_id).includes(id)));
    };

    const handleAllLeft = () => {
        setEmpleadosDisponibles(empleadosDisponibles.concat(empleadosAsignadosFiltrados));
        setEmpleadosAsignados(empleadosAsignados.filter(emp => !empleadosAsignadosFiltrados.map(e => e.empleado_id).includes(emp.empleado_id)));
    };

    const handleToggleDia = (valorDia) => {
        if (diasSeleccionados.includes(valorDia)) {
            setDiasSeleccionados(diasSeleccionados.filter(d => d !== valorDia));
            return true;
        } else {
            if (diasSeleccionados.length >= 6) {
                toast.error("Al menos un día debe quedar sin marcar.");
                return false;
            }
            setDiasSeleccionados([...diasSeleccionados, valorDia]);
            return true;
        }
    }

    // Filtrado y paginacion
    const turnosFiltrados = turnos.filter((tur) => {
        const nombreTurno = `${tur.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreTurno.includes(term);
        const coincideEstado = filtroestado ? tur.estado?.estado_id === filtroestado : true;
        const coincideEmpresa = empresasFiltro ? tur.empresa?.empresa_id === empresasFiltro : true;


        return coincideTexto && coincideEstado && coincideEmpresa;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        const fetchLegal = async () => {
            try {
                const data = await obtenerHorarioLegal();
                if (data && Array.isArray(data) && data.length > 0) {
                    setHorarioLegalGlobal(data[0].hora);
                }
            } catch (error) {
                console.error("Error fetching legal hours", error);
            }
        };
        fetchLegal();
    }, []);

    useEffect(() => {
        cargarTurnos();
    }, []);

    useEffect(() => {
        cargarEmpleados();
    }, []);

    useEffect(() => {
        cargarEmpresasFiltro();
    }, []);

    useEffect(() => {
        cargarEmpresasFiltroCrear();
    }, []);



    useEffect(() => {
        cargarEmpresasFiltroEdit();
    }, []);



    ;

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado]);

    // Renderizado condicional

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y botones */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px", }}>
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

                    {/* Filtro de empresa */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "26vh" }} label="Empresa" value={empresasFiltro} onChange={(e) => setEmpresasFiltro(e.target.value)}>
                            <MenuItem>Todos</MenuItem>
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                    {emp.nombre_empresa}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de estado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroestado} onChange={(e) => setFiltroEstado(e.target.value)} label="Estado">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}> Vigente </MenuItem>
                            <MenuItem value={2}> No Vigente </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={() => setCrear(true)} >
                        Nuevo Registro
                    </Button>

                </Box>

                {/* Tabla principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="20%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Asiganar Horarios</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Asignar Empleados</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody >
                                {turnosFiltrados.length > 0 ? (
                                    turnosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((tur) => (
                                            <TableRow key={tur.turno_id}>
                                                <TableCell align="center">
                                                    {tur.empresa?.nombre_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tur.nombre}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: tur.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>

                                                < TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                                        }}
                                                        onClick={() => abrirAsignarHorarios(tur)}
                                                    >
                                                        Asignar Horarios
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        onClick={async () => {
                                                            const tId = toast.loading("Cargando empleados de la empresa...");
                                                            try {
                                                                const empresa_id = tur.empresa?.empresa_id;
                                                                if (!empresa_id) {
                                                                    toast.error("El turno no tiene una empresa asociada");
                                                                    return;
                                                                }

                                                                const empsDeEmpresaRaw = await obtenerPorEmpresa(empresa_id);
                                                                if (!empsDeEmpresaRaw) {
                                                                    toast.dismiss(tId);
                                                                    setAsignar(true);
                                                                    setIdTurnoAsignar(tur.turno_id);
                                                                    setFiltroEmpresaAsignar(empresa_id);
                                                                    setEmpleadosAsignados([]);
                                                                    setEmpleadosDisponibles([]);
                                                                    return;
                                                                }

                                                                // Filtrar solo los que NO permiten turno rotativo
                                                                const empsDeEmpresa = empsDeEmpresaRaw.filter(emp => emp.permite_rotativo === false);

                                                                setAsignar(true);
                                                                setIdTurnoAsignar(tur.turno_id);
                                                                setFiltroEmpresaAsignar(empresa_id);
                                                                setFiltroDepartamentoAsignar("");
                                                                setFiltroCencoAsignar("");
                                                                setFiltroCargoAsignar("");

                                                                const assigned = empsDeEmpresa.filter(emp => emp.turno?.turno_id === tur.turno_id);
                                                                const available = empsDeEmpresa.filter(emp => !emp.turno || !emp.turno.turno_id);
                                                                
                                                                setEmpleadosAsignados(assigned);
                                                                setEmpleadosDisponibles(available.filter(a => !assigned.some(as => as.empleado_id === a.empleado_id)));
                                                                setCheckedEmpleados([]);
                                                                toast.success("Empleados cargados", { id: tId });
                                                            } catch (error) {
                                                                toast.error("Error al cargar empleados", { id: tId });
                                                            }
                                                        }}
                                                        sx={{
                                                            fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                                        }}
                                                    >
                                                        Asignar
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setEditar(true)
                                                        setIdEdit(tur.turno_id)
                                                        setEmpresaEdit(tur.empresa?.empresa_id)
                                                        setNombreEdit(tur.nombre)
                                                        setEstadoEdit(tur.estado?.estado_id)
                                                    }} >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell align="center" colSpan={9}>
                                            <Typography variant="body1" color="text.secondary">
                                                {turnosFiltrados
                                                    ? "No se encontraron turnos"
                                                    : "No se encontraron turnos. "}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={turnosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            < Dialog open={crear} sx={{ textAlign: "center", }
            }>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "45vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Agregar Nuevo Turno</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"
                                        value={empresaCrear}
                                        onChange={(e) => setEmpresaCrear(e.target.value)}
                                    >
                                        {filtroEmpresaCrear.map((fec) => (
                                            <MenuItem key={fec.empresa_id} value={fec.empresa_id}>
                                                {fec.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                                <Box sx={{ mb: 2 }}>

                                    <TextField
                                        value={nombreCrear}
                                        onChange={(e) => setNombreCrear(e.target.value)}
                                        fullWidth label="Nombre" size="small"
                                    />
                                </Box>


                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoCrear}
                                        onChange={(e) => setEstadoCrear(e.target.value)}>
                                        <MenuItem value={1}>
                                            Activo
                                        </MenuItem>
                                        <MenuItem value={2}>
                                            Inactivo
                                        </MenuItem>
                                    </Select>
                                </FormControl>


                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarCrear} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog editar */}
            < Dialog open={editar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Editar Turno</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"
                                        value={empresaEdit}
                                        onChange={(e) => setEmpresaEdit(e.target.value)}
                                    >
                                        {filtroEmpresaEdit.map((fec) => (
                                            <MenuItem key={fec.empresa_id} value={fec.empresa_id}>
                                                {fec.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>
                                <Box sx={{ mb: 2 }}>

                                    <TextField
                                        value={nombreEdit}
                                        onChange={(e) => setNombreEdit(e.target.value)}
                                        fullWidth label="Nombre" size="small"
                                    />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoEdit}
                                        onChange={(e) => setEstadoEdit(e.target.value)}>
                                        <MenuItem value={1}>
                                            Activo
                                        </MenuItem>
                                        <MenuItem value={2}>
                                            Inactivo
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error">Cancelar</Button>
                    <Button onClick={clickEdit} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog asignar empleados */}
            < Dialog
                open={asignar}
                fullWidth
                maxWidth="md"
            >
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>
                                    Asignar turno
                                    {idTurnoAsignar && (() => {
                                        const turnoSel = turnos.find(t => t.turno_id === idTurnoAsignar);
                                        return turnoSel?.horario
                                            ? ` (${turnoSel.horario.hora_entrada.slice(0, 5)} - ${turnoSel.horario.hora_salida.slice(0, 5)})`
                                            : "";
                                    })()}
                                </DialogTitle>

                                <Box sx={{ mb: 4, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <FormControl size="small" sx={{ minWidth: 170 }} disabled>
                                            <InputLabel>Empresa</InputLabel>
                                            <Select
                                                label="Empresa"
                                                value={filtroEmpresaAsignar}
                                                onChange={(e) => {
                                                    setFiltroEmpresaAsignar(e.target.value);
                                                    setFiltroDepartamentoAsignar(""); // Reset upon change
                                                    setFiltroCencoAsignar("");
                                                }}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {empresas.map((emp) => (
                                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }} disabled={!filtroEmpresaAsignar}>
                                            <InputLabel>Departamento</InputLabel>
                                            <Select
                                                label="Departamento"
                                                value={filtroDepartamentoAsignar}
                                                onChange={(e) => {
                                                    setFiltroDepartamentoAsignar(e.target.value);
                                                    setFiltroCencoAsignar(""); // Reset upon change
                                                }}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {departamentos
                                                    .filter(dep => dep.empresa?.empresa_id === filtroEmpresaAsignar)
                                                    .map((dep) => (
                                                        <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }} disabled={!filtroDepartamentoAsignar}>
                                            <InputLabel>Centro de costo</InputLabel>
                                            <Select
                                                label="Centro de costo"
                                                value={filtroCencoAsignar}
                                                onChange={(e) => setFiltroCencoAsignar(e.target.value)}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {cencos
                                                    .filter(cenco => cenco.departamento?.departamento_id === filtroDepartamentoAsignar)
                                                    .map((cenco) => (
                                                        <MenuItem key={cenco.cenco_id} value={cenco.cenco_id}>{cenco.nombre_cenco}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl size="small" sx={{ minWidth: 170 }}>
                                            <InputLabel>Cargo</InputLabel>
                                            <Select
                                                label="Cargo"
                                                value={filtroCargoAsignar}
                                                onChange={(e) => setFiltroCargoAsignar(e.target.value)}
                                            >
                                                <MenuItem value=""><em>Todos</em></MenuItem>
                                                {cargos
                                                    .filter(cargo => filtroEmpresaAsignar ? cargo.empresa?.empresa_id === filtroEmpresaAsignar : true)
                                                    .map((cargo) => (
                                                        <MenuItem key={cargo.cargo_id} value={cargo.cargo_id}>{cargo.nombre}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Stack>
                                </Box>


                                <Box sx={{ display: 'flex', flex: 1, gap: 2, height: "250px" }}>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Empleados disponibles
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            <List dense component="div" role="list">
                                                {!filtroCencoAsignar ? (
                                                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                                        Seleccione un centro de costo para ver empleados
                                                    </Typography>
                                                ) : (
                                                    empleadosDisponiblesFiltrados
                                                        .map((value) => {
                                                            const labelId = `transfer-list-item-${value.empleado_id}-label`;
                                                            return (
                                                                <ListItem
                                                                    key={value.empleado_id}
                                                                    role="listitem"
                                                                    button
                                                                    onClick={() => handleToggleEmpleado(value.empleado_id)}
                                                                >
                                                                    <Checkbox
                                                                        checked={checkedEmpleados.indexOf(value.empleado_id) !== -1}
                                                                        tabIndex={-1}
                                                                        disableRipple
                                                                        inputProps={{ 'aria-labelledby': labelId }}
                                                                    />
                                                                    <ListItemText id={labelId} primary={`${value.nombres} ${value.apellido_paterno} ${value.apellido_materno}`} />
                                                                </ListItem>
                                                            );
                                                        })
                                                )}
                                            </List>
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} justifyContent="center">
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllRight} disabled={!filtroCencoAsignar}>&gt;&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedRight} disabled={!filtroCencoAsignar || empleadosDisponiblesFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id)).length === 0}>&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedLeft} disabled={!filtroCencoAsignar || empleadosAsignadosFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id)).length === 0}>&lt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllLeft} disabled={!filtroCencoAsignar}>&lt;&lt;</Button>
                                    </Stack>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Empleados asignados ({empleadosAsignadosFiltrados.length})
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            <List dense component="div" role="list">
                                                {empleadosAsignadosFiltrados.map((value) => {
                                                    const labelId = `transfer-list-item-assigned-${value.empleado_id}-label`;
                                                    return (
                                                        <ListItem
                                                            key={value.empleado_id}
                                                            role="listitem"
                                                            button
                                                            onClick={() => handleToggleEmpleado(value.empleado_id)}
                                                        >
                                                            <Checkbox
                                                                checked={checkedEmpleados.indexOf(value.empleado_id) !== -1}
                                                                tabIndex={-1}
                                                                disableRipple
                                                                inputProps={{ 'aria-labelledby': labelId }}
                                                            />
                                                            <ListItemText id={labelId} primary={`${value.nombres} ${value.apellido_paterno} ${value.apellido_materno}`} />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={cerrarAsignar} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={clickGuardarAsignacion}>Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog asignar dias */}
            < Dialog
                open={detalle}
                onClose={cerrarDetalle}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 0, pt: 3, px: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Asignar Horarios</Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">Usar horas empresa</Typography>
                        <Switch 
                            checked={usarHorarioEmpresa} 
                            onChange={(e) => setUsarHorarioEmpresa(e.target.checked)} 
                            disabled={!empresaActual?.horario}
                            size="small"
                        />
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 280, mt: 2 }}>
                        <InputLabel>Asignación semana</InputLabel>
                        <Select
                            label="Asignación semana"
                            value={horarioGlobal}
                            onChange={(e) => {
                                const nuevoHorario = e.target.value;
                                setHorarioGlobal(nuevoHorario);

                                setHorariosSeleccionados(prev => {
                                    const nuevos = { ...prev };
                                    diasSeleccionados.forEach(d => {
                                        nuevos[d] = nuevoHorario;
                                    });
                                    return nuevos;
                                });
                            }}
                        >
                            <MenuItem value=""><em>Ninguno</em></MenuItem>
                            {horarios.filter(h => h.empresa?.empresa_id === empresaIdHorarios).map((h) => {
                                const colMins = h.colacion ? parseInt(h.colacion.split(':')[1], 10) : 0;
                                return (
                                    <MenuItem key={h.horario_id} value={h.horario_id}>
                                        {h.hora_entrada.slice(0, 5)} - {h.hora_salida.slice(0, 5)} / col: {colMins}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </DialogTitle>

                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia, index) => {
                            const valorDia = index + 1;
                            const isChecked = diasSeleccionados.includes(valorDia);
                            return (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", gap: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const success = handleToggleDia(valorDia);
                                                    if (!success) return;

                                                    if (isChecked) {
                                                        const nuevosHorarios = { ...horariosSeleccionados };
                                                        delete nuevosHorarios[valorDia];
                                                        setHorariosSeleccionados(nuevosHorarios);
                                                    } else {
                                                        if (horarioGlobal) {
                                                            setHorariosSeleccionados(prev => ({
                                                                ...prev,
                                                                [valorDia]: horarioGlobal
                                                            }));
                                                        }
                                                    }
                                                }}
                                                sx={{
                                                    padding: 0.5,
                                                    '&.Mui-checked': { color: '#1976d2' }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ width: "80px", fontWeight: 'bold' }}>
                                                {dia}
                                            </Typography>
                                        }
                                        sx={{ margin: 0 }}
                                    />

                                    <FormControl size="small" sx={{ minWidth: 200, visibility: isChecked ? 'visible' : 'hidden' }}>
                                        <InputLabel>Horario</InputLabel>
                                        <Select
                                            label="Horario"
                                            value={horariosSeleccionados[valorDia] || ""}
                                            onChange={(e) => setHorariosSeleccionados({
                                                ...horariosSeleccionados,
                                                [valorDia]: e.target.value
                                            })}
                                        >
                                            {horarios.filter(h => h.empresa?.empresa_id === empresaIdHorarios).map((h) => {
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
                            )
                        })}
                    </Box>

                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                        Seleccione los días laborales y asigne un horario a cada uno.
                    </Typography>
                    
                    <Typography variant="body2" display="block" textAlign="center" color={calcularHorasSemanales() > getHorasLímite() ? "error" : "text.primary"} sx={{ mt: 1, fontWeight: 'bold' }}>
                        Horas semanales: {calcularHorasSemanales().toFixed(1)} / {getHorasLímite()}
                    </Typography>
                    {calcularHorasSemanales() > getHorasLímite() && (
                        <Typography variant="caption" display="block" textAlign="center" color="error" sx={{ mt: 0.5 }}>
                            Las horas asignadas superan el límite permitido.
                        </Typography>
                    )}

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
                    <Button onClick={cerrarDetalle} color="error" sx={{ minWidth: 100 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" sx={{ minWidth: 100 }} disabled={calcularHorasSemanales() > getHorasLímite() || diasSeleccionados.length >= 7} onClick={clickGuardarDias}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >

            
        </>
    );
}
export default AdminTurnos;