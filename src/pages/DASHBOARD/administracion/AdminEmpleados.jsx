import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    InputAdornment
} from "@mui/material";
import { toast } from "react-hot-toast";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/es";
import dayjs from "dayjs";
dayjs.locale("es");
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { actualizarEmpleado } from "../../../services/empleadosServices"
import { obtenerEmpresas } from "../../../services/empresasServices"
import { regiones, comunas } from "../../../utils/dataGeografica"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import DraftsIcon from '@mui/icons-material/Drafts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { obtenerCentroCostos } from "../../../services/centroCostosServices"
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { obtenerTurnos } from "../../../services/turnosServices"
import { obtenerCargos } from "../../../services/cargosServices"
import { obtenerEmpleados } from "../../../services/empleadosServices"
import { crearEmpleado } from "../../../services/empleadosServices"
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import { asignarCencosAEmpleados } from "../../../services/asignaciones/asignacionesServices"
import { obtenerProveedorCorreo } from "../../../services/proveedorCorreoServices"


const ItemArbol = ({ nodo, isChecked, toggleCheck, nivel = 0 }) => {
    const [abierto, setAbierto] = React.useState(false);
    const tieneHijos = nodo.hijos && nodo.hijos.length > 0;

    const paddingLeft = 2 + (nivel * 2);

    const handleExpandir = (e) => {
        e.stopPropagation();
        setAbierto(!abierto);
    };

    return (
        <Box sx={{ bgcolor: abierto ? "rgba(0,0,0,0.02)" : "transparent", borderRadius: 1 }}>
            <ListItemButton
                sx={{
                    pl: paddingLeft,
                    py: 0.5,
                    height: 40,
                    '&:hover': { bgcolor: "rgba(25, 118, 210, 0.08)" }
                }}
                onClick={handleExpandir}
            >
                <ListItemIcon sx={{ minWidth: 24, mr: 1, color: "text.secondary" }}>
                    {tieneHijos ? (
                        abierto ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
                    ) : (
                        <Box width={20} />
                    )}
                </ListItemIcon>

                <Checkbox
                    edge="start"
                    checked={isChecked(nodo.id)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                    onChange={(e) => toggleCheck(nodo, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                />

                <ListItemText
                    primary={nodo.nombre}
                    primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: nivel === 0 ? "bold" : "regular",
                        fontSize: "0.9rem"
                    }}
                />
            </ListItemButton>

            {tieneHijos && (
                <Collapse in={abierto} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {nodo.hijos.map((hijo) => (
                            <ItemArbol
                                key={hijo.id}
                                nodo={hijo}
                                isChecked={isChecked}
                                toggleCheck={toggleCheck}
                                nivel={nivel + 1}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    );
};

function AdminEmpleados() {

    // Estados de datos
    const [empleados, setEmpleados] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [departamentos, setDepartamentos] = useState([])
    const [cencos, setCencos] = useState([])
    const [turnos, setTurnos] = useState([])
    const [cargos, setCargos] = useState([])
    const [cargando, setCargando] = useState(false);



    // Estados de paginacion y filtrado
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepartamento, setFiltroDepartamento] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("")
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(8);

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNumFicha, setNuevoNumFicha] = useState("");
    const [nuevoLetraFicha, setNuevoLetraFicha] = useState("");
    const [nuevoClave, setNuevoClave] = useState("")
    const [nuevoRun, setNuevoRun] = useState("")
    const [nuevoNombre, setnuevoNombre] = useState("")
    const [nuevoApPaterno, setNuevoApPaterno] = useState("")
    const [nuevoApMaterno, setNuevoApMaterno] = useState("")
    const [nuevoFechaNacimiento, setNuevoFechaNacimiento] = useState(null);
    const [nuevoEmpresa, setNuevoEmpresa] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")
    const [nuevoAutorizaAusencia, setnuevoAutorizaAusencia] = useState("")
    const [nuevoDireccion, setNuevoDireccion] = useState("")
    const [nuevoRegion, setNuevoRegion] = useState("")
    const [nuevoComuna, setNuevoComuna] = useState("")
    const [nuevoFechaInicioContrato, setNuevoFechaInicioContrato] = useState(null);
    const [nuevoFechaTerminoContrato, setNuevoFechaTerminoContrato] = useState(null)
    const [nuevoArt22, setNuevoArt22] = useState("")
    const [nuevoContratoIndefinido, setNuevoContratoIndefinido] = useState(null)
    const [nuevoEmailPersonal, setNuevoEmailPersonal] = useState("")
    const [nuevoSexo, setNuevoSexo] = useState("")
    const [nuevoTelefonoFijo, setNuevoTelefonoFijo] = useState("")
    const [nuevoTelefonoMovil, setNuevoTelefonoMovil] = useState("")
    const [nuevoTurno, setNuevoturno] = useState("")
    const [nuevoCargo, setNuevoCargo] = useState("")
    const [nuevoEmailLaboral, setNuevoEmailLaboral] = useState("")
    const [dominio, setDominio] = useState("")
    const [dominioPersonal, setDominioPersonal] = useState("")
    const [nuevoPermiteR,setNuevoPermiteR] = useState("")

    const [nuevoDepartamento, setNuevoDepartamento] = useState("")
    const [nuevoCenco, setNuevoCenco] = useState("")

    const [comunasFiltradasCrear, setComunasFiltradasCrear] = useState([]);

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editId, setEditId] = useState("")

    const [editNumFicha, setEditNumFicha] = useState("")
    const [editLetraFicha, setEditLetraFicha] = useState("")
    const [editRun, setEditRun] = useState("")
    const [editClave, setEditClave] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editApPaterno, setEditApPaterno] = useState("")
    const [editApMaterno, setEditApMaterno] = useState("")
    const [editFechaNacimiento, setEditFechaNacimiento] = useState(null)
    const [editEmpresa, setEditEmpresa] = useState("")
    const [editDepartamento, setEditDepartamento] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editAutorizaAusencia, setEditAutorizaAusencia] = useState("")
    const [editCenco, setEditCenco] = useState("")
    const [editDireccion, setEditDireccion] = useState("")
    const [editRegion, setEditRegion] = useState("")
    const [editComuna, setEditComuna] = useState("")
    const [editFechaInicioContrato, setEditFechaInicioContrato] = useState(null)
    const [editEmail, setEditEmail] = useState("")
    const [editFechaTerminoContrato, setEditFechaTerminoContrato] = useState(null)
    const [editArt22, setEditArt22] = useState("")
    const [editContratoIndefinido, setEditContratoIndefinido] = useState(null)
    const [editEmailPersonal, setEditEmailPersonal] = useState("")
    const [editSexo, setEditSexo] = useState("")
    const [editTelefonoFijo, setEditTelefonoFijo] = useState("")
    const [editTelefonoMovil, setEditTelefonoMovil] = useState("")
    const [editTurno, setEditTurno] = useState("")
    const [editCargo, setEditCargo] = useState("")
    const [comunasFiltradasEdit, setComunasFiltradasEdit] = useState([])
    const [editEmailLaboral, setEditEmailLaboral] = useState("")
    const [editDominio, setEditDominio] = useState("")
    const [editDominioPersonal, setEditDominioPersonal] = useState("")
    const [editPermiteR, setEditPermiteR] = useState("")

    // Estados dialogs emails
    const [openDialogEmail, setOpenDialogEmail] = useState(false)
    const [openDialogEmailPersonal, setOpenDialogEmailPersonal] = useState(false)

    // Estados nueva asignacion (Genérica)
    const [itemsRight, setItemsRight] = useState([]);
    const [itemsLeft, setItemsLeft] = useState([]);
    const [abrirAsignacion, setAbrirAsignacion] = useState(false);
    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);

    // Estados Asignar Cencos
    const [abrirAsignar, setAbrirAsignar] = useState(false);
    const [seleccionados, setSeleccionados] = useState([]);
    const cerrarAsignar = () => {
        setAbrirAsignar(false);
        setSeleccionados([]);
    }

    const obtenerIdsDescendientes = (nodo) => {
        let ids = [nodo.id];
        if (nodo.hijos && nodo.hijos.length > 0) {
            nodo.hijos.forEach(hijo => {
                ids = [...ids, ...obtenerIdsDescendientes(hijo)];
            });
        }
        return ids;
    };

    // Carga de datos
    const [proveedorCorreo, setProveedorCorreo] = useState([])

    const llamarDatosParaFiltrado = async () => {
        try {
            const respuestaEmpresa = await obtenerEmpresas()
            setEmpresas(respuestaEmpresa)
            const respuestaDepto = await obtenerDepartamentos()
            setDepartamentos(respuestaDepto)
            const respuestaCenco = await obtenerCentroCostos()
            setCencos(respuestaCenco)
            const respuestaTurno = await obtenerTurnos()
            setTurnos(respuestaTurno)
            const respuestacargo = await obtenerCargos()
            setCargos(respuestacargo)
            const repuestaProveedorcorreo = await obtenerProveedorCorreo()
            setProveedorCorreo(repuestaProveedorcorreo)

        } catch (error) {
            toast.error(error.message)
        }
    }

    const llamarEmpleados = async () => {
        try {
            const respuesta = await obtenerEmpleados()
            setEmpleados(respuesta)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const clickCrear = async () => {
        try {
            setCargando(true);
            const datosParaEnviar = {

                run: nuevoRun,
                nombres: nuevoNombre,
                apellido_paterno: nuevoApPaterno,
                apellido_materno: nuevoApMaterno,
                fecha_nacimiento: nuevoFechaNacimiento ? nuevoFechaNacimiento.toISOString() : null,
                direccion: nuevoDireccion,
                email: nuevoEmailPersonal && dominioPersonal ? `${nuevoEmailPersonal}${dominioPersonal}` : null,
                sexo: nuevoSexo,
                telefono_fijo: nuevoTelefonoFijo ? Number(nuevoTelefonoFijo) : null,
                telefono_movil: nuevoTelefonoMovil ? Number(nuevoTelefonoMovil) : null,
                comuna: nuevoComuna,
                fecha_ini_contrato: nuevoFechaInicioContrato ? nuevoFechaInicioContrato.toISOString() : null,
                contrato_indefinido: nuevoContratoIndefinido,
                fecha_fin_contrato: nuevoContratoIndefinido === true
                    ? "3000-12-31T00:00:00.000Z"
                    : (nuevoFechaTerminoContrato ? nuevoFechaTerminoContrato.toISOString() : null),
                art_22: nuevoArt22,
                autoriza_ausencia: nuevoAutorizaAusencia,
                clave: nuevoClave,
                empresa: nuevoEmpresa,
                cargo: nuevoCargo,
                turno: nuevoTurno ? nuevoTurno : null,
                estado: nuevoEstado,
                email_laboral: nuevoEmailLaboral && dominio ? `${nuevoEmailLaboral}${dominio}` : null,
                num_ficha: nuevoNumFicha ? `${nuevoNumFicha}${nuevoLetraFicha}` : null,
                cenco_id: nuevoCenco,
                permite_rotativo: nuevoPermiteR
            };
            const resultado = await crearEmpleado(datosParaEnviar);
            toast.success("Empleado creado exitosamente");
            cerrarDialog();
            llamarEmpleados();
            setNuevoNumFicha("");
            setNuevoLetraFicha("");
            setNuevoClave("");
            setNuevoRun("");
            setnuevoNombre("");
            setNuevoApPaterno("");
            setNuevoApMaterno("");
            setNuevoFechaNacimiento(null);
            setNuevoEstado("");
            setnuevoAutorizaAusencia("");
            setNuevoDireccion("");
            setNuevoRegion("");
            setNuevoComuna("");
            setNuevoFechaInicioContrato(null);
            setNuevoFechaTerminoContrato(null);
            setNuevoArt22("");
            setNuevoContratoIndefinido(null);
            setNuevoEmailPersonal("");
            setNuevoSexo("");
            setNuevoTelefonoFijo("");
            setNuevoTelefonoMovil("");
            setNuevoturno("");
            setNuevoCargo("");
            setNuevoEmailLaboral("");
            setNuevoDepartamento("");
            setNuevoCenco("");
            setNuevoPermiteR("");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setCargando(false);
        }
    };

    const clickEditar = async () => {
        try {
            const datosEmpleado = {
                run: editRun,
                nombres: editNombre,
                apellido_paterno: editApPaterno,
                apellido_materno: editApMaterno,
                fecha_nacimiento: editFechaNacimiento ? editFechaNacimiento.toISOString() : null,
                direccion: editDireccion,
                email: editEmailPersonal && editDominioPersonal ? `${editEmailPersonal}${editDominioPersonal}` : null,
                sexo: editSexo,
                telefono_fijo: editTelefonoFijo ? Number(editTelefonoFijo) : null,
                telefono_movil: editTelefonoMovil ? Number(editTelefonoMovil) : null,
                comuna: editComuna,
                fecha_ini_contrato: editFechaInicioContrato ? editFechaInicioContrato.toISOString() : null,
                contrato_indefinido: editContratoIndefinido,
                fecha_fin_contrato: editContratoIndefinido === true
                    ? "3000-12-31T00:00:00.000Z"
                    : (editFechaTerminoContrato ? editFechaTerminoContrato.toISOString() : null),
                art_22: editArt22,
                autoriza_ausencia: editAutorizaAusencia,
                clave: editClave,
                empresa: editEmpresa,
                cargo: editCargo,
                turno: editTurno ? editTurno : null,
                estado: editEstado,
                email_laboral: editEmailLaboral && editDominio ? `${editEmailLaboral}${editDominio}` : null,
                num_ficha: editNumFicha ? `${editNumFicha}${editLetraFicha}` : null,
                cenco_id: editCenco,
                permite_rotativo: editPermiteR
            };

            const respuesta = await actualizarEmpleado(editId, datosEmpleado);
            toast.success("Empleado actualizado exitosamente");
            llamarEmpleados();
            closeDialogEdit(true)
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Manejo de dialogs
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

    const cerrarDialog = () => {
        setOpen(false);
        setNuevoRun("");
        setNuevoNumFicha("");
        setNuevoLetraFicha("");
        setnuevoNombre(""); setNuevoEmpresa("");
        setNuevoEstado(""); setNuevoDireccion("");
        setNuevoEmailPersonal(""); setNuevoRegion("");
        setNuevoComuna("");
        setNuevoDepartamento(""); setNuevoCenco("");
        setNuevoPermiteR("");
    }

    const closeDialogEdit = () => { setOpenEdit(false) }

    const closeDialogEmail = () => { setOpenDialogEmail(false) }
    const closeDialogEmailPersonal = () => { setOpenDialogEmailPersonal(false) }

    // Utilidades y validaciones
    const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const calcularDV = (cuerpo) => {
        let suma = 0;
        let multiplicador = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = 11 - (suma % 11);
        if (resto === 11) return '0';
        if (resto === 11) return 'K';
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

    // Logica nueva asignacion (Genérica)
    const abrirDialogAsignacionHandler = () => {
        setItemsSeleccionados([]);
        setAbrirAsignacion(true);
    };

    const cerrarDialogAsignacion = () => {
        setAbrirAsignacion(false);
    };

    const guardarAsignacion = async () => {

        setAbrirAsignacion(false);
    };

    const intersectionItems = (a, b) =>
        a.filter((aItem) => b.some((bItem) => aItem.item_id === bItem.item_id));

    const notItems = (a, b) =>
        a.filter((aItem) => !b.some((bItem) => aItem.item_id === bItem.item_id));

    const handleToggleItem = (item) => () => {
        const nuevaListaCheck = [...itemsSeleccionados];
        const indiceActual = itemsSeleccionados.indexOf(item);

        if (indiceActual === -1) {
            nuevaListaCheck.push(item);
        } else {
            nuevaListaCheck.splice(indiceActual, 1);
        }
        setItemsSeleccionados(nuevaListaCheck);
    };

    const handleAllRightItems = () => {
        setItemsRight(itemsRight.concat(itemsLeft));
        setItemsLeft([]);
    };

    const handleCheckedRightItems = () => {
        const leftChecked = intersectionItems(itemsSeleccionados, itemsLeft);
        setItemsRight(itemsRight.concat(leftChecked));
        setItemsLeft(notItems(itemsLeft, leftChecked));
        setItemsSeleccionados(notItems(itemsSeleccionados, leftChecked));
    };

    const handleCheckedLeftItems = () => {
        const rightChecked = intersectionItems(itemsSeleccionados, itemsRight);
        setItemsLeft(itemsLeft.concat(rightChecked));
        setItemsRight(notItems(itemsRight, rightChecked));
        setItemsSeleccionados(notItems(itemsSeleccionados, rightChecked));
    };

    const handleAllLeftItems = () => {
        setItemsLeft(itemsLeft.concat(itemsRight));
        setItemsRight([]);
    };

    const customListItems = (items) => (
        <List dense component="div" role="list">
            {items.map((value) => {
                const labelId = `transfer-list-item-${value.item_id}-label`;

                return (
                    <ListItem key={value.item_id} role="listitem" button onClick={handleToggleItem(value)}>
                        <ListItemIcon>
                            <Checkbox
                                checked={itemsSeleccionados.indexOf(value) !== -1}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            id={labelId}
                            primary={value.nombre || "Nombre Item"}
                            secondary={value.descripcion || "Descripción Item"}
                        />
                    </ListItem>
                );
            })}
        </List>
    );


    // Filtrado y paginacion
    const empleadosFiltrados = empleados.filter((emp) => {
        const textoBusqueda = `${emp.run || ''}${emp.nombres || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        const coincideEmpresa = filtroEmpresa ? emp.empresa?.empresa_id === filtroEmpresa : true
        const coincideDepartamento = filtroDepartamento ? emp.departamento?.departamento_id === filtroDepartamento : true
        const coincideCenco = filtroCenco ? emp.departamento?.departamento_id === filtroCenco : true
        const coincideEstado = filtroEstado ? emp.estado?.estado_id === filtroEstado : true
        return coincideTexto && coincideEstado && coincideDepartamento && coincideCenco && coincideEmpresa
    });

    const handleChangePage = (event, newPage) => { setPagina(newPage); };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        llamarDatosParaFiltrado()
    }, [])

    useEffect(() => {
        llamarEmpleados()
    }, [])

    useEffect(() => { setPagina(0); }, [busqueda, filtroEmpresa, filtroEstado]);


    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">Admin Empleados</Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{ p: 2, width: "100%", bgcolor: "#FFFFFD", borderRadius: 2, maxWidth: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden", boxSizing: "border-box" }}>

                {/* Barra de busqueda y botones */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "200px" }, height: "40px", }}>
                        <TextField placeholder="Buscar..." variant="standard" InputProps={{ disableUnderline: true }} sx={{ ml: 1, flex: 1, px: 1 }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search"><SearchIcon /></IconButton>
                    </Paper>

                    {/* Filtro de empresa */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130, }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroEmpresa} onChange={(e) => { setFiltroEmpresa(e.target.value); setFiltroDepartamento(""); setFiltroCenco("") }} label="Empresa">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                    {emp.nombre_empresa}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filtro de estado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 130 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "20vh" }} label="Estado" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}>Activo</MenuItem>
                            <MenuItem value={2}>Inactivo</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>Nuevo Registro</Button>
                </Box>

                {/* Tabla principal */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative", }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 1650 }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width={150} align="center"><strong>Num Ficha</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Cargo</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Email Laboral</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Email Personal</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Inicio Contrato</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Fin Contrato</strong></TableCell>
                                    <TableCell width={200} align="center"><strong>Turno</strong></TableCell>
                                    <TableCell width={200} align="center"><strong>Permite Turno Rotativo</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell align="center"><strong>Creador</strong></TableCell>
                                    <TableCell align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>


                            <TableBody>
                                {empleadosFiltrados.length > 0 ? (
                                    empleadosFiltrados.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((e) => (
                                        <TableRow key={e.empleado_id} >
                                            <TableCell align="center">
                                                {e.num_ficha} {e.letra_ficha}
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.nombres}
                                            </TableCell>
                                            <TableCell align="center">
                                                <CircleIcon
                                                    sx={{
                                                        fontSize: '1rem',
                                                        color: e.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.cargo?.nombre}
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton onClick={() => {
                                                    setOpenDialogEmail(true),
                                                        setEditEmailLaboral(e.email_laboral || "")
                                                }}>
                                                    <DraftsIcon>

                                                    </DraftsIcon>
                                                </IconButton>
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton onClick={() => {
                                                    setOpenDialogEmailPersonal(true),
                                                        setEditEmailPersonal(e.email)
                                                }}>
                                                    <DraftsIcon>

                                                    </DraftsIcon>
                                                </IconButton>
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.fecha_ini_contrato}
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.fecha_fin_contrato}
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.turno?.nombre}
                                            </TableCell>

                                            <TableCell align="center">
                                                {e.permite_rotativo ? "Si" : "No"}
                                            </TableCell>

                                            <TableCell align="center">
                                                ?
                                            </TableCell>
                                            <TableCell align="center">
                                                ?
                                            </TableCell>

                                            <TableCell align="center">
                                                ?
                                            </TableCell>

                                            <TableCell>
                                                <IconButton onClick={() => {
                                                    setEditId(e.empleado_id),
                                                        setOpenEdit(true)

                                                    const fichaStr = e.num_ficha || "";
                                                    let letra = "";
                                                    let fichaBase = fichaStr;
                                                    if (fichaStr.length > 0) {
                                                        const lastChar = fichaStr.charAt(fichaStr.length - 1).toUpperCase();
                                                        if (['A', 'B', 'C'].includes(lastChar)) {
                                                            letra = lastChar;
                                                            fichaBase = fichaStr.slice(0, -1);
                                                        }
                                                    }
                                                    setEditLetraFicha(letra);
                                                    setEditNumFicha(fichaBase);
                                                    setEditPermiteR(e.permite_rotativo);
                                                    setEditRun(e.run || "");
                                                    setEditNombre(e.nombres || "");
                                                    setEditApPaterno(e.apellido_paterno || "");
                                                    setEditApMaterno(e.apellido_materno || "");
                                                    setEditFechaNacimiento(e.fecha_nacimiento ? dayjs(e.fecha_nacimiento) : null);
                                                    setEditFechaInicioContrato(e.fecha_ini_contrato ? dayjs(e.fecha_ini_contrato) : null);
                                                    setEditFechaTerminoContrato(e.fecha_fin_contrato ? dayjs(e.fecha_fin_contrato) : null);
                                                    setEditEstado(e.estado?.estado_id);
                                                    setEditClave(e.clave)
                                                    setEditAutorizaAusencia(e.autoriza_ausencia);
                                                    setEditDireccion(e.direccion || "");
                                                    const objComuna = comunas.find(c => c.nombre === e.comuna);
                                                    if (objComuna) {
                                                        setEditRegion(objComuna.regionId);
                                                        setComunasFiltradasEdit(comunas.filter(c => c.regionId === objComuna.regionId));
                                                    } else {
                                                        setEditRegion("");
                                                        setComunasFiltradasEdit([]);
                                                    }
                                                    if (e.email_laboral && e.email_laboral.includes("@")) {
                                                        const parts = e.email_laboral.split("@");
                                                        setEditEmailLaboral(parts[0]);
                                                        setEditDominio(`@${parts[1]}`);
                                                    } else {
                                                        setEditEmailLaboral("");
                                                        setEditDominio("");
                                                    }

                                                    setEditEmpresa(e.empresa?.empresa_id)
                                                    setEditSexo(e.sexo === "M" ? "M" : "F")
                                                    setEditComuna(e.comuna || "");
                                                    setEditArt22(e.art_22);
                                                    setEditContratoIndefinido(e.contrato_indefinido);
                                                    if (e.email && e.email.includes("@")) {
                                                        const partsPersonal = e.email.split("@");
                                                        setEditEmailPersonal(partsPersonal[0]);
                                                        setEditDominioPersonal(`@${partsPersonal[1]}`);
                                                    } else {
                                                        setEditEmailPersonal(e.email || "");
                                                        setEditDominioPersonal("");
                                                    }
                                                    setEditTelefonoFijo(e.telefono_fijo ? String(e.telefono_fijo) : "");
                                                    setEditTelefonoMovil(e.telefono_movil ? String(e.telefono_movil) : "");

                                                    const turnoActualId = e.turno?.turno_id || "";
                                                    const cencoAsociado = e.cenco?.cenco_id || "";
                                                    const deptoAsociado = e.cenco?.departamento_id || "";

                                                    setEditDepartamento(deptoAsociado);
                                                    setEditCenco(cencoAsociado);
                                                    setEditTurno(turnoActualId);
                                                    setEditCargo(e.cargo?.cargo_id || "");
                                                }}>
                                                    <EditIcon>

                                                    </EditIcon>
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
                <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={empleadosFiltrados.length} rowsPerPage={filaPorPagina} page={pagina} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Paginas" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`} />
            </Paper >

            {/* Dialog email laboral */}
            < Dialog sx={{ textAlign: "center" }
            } open={openDialogEmail} >
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle>Email Laboral</DialogTitle>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '40px',
                                            p: 0.5,
                                            color: '#424242',
                                            mb: 2
                                        }}
                                    >
                                        {editEmailLaboral}
                                    </Typography>
                                </Box>
                                <Button variant="outlined" color="error" onClick={closeDialogEmail}>cerrar</Button>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >

            {/* Dialog email personal */}
            < Dialog sx={{ textAlign: "center" }} open={openDialogEmailPersonal}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle>Email</DialogTitle>
                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '40px',
                                            p: 0.5,
                                            color: '#424242',
                                            mb: 2
                                        }}
                                    >
                                        {editEmailPersonal}
                                    </Typography>
                                </Box>
                                <Button variant="outlined" color="error" onClick={closeDialogEmailPersonal}>cerrar</Button>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog >

            {/* Dialog crear */}
            < Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Empleado</DialogTitle>


                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Run"
                                    placeholder="12345678-K"
                                    size="small"
                                    value={nuevoRun}
                                    onChange={(e) => {
                                        const formatted = formatearRut(e.target.value);
                                        setNuevoRun(formatted);
                                        setNuevoNumFicha(formatted);
                                    }}
                                    inputProps={{ maxLength: 12 }}
                                    error={nuevoRun.length > 0 && !esRutValido(nuevoRun)}
                                    helperText={
                                        nuevoRun.trim() === ""
                                            ? "El Run es obligatorio"
                                            : (!esRutValido(nuevoRun) ? "RUT inválido" : "")
                                    }
                                />
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Ficha"
                                    size="small"
                                    value={nuevoNumFicha}
                                    disabled
                                    onChange={(e) => setNuevoNumFicha(e.target.value)}
                                    helperText="Autocompletado con el RUN"
                                />
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Letra</InputLabel>
                                    <Select
                                        label="Letra"
                                        value={nuevoLetraFicha}
                                        onChange={(e) => setNuevoLetraFicha(e.target.value)}
                                    >
                                        <MenuItem value="">-</MenuItem>
                                        <MenuItem value="A">A</MenuItem>
                                        <MenuItem value="B">B</MenuItem>
                                        <MenuItem value="C">C</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Nombres" size="small" value={nuevoNombre} onChange={(e) => setnuevoNombre(e.target.value)} helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""} />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Apellido Paterno" size="small" value={nuevoApPaterno} onChange={(e) => setNuevoApPaterno(e.target.value)} helperText={nuevoApPaterno.trim() === "" ? "El Apellido paterno es obligatorio" : ""} />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Apellido Materno" size="small" value={nuevoApMaterno} onChange={(e) => setNuevoApMaterno(e.target.value)} helperText={nuevoApMaterno.trim() === "" ? "El Apellido materno es obligatorio" : ""} />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha de nacimiento"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaNacimiento}
                                        onChange={(newValue) => setNuevoFechaNacimiento(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !nuevoFechaNacimiento ? "La fecha de nacimiento es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField fullWidth label="Dirección" size="small" value={nuevoDireccion} onChange={(e) => setNuevoDireccion(e.target.value)} helperText={nuevoDireccion.trim() === "" ? "La dirección es obligatoria" : ""} />
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Email Personal"
                                    size="small"
                                    value={nuevoEmailPersonal}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/@/g, "");
                                        setNuevoEmailPersonal(val);
                                    }}
                                    helperText={
                                        nuevoEmailPersonal.trim() === ""
                                            ? "El email es obligatorio"
                                            : ""
                                    }
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select
                                        label="Dominio"
                                        value={dominioPersonal}
                                        onChange={(e) => setDominioPersonal(e.target.value)}
                                    >
                                        {proveedorCorreo
                                            .filter(p => !p.empresa || p.empresa === null)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>
                                                    {prov.dominio}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>



                            <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                <InputLabel>Sexo</InputLabel>
                                <Select label="Sexo" value={nuevoSexo} onChange={(e) => setNuevoSexo(e.target.value)}>
                                    <MenuItem value={"M"}>
                                        Masculino
                                    </MenuItem>
                                    <MenuItem value={"F"}>
                                        Femenino
                                    </MenuItem>
                                </Select>
                                {!nuevoSexo && (
                                    <FormHelperText>El sexo es obligatorio</FormHelperText>
                                )}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Teléfono fijo"
                                    placeholder="937463524"
                                    value={nuevoTelefonoFijo}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                        setNuevoTelefonoFijo(value);
                                    }}
                                    inputProps={{
                                        maxLength: 9,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    helperText={
                                        nuevoTelefonoFijo.length === 0
                                            ? "El teléfono fijo es obligatorio"
                                            : nuevoTelefonoFijo.length !== 9
                                                ? "Debe tener 9 números"
                                                : ""
                                    }
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Teléfono movil"
                                    value={nuevoTelefonoMovil}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                        setNuevoTelefonoMovil(value);
                                    }}
                                    inputProps={{
                                        maxLength: 9,
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                +56
                                            </InputAdornment>
                                        ),
                                    }}
                                    helperText={
                                        nuevoTelefonoMovil.length === 0
                                            ? "El teléfono Movil es obligatorio"
                                            : nuevoTelefonoMovil.length !== 9
                                                ? "Debe tener 9 números"
                                                : ""
                                    }
                                />
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
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Clave (4 dígitos)
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <TextField
                                            key={index}
                                            id={`otp-${index}`}
                                            size="small"
                                            value={nuevoClave[index] || ""}
                                            inputProps={{
                                                maxLength: 1,
                                                style: { textAlign: 'center', width: '30px', padding: '8px' }
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!/^\d*$/.test(val)) return;

                                                const nuevaClaveArray = nuevoClave.split("");
                                                nuevaClaveArray[index] = val;
                                                const resultado = nuevaClaveArray.join("").slice(0, 4);
                                                setNuevoClave(resultado);

                                                if (val && index < 3) {
                                                    document.getElementById(`otp-${index + 1}`).focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !nuevoClave[index] && index > 0) {
                                                    document.getElementById(`otp-${index - 1}`).focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>

                                {nuevoClave.length < 4 && (
                                    <FormHelperText error={false} sx={{ mt: 1, textAlign: 'center' }}>
                                    </FormHelperText>
                                )}
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Estado</InputLabel>
                                <Select label="Estado" value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
                                    <MenuItem value={1}>Vigente</MenuItem>
                                    <MenuItem value={2}>No Vigente</MenuItem>
                                </Select>
                                {nuevoEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha Inicio Contrato"
                                        format="DD-MM-YYYY"
                                        value={nuevoFechaInicioContrato}
                                        onChange={(newValue) => setNuevoFechaInicioContrato(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !nuevoFechaInicioContrato ? "La fecha de Inicio de contrato es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Contrato indefinido</InputLabel>
                                <Select
                                    label="Contrato indefinido"
                                    value={nuevoContratoIndefinido}
                                    onChange={(e) => setNuevoContratoIndefinido(e.target.value)}
                                >
                                    <MenuItem value={true}>Si</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>

                                {(nuevoContratoIndefinido === "" || nuevoContratoIndefinido === null) && (
                                    <FormHelperText>El contrato indefinido es obligatorio</FormHelperText>
                                )}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        disabled={nuevoContratoIndefinido === true}
                                        label="Fecha término Contrato"
                                        format="DD-MM-YYYY"
                                        value={
                                            nuevoContratoIndefinido === true
                                                ? dayjs("3000-12-31")
                                                : (nuevoFechaTerminoContrato ? dayjs(nuevoFechaTerminoContrato) : null)
                                        }
                                        onChange={(newValue) => setNuevoFechaTerminoContrato(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                error: false,
                                                helperText: (nuevoContratoIndefinido !== true && !nuevoFechaTerminoContrato)
                                                    ? "La fecha de terino es obligatoria"
                                                    : ""
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                <InputLabel>Art. 22</InputLabel>
                                <Select label="Art .22" value={nuevoArt22} onChange={(e) => setNuevoArt22(e.target.value)}>
                                    <MenuItem value={true}>
                                        Si
                                    </MenuItem>
                                    <MenuItem value={false}>
                                        No
                                    </MenuItem>
                                </Select>
                                {(nuevoArt22 === "" || nuevoArt22 === null) && (
                                    <FormHelperText>El Art 22 es obligatorio</FormHelperText>
                                )}
                            </FormControl>


                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    label="Empresa"
                                    value={nuevoEmpresa}
                                    onChange={(e) => {
                                        setNuevoEmpresa(e.target.value);
                                        setNuevoDepartamento("");
                                        setNuevoCenco("");
                                        setNuevoturno("");
                                    }}
                                >
                                    {empresas.map((emp) => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                            {emp.nombre_empresa}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {nuevoEmpresa === "" && <FormHelperText>La Empresa es obligatoria</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Email Laboral"
                                    size="small"
                                    value={nuevoEmailLaboral}
                                    onChange={(e) => {
                                        // Evitar que ingrese @
                                        const val = e.target.value.replace(/@/g, "");
                                        setNuevoEmailLaboral(val);
                                    }}
                                    helperText={
                                        nuevoEmailLaboral.trim() === ""
                                            ? "El email es obligatorio"
                                            : ""
                                    }
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select
                                        label="Dominio"
                                        value={dominio}
                                        onChange={(e) => setDominio(e.target.value)}
                                        disabled={!nuevoEmpresa}
                                    >
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === nuevoEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>
                                                    {prov.dominio}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Departamento</InputLabel>
                                <Select
                                    label="Departamento"
                                    value={nuevoDepartamento}
                                    onChange={(e) => {
                                        setNuevoDepartamento(e.target.value);
                                        setNuevoCenco("");
                                        setNuevoturno("");
                                    }}
                                    disabled={!nuevoEmpresa}
                                >
                                    {departamentos
                                        .filter(dep => dep.empresa?.empresa_id === nuevoEmpresa)
                                        .map((dep) => (
                                            <MenuItem key={dep.departamento_id} value={dep.departamento_id}>
                                                {dep.nombre_departamento}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Centro de Costo</InputLabel>
                                <Select
                                    label="Centro de Costo"
                                    value={nuevoCenco}
                                    onChange={(e) => {
                                        const cencoId = e.target.value;
                                        setNuevoCenco(cencoId);
                                        setNuevoturno("");
                                        const cencoSel = cencos.find(c => c.cenco_id === cencoId);
                                        if (cencoSel && !cencoSel.permite_turno_r) {
                                            setNuevoPermiteR(false);
                                        }
                                    }}
                                    disabled={!nuevoDepartamento}
                                >
                                    {cencos
                                        .filter(cen => cen.departamento?.departamento_id === nuevoDepartamento)
                                        .map((cen) => (
                                            <MenuItem key={cen.cenco_id} value={cen.cenco_id}>
                                                {cen.nombre_cenco}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                <InputLabel>Permite Rotativo</InputLabel>
                                <Select 
                                    label="Permite Rotativo" 
                                    value={nuevoPermiteR} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNuevoPermiteR(val);
                                        if (val === true) setNuevoturno("");
                                    }}
                                    disabled={!nuevoCenco || !cencos.find(c => c.cenco_id === nuevoCenco)?.permite_turno_r}
                                >
                                    <MenuItem value={true}>
                                        Si
                                    </MenuItem>
                                    <MenuItem value={false}>
                                        No
                                    </MenuItem>
                                </Select>
                                {(nuevoPermiteR === "" || nuevoPermiteR === null) && (
                                    <FormHelperText>El Permite Rotativo es obligatorio</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Turno (Opcional)</InputLabel>
                                <Select
                                    label="Turno (Opcional)"
                                    value={nuevoTurno}
                                    onChange={(e) => setNuevoturno(e.target.value)}
                                    disabled={!nuevoCenco || nuevoPermiteR === true}
                                >
                                    {(() => {
                                        const cencoSeleccionado = cencos.find(c => c.cenco_id === nuevoCenco);
                                        const turnosDelCenco = cencoSeleccionado && cencoSeleccionado.turnos ? cencoSeleccionado.turnos : [];
                                        const options = turnosDelCenco.map((turn) => (
                                            <MenuItem key={turn.turno_id} value={turn.turno_id}>
                                                {turn.nombre}
                                            </MenuItem>
                                        ));
                                        options.unshift(<MenuItem key="ninguno" value=""><em>Ninguno</em></MenuItem>);
                                        return options;
                                    })()}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                <InputLabel>Cargo</InputLabel>
                                <Select label="Cargo" value={nuevoCargo} onChange={(e) => setNuevoCargo(e.target.value)}>
                                    {cargos.filter(car => car.empresa?.empresa_id === nuevoEmpresa).map((car) => (
                                        <MenuItem key={car.cargo_id} value={car.cargo_id}>
                                            {car.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {nuevoCargo === "" && <FormHelperText>El Cargo es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                <InputLabel>Autoriza ausencias</InputLabel>
                                <Select label="Autoriza ausencias" value={nuevoAutorizaAusencia} onChange={(e) => setnuevoAutorizaAusencia(e.target.value)}>
                                    <MenuItem value={true}>
                                        Si
                                    </MenuItem>
                                    <MenuItem value={false}>
                                        No
                                    </MenuItem>
                                </Select>
                                {!nuevoAutorizaAusencia && (
                                    <FormHelperText>El Autoriza ausencia es obligatorio</FormHelperText>
                                )}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent >
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrear}
                        variant="contained"
                        color="primary"
                        disabled={
                            nuevoRun.trim() === "" ||
                            !esRutValido(nuevoRun) ||
                            nuevoNombre.trim() === "" ||
                            nuevoApPaterno.trim() === "" ||
                            nuevoApMaterno.trim() === "" ||
                            nuevoDireccion.trim() === "" ||
                            !nuevoFechaNacimiento ||
                            nuevoTelefonoFijo.length !== 9 ||
                            nuevoTelefonoMovil.length !== 9 ||
                            !nuevoSexo ||
                            nuevoRegion === "" ||
                            nuevoComuna === "" ||
                            nuevoEstado === "" ||
                            !nuevoFechaInicioContrato ||
                            !nuevoContratoIndefinido && nuevoContratoIndefinido !== false && nuevoContratoIndefinido !== true ||
                            !nuevoArt22 && nuevoArt22 !== false && nuevoArt22 !== true ||
                            !nuevoPermiteR && nuevoPermiteR !== false && nuevoPermiteR !== true ||
                            nuevoEmpresa === "" ||
                            // Removemos nuevoTurno de los checks
                            nuevoCargo === "" ||
                            !nuevoAutorizaAusencia && nuevoAutorizaAusencia !== false && nuevoAutorizaAusencia !== true}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Dialog editar */}
            < Dialog open={openEdit} onClose={closeDialogEdit} sx={{ textAlign: "center" }
            }>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Empleado</DialogTitle>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Run"
                                    placeholder="12345678-K"
                                    size="small"
                                    value={editRun}
                                    onChange={(e) => {
                                        const formatted = formatearRut(e.target.value);
                                        setEditRun(formatted);
                                        setEditNumFicha(formatted);
                                    }}
                                    inputProps={{ maxLength: 12 }}
                                    error={editRun.length > 0 && !esRutValido(editRun)}
                                    helperText={
                                        editRun.trim() === ""
                                            ? "El Run es obligatorio"
                                            : (!esRutValido(editRun) ? "RUT inválido" : "")
                                    }
                                />
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Número de Ficha"
                                    size="small"
                                    value={editNumFicha}
                                    disabled
                                    onChange={(e) => setEditNumFicha(e.target.value)}
                                    helperText="Autocompletado con el RUN"
                                />
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Letra</InputLabel>
                                    <Select
                                        label="Letra"
                                        value={editLetraFicha}
                                        onChange={(e) => setEditLetraFicha(e.target.value)}
                                    >
                                        <MenuItem value="">-</MenuItem>
                                        <MenuItem value="A">A</MenuItem>
                                        <MenuItem value="B">B</MenuItem>
                                        <MenuItem value="C">C</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Nombres"
                                    size="small"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Apellido Paterno"
                                    size="small"
                                    value={editApPaterno}
                                    onChange={(e) => setEditApPaterno(e.target.value)}
                                    helperText={editNombre.trim() === "" ? "El Apellido paterno es obligatorio" : ""}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Apellido Materno"
                                    size="small"
                                    value={editApMaterno}
                                    onChange={(e) => setEditApMaterno(e.target.value)}
                                    helperText={editNombre.trim() === "" ? "El Apellido materno es obligatorio" : ""}
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha de nacimiento"
                                        format="DD-MM-YYYY"
                                        value={editFechaNacimiento}
                                        onChange={(newValue) => setEditFechaNacimiento(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !editFechaNacimiento ? "La fecha de nacimiento es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Dirección"
                                    size="small"
                                    value={editDireccion}
                                    onChange={(e) => setEditDireccion(e.target.value)}
                                    helperText={editDireccion.trim() === "" ? "La dirección es obligatoria" : ""}
                                />
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Email Personal"
                                    size="small"
                                    value={editEmailPersonal}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/@/g, "");
                                        setEditEmailPersonal(val);
                                    }}
                                    helperText={
                                        editEmailPersonal.trim() === ""
                                            ? "El email es obligatorio"
                                            : ""
                                    }
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select
                                        label="Dominio"
                                        value={editDominioPersonal}
                                        onChange={(e) => setEditDominioPersonal(e.target.value)}
                                    >
                                        {proveedorCorreo
                                            .filter(p => !p.empresa || p.empresa === null)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>
                                                    {prov.dominio}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>



                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Sexo</InputLabel>
                                <Select label="Sexo" value={editSexo} onChange={(e) => setEditSexo(e.target.value)}>
                                    <MenuItem value={"M"}>Masculino</MenuItem>
                                    <MenuItem value={"F"}>Femenino</MenuItem>
                                </Select>
                                {!editSexo && <FormHelperText>El sexo es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Teléfono fijo"
                                    value={editTelefonoFijo}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                        setEditTelefonoFijo(value);
                                    }}
                                    inputProps={{ maxLength: 9 }}
                                    helperText={
                                        String(editTelefonoFijo || "").length === 0
                                            ? "El teléfono fijo es obligatorio"
                                            : String(editTelefonoFijo || "").length !== 9
                                                ? "Debe tener 9 números"
                                                : ""
                                    }
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Teléfono movil"
                                    value={editTelefonoMovil}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                                        setEditTelefonoMovil(value);
                                    }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">+56</InputAdornment>,
                                    }}
                                    helperText={
                                        String(editTelefonoMovil || "").length === 0
                                            ? "El teléfono Movil es obligatorio"
                                            : String(editTelefonoMovil || "").length !== 9
                                                ? "Debe tener 9 números"
                                                : ""
                                    }
                                />
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
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Clave (4 dígitos)
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    {[0, 1, 2, 3].map((index) => (
                                        <TextField
                                            key={index}
                                            id={`otp-edit-${index}`}
                                            size="small"
                                            value={editClave ? editClave[index] || "" : ""}
                                            inputProps={{
                                                maxLength: 1,
                                                style: { textAlign: 'center', width: '30px', padding: '8px' }
                                            }}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!/^\d*$/.test(val)) return;

                                                const nuevaClaveArray = (editClave || "").split("");
                                                nuevaClaveArray[index] = val;
                                                const resultado = nuevaClaveArray.join("").slice(0, 4);
                                                setEditClave(resultado);

                                                if (val && index < 3) {
                                                    document.getElementById(`otp-edit-${index + 1}`).focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && (!editClave || !editClave[index]) && index > 0) {
                                                    document.getElementById(`otp-edit-${index - 1}`).focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>

                                {(editClave || "").length < 4 && (
                                    <FormHelperText error={false} sx={{ mt: 1, textAlign: 'center' }}>
                                    </FormHelperText>
                                )}
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Estado</InputLabel>
                                <Select label="Estado" value={editEstado} onChange={(e) => setEditEstado(e.target.value)}>
                                    <MenuItem value={1}>Vigente</MenuItem>
                                    <MenuItem value={2}>No Vigente</MenuItem>
                                </Select>
                                {editEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        label="Fecha Inicio Contrato"
                                        format="DD-MM-YYYY"
                                        value={editFechaInicioContrato}
                                        onChange={(newValue) => setEditFechaInicioContrato(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                required: true,
                                                helperText: !editFechaInicioContrato ? "La fecha de Inicio de contrato es obligatoria" : "",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Contrato indefinido</InputLabel>
                                <Select label="Contrato indefinido" value={editContratoIndefinido} onChange={(e) => setEditContratoIndefinido(e.target.value)}>
                                    <MenuItem value={true}>Si</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                                {(editContratoIndefinido === "" || editContratoIndefinido === null) && <FormHelperText>El contrato indefinido es obligatorio</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                        disabled={editContratoIndefinido === true}
                                        label="Fecha término Contrato"
                                        format="DD-MM-YYYY"
                                        value={editFechaTerminoContrato}
                                        onChange={(newValue) => setEditFechaTerminoContrato(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
                                                error: false,
                                                required: !editContratoIndefinido,
                                                helperText: editContratoIndefinido ? "" : "La fecha de Termino de contrato es obligatoria",
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Art. 22</InputLabel>
                                <Select label="Art .22" value={editArt22} onChange={(e) => setEditArt22(e.target.value)}>
                                    <MenuItem value={true}>Si</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                                {(editArt22 === "" || editArt22 === null) && <FormHelperText>El Art 22 es obligatorio</FormHelperText>}
                            </FormControl>


                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    label="Empresa"
                                    value={editEmpresa}
                                    onChange={(e) => {
                                        setEditEmpresa(e.target.value);
                                        setEditDepartamento("");
                                        setEditCenco("");
                                        setEditTurno("");
                                    }}
                                >
                                    {empresas.map((emp) => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                            {emp.nombre_empresa}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editEmpresa === "" && <FormHelperText>La Empresa es obligatoria</FormHelperText>}
                            </FormControl>

                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Email Laboral"
                                    size="small"
                                    value={editEmailLaboral}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/@/g, "");
                                        setEditEmailLaboral(val);
                                    }}
                                    helperText={
                                        editEmailLaboral.trim() === ""
                                            ? "El email es obligatorio"
                                            : ""
                                    }
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Dominio</InputLabel>
                                    <Select
                                        label="Dominio"
                                        value={editDominio}
                                        onChange={(e) => setEditDominio(e.target.value)}
                                        disabled={!editEmpresa}
                                    >
                                        {proveedorCorreo
                                            .filter(p => p.empresa?.empresa_id === editEmpresa)
                                            .map((prov) => (
                                                <MenuItem key={prov.id} value={prov.dominio}>
                                                    {prov.dominio}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Departamento</InputLabel>
                                <Select
                                    label="Departamento"
                                    value={editDepartamento}
                                    onChange={(e) => {
                                        setEditDepartamento(e.target.value);
                                        setEditCenco("");
                                        setEditTurno("");
                                    }}
                                    disabled={!editEmpresa}
                                >
                                    {departamentos
                                        .filter(dep => dep.empresa?.empresa_id === editEmpresa)
                                        .map((dep) => (
                                            <MenuItem key={dep.departamento_id} value={dep.departamento_id}>
                                                {dep.nombre_departamento}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Centro de Costo</InputLabel>
                                <Select
                                    label="Centro de Costo"
                                    value={editCenco}
                                    onChange={(e) => {
                                        const cencoId = e.target.value;
                                        setEditCenco(cencoId);
                                        setEditTurno("");
                                        const cencoSel = cencos.find(c => c.cenco_id === cencoId);
                                        if (cencoSel && !cencoSel.permite_turno_r) {
                                            setEditPermiteR(false);
                                        }
                                    }}
                                    disabled={!editDepartamento}
                                >
                                    {cencos
                                        .filter(cen => cen.departamento?.departamento_id === editDepartamento)
                                        .map((cen) => (
                                            <MenuItem key={cen.cenco_id} value={cen.cenco_id}>
                                                {cen.nombre_cenco}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Permite Rotativo</InputLabel>
                                <Select 
                                    label="Permite Rotativo" 
                                    value={editPermiteR} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setEditPermiteR(val);
                                        if (val === true) setEditTurno("");
                                    }}
                                    disabled={!editCenco || !cencos.find(c => c.cenco_id === editCenco)?.permite_turno_r}
                                >
                                    <MenuItem value={true}>
                                        Si
                                    </MenuItem>
                                    <MenuItem value={false}>
                                        No
                                    </MenuItem>
                                </Select>
                                {(editPermiteR === "" || editPermiteR === null) && (
                                    <FormHelperText>El Permite Rotativo es obligatorio</FormHelperText>
                                )}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Turno (Opcional)</InputLabel>
                                <Select
                                    label="Turno (Opcional)"
                                    value={editTurno}
                                    onChange={(e) => setEditTurno(e.target.value)}
                                    disabled={!editCenco || editPermiteR === true}
                                >
                                    <MenuItem value="">Sin Turno</MenuItem>
                                    {(() => {
                                        const cencoSeleccionado = cencos.find(c => c.cenco_id === editCenco);
                                        const turnosDelCenco = cencoSeleccionado && cencoSeleccionado.turnos ? cencoSeleccionado.turnos : [];
                                        return turnosDelCenco.map((turn) => (
                                            <MenuItem key={turn.turno_id} value={turn.turno_id}>
                                                {turn.nombre}
                                            </MenuItem>
                                        ));
                                    })()}
                                </Select>
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Cargo</InputLabel>
                                <Select label="Cargo" value={editCargo} onChange={(e) => setEditCargo(e.target.value)}>
                                    {cargos.filter(car => car.empresa?.empresa_id === editEmpresa).map((car) => (
                                        <MenuItem key={car.cargo_id} value={car.cargo_id}>
                                            {car.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editCargo === "" && <FormHelperText>El Cargo es obligatorio</FormHelperText>}
                            </FormControl>

                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Autoriza ausencias</InputLabel>
                                <Select label="Autoriza ausencias" value={editAutorizaAusencia} onChange={(e) => setEditAutorizaAusencia(e.target.value)}>
                                    <MenuItem value={true}>Si</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                                {(editAutorizaAusencia === "" || editAutorizaAusencia === null) && <FormHelperText>El Autoriza ausencia es obligatorio</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialogEdit} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={clickEditar}
                        disabled={
                            (editRun || "").trim() === "" ||
                            !esRutValido(editRun || "") ||
                            (editNombre || "").trim() === "" ||
                            (editApPaterno || "").trim() === "" ||
                            (editApMaterno || "").trim() === "" ||
                            (editDireccion || "").trim() === "" ||
                            !editFechaNacimiento ||
                            String(editTelefonoFijo || "").length !== 9 ||
                            String(editTelefonoMovil || "").length !== 9 ||
                            !editSexo ||
                            editRegion === "" ||
                            editComuna === "" ||
                            editEstado === "" ||
                            !editFechaInicioContrato ||
                            (!editContratoIndefinido && editContratoIndefinido !== false && editContratoIndefinido !== true) ||
                            (!editArt22 && editArt22 !== false && editArt22 !== true) ||
                            editEmpresa === "" ||
                            editCargo === "" ||
                            (!editAutorizaAusencia && editAutorizaAusencia !== false && editAutorizaAusencia !== true)
                        }
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >



        </>
    );
}
export default AdminEmpleados;