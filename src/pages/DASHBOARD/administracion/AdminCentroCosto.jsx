import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    ListItemIcon,
    Checkbox,
    Tooltip
} from "@mui/material";
import { toast } from "react-hot-toast";
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
import { obtenerProveedorCorreo } from "../../../services/proveedorCorreoServices"

function AdminCentroCosto() {

    // Estados de datos
    const [cencos, setCencos] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [todosDispositivos, setTodosDispositivos] = useState([]);
    const [turnos, setTurnos] = useState([])
    const [proveedorCorreo, setProveedorCorreo] = useState([])
    const [cargando, setCargando] = useState(true);



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
    const [nuevoEmailGnralLocal, setNuevoEmailGnralLocal] = useState("")
    const [nuevoEmailGnralDominio, setNuevoEmailGnralDominio] = useState("")
    const [nuevoEmailNotiLocal, setNuevoEmailNotiLocal] = useState("")
    const [nuevoEmailNotiDominio, setNuevoEmailNotiDominio] = useState("")
    const [nuevoZonaExtrema, setNuevoZonaExtrema] = useState("")
    const [comunasFiltradasCrear, setComunasFiltradasCrear] = useState([]);
    const [nuevoPermiteTurnos, setNuevoPermiteTurnos] = useState("")

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
    const [editEmailGnralLocal, setEditEmailGnralLocal] = useState("")
    const [editEmailGnralDominio, setEditEmailGnralDominio] = useState("")
    const [editEmailNotiLocal, setEditEmailNotiLocal] = useState("")
    const [editEmailNotiDominio, setEditEmailNotiDominio] = useState("")
    const [editZonaExtrema, setEditZonaExtrema] = useState("")
    const [comunasFiltradasEdit, setComunasFiltradasEdit] = useState([]);
    const [editPermiteTurnos, setEditPermiteTurnos] = useState("")

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
    const [filtroDiasTurnos, setFiltroDiasTurnos] = useState([])

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
            toast.error(err.message);
        }
    };

    const llamarTurnos = async () => {
        try {
            const respuesta = await obtenerTurnos()
            setTurnos(respuesta)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const llamarProveedorCorreo = async () => {
        try {
            const respuesta = await obtenerProveedorCorreo()
            setProveedorCorreo(Array.isArray(respuesta) ? respuesta : [])
        } catch (error) {
            console.error("Error cargando proveedores de correo", error)
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
        setNuevoEstado(""); setNuevoEmailGnralLocal(""); setNuevoEmailGnralDominio("");
        setNuevoEmailNotiLocal(""); setNuevoEmailNotiDominio("");
        setNuevoDireccion(""); setNuevoZonaExtrema(""); setNuevoRegion("");
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
        const emailGnral = nuevoEmailGnralLocal && nuevoEmailGnralDominio ? `${nuevoEmailGnralLocal}${nuevoEmailGnralDominio}` : "";
        const emailNoti = nuevoEmailNotiLocal && nuevoEmailNotiDominio ? `${nuevoEmailNotiLocal}${nuevoEmailNotiDominio}` : "";
        try {
            await crearCentroCosto(nuevoNombre, nuevoDireccion, nuevoRegion, nuevoComuna, emailGnral, emailNoti, nuevoZonaExtrema, nuevoEstado, nuevoDepartamento, nuevoPermiteTurnos)
            setOpen(false)
            toast.success("Centro de costo creado con exito")
            const data = await obtenerCentroCostos();
            setCencos(data);
            setnuevoNombre(""); setNuevoDepartamento(""); setNuevoEmpresa("");
            setNuevoEstado(""); setNuevoEmailGnralLocal(""); setNuevoEmailGnralDominio("");
            setNuevoEmailNotiLocal(""); setNuevoEmailNotiDominio("");
            setNuevoDireccion(""); setNuevoZonaExtrema(""); setNuevoRegion("");
            setNuevoComuna("");
        } catch (error) {
            toast.error(error.message || "Error al crear")
        }
    }

    const clickEditar = async () => {
        const emailGnral = editEmailGnralLocal && editEmailGnralDominio ? `${editEmailGnralLocal}${editEmailGnralDominio}` : "";
        const emailNoti = editEmailNotiLocal && editEmailNotiDominio ? `${editEmailNotiLocal}${editEmailNotiDominio}` : "";
        try {
            await actualizarCentroCosto(editId, editNombre, editDireccion, editRegion, editComuna, emailGnral, emailNoti, editZonaExtrema, editEstado, editDepartamento, editPermiteTurnos)
            setMostrarEdit(false)
            toast.success("Se edito con exito")
            const data = await obtenerCentroCostos();
            setCencos(data);
        } catch (error) {
            toast.error(error.message || "Error al editar")
        }
    }

    // Logica dispositivos
    const abrirDialogDispositivo = (cenco) => {
        setCencoIdParaDispositivo(cenco.cenco_id);
        setCencoEnEdicion(cenco);

        const asignados = cenco.dispositivos || [];
        setRight(asignados);

        // Obtenemos todos los dispositivos asignados a TODOS los cencos
        const todosAsignados = cencos.flatMap(c => c.dispositivos || []);

        const disponibles = todosDispositivos.filter(dispoGlobal =>
            !todosAsignados.some(asignado => asignado.dispositivo_id === dispoGlobal.dispositivo_id)
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

            toast.success("Dispositivos asignados correctamente");
            setDialogDispositivo(false);
            cargarCencos();

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error al asignar dispositivos");
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

        const empresaId = cenco.departamento?.empresa?.empresa_id;

        // Filtramos todos los turnos por la empresa del cenco
        const turnosDeEmpresa = turnos.filter(t => t.empresa?.empresa_id === empresaId);

        const asignados = (cenco.turnos || []).filter(tAsignado => {
            // Aseguramos que el turno asignado sea de la misma empresa (por seguridad)
            // En un flujo normal, cenco.turnos ya viene de la base de datos
            // Pero al buscar en turnosGlobales, usamos el filtro por empresa
            const tGlobal = turnosDeEmpresa.find(t => t.turno_id === tAsignado.turno_id);
            return tGlobal !== undefined;
        }).map(tAsignado => {
            const tGlobal = turnosDeEmpresa.find(t => t.turno_id === tAsignado.turno_id);
            return tGlobal || tAsignado;
        });
        setTurnosRight(asignados);

        const disponibles = turnosDeEmpresa.filter(tGlobal =>
            !asignados.some(tAsignado => tAsignado.turno_id === tGlobal.turno_id)
        );
        setTurnosLeft(disponibles);

        setTurnosSeleccionados([]);
        setFiltroHoraDesdeTurnos("");
        setFiltroHoraHastaTurnos("");
        setFiltroDiasTurnos([]);
        setAbrirTurnos(true);
    }

    const guardarTurnos = async () => {
        try {
            if (!cencoEnEdicion || !cencoEnEdicion.cenco_id) {
                toast.error("No se ha seleccionado ningún centro de costo.");
                return;
            }

            const listaIds = turnosRight.map((t) => t.turno_id);

            await asignarTurnos(cencoEnEdicion.cenco_id, listaIds);

            toast.success("Turnos asignados correctamente");
            setAbrirTurnos(false);
            cargarCencos();
        } catch (error) {
            toast.error(error.message || "Error al asignar turnos");
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

    const filtrarTurnos = (listaTurnos) => {
        return listaTurnos.filter((tur) => {
            const detalles = tur.detalle_turno || [];

            // Si no hay filtros, mostramos todo
            if (!filtroHoraDesdeTurnos && !filtroHoraHastaTurnos && filtroDiasTurnos.length === 0) return true;

            // El turno coincide si AL MENOS UN detalle coincide con los criterios activos simultáneamente
            return detalles.some(d => {
                const timeEntrada = d.horario?.hora_entrada?.substring(0, 5) || "";
                const timeSalida = d.horario?.hora_salida?.substring(0, 5) || "";
                const codDia = d.dia?.cod_dia;

                const coincideHoraDesde = !filtroHoraDesdeTurnos || timeEntrada === filtroHoraDesdeTurnos;
                const coincideHoraHasta = !filtroHoraHastaTurnos || timeSalida === filtroHoraHastaTurnos;
                const coincideDia = filtroDiasTurnos.length === 0 || filtroDiasTurnos.includes(codDia);

                return coincideHoraDesde && coincideHoraHasta && coincideDia;
            });
        }).sort((a, b) => {
            const horaA = a.detalle_turno?.[0]?.horario?.hora_entrada || "";
            const horaB = b.detalle_turno?.[0]?.horario?.hora_entrada || "";
            return horaA.localeCompare(horaB);
        });
    };

    const turnosDisponiblesFiltrados = filtrarTurnos(turnosLeft);
    const turnosAsignadosFiltrados = filtrarTurnos(turnosRight);


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
        setTurnosLeft(turnosLeft.concat(turnosAsignadosFiltrados));
        setTurnosRight(notTurnos(turnosRight, turnosAsignadosFiltrados));
    };

    const customListTurnos = (items) => (
        <List dense component="div" role="list">
            {items.map((value, index) => {
                const uniqueKey = `list-turno-${value.turno_id}-${index}`;
                const labelId = `transfer-list-item-turno-${value.turno_id}-label`;

                const tooltipContent = (
                    <Box sx={{ p: 0.5 }}>
                        {value.detalle_turno && value.detalle_turno.length > 0 ? (
                            value.detalle_turno.map((d, i) => (
                                <Typography key={i} variant="caption" display="block" sx={{ whiteSpace: 'nowrap' }}>
                                    {d.dia?.nombre_dia}: {d.horario?.hora_entrada?.substring(0, 5)} - {d.horario?.hora_salida?.substring(0, 5)}
                                </Typography>
                            ))
                        ) : (
                            "Sin detalles de horario"
                        )}
                    </Box>
                );

                const secondaryText = value.detalle_turno && value.detalle_turno.length > 0
                    ? `${value.detalle_turno[0].dia?.nombre_dia?.substring(0, 3)} ${value.detalle_turno[0].horario?.hora_entrada?.substring(0, 5)}...`
                    : "Sin horario";

                return (
                    <Tooltip key={uniqueKey} title={tooltipContent} arrow placement="right">
                        <ListItem role="listitem" button onClick={handleToggleTurno(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={turnosSeleccionados.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                id={labelId}
                                primary={value.nombre}
                                secondary={secondaryText}
                            />
                        </ListItem>
                    </Tooltip>
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
                toast.error(err.message);
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
                toast.error(err.message);
            } finally {
                setCargando(false);
            }
        };
        cargarDatosIniciales();
    }, [])

    useEffect(() => {
        llamarTurnos()
    }, [])

    useEffect(() => {
        llamarProveedorCorreo()
    }, [])

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">Admin Centro Costo</Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{ p: 2, width: "100%", bgcolor: "#FFFFFD", borderRadius: 2, maxWidth: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden", boxSizing: "border-box" }}>
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
                                    <TableCell width={100} align="center"><strong>Permite Turnos R</strong></TableCell>
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
                                            <TableCell align="center">{cenco.permite_turno_r === true ? "Si" : "No"}</TableCell>
                                            <TableCell align="center">{cenco.fecha_creacion}</TableCell>
                                            <TableCell align="center">{cenco.fecha_actualizacion}</TableCell>
                                            <TableCell align="center">{cenco.usuario_creador}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => {
                                                    setEditId(cenco.cenco_id);
                                                    setEditDepartamento(cenco.departamento_id);
                                                    setEditNombre(cenco.nombre_cenco);
                                                    setEditEstado(cenco.estado_id);
                                                    setEditDireccion(cenco.direccion);
                                                    // Split email_general
                                                    let dominioGnral = "";
                                                    if (cenco.email_general && cenco.email_general.includes("@")) {
                                                        const partsG = cenco.email_general.split("@");
                                                        setEditEmailGnralLocal(partsG[0]);
                                                        dominioGnral = `@${partsG[1]}`;
                                                        setEditEmailGnralDominio(dominioGnral);
                                                    } else {
                                                        setEditEmailGnralLocal(cenco.email_general || "");
                                                        setEditEmailGnralDominio("");
                                                    }
                                                    // Split email_notificacion
                                                    if (cenco.email_notificacion && cenco.email_notificacion.includes("@")) {
                                                        const partsN = cenco.email_notificacion.split("@");
                                                        setEditEmailNotiLocal(partsN[0]);
                                                        setEditEmailNotiDominio(`@${partsN[1]}`);
                                                    } else {
                                                        setEditEmailNotiLocal(cenco.email_notificacion || "");
                                                        setEditEmailNotiDominio("");
                                                    }

                                                    // Set Empresa (desde el departamento)
                                                    if (cenco.departamento && cenco.departamento.empresa) {
                                                        setEditEmpresa(cenco.departamento.empresa.empresa_id);
                                                    } else {
                                                        setEditEmpresa("");
                                                    }

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
                                                    setEditPermiteTurnos(cenco.permite_turno_r != null ? cenco.permite_turno_r : "");
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
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={cencosFiltradas.length} rowsPerPage={filaPorPagina} page={pagina} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Paginas" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`} />
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
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth label="Email General" size="small"
                                    value={nuevoEmailGnralLocal}
                                    onChange={(e) => setNuevoEmailGnralLocal(e.target.value.replace(/@/g, ""))}
                                />
                                <FormControl size="small" sx={{ minWidth: 160 }} disabled={!nuevoEmpresa}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select label="Dominio" value={nuevoEmailGnralDominio} onChange={(e) => setNuevoEmailGnralDominio(e.target.value)}>
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === nuevoEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth label="Email Notificación" size="small"
                                    value={nuevoEmailNotiLocal}
                                    onChange={(e) => setNuevoEmailNotiLocal(e.target.value.replace(/@/g, ""))}
                                />
                                <FormControl size="small" sx={{ minWidth: 160 }} disabled={!nuevoEmpresa}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select label="Dominio" value={nuevoEmailNotiDominio} onChange={(e) => setNuevoEmailNotiDominio(e.target.value)}>
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === nuevoEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <FormControl size="small" fullWidth >
                                <InputLabel>Zona Extrema?</InputLabel>
                                <Select label="Zona Extrema?" value={nuevoZonaExtrema} onChange={(e) => setNuevoZonaExtrema(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {nuevoZonaExtrema === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth >
                                <InputLabel>Permite Turnos Rotativos?</InputLabel>
                                <Select label="Permite Turnos Rotativos?" value={nuevoPermiteTurnos} onChange={(e) => setNuevoPermiteTurnos(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {nuevoPermiteTurnos === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clikCrear} variant="contained" color="primary" disabled={nuevoDepartamento === "" || nuevoNombre.trim() === "" || nuevoDireccion.trim() === "" || nuevoEstado === "" || nuevoRegion === "" || nuevoComuna === "" || nuevoZonaExtrema === ""}>Guardar</Button>
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
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth label="Email General" size="small"
                                    value={editEmailGnralLocal}
                                    onChange={(e) => setEditEmailGnralLocal(e.target.value.replace(/@/g, ""))}
                                />
                                <FormControl size="small" sx={{ minWidth: 160 }} disabled={!editEmpresa}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select label="Dominio" value={editEmailGnralDominio} onChange={(e) => setEditEmailGnralDominio(e.target.value)}>
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === editEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth label="Email Notificación" size="small"
                                    value={editEmailNotiLocal}
                                    onChange={(e) => setEditEmailNotiLocal(e.target.value.replace(/@/g, ""))}
                                />
                                <FormControl size="small" sx={{ minWidth: 160 }} disabled={!editEmpresa}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select label="Dominio" value={editEmailNotiDominio} onChange={(e) => setEditEmailNotiDominio(e.target.value)}>
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === editEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Zona Extrema?</InputLabel>
                                <Select label="Zona Extrema?" value={editZonaExtrema} onChange={(e) => setEditZonaExtrema(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {editZonaExtrema === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth >
                                <InputLabel>Permite Turnos Rotativos?</InputLabel>
                                <Select label="Permite Turnos Rotativos?" value={editPermiteTurnos} onChange={(e) => setEditPermiteTurnos(e.target.value)}>
                                    <MenuItem value={true}>SI</MenuItem>
                                    <MenuItem value={false}>NO</MenuItem>
                                </Select>
                                {editPermiteTurnos === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEditar} variant="contained" color="primary" disabled={editDepartamento === "" || editNombre.trim() === "" || editEstado === "" || editRegion === "" || editComuna === "" || editZonaExtrema === ""}>Guardar Cambios</Button>
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
                                <Box sx={{ display: 'flex', flex: 1, gap: 2, height: "55vh", minHeight: "450px" }}>

                                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Turnos Disponibles ({turnosDisponiblesFiltrados.length})
                                        </Typography>

                                        {/* Filtros */}
                                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 1, mb: 2, alignItems: 'center' }}>
                                            <TextField
                                                label="Hora Inicio"
                                                type="time"
                                                value={filtroHoraDesdeTurnos}
                                                onChange={(e) => setFiltroHoraDesdeTurnos(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                sx={{
                                                    minWidth: "120px",
                                                    '& input::-webkit-calendar-picker-indicator': { display: 'none' }
                                                }}
                                            />
                                            <TextField
                                                label="Hora Fin"
                                                type="time"
                                                value={filtroHoraHastaTurnos}
                                                onChange={(e) => setFiltroHoraHastaTurnos(e.target.value)}
                                                InputLabelProps={{ shrink: true }}
                                                size="small"
                                                sx={{
                                                    minWidth: "120px",
                                                    '& input::-webkit-calendar-picker-indicator': { display: 'none' }
                                                }}
                                            />
                                            <FormControl size="small" sx={{ minWidth: "160px", flex: 1 }}>
                                                <InputLabel>Días</InputLabel>
                                                <Select
                                                    multiple
                                                    value={filtroDiasTurnos}
                                                    onChange={(e) => setFiltroDiasTurnos(e.target.value)}
                                                    label="Días"
                                                    renderValue={(selected) => {
                                                        const mapDias = { 1: "Lun", 2: "Mar", 3: "Mié", 4: "Jue", 5: "Vie", 6: "Sáb", 7: "Dom" };
                                                        return selected.map(val => mapDias[val]).join(", ");
                                                    }}
                                                >
                                                    {[
                                                        { id: 1, label: "Lunes" },
                                                        { id: 2, label: "Martes" },
                                                        { id: 3, label: "Miércoles" },
                                                        { id: 4, label: "Jueves" },
                                                        { id: 5, label: "Viernes" },
                                                        { id: 6, label: "Sábado" },
                                                        { id: 7, label: "Domingo" }
                                                    ].map((dia) => (
                                                        <MenuItem key={dia.id} value={dia.id}>
                                                            <Checkbox checked={filtroDiasTurnos.indexOf(dia.id) > -1} />
                                                            <ListItemText primary={dia.label} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
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
                                            Turnos Asignados ({turnosAsignadosFiltrados.length})
                                        </Typography>
                                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                                            {turnosAsignadosFiltrados.length === 0
                                                ? <Typography variant="body2" sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>Ninguno asignado</Typography>
                                                : customListTurnos(turnosAsignadosFiltrados)
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