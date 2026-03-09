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
    Menu
} from "@mui/material";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerTurnos, crearTurno, actualizarTurno, asignarEmpleados, asignarTurnoACenco } from "../../../services/turnosServices";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { obtenerEmpleados } from "../../../services/empleadosServices"
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { obtenerCentroCostos } from "../../../services/centroCostosServices"
import { obtenerCargos } from "../../../services/cargosServices"


function AdminTurnos() {

    // Estados de datos
    const [turnos, setTurnos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [horarios, setHorarios] = useState([])
    const [empleados, setEmpleados] = useState([])
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

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
            setError(err.message);
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
            setError(err.message);
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
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarEmpleados = async () => {
        try {
            const respuesta = await obtenerEmpleados()
            setEmpleados(respuesta)
        } catch (err) {
            setError(err.message)
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
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };





    // Manejo de dialogs
    const [asignar, setAsignar] = useState(false)
    const [detalle, setDetalle] = useState(false)
    const [idTurnoDias, setIdTurnoDias] = useState(null)
    const [diasSeleccionados, setDiasSeleccionados] = useState([])

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
            const [dataDeptos, dataCencos, dataCargos] = await Promise.all([
                obtenerDepartamentos(),
                obtenerCentroCostos(),
                obtenerCargos()
            ]);
            setDepartamentos(Array.isArray(dataDeptos) ? dataDeptos : [dataDeptos]);
            setCencos(Array.isArray(dataCencos) ? dataCencos : [dataCencos]);
            setCargos(Array.isArray(dataCargos) ? dataCargos : [dataCargos]);
        } catch (err) {
            setError(err.message);
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
            setMensajeExito("Turno creado con exito")
            setNombreCrear("")
            setEstadoCrear("")
            cargarTurnos()
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const clickEdit = async () => {
        setCargando(true)
        try {
            const respuesta = await actualizarTurno(idEdit, nombreEdit, empresaEdit, estadoEdit)
            setEditar(false)
            setMensajeExito("Turno Actualizado con exito")
            cargarTurnos()
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const clickGuardarDias = async () => {
        setCargando(true)
        try {
            // Aseguramos que solo viajen números del 1 al 7, por si quedó basura en el estado de React
            const diasValidos = diasSeleccionados.filter(d => typeof d === 'number' && d >= 1 && d <= 7);
            const diasOrdenados = [...diasValidos].sort((a, b) => a - b);

            console.log("Lo que se envía a la API finalmente será: ", JSON.stringify({ dias: diasOrdenados }));

            await asignarDias(idTurnoDias, diasOrdenados)
            setMensajeExito("Días asignados correctamente")
            cerrarDetalle()
            cargarTurnos()
        } catch (err) {
            setError(err.message)
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

            setMensajeExito("Asignación guardada correctamente");
            cerrarAsignar();
            cargarEmpleados();
            cargarTurnos();
        } catch (err) {
            setError(err.message);
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
        } else {
            setDiasSeleccionados([...diasSeleccionados, valorDia]);
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



    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito]);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado]);

    // Renderizado condicional
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos
                </Typography>
            </Box>

            {/* Alerta de exito */}
            {mensajeExito && (
                <Container sx={{ mb: 2 }}>
                    <Alert severity="success" onClose={() => setMensajeExito("")}>
                        {mensajeExito}
                    </Alert>
                </Container>
            )}

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
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
                                                        onClick={() => {
                                                            setDetalle(true)
                                                            setIdTurnoDias(tur.turno_id)
                                                            if (tur.dias && Array.isArray(tur.dias)) {
                                                                // Extraer el "cod_dia" de la semana en lugar del "id" relacional
                                                                const diasExtraidos = [];
                                                                for (let i = 0; i < tur.dias.length; i++) {
                                                                    if (tur.dias[i].semana && tur.dias[i].semana.cod_dia) {
                                                                        diasExtraidos.push(tur.dias[i].semana.cod_dia);
                                                                    }
                                                                }
                                                                setDiasSeleccionados(diasExtraidos);
                                                            } else {
                                                                setDiasSeleccionados([]);
                                                            }
                                                        }}
                                                    >
                                                        Asignar Horarios
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                            setAsignar(true);
                                                            setIdTurnoAsignar(tur.turno_id);
                                                            setFiltroEmpresaAsignar(tur.empresa?.empresa_id || "");
                                                            setFiltroDepartamentoAsignar("");
                                                            setFiltroCencoAsignar("");
                                                            setFiltroCargoAsignar("");

                                                            const assigned = empleados.filter(emp => emp.turno?.turno_id === tur.turno_id);
                                                            const available = empleados.filter(emp => !emp.turno || !emp.turno.turno_id);
                                                            setEmpleadosAsignados(assigned);
                                                            setEmpleadosDisponibles(available);
                                                            setCheckedEmpleados([]);
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
                    rowsPerPageOptions={[]}
                    component="div"
                    count={turnosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
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
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllRight}>&gt;&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedRight} disabled={empleadosDisponiblesFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id)).length === 0}>&gt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleCheckedLeft} disabled={empleadosAsignadosFiltrados.filter(emp => checkedEmpleados.includes(emp.empleado_id)).length === 0}>&lt;</Button>
                                        <Button variant="outlined" size="small" sx={{ minWidth: 40 }} onClick={handleAllLeft}>&lt;&lt;</Button>
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
                    <Button variant="contained" color="primary" onClick={iniciarGuardadoAsignacion}>Guardar</Button>
                </DialogActions>
            </Dialog >

            {/* Dialog asignar dias */}
            < Dialog
                open={detalle}
                onClose={cerrarDetalle}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", pb: 0 }}>
                    Asignar Días
                </DialogTitle>

                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>

                        <FormGroup
                            row
                            sx={{
                                justifyContent: "center",
                                gap: 1.5
                            }}
                        >
                            {["L", "M", "M", "J", "V", "S", "D"].map((dia, index) => {
                                const valorDia = index + 1;
                                return (
                                    <FormControlLabel
                                        key={index}
                                        labelPlacement="top"
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={diasSeleccionados.includes(valorDia)}
                                                onChange={() => handleToggleDia(valorDia)}
                                                sx={{
                                                    padding: 0.5,
                                                    '&.Mui-checked': { color: '#1976d2' }
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'text.secondary',
                                                    width: '20px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {dia}
                                            </Typography>
                                        }
                                        sx={{ margin: 0 }}
                                    />
                                )
                            })}
                        </FormGroup>

                    </Box>

                    <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 2 }}>
                        Seleccione los días laborales para este turno.
                    </Typography>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3, justifyContent: "center" }}>
                    <Button onClick={cerrarDetalle} color="error" sx={{ minWidth: 100 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" sx={{ minWidth: 100 }} onClick={clickGuardarDias}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog >

            {/* Dialog de confirmación de asignación */}
            <Dialog
                open={confirmacionVisible}
                maxWidth="sm"
                fullWidth
                disableEscapeKeyDown={true}
                onClose={(event, reason) => {
                    if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                        setConfirmacionVisible(false);
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: "center", bgcolor: "#1976d2", color: "white", mb: 2 }}>
                    Confirmar Asignación
                </DialogTitle>
                <DialogContent sx={{ textAlign: "center", pb: 2 }}>
                    <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                        ¿Asignar este turno a los siguientes empleados?
                    </Typography>

                    <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: '#f5f5f5', p: 1, borderRadius: 1, my: 2 }}>
                        {empleadosAConfirmar.length > 0 ? (
                            empleadosAConfirmar.map((nombre, i) => (
                                <Typography key={i} variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                    • {nombre}
                                </Typography>
                            ))
                        ) : (
                            <Typography variant="body2" color="error">
                                (Ningún empleado seleccionado)
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Centro de costo: <Typography component="span" fontWeight="bold" color="primary">{cencoAConfirmar}</Typography>
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button onClick={() => setConfirmacionVisible(false)} color="error" sx={{ minWidth: 100 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={confirmarYGuardar} sx={{ minWidth: 100 }}>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTurnos;