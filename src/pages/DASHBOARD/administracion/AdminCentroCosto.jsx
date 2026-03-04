import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    ListItemIcon,
    Checkbox
} from "@mui/material";
import { obtenerEmpresas } from "../../../services/empresasServices"
import { regiones, comunas } from "../../../utils/dataGeografica"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import FaxIcon from '@mui/icons-material/Fax';
import DraftsIcon from '@mui/icons-material/Drafts';
import { obtenerCentroCostos } from "../../../services/centroCostosServices"
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { crearCentroCosto } from "../../../services/centroCostosServices"
import { actualizarCentroCosto } from "../../../services/centroCostosServices"
import { obtenerDispositivo } from "../../../services/dispositivosServices"
import { asignarDispositivo } from "../../../services/asignaciones/asignacionesServices"
import { obtenerTurnos } from "../../../services/turnosServices"
import { asignarTurnos } from "../../../services/asignaciones/asignacionesServices"

function AdminCentroCosto() {

    // Estados de datos
    const [cencos, setCencos] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [todosDispositivos, setTodosDispositivos] = useState([]);
    const [turnos, setTurnos] = useState([])
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("");

    // Estados de paginacion y filtrado
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtrodepartamento, setFiltroDepartamento] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("")
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setnuevoNombre] = useState("")
    const [nuevoEmpresa, setNuevoEmpresa] = useState("")
    const [nuevoDepartamento, setNuevoDepartamento] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")
    const [nuevoDireccion, setNuevoDireccion] = useState("")
    const [nuevoRegion, setNuevoRegion] = useState("")
    const [nuevoComuna, setNuevoComuna] = useState("")
    const [nuevoEmailGnral, setNuevoEmailGnral] = useState("")
    const [nuevoEmailNoti, setNuevoEmailNoti] = useState("")
    const [nuevoZonaExtrema, setNuevoZonaExtrema] = useState("")
    const [comunasFiltradasCrear, setComunasFiltradasCrear] = useState([]);

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editEmpresa, setEditEmpresa] = useState("")
    const [editDepartamento, setEditDepartamento] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editDireccion, setEditDireccion] = useState("")
    const [editRegion, setEditRegion] = useState("")
    const [editComuna, setEditComuna] = useState("")
    const [editEmailGnral, setEditEmailGnral] = useState("")
    const [editEmailNoti, setEditEmailNoti] = useState("")
    const [editZonaExtrema, setEditZonaExtrema] = useState("")
    const [comunasFiltradasEdit, setComunasFiltradasEdit] = useState([]);

    // Estados dispositivos
    const [dialogDispositivo, setDialogDispositivo] = useState(false)
    const [cencoIdParaDispositivo, setCencoIdParaDispositivo] = useState("")
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const [checked, setChecked] = useState([]);

    // Estados turnos
    const [turnosRight, setTurnosRight] = useState([])
    const [turnosLeft, setTurnosLeft] = useState([])
    const [abrirTurnos, setAbrirTurnos] = useState("")
    const [turnosSeleccionados, setTurnosSeleccionados] = useState([])
    const [filtroHoraDesdeTurnos, setFiltroHoraDesdeTurnos] = useState("")
    const [filtroHoraHastaTurnos, setFiltroHoraHastaTurnos] = useState("")

    // Estados email y cenco en edicion
    const [abrirEmailNoti, setAbrirEmailNoti] = useState(false)
    const [cencoSeleccionado, setCencoSeleccionado] = useState(null);
    const [cencoEnEdicion, setCencoEnEdicion] = useState(null);

    // Carga de datos
    const cargarCencos = async () => {
        try {
            const dataCencos = await obtenerCentroCostos();
            setCencos(dataCencos);
        } catch (err) {
            setError(err.message);
        }
    };

    const llamarTurnos = async () => {
        try {
            const respuesta = await obtenerTurnos()
            setTurnos(respuesta)
        } catch (error) {
            setError(error.message)
        }
    }

    // Validacion email
    const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Manejo de region y comuna
    const handleCambioRegion = (evento) => {
        const idSeleccionado = evento.target.value
        setNuevoRegion(idSeleccionado)
        const filtro = comunas.filter(c => c.regionId === idSeleccionado)
        setComunasFiltradasCrear(filtro)
        setNuevoComuna("")
    }

    const handleCambioRegionEdit = (evento) => {
        const idSeleccionadoEdit = evento.target.value
        setEditRegion(idSeleccionadoEdit)
        const filtro = comunas.filter(c => c.regionId === idSeleccionadoEdit)
        setComunasFiltradasEdit(filtro)
        setEditComuna("")
    }

    // Manejo de dialogs
    const cerrarDialog = () => {
        setOpen(false);
        setnuevoNombre(""); setNuevoDepartamento(""); setNuevoEmpresa("");
        setNuevoEstado(""); setNuevoEmailGnral(""); setNuevoDireccion("");
        setNuevoEmailNoti(""); setNuevoZonaExtrema(""); setNuevoRegion("");
        setNuevoComuna("");
    }

    const cerrarDialogEdit = () => { setMostrarEdit(false) }

    const cerrarEmailNoti = () => { setAbrirEmailNoti(false); setCencoSeleccionado(null); }

    const cerrarDialogDispositivo = () => { setDialogDispositivo(false) }

    const cerrearDialogTurnos = () => {
        setAbrirTurnos(false)
    }

    // Acciones crear y editar
    const clikCrear = async () => {
        try {
            await crearCentroCosto(nuevoNombre, nuevoDireccion, nuevoRegion, nuevoComuna, nuevoEmailGnral, nuevoEmailNoti, nuevoZonaExtrema, nuevoEstado, nuevoDepartamento,)
            setOpen(false)
            setMensajeExito("Centro de costo creado con exito")
            const data = await obtenerCentroCostos();
            setCencos(data);
            setnuevoNombre(""); setNuevoDepartamento(""); setNuevoEmpresa("");
            setNuevoEstado(""); setNuevoEmailGnral(""); setNuevoDireccion("");
            setNuevoEmailNoti(""); setNuevoZonaExtrema(""); setNuevoRegion("");
            setNuevoComuna("");
        } catch (error) {
            setError(error.message || "Error al crear")
        }
    }

    const clickEditar = async () => {
        try {
            await actualizarCentroCosto(editId, editNombre, editDireccion, editRegion, editComuna, editEmailGnral, editEmailNoti, editZonaExtrema, editEstado, editDepartamento,)
            setMostrarEdit(false)
            setMensajeExito("Se edito con exito")
            const data = await obtenerCentroCostos();
            setCencos(data);
        } catch (error) {
            setError(error.message || "Error al editar")
        }
    }

    // Logica dispositivos
    const abrirDialogDispositivo = (cenco) => {
        setCencoIdParaDispositivo(cenco.cenco_id);
        setCencoEnEdicion(cenco);

        const asignados = cenco.dispositivos || [];
        setRight(asignados);

        const disponibles = todosDispositivos.filter(dispoGlobal =>
            !asignados.some(dispoAsignado => dispoAsignado.dispositivo_id === dispoGlobal.dispositivo_id)
        );
        setLeft(disponibles);

        setChecked([]);
        setDialogDispositivo(true);
    }

    const guardarCambiosDispositivos = async () => {
        try {
            const listaParaEnviar = right.map((item) => ({
                dispositivo_id: item.dispositivo_id
            }));

            await asignarDispositivo(
                cencoIdParaDispositivo,
                cencoEnEdicion.nombre_cenco,
                cencoEnEdicion.direccion,
                cencoEnEdicion.region,
                cencoEnEdicion.comuna,
                cencoEnEdicion.email_general,
                cencoEnEdicion.email_notificacion,
                cencoEnEdicion.zona_extrema,
                cencoEnEdicion.usuario_creador,
                cencoEnEdicion.estado?.estado_id || cencoEnEdicion.estado_id,
                cencoEnEdicion.depto?.departamento_id || cencoEnEdicion.departamento_id,
                listaParaEnviar
            );

            setMensajeExito("Dispositivos asignados correctamente");
            setDialogDispositivo(false);
            cargarCencos();

        } catch (error) {
            console.error(error);
            setError(error.message || "Error al asignar dispositivos");
        }
    };

    const intersection = (a, b) => a.filter((value) => b.some((item) => item.dispositivo_id === value.dispositivo_id));

    const not = (a, b) => a.filter((value) => !b.some((item) => item.dispositivo_id === value.dispositivo_id));

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) { newChecked.push(value); }
        else { newChecked.splice(currentIndex, 1); }
        setChecked(newChecked);
    };

    const handleAllRight = () => { setRight(right.concat(left)); setLeft([]); };

    const handleCheckedRight = () => {
        const leftChecked = intersection(checked, left);
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        const rightChecked = intersection(checked, right);
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => { setLeft(left.concat(right)); setRight([]); };

    const customList = (items) => (
        <List dense component="div" role="list">
            {items.map((value) => {
                const labelId = `transfer-list-item-${value.dispositivo_id}-label`;
                return (
                    <ListItem key={value.dispositivo_id} role="listitem" button onClick={handleToggle(value)}>
                        <ListItemIcon>
                            <Checkbox checked={checked.indexOf(value) !== -1} tabIndex={-1} disableRipple inputProps={{ 'aria-labelledby': labelId }} />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={value.nombre} secondary={value.modelo || "Sin modelo"} />
                    </ListItem>
                );
            })}
        </List>
    );

    // Logica turnos
    const abrirDialogTurnosHandler = (cenco) => {
        setCencoEnEdicion(cenco);

        const asignados = cenco.turnos || [];
        setTurnosRight(asignados);

        const disponibles = turnos.filter(tGlobal =>
            !asignados.some(tAsignado => tAsignado.turno_id === tGlobal.turno_id)
        );
        setTurnosLeft(disponibles);

        setTurnosSeleccionados([]);
        setFiltroHoraDesdeTurnos("");
        setFiltroHoraHastaTurnos("");
        setAbrirTurnos(true);
    }

    const guardarTurnos = async () => {
        try {
            if (!cencoEnEdicion || !cencoEnEdicion.cenco_id) {
                setError("No se ha seleccionado ningún centro de costo.");
                return;
            }

            const listaIds = turnosRight.map((t) => t.turno_id);

            await asignarTurnos(cencoEnEdicion.cenco_id, listaIds);

            setMensajeExito("Turnos asignados correctamente");
            setAbrirTurnos(false);
            cargarCencos();
        } catch (error) {
            setError(error.message || "Error al asignar turnos");
        }
    };

    const intersectionTurnos = (a, b) =>
        a.filter((aItem) => b.some((bItem) => aItem.turno_id === bItem.turno_id));

    const notTurnos = (a, b) =>
        a.filter((aItem) => !b.some((bItem) => aItem.turno_id === bItem.turno_id));

    const handleToggleTurno = (turn) => () => {
        const nuevaListaCheck = [...turnosSeleccionados]
        const indiceActual = turnosSeleccionados.indexOf(turn);

        if (indiceActual === -1) {
            nuevaListaCheck.push(turn)
        } else {
            nuevaListaCheck.splice(indiceActual, 1)
        }
        setTurnosSeleccionados(nuevaListaCheck)
    }

    const turnosDisponiblesFiltrados = turnosLeft.filter((tur) => {
        let coincideHora = true;
        if (filtroHoraDesdeTurnos || filtroHoraHastaTurnos) {
            const turnoEntrada = tur.horario?.hora_entrada; // formato "HH:MM:SS"
            const turnoSalida = tur.horario?.hora_salida;
            if (turnoEntrada && turnoSalida) {
                const timeEntrada = turnoEntrada.substring(0, 5);
                const timeSalida = turnoSalida.substring(0, 5);

                if (filtroHoraDesdeTurnos && timeEntrada < filtroHoraDesdeTurnos) coincideHora = false;
                if (filtroHoraHastaTurnos && timeSalida > filtroHoraHastaTurnos) coincideHora = false;
            } else {
                coincideHora = false; // si no tiene hora pero estamos filtrando por hora
            }
        }
        return coincideHora;
    });

    const handleAllRightTurnos = () => {
        setTurnosRight(turnosRight.concat(turnosDisponiblesFiltrados));
        setTurnosLeft(notTurnos(turnosLeft, turnosDisponiblesFiltrados));
    };

    const handleCheckedRightTurnos = () => {
        const leftChecked = intersectionTurnos(turnosSeleccionados, turnosLeft);
        setTurnosRight(turnosRight.concat(leftChecked));
        setTurnosLeft(notTurnos(turnosLeft, leftChecked));
        setTurnosSeleccionados(notTurnos(turnosSeleccionados, leftChecked));
    };

    const handleCheckedLeftTurnos = () => {
        const rightChecked = intersectionTurnos(turnosSeleccionados, turnosRight);
        setTurnosLeft(turnosLeft.concat(rightChecked));
        setTurnosRight(notTurnos(turnosRight, rightChecked));
        setTurnosSeleccionados(notTurnos(turnosSeleccionados, rightChecked));
    };

    const handleAllLeftTurnos = () => {
        setTurnosLeft(turnosLeft.concat(turnosRight));
        setTurnosRight([]);
    };

    const customListTurnos = (items) => (
        <List dense component="div" role="list">
            {items.map((value) => {
                const labelId = `transfer-list-item-turno-${value.turno_id}-label`;
                const textoHorario = value.horario
                    ? `${value.horario.hora_entrada} - ${value.horario.hora_salida}`
                    : (value.es_rotativo ? "Rotativo" : "Sin horario");

                return (
                    <ListItem key={value.turno_id} role="listitem" button onClick={handleToggleTurno(value)}>
                        <ListItemIcon>
                            <Checkbox
                                checked={turnosSeleccionados.indexOf(value) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            id={labelId} primary={value.nombre} secondary={textoHorario}
                        />
                    </ListItem>
                );
            })}
        </List>
    );



    // Filtrado de departamentos
    const departamentosFiltrados = (departamentos.departamentos || departamentos || []).filter((dep) => {
        return filtroEmpresa ? dep.empresa?.empresa_id == filtroEmpresa : true;
    });

    const departamentosFiltradosCrear = (departamentos.departamentos || departamentos || []).filter((dep) => {
        return nuevoEmpresa ? dep.empresa?.empresa_id == nuevoEmpresa : true;
    });

    const departamentosFiltradosEditar = (departamentos.departamentos || departamentos || []).filter((dep) => {
        return editEmpresa ? dep.empresa?.empresa_id == editEmpresa : true;
    });

    // Filtrado y paginacion
    const cencosFiltradas = cencos.filter((cenco) => {
        const textoBusqueda = `${cenco.nombre_cenco || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        const coincideDepartamento = filtrodepartamento ? cenco.departamento?.departamento_id === filtrodepartamento : true
        const coincideEstado = filtroEstado ? cenco.estado?.estado_id === filtroEstado : true
        return coincideTexto && coincideEstado && coincideDepartamento
    });

    const handleChangePage = (event, newPage) => { setPagina(newPage); };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const [dataCencos, dataEmpresas] = await Promise.all([
                    obtenerCentroCostos(),
                    obtenerEmpresas()
                ]);
                setCencos(dataCencos);
                setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);

                try {
                    const dataDispo = await obtenerDispositivo();
                    setTodosDispositivos(dataDispo || []);
                } catch (e) {
                    console.error("Error loading devices", e);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
    }, [])

    useEffect(() => {
        const fetchDeptos = async () => {
            try {
                const res = await obtenerDepartamentos();
                setDepartamentos(res || []);
            } catch (e) { console.error(e) }
        }
        fetchDeptos();
    }, [filtroEmpresa]);

    useEffect(() => { setPagina(0); }, [busqueda, filtroEmpresa, filtroEstado]);

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => setMensajeExito(""), 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                setCargando(true);

                await cargarCencos();

                const dataEmpresas = await obtenerEmpresas();
                setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
                try {
                    const dataDispo = await obtenerDispositivo();
                    setTodosDispositivos(dataDispo || []);
                } catch (e) {
                    console.error("Error cargando dispositivos", e);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
    }, [])

    useEffect(() => {
        llamarTurnos()
    }, [])

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">Admin Centro Costo</Typography>
            </Box>

            {/* Alerta de exito */}
            {mensajeExito && (
                <Container sx={{ mb: 2 }}><Alert severity="success" onClose={() => setMensajeExito("")}>{mensajeExito}</Alert></Container>
            )}

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{ p: 2, width: "100%", bgcolor: "#FFFFFD", borderRadius: 2, maxWidth: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden", boxSizing: "border-box" }}>

                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px", }}>
                        <TextField placeholder="Buscar..." variant="standard" InputProps={{ disableUnderline: true }} sx={{ ml: 1, flex: 1, px: 1 }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search"><SearchIcon /></IconButton>
                    </Paper>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 130, }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroEmpresa} onChange={(e) => { setFiltroEmpresa(e.target.value); setFiltroDepartamento(""); }} label="Empresa">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empresas.map((empresa) => (<MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.nombre_empresa}</MenuItem>))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Departamento</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtrodepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {departamentosFiltrados.map((filDept) => (<MenuItem key={filDept.departamento_id} value={filDept.departamento_id}>{filDept.nombre_departamento}</MenuItem>))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "20vh" }} label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}>Activo</MenuItem>
                            <MenuItem value={2}>Inactivo</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>Nuevo Registro</Button>
                </Box>

                {/* Tabla principal */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative", }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 1650 }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width={100} align="center"><strong>Acción</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Direccion</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Region</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Comuna</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Email Gnral</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Emails Noti</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Dispositivos</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Zona Extrema?</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Creador</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cencosFiltradas.length > 0 ? (
                                    cencosFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((cenco) => (
                                        <TableRow key={cenco.cenco_id} hover>
                                            <TableCell align="center">
                                                <Button variant="contained" size="small" sx={{ fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)" }} onClick={() => abrirDialogTurnosHandler(cenco)}>Turnos</Button>
                                            </TableCell>
                                            <TableCell align="center">{cenco.nombre_cenco}</TableCell>
                                            <TableCell align="center"><CircleIcon sx={{ fontSize: "1rem", color: cenco.estado?.estado_id === 1 ? "#4caf50" : "#f44336" }} /></TableCell>
                                            <TableCell align="center">{cenco.direccion}</TableCell>
                                            <TableCell align="center">{cenco.region}</TableCell>
                                            <TableCell align="center">{cenco.comuna}</TableCell>
                                            <TableCell align="center">{cenco.email_general}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => { setCencoSeleccionado(cenco); setAbrirEmailNoti(true); }}><DraftsIcon /></IconButton>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => abrirDialogDispositivo(cenco)}><FaxIcon /></IconButton>
                                            </TableCell>
                                            <TableCell align="center">{cenco.zona_extrema === true ? "Si" : "No"}</TableCell>
                                            <TableCell align="center">{cenco.fecha_creacion}</TableCell>
                                            <TableCell align="center">{cenco.fecha_actualizacion}</TableCell>
                                            <TableCell align="center">{cenco.usuario_creador}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => {
                                                    setEditId(cenco.cenco_id);
                                                    setEditEmpresa("");
                                                    setEditDepartamento(cenco.departamento_id);
                                                    setEditNombre(cenco.nombre_cenco);
                                                    setEditEstado(cenco.estado_id);
                                                    setEditDireccion(cenco.direccion);
                                                    setEditEmailGnral(cenco.email_general);
                                                    setEditEmailNoti(cenco.email_notificacion);
                                                    setEditZonaExtrema(cenco.zona_extrema ? true : false);

                                                    const normalize = (str) => (str || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                                                    const comunaStr = normalize(cenco.comuna);
                                                    const regionStr = normalize(cenco.region);

                                                    const comunaEncontrada = comunas.find((c) => normalize(c.nombre) === comunaStr);
                                                    const regionEncontrada = regiones.find((r) => r.id === String(cenco.region) || normalize(r.nombre) === regionStr);

                                                    let regionSeleccionada = "";
                                                    if (comunaEncontrada) {
                                                        regionSeleccionada = comunaEncontrada.regionId;
                                                    } else if (regionEncontrada) {
                                                        regionSeleccionada = regionEncontrada.id;
                                                    } else {
                                                        regionSeleccionada = cenco.region || "";
                                                    }

                                                    setEditRegion(regionSeleccionada);

                                                    if (regionSeleccionada) {
                                                        const filtro = comunas.filter((c) => c.regionId === regionSeleccionada);
                                                        setComunasFiltradasEdit(filtro);
                                                        const comunaValida = filtro.find(c => normalize(c.nombre) === comunaStr);
                                                        setEditComuna(comunaValida ? comunaValida.nombre : (cenco.comuna || ""));
                                                    } else {
                                                        setComunasFiltradasEdit([]);
                                                        setEditComuna(cenco.comuna || "");
                                                    }

                                                    setMostrarEdit(true);
                                                }}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={14} align="center" sx={{ py: 3 }}><Typography variant="body1" color="text.secondary">No se encontraron registros.</Typography></TableCell></TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination rowsPerPageOptions={[]} component="div" count={cencosFiltradas.length} rowsPerPage={filaPorPagina} page={pagina} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`} />
            </Paper >

            {/* Dialog email notificacion */}
            <Dialog open={abrirEmailNoti} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle>Emails Notificación</DialogTitle>
                                <Box sx={{ mb: 2 }}>
                                    {cencoSeleccionado && (
                                        <Typography variant="body2" sx={{ border: '1px solid #E0E0E0', borderRadius: '40px', p: 0.5, color: '#424242' }}>
                                            {cencoSeleccionado.email_notificacion}
                                        </Typography>
                                    )}
                                </Box>
                                <Button variant="outlined" color="error" onClick={cerrarEmailNoti}>cerrar</Button>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Dialog crear */}
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Centro Costo</DialogTitle>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Empresa</InputLabel>
                                <Select label="Empresa" value={nuevoEmpresa} onChange={(e) => setNuevoEmpresa(e.target.value)}>
                                    {empresas.map((empresa) => (<MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.nombre_empresa}</MenuItem>))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Departamento</InputLabel>
                                <Select label="Departamento" value={nuevoDepartamento} onChange={(e) => setNuevoDepartamento(e.target.value)}>
                                    {departamentosFiltradosCrear.map((dep) => (<MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>))}
                                </Select>
                                {nuevoDepartamento === "" && <FormHelperText>El departamento es obligatorio</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Nombre" size="small" value={nuevoNombre} onChange={(e) => setnuevoNombre(e.target.value)} helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Estado</InputLabel>
                                <Select label="Estado" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                    <MenuItem value={1}>Activo</MenuItem>
                                    <MenuItem value={2}>Inactivo</MenuItem>
                                </Select>
                                {nuevoEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Dirección" size="small" value={nuevoDireccion} onChange={(e) => setNuevoDireccion(e.target.value)} helperText={nuevoDireccion.trim() === "" ? "La dirección es obligatoria" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Región</InputLabel>
                                <Select label="Región" value={nuevoRegion} onChange={handleCambioRegion}>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {nuevoRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={nuevoComuna} onChange={(e) => setNuevoComuna(e.target.value)} disabled={comunasFiltradasCrear.length === 0}>
                                    {comunasFiltradasCrear.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {nuevoComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Email Gnral" size="small" value={nuevoEmailGnral} onChange={(e) => setNuevoEmailGnral(e.target.value)} error={nuevoEmailGnral !== "" && !esEmailValido(nuevoEmailGnral)} helperText={nuevoEmailGnral !== "" && !esEmailValido(nuevoEmailGnral) ? "Ingrese un email válido" : ""} />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Email Noti" size="small" value={nuevoEmailNoti} onChange={(e) => setNuevoEmailNoti(e.target.value)} error={nuevoEmailNoti !== "" && !esEmailValido(nuevoEmailNoti)} helperText={nuevoEmailNoti !== "" && !esEmailValido(nuevoEmailNoti) ? "Ingrese un email válido" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth >
                                <InputLabel>Zona Extrema?</InputLabel>
                                <Select label="Zona Extrema?" value={nuevoZonaExtrema} onChange={(e) => setNuevoZonaExtrema(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {nuevoZonaExtrema === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clikCrear} variant="contained" color="primary" disabled={nuevoDepartamento === "" || nuevoNombre.trim() === "" || nuevoDireccion.trim() == "" || nuevoEstado === "" || nuevoRegion === "" || nuevoComuna === "" || nuevoZonaExtrema === "" || (nuevoEmailGnral ? nuevoEmailGnral !== "" && !esEmailValido(nuevoEmailGnral) : "") || (nuevoEmailNoti !== "" && !esEmailValido(nuevoEmailNoti))}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Centro de Costo</DialogTitle>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Empresa</InputLabel>
                                <Select label="Empresa" value={editEmpresa} onChange={(e) => setEditEmpresa(e.target.value)}>
                                    {empresas.map((emp) => (<MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Departamento</InputLabel>
                                <Select label="Departamento" value={editDepartamento} onChange={(e) => setEditDepartamento(e.target.value)}>
                                    {departamentosFiltradosEditar.map((dep) => (<MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>))}
                                </Select>
                                {editDepartamento === "" && <FormHelperText>El departamento es obligatorio</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Nombre" size="small" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Estado</InputLabel>
                                <Select label="Estado" value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
                                    <MenuItem value={1}>Activo</MenuItem>
                                    <MenuItem value={2}>Inactivo</MenuItem>
                                </Select>
                                {editEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Dirección" size="small" value={editDireccion} onChange={(e) => setEditDireccion(e.target.value)} helperText={editDireccion.trim() === "" ? "La dirección es obligatoria" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Región</InputLabel>
                                <Select label="Región" value={editRegion} onChange={handleCambioRegionEdit}>
                                    {regiones.map((reg) => (<MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>))}
                                </Select>
                                {editRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                            </FormControl>
                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Comuna</InputLabel>
                                <Select label="Comuna" value={editComuna} onChange={(e) => setEditComuna(e.target.value)} disabled={comunasFiltradasEdit.length === 0}>
                                    {comunasFiltradasEdit.map((com, index) => (<MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>))}
                                </Select>
                                {editComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                            </FormControl>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Email Gnral" size="small" value={editEmailGnral} onChange={(e) => setEditEmailGnral(e.target.value)} helperText={editEmailGnral !== "" && !esEmailValido(editEmailGnral) ? "Ingrese un email válido" : ""} />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Email Noti" size="small" value={editEmailNoti} onChange={(e) => setEditEmailNoti(e.target.value)} helperText={editEmailNoti !== "" && !esEmailValido(editEmailNoti) ? "Ingrese un email válido" : ""} />
                            </Box>
                            <FormControl size="small" fullWidth >
                                <InputLabel>Zona Extrema?</InputLabel>
                                <Select label="Zona Extrema?" value={editZonaExtrema} onChange={(e) => setEditZonaExtrema(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {editZonaExtrema === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEditar} variant="contained" color="primary" disabled={editDepartamento === "" || editNombre.trim() === "" || editEstado === "" || editRegion === "" || editComuna === "" || editZonaExtrema === "" || (editEmailGnral ? editEmailGnral !== "" && !esEmailValido(editEmailGnral) : "") || (editEmailNoti !== "" && !esEmailValido(editEmailNoti))}>Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog asignar dispositivos */}
            <Dialog open={dialogDispositivo} fullWidth maxWidth="md" onClose={cerrarDialogDispositivo}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 2 }}>Asignar Dispositivos</DialogTitle>
                                <Box sx={{ display: 'flex', flex: 1, gap: 2, height: "250px" }}>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Dispositivos Disponibles ({left.length})</Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            {left.length === 0 ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>No hay disponibles</Typography> : customList(left)}
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} justifyContent="center" alignItems="center">
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllRight} disabled={left.length === 0}>≫</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedRight} disabled={intersection(checked, left).length === 0}>&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedLeft} disabled={intersection(checked, right).length === 0}>&lt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllLeft} disabled={right.length === 0}>≪</Button>
                                    </Stack>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Dispositivos Asignados ({right.length})</Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            {right.length === 0 ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>Ninguno asignado</Typography> : customList(right)}
                                        </Box>
                                    </Box>

                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogDispositivo} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={guardarCambiosDispositivos}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog asignar turnos */}
            <Dialog open={abrirTurnos} fullWidth maxWidth="md" onClose={cerrearDialogTurnos}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 2 }}>Asignar Turnos</DialogTitle>
                                <Box sx={{ display: 'flex', flex: 1, gap: 2, height: "250px" }}>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Turnos Disponibles ({turnosDisponiblesFiltrados.length})
                                        </Typography>

                                        {/* Filtros de Hora */}
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                label="Hora Desde"
                                                type="time"
                                                value={filtroHoraDesdeTurnos}
                                                onChange={(e) => setFiltroHoraDesdeTurnos(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <TextField
                                                label="Hora Hasta"
                                                type="time"
                                                value={filtroHoraHastaTurnos}
                                                onChange={(e) => setFiltroHoraHastaTurnos(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>

                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            {turnosDisponiblesFiltrados.length === 0
                                                ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>No hay disponibles</Typography>
                                                : customListTurnos(turnosDisponiblesFiltrados)
                                            }
                                        </Box>
                                    </Box>

                                    <Stack spacing={1} justifyContent="center" alignItems="center">
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllRightTurnos} disabled={turnosLeft.length === 0}>≫</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedRightTurnos} disabled={intersectionTurnos(turnosSeleccionados, turnosLeft).length === 0}>&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedLeftTurnos} disabled={intersectionTurnos(turnosSeleccionados, turnosRight).length === 0}>&lt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllLeftTurnos} disabled={turnosRight.length === 0}>≪</Button>
                                    </Stack>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Turnos Asignados ({turnosRight.length})
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            {turnosRight.length === 0
                                                ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>Ninguno asignado</Typography>
                                                : customListTurnos(turnosRight)
                                            }
                                        </Box>
                                    </Box>

                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrearDialogTurnos} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={guardarTurnos}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminCentroCosto;