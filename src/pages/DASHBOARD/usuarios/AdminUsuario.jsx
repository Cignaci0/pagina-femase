import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination,
    FormHelperText
} from "@mui/material";

import { obtenerUsuarios, crearUsuario, actualizarUsuario } from "../../../services/usuariosServices"
import { obtenerPerfiles } from "../../../services/perfilUsuariosServices"
import { obtenerEmpresas } from "../../../services/empresasServices"
import { obtenerCentroCostos } from "../../../services/centroCostosServices"
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { obtenerProveedorCorreo } from "../../../services/proveedorCorreoServices"
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { asignarCencos } from "../../../services/asignaciones/asignacionesServices"


const ItemArbol = ({ nodo, isChecked, toggleCheck, nivel = 0, disabled = false }) => {
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
                    disabled={disabled}
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
                                disabled={disabled}
                            />
                        ))}
                    </List>
                </Collapse>
            )}
        </Box>
    );
};


function AdminUsuario() {

    // --- ESTADOS PAGINACIÓN ---
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // --- ESTADOS DIALOGOS ---
    const [open, setOpen] = useState(false);

    const abrirDialog = () => setOpen(true);
    const cerrarDialog = () => {
        setOpen(false),
            setRun(""), setEmailLocal(""),
            setEmailDominio(""), setNombres(""),
            setApellidoPaterno(""), setApellidoMaterno(""),
            setEmail(""), setEmpresa(""), setPerfilUsuario(""),
            setEstado(""), setUsername(""), setPass1(""), setPass2("")
    };

    const [openEditar, setOpenEditar] = useState(false);
    const [datosEditados, setDatosEditados] = useState({});

    // --- ESTADOS DE DATOS ---
    const [usuarios, setUsuarios] = useState([]);
    const [perfiles, setPerfiles] = useState([]);
    const [empresas, setEmpresas] = useState([])
    const [cencos, setCencos] = useState([])
    const [departamentos, setDepartamentos] = useState([])

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // --- ESTADOS DE FILTRADO ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroPerfil, setFiltroPerfil] = useState("");

    const [run, setRun] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [email, setEmail] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [perfilUsuario, setPerfilUsuario] = useState("");
    const [estado, setEstado] = useState("");
    const [username, setUsername] = useState("");
    const [pass1, setPass1] = useState("");
    const [pass2, setPass2] = useState("");


    const [mensajeExito, setmensajeExito] = useState("")
    const [proveedorCorreo, setProveedorCorreo] = useState([])
    const [emailLocal, setEmailLocal] = useState("")
    const [emailDominio, setEmailDominio] = useState("")
    const [editEmailLocal, setEditEmailLocal] = useState("")
    const [editEmailDominio, setEditEmailDominio] = useState("")

    const clickCrear = async () => {
        const emailFinal = emailLocal && emailDominio ? `${emailLocal}${emailDominio}` : email;
        try {
            const respuesta = await crearUsuario(username, pass2, estado, nombres, apellidoPaterno, apellidoMaterno, emailFinal, perfilUsuario, run, empresa)
            setRun("")
            setNombres("")
            setApellidoPaterno("")
            setApellidoMaterno("")
            setEmail("")
            setEmailLocal("")
            setEmailDominio("")
            setEmpresa("")
            setPerfilUsuario("")
            setOpen(false)
            setEstado("")
            setUsername("")
            setPass1("")
            setPass2("")
            setmensajeExito("Usuario creado con exito")
            cargarDatos()


        } catch (error) {
            setError(error.message)
        }
    }

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setmensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])


    // --- ESTADOS EDITAR ---
    const [editId, setEditId] = useState("")
    const [editRut, setEditRut] = useState("");
    const [editNombres, setEditNombres] = useState("");
    const [editApellidoPaterno, setEditApellidoPaterno] = useState("");
    const [editApellidoMaterno, setEditApellidoMaterno] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editEmpresa, setEditEmpresa] = useState("");
    const [editPerfilUsuario, setEditPerfilUsuario] = useState("");
    const [editEstado, setEditEstado] = useState("");
    const [editUsername, setEditUsername] = useState("");

    const clickEdit = async () => {
        const emailFinal = editEmailLocal && editEmailDominio ? `${editEmailLocal}${editEmailDominio}` : editEmail;
        try {
            const respuesta = await actualizarUsuario(editId, editUsername, editEstado, editNombres, editApellidoPaterno, editApellidoMaterno, emailFinal, editPerfilUsuario, editRut, editEmpresa)
            cargarDatos()
            setOpenEditar(false)
            setmensajeExito("Usuario editado con exito")
        } catch (error) { error.message }
    }


    // --- CARGA DE DATOS ---
    const cargarDatos = async () => {
        try {
            const [dataUsuarios, dataPerfiles, dataEmpresas, dataProveedores] = await Promise.all([
                obtenerUsuarios(),
                obtenerPerfiles(),
                obtenerEmpresas(),
                obtenerProveedorCorreo()
            ]);
            setUsuarios(dataUsuarios);
            setPerfiles(dataPerfiles);
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
            setProveedorCorreo(Array.isArray(dataProveedores) ? dataProveedores : []);

        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };
    useEffect(() => {
        cargarDatos();
    }, []);




    // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroEmpresa, filtroEstado, filtroPerfil]);

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''} ${usuario.runEmpleado || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();

        const coincideTexto = nombreCompleto.includes(term) ||
            (usuario.username && usuario.username.toLowerCase().includes(term));

        const coincideEmpresa = filtroEmpresa ? usuario.empresa?.empresa_id === parseInt(filtroEmpresa) : true;
        const coincideEstado = filtroEstado ? usuario.estado?.estado_id === parseInt(filtroEstado) : true;
        const coincidePerfil = filtroPerfil ? usuario.perfil?.perfil_id === parseInt(filtroPerfil) : true;

        return coincideTexto && coincideEmpresa && coincideEstado && coincidePerfil;
    });


    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const clickAbrirEdit = () => {
        setOpenEditar(true)
    }

    const cerrarDialogEditar = () => {
        setOpenEditar(false);
        setDatosEditados({});
    };

    const [checked, setCrecked] = React.useState([true, false])
    const [abrirAsignar, setAbrirAsignar] = useState("")
    const [disableAsignacion, setDisableAsignacion] = useState(false)

    const cerrarAsignar = () => {
        setAbrirAsignar(false)
        setSeleccionados([])
        setDisableAsignacion(false)
    }

    // --- LOGICA ASIGNAR ---
    const [allDepartamentos, setAllDepartamentos] = useState([]);
    const [allCencos, setAllCencos] = useState([]);


    const cargarDatosArbol = async () => {
        const deptos = await obtenerDepartamentos()
        const cencos = await obtenerCentroCostos()
        setAllDepartamentos(deptos);
        setAllCencos(cencos);
    }
    useEffect(() => {
        cargarDatosArbol();
    }, []);




    // arbol jerarquico

    const arbolDatos = React.useMemo(() => {
        if (!empresas.length) return []

        return empresas.map(emp => {
            const misDeptos = allDepartamentos.filter(d => d.empresa?.empresa_id === emp.empresa_id)
            const deptosConHijos = misDeptos.map(dep => {
                const misCencos = allCencos.filter(c => c.departamento?.departamento_id === dep.departamento_id)
                const cencosFormateados = misCencos.map(cen => ({
                    id: `cen-${cen.cenco_id}`,
                    originalId: cen.cenco_id,
                    nombre: cen.nombre_cenco,
                    tipo: 'cenco',
                    hijos: []
                }))
                return {
                    id: `dep-${dep.departamento_id}`,
                    originalId: dep.departamento_id,
                    nombre: dep.nombre_departamento,
                    tipo: 'depto',
                    hijos: cencosFormateados
                };
            })
            return {
                id: `emp-${emp.empresa_id}`,
                originalId: emp.empresa_id,
                nombre: emp.nombre_empresa,
                tipo: 'empresa',
                hijos: deptosConHijos
            };

        }, [empresas, allDepartamentos, allCencos])
    })

    const [seleccionados, setSeleccionados] = useState([]);
    const obtenerIdsDescendientes = (nodo) => {
        let ids = [nodo.id];
        if (nodo.hijos && nodo.hijos.length > 0) {
            nodo.hijos.forEach(hijo => {
                ids = [...ids, ...obtenerIdsDescendientes(hijo)];
            });
        }
        return ids;
    };

    const handleCheck = (nodo, isChecked) => {
        const idsAfectados = obtenerIdsDescendientes(nodo);

        setSeleccionados(prev => {
            if (isChecked) {
                return [...new Set([...prev, ...idsAfectados])];
            } else {
                return prev.filter(id => !idsAfectados.includes(id));
            }
        });
    };

    const isChecked = (id) => seleccionados.includes(id);
    const cencosSeleccionadosDetalle = React.useMemo(() => {
        return allCencos.filter(cencoReal =>
            seleccionados.includes(`cen-${cencoReal.cenco_id}`)
        );
    }, [seleccionados, allCencos]);

    const eliminarCencoDesdeLista = (idCenco) => {
        const idArbol = `cen-${idCenco}`;
        setSeleccionados(prev => prev.filter(id => id !== idArbol));
    };

    const seleccionarTodosLosCencos = () => {
        let todosLosIds = []
        const recolectarIds = (nodos) => {
            nodos.forEach(nodo => {
                todosLosIds.push(nodo.id)
                if (nodo.hijos && nodo.hijos.length > 0) {
                    recolectarIds(nodo.hijos)
                }
            })
        }
        recolectarIds(arbolDatos);
        setSeleccionados(todosLosIds);
    }

    // LOGICA RUT 

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

    //Logica validacionContraseña
    const esClaveValida = (clave) => {
        const regex = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{5,}$/;
        return regex.test(clave);
    };



    const guardarAsignar = async () => {
        try {
            const listaIds = cencosSeleccionadosDetalle.map((cenco) => cenco.cenco_id);
            await asignarCencos(editId, listaIds);
            await cargarDatos();
            setAbrirAsignar(false);
            setSeleccionados([]);
            setmensajeExito("Asignado con éxito");

        } catch (error) {
            setError(error.message);
        }
    };

    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Usuarios
                </Typography>
            </Box>
            {mensajeExito && (
                <Container sx={{ mb: 2 }}>
                    <Alert severity="success" onClose={() => setMensajeExito("")}>
                        {mensajeExito}
                    </Alert>
                </Container>
            )}

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2 }}>

                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "300px" }, height: "40px" }}>
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

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "20vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} label="Empresa">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empresas.map((empresa) => (
                                <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            sx={{ width: "20vh" }}
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            label="Estado"
                        >
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}>Activo</MenuItem>
                            <MenuItem value={2}>Inactivo</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Perfil</InputLabel>
                        <Select
                            sx={{ width: "20vh" }}
                            value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)} label="Perfil">

                            <MenuItem><em>Todos</em></MenuItem>
                            {perfiles.map((p) => (
                                <MenuItem key={p.perfil_id} value={p.perfil_id}>{p.nombre_perfil}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant="contained" startIcon={<AddIcon />} disableElevation sx={{ height: "40px", ml: 'auto' }} onClick={abrirDialog}>
                        Nuevo Registro
                    </Button>
                </Box>


                {/* TABLA PRINCIPAL */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflowX: "auto",
                        overflowY: "auto"
                    }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="20%"><strong>Username</strong></TableCell>
                                    <TableCell width="20%"><strong>Nombre Completo</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Perfil</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Admin Cenco</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {usuariosFiltrados
                                    .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                    .map((usuario) => {
                                        return (
                                            <TableRow
                                                key={usuario.usuario_id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {usuario.username}
                                                </TableCell>

                                                <TableCell>
                                                    {usuario.nombres} {usuario.apellido_paterno}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            color: usuario.estado?.estado_id === 1 ? '#4caf50' : '#f44336',
                                                            fontSize: '1rem'
                                                        }}
                                                    />
                                                </TableCell>

                                                <TableCell align="center">
                                                    {usuario.perfil?.nombre_perfil}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditId(usuario.usuario_id);
                                                            setAbrirAsignar(true);
                                                            setDisableAsignacion(usuario.empleado !== null);
                                                            if (usuario.cencos && usuario.cencos.length > 0) {
                                                                const misCencosIds = usuario.cencos.map(c => `cen-${c.cenco_id}`);
                                                                setSeleccionados(misCencosIds);
                                                            } else {
                                                                setSeleccionados([]);
                                                            }
                                                        }}
                                                    >
                                                        <AssignmentIcon />
                                                    </IconButton>
                                                </TableCell>

                                                <TableCell align="center">
                                                    <IconButton
                                                        sx={{ padding: 0 }}
                                                        onClick={() => {
                                                            clickAbrirEdit();
                                                            setEditId(usuario.usuario_id)
                                                            setEditRut(usuario.run_usuario);
                                                            setEditUsername(usuario.username)
                                                            setEditNombres(usuario.nombres)
                                                            setEditApellidoMaterno(usuario.apellido_materno)
                                                            setEditApellidoPaterno(usuario.apellido_paterno)
                                                            // Split email
                                                            if (usuario.email && usuario.email.includes("@")) {
                                                                const parts = usuario.email.split("@");
                                                                setEditEmail(usuario.email);
                                                                setEditEmailLocal(parts[0]);
                                                                setEditEmailDominio(`@${parts[1]}`);
                                                            } else {
                                                                setEditEmail(usuario.email || "");
                                                                setEditEmailLocal(usuario.email || "");
                                                                setEditEmailDominio("");
                                                            }
                                                            setEditEmpresa(usuario.empresa?.empresa_id)
                                                            setEditPerfilUsuario(usuario.perfil?.perfil_id)
                                                            setEditEstado(usuario.estado?.estado_id)
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}



                                {usuariosFiltrados.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron usuarios con esos filtros.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={usuariosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >






            {/* --- DIALOGO CREAR NUEVO USUARIO --- */}
            <Dialog open={open} onClose={cerrarDialog} fullWidth maxWidth="md" sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ textAlign: 'center', p: 0, mb: 2 }}>Crear Usuario</DialogTitle>
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>

                                    <Box sx={{ gridColumn: "span 2" }}>
                                        <TextField
                                            fullWidth
                                            label="Run"
                                            placeholder="12.345.678-K"
                                            value={run}
                                            onChange={(e) => setRun(formatearRut(e.target.value))}
                                            inputProps={{ maxLength: 12 }}
                                            error={run.length > 0 && !esRutValido(run)}
                                            helperText={
                                                run.trim() === ""
                                                    ? "El Run es obligatorio"
                                                    : (!esRutValido(run) ? "RUT inválido" : "")
                                            }
                                        />
                                    </Box>

                                    <TextField
                                        label="Nombres"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={nombres}
                                        onChange={(e) => setNombres(e.target.value)}
                                        helperText={nombres.trim() === "" ? "Los nombres son obligatorios" : ""}
                                    />

                                    <TextField
                                        label="Apellido Paterno"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={apellidoPaterno}
                                        onChange={(e) => setApellidoPaterno(e.target.value)}
                                        helperText={apellidoPaterno.trim() === "" ? "El Apellido Paterno es obligatorio" : ""}
                                    />

                                    <TextField
                                        label="Apellido Materno"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={apellidoMaterno}
                                        onChange={(e) => setApellidoMaterno(e.target.value)}
                                        helperText={apellidoMaterno.trim() === "" ? "El Apellido Materno es obligatorio" : ""}
                                    />



                                    <FormControl size="small" fullWidth >
                                        <InputLabel>Empresa</InputLabel>
                                        <Select
                                            label="Empresa"
                                            value={empresa}
                                            onChange={(e) => setEmpresa(e.target.value)}
                                        >
                                            {Array.isArray(empresas) && empresas.map((emp) => (
                                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                                    {emp.nombre_empresa}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {empresa === "" && <FormHelperText>Seleccione empresa</FormHelperText>}
                                    </FormControl>

                                    {/* Email + Dominio */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            label="Email"
                                            variant="outlined"
                                            size="small"
                                            sx={{ flex: 1 }}
                                            value={emailLocal}
                                            onChange={(e) => setEmailLocal(e.target.value.replace(/@/g, ""))}
                                            helperText={emailLocal.trim() === "" ? "El email es obligatorio" : ""}
                                        />
                                        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!empresa}>
                                            <InputLabel>Dominio</InputLabel>
                                            <Select label="Dominio" value={emailDominio} onChange={(e) => setEmailDominio(e.target.value)}>
                                                {proveedorCorreo
                                                    .filter(p => p.empresa?.empresa_id === empresa)
                                                    .map((prov) => (
                                                        <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <FormControl fullWidth size="small" >
                                        <InputLabel>Perfil de usuario</InputLabel>
                                        <Select
                                            label="Perfil de usuario"
                                            value={perfilUsuario}
                                            onChange={(e) => setPerfilUsuario(e.target.value)}
                                        >
                                            {perfiles.map((perfil) => (
                                                <MenuItem key={perfil.perfil_id} value={perfil.perfil_id}>
                                                    {perfil.nombre_perfil}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {perfilUsuario === "" && <FormHelperText>Seleccione perfil</FormHelperText>}
                                    </FormControl>

                                    <FormControl fullWidth size="small" >
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            label="Estado"
                                            value={estado}
                                            onChange={(e) => setEstado(e.target.value)}
                                        >
                                            <MenuItem value={1}>Activo</MenuItem>
                                            <MenuItem value={2}>Inactivo</MenuItem>
                                        </Select>
                                        {estado === "" && <FormHelperText>Seleccione estado</FormHelperText>}
                                    </FormControl>

                                    <TextField
                                        label="Username"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        helperText={username.trim() === "" ? "El Username es obligatorio" : ""}
                                    />

                                    <TextField
                                        label="Clave"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={pass1}
                                        onChange={(e) => setPass1(e.target.value)}
                                        helperText={
                                            pass1.trim() === ""
                                                ? "La clave es obligatoria"
                                                : (!esClaveValida(pass1) ? "Debe tener mín. 5 caracteres, 1 número y 1 símbolo especial" : "")
                                        } />
                                    <TextField
                                        label="Reingresar clave"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={pass2}
                                        onChange={(e) => setPass2(e.target.value)}
                                        helperText={pass2 !== "" && pass1 !== pass2 ? "Las claves no coinciden" : ""}
                                    />
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary"
                        disabled={
                            !esRutValido(run) ||
                            nombres.trim() === "" ||
                            apellidoMaterno.trim() === "" ||
                            apellidoPaterno.trim() === "" ||
                            emailLocal.trim() === "" ||
                            empresa === "" ||
                            perfilUsuario === "" ||
                            estado === "" ||
                            username.trim() === "" ||
                            pass1.trim() === "" ||
                            pass2.trim() === ""
                        }
                    >Guardar</Button>
                </DialogActions>
            </Dialog>




            {/* --- DIALOGO EDITAR --- */}
            <Dialog open={openEditar} onClose={cerrarDialogEditar} fullWidth maxWidth="md" sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 2 }}>Editar Usuario</DialogTitle>
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mt: 2 }}>

                                    <Box sx={{ gridColumn: "span 2" }}>
                                        <TextField
                                            label="Run"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={editRut}
                                            onChange={(e) => setEditRut(formatearRut(e.target.value))}
                                            helperText={editRut.trim() === "" ? "El RUT es obligatorio" : (!esRutValido(editRut) ? "RUT inválido" : "")}
                                            error={editRut.length > 0 && !esRutValido(editRut)}
                                            inputProps={{ maxLength: 12 }}
                                            placeholder="12.345.678-K"
                                        />
                                    </Box>

                                    <TextField
                                        label="Username" variant="outlined" fullWidth size="small"
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        error={editUsername.trim() === ""}
                                        helperText={editUsername.trim() === "" ? "Obligatorio" : ""}
                                    />

                                    <TextField
                                        label="Nombres" variant="outlined" fullWidth size="small"
                                        value={editNombres}
                                        onChange={(e) => setEditNombres(e.target.value)}
                                        helperText={editNombres.trim() === "" ? "Obligatorio" : ""}
                                    />

                                    <TextField
                                        label="Apellido Paterno" variant="outlined" fullWidth size="small"
                                        value={editApellidoPaterno}
                                        onChange={(e) => setEditApellidoPaterno(e.target.value)}
                                        helperText={editApellidoPaterno.trim() === "" ? "Obligatorio" : ""}
                                    />

                                    <TextField
                                        label="Apellido Materno" variant="outlined" fullWidth size="small"
                                        value={editApellidoMaterno}
                                        onChange={(e) => setEditApellidoMaterno(e.target.value)}
                                        helperText={editApellidoMaterno.trim() === "" ? "Obligatorio" : ""}
                                    />

                                    {/* Email + Dominio Edit */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            label="Email" variant="outlined" size="small" sx={{ flex: 1 }}
                                            value={editEmailLocal}
                                            onChange={(e) => setEditEmailLocal(e.target.value.replace(/@/g, ""))}
                                            helperText={editEmailLocal.trim() === "" ? "El email es obligatorio" : ""}
                                        />
                                        <FormControl size="small" sx={{ minWidth: 150 }} disabled={!editEmpresa}>
                                            <InputLabel>Dominio</InputLabel>
                                            <Select label="Dominio" value={editEmailDominio} onChange={(e) => setEditEmailDominio(e.target.value)}>
                                                {proveedorCorreo
                                                    .filter(p => p.empresa?.empresa_id === editEmpresa)
                                                    .map((prov) => (
                                                        <MenuItem key={prov.id} value={prov.dominio}>{prov.dominio}</MenuItem>
                                                    ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Empresa</InputLabel>
                                        <Select
                                            label="Empresa"
                                            value={editEmpresa}
                                            onChange={(e) => setEditEmpresa(e.target.value)}
                                        >
                                            {Array.isArray(empresas) && empresas.map((emp) => (
                                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                                    {emp.nombre_empresa}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {editEmpresa === "" && <FormHelperText>Seleccione una empresa</FormHelperText>}
                                    </FormControl>

                                    <FormControl fullWidth size="small" >
                                        <InputLabel>Estado</InputLabel>
                                        <Select
                                            label="Estado"
                                            value={editEstado}
                                            onChange={(e) => setEditEstado(e.target.value)}
                                        >
                                            <MenuItem value={1}>Activo</MenuItem>
                                            <MenuItem value={2}>Inactivo</MenuItem>
                                        </Select>
                                        {editEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                                    </FormControl>

                                    <FormControl fullWidth size="small" >
                                        <InputLabel>Perfil</InputLabel>
                                        <Select
                                            label="Perfil"
                                            value={editPerfilUsuario}
                                            onChange={(e) => setEditPerfilUsuario(e.target.value)}
                                        >
                                            {perfiles.map((p) => (
                                                <MenuItem key={p.perfil_id} value={p.perfil_id}>{p.nombre_perfil}</MenuItem>
                                            ))}
                                        </Select>
                                        {editPerfilUsuario === "" && <FormHelperText>Seleccione un perfil</FormHelperText>}
                                    </FormControl>

                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={cerrarDialogEditar} color="error">Cancelar</Button>
                    <Button
                        onClick={clickEdit}
                        variant="contained"
                        color="primary"

                        disabled={
                            !esRutValido(editRut) ||
                            editNombres.trim() === "" ||
                            editUsername.trim() === "" ||
                            editEmailLocal.trim() === "" ||
                            editEmpresa === "" ||
                            editPerfilUsuario === "" ||
                            editEstado === ""
                        }
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>


            {/* DIALOG ASIGNAR CENTROS DE COSTO */}
            <Dialog open={abrirAsignar} onClose={cerrarAsignar} fullWidth maxWidth="lg">
                <DialogTitle sx={{ pb: 1 }}>Asignar Centros de Costo</DialogTitle>
                <DialogContent sx={{ bgcolor: "#f5f5f5", p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, height: "60vh", mt: 1 }}>
                        {/* --- COLUMNA IZQUIERDA --- */}
                        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Box sx={{ p: 1.5, borderBottom: "1px solid #e0e0e0", bgcolor: "#fff", display: "flex", justifyContent: "space-between" }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Seleccione un Cento de Costo
                                </Typography>
                                <Button size="small" color="primary" onClick={seleccionarTodosLosCencos} sx={{ fontSize: '0.7rem' }} disabled={disableAsignacion}>
                                    Seleccionar Todo
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: "auto", p: 1, bgcolor: "#fff" }}>
                                {arbolDatos.length > 0 ? (
                                    arbolDatos.map((empresa) => (
                                        <ItemArbol
                                            key={empresa.id}
                                            nodo={empresa}
                                            isChecked={isChecked}
                                            toggleCheck={handleCheck}
                                            nivel={0}
                                            disabled={disableAsignacion}
                                        />
                                    ))
                                ) : (
                                    <Typography sx={{ p: 2, color: 'gray', fontSize: '0.9rem' }}>
                                        Cargando estructura...
                                    </Typography>
                                )}
                            </Box>
                        </Paper>

                        {/* --- COLUMNA DERECHA --- */}
                        <Paper elevation={0} sx={{ flex: 1, border: "1px solid #e0e0e0", borderRadius: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Box sx={{ p: 1.5, borderBottom: "1px solid #e0e0e0", bgcolor: "#f9fafb", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Centros Seleccionados ({cencosSeleccionadosDetalle.length})
                                </Typography>
                                {cencosSeleccionadosDetalle.length > 0 && (
                                    <Button size="small" color="error" onClick={() => setSeleccionados([])} sx={{ fontSize: '0.7rem' }} disabled={disableAsignacion}>
                                        Limpiar Todo
                                    </Button>
                                )}
                            </Box>

                            <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#fff" }}>
                                <List dense>
                                    {cencosSeleccionadosDetalle.length === 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                                            <Typography variant="caption">No hay centros seleccionados</Typography>
                                        </Box>
                                    )}

                                    {cencosSeleccionadosDetalle.map((cenco) => (
                                        <React.Fragment key={cenco.cenco_id}>
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete" size="small" onClick={() => eliminarCencoDesdeLista(cenco.cenco_id)} disabled={disableAsignacion}>
                                                        <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>✕</Typography>
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemText
                                                    primary={cenco.nombre_cenco}
                                                    secondary={
                                                        // Aquí intentamos mostrar a qué depto pertenece si tenemos la data cargada
                                                        `${cenco.depto?.nombre_departamento || 'Depto'} - ${cenco.depto?.empresa?.nombre_empresa || 'Empresa'}`
                                                    }
                                                    primaryTypographyProps={{ fontSize: '0.9rem', color: '#333' }}
                                                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                                />
                                            </ListItem>
                                            {/* Línea separadora suave */}
                                            <Box sx={{ borderBottom: '1px solid #f0f0f0', ml: 2, mr: 2 }} />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Button onClick={cerrarAsignar} color="error">Cancelar</Button>
                    <Button onClick={guardarAsignar} variant="contained" color="primary" disableElevation disabled={disableAsignacion}>Guardar Asignación</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminUsuario;