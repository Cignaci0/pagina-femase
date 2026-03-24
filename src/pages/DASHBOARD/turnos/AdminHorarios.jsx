import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    DialogContentText
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerHorarios, crearHorario, actualizarHorario } from "../../../services/horariosServices";

import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

function AdminHorarios() {

    // Estados de datos
    const [horarios, setHorarios] = useState([])
    const [empresas, setEmpresas] = useState([""])
    const [empresasFiltro, setEmpresasFiltro] = useState([])

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);
    const [filtroEmpresa, setFiltroEmpresa] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoHorarioEntrada, setNuevoHorarioEntrada] = useState("")
    const [nuevoHorarioSalida, setNuevoHorarioSalida] = useState("")
    const [idEmpresaCrear, setIdEmpresaCrear] = useState("")
    const [horaEntradaCrear, setHoraEntradaCrear] = useState("")
    const [minutoEntradaCrear, setMinutoEntradaCrear] = useState("")
    const [segEntradaCrear, setSegEntradaCrear] = useState("")
    const [horaSalidaCrear, setHoraSalidaCrear] = useState("")
    const [minutoSalidaCrear, setMinutoSalidaCrear] = useState("")
    const [segSalidaCrear, setSegSalidaCrear] = useState("")
    const [minutoHolguraCrear, setMinutoHolguraCrear] = useState("")
    const [minutoColacionCrear, setMinutoColacionCrear] = useState("")
    const enviarHoraEntradaCrear = `${horaEntradaCrear || "00"}:${minutoEntradaCrear || "00"}:00`
    const enviarHoraSalidaCrear = `${horaSalidaCrear || "00"}:${minutoSalidaCrear || "00"}:00`
    const enviarHolguraCrear = `00:${minutoHolguraCrear || "00"}:00`
    const enviarColacionCrear = `00:${minutoColacionCrear || "00"}:00`
    const [nocturno, setNocturno] = useState(false)

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState("")
    const [editId, setEditId] = useState("")
    const [idEmpresaEdit, setIdEmpresaEdit] = useState("")
    const [horaEntradaEdit, setHoraEntradaEdit] = useState("")
    const [minutoEntradaEdit, setMinutoEntradaEdit] = useState("")
    const [segEntradaEdit, setSegEntradaEdit] = useState("")
    const [horaSalidaEdit, setHoraSalidaEdit] = useState("")
    const [minutoSalidaEdit, setMinutoSalidaEdit] = useState("")
    const [segSalidaEdit, setSegSalidaEdit] = useState("")
    const [minutoHolguraEdit, setMinutoHolguraEdit] = useState("")
    const [minutoColacionEdit, setMinutoColacionEdit] = useState("")
    const enviarHoraEntradaEdit = `${horaEntradaEdit || "00"}:${minutoEntradaEdit || "00"}:00`
    const enviarHoraSalidaEdit = `${horaSalidaEdit || "00"}:${minutoSalidaEdit || "00"}:00`
    const enviarHolguraEdit = `00:${minutoHolguraEdit || "00"}:00`
    const enviarColacionEdit = `00:${minutoColacionEdit || "00"}:00`
    const [eliminar, setEliminar] = useState(false)
    const [inputConfirmacion, setInputConfirmacion] = useState("");
    const [nocturnoEdit, setNocturnoEdit] = useState(false)

    // Carga de datos
    const obtenerEmpresasCrear = async () => {
        try {
            const respuesta = await obtenerEmpresas()
            setEmpresas(respuesta)
        } catch (error) {
            toast.error(error.message || " error al traer empresas")
        }
    }

    const cargarHorarios = async () => {
        try {
            const respuesta = await obtenerHorarios()
            setHorarios(respuesta)
        } catch (error) {
            toast.error("Error al traer los horarios")
        }
    }

    const obtenerEmpresasFiltro = async () => {
        try {
            const respuesta = await obtenerEmpresas()
            setEmpresasFiltro(respuesta)
        } catch (error) {
            toast.error(error.message || " error al traer empresas")
        }
    }

    // Manejo de dialogs
    const abrirDialog = () => setOpen(true);

    const cerrarDialog = () => {
        setOpen(false)
        setHoraEntradaCrear("")
        setMinutoEntradaCrear("")
        setIdEmpresaCrear("")
        setSegEntradaCrear("")
        setHoraSalidaCrear("")
        setMinutoSalidaCrear("")
        setSegSalidaCrear("")
        setMinutoHolguraCrear("")
        setMinutoColacionCrear("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    const clickCrear = async () => {
        try {
            const respuesta = await crearHorario(enviarHoraEntradaCrear, enviarHoraSalidaCrear, idEmpresaCrear, enviarHolguraCrear, enviarColacionCrear, nocturno)
            toast.success("Se creo con exito")
            setOpen(false)
            setNuevoHorarioEntrada("")
            setIdEmpresaCrear("")
            cargarHorarios()
            setHoraEntradaCrear("")
            setMinutoEntradaCrear("")
            setIdEmpresaCrear("")
            setSegEntradaCrear("")
            setHoraSalidaCrear("")
            setMinutoSalidaCrear("")
            setSegSalidaCrear("")
            setMinutoHolguraCrear("")
            setMinutoColacionCrear("")
            setNocturno("")
        } catch (error) {
            toast.error(error.message || "Error al crear el horarios")
        }
    }

    const clickEdit = async () => {
        try {
            const respuesta = await actualizarHorario(editId, enviarHoraEntradaEdit, enviarHoraSalidaEdit, idEmpresaEdit, enviarHolguraEdit, enviarColacionEdit, nocturnoEdit)
            setMostrarEdit(false)
            toast.success("Se edito con exito")
            cargarHorarios()
        } catch (error) {
            toast.error(error.message || "error al editar")
        }
    }

    const clickEliminarHorario = async () => {
        try {
            const respuesta = eliminarHorario(editId)
            toast.success("Eliminado con exito")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const cerrarEliminar = () => {
        setEliminar(false)
        setInputConfirmacion("")
        setEliminar(false)
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

    // Filtrado y paginacion
    const horariosFiltrados = horarios.filter((hor) => {
        const coincideEmpresa = filtroEmpresa ? hor.empresa?.empresa_id === filtroEmpresa : true || ""
        return coincideEmpresa;
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
        obtenerEmpresasCrear()
    }, [])

    useEffect(() => {
        cargarHorarios()
    }, [])

    useEffect(() => {
        obtenerEmpresasFiltro()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [filtroEmpresa]);

    // Auto-calcular nocturno en crear: si hora entrada > hora salida => nocturno
    useEffect(() => {
        if (horaEntradaCrear !== "" && horaSalidaCrear !== "") {
            const entrada = parseInt(horaEntradaCrear, 10) * 60 + parseInt(minutoEntradaCrear || "0", 10);
            const salida = parseInt(horaSalidaCrear, 10) * 60 + parseInt(minutoSalidaCrear || "0", 10);
            setNocturno(entrada > salida);
        }
    }, [horaEntradaCrear, minutoEntradaCrear, horaSalidaCrear, minutoSalidaCrear]);

    // Auto-calcular nocturno en editar: si hora entrada > hora salida => nocturno
    useEffect(() => {
        if (horaEntradaEdit !== "" && horaSalidaEdit !== "") {
            const entrada = parseInt(horaEntradaEdit, 10) * 60 + parseInt(minutoEntradaEdit || "0", 10);
            const salida = parseInt(horaSalidaEdit, 10) * 60 + parseInt(minutoSalidaEdit || "0", 10);
            setNocturnoEdit(entrada > salida);
        }
    }, [horaEntradaEdit, minutoEntradaEdit, horaSalidaEdit, minutoSalidaEdit]);



    // Renderizado condicional


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Horarios
                </Typography>
            </Box>

            {/* Alerta de exito */}


            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y botones */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    <FormControl size="small" variant="outlined" sx={{ minWidth: 120, ml: 2 }} >
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} label="Empresa">
                            <MenuItem>Todos</MenuItem>
                            {empresasFiltro.map((fe) => (
                                <MenuItem key={fe.empresa_id} value={fe.empresa_id}>
                                    {fe.nombre_empresa}
                                </MenuItem>
                            ))}

                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={abrirDialog}>
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
                                    <TableCell width="15%" align="center"><strong>Horario entrada</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Horario salida</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Holgura Mins</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Colación Mins</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Nocturno</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>

                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {horariosFiltrados.length > 0 ? (
                                    horariosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow key={row.horario_id}>
                                                <TableCell align="center">{row.empresa?.nombre_empresa}</TableCell>
                                                <TableCell align="center">{row.hora_entrada}</TableCell>
                                                <TableCell align="center">{row.hora_salida}</TableCell>
                                                <TableCell align="center">{row.holgura_mins ? row.holgura_mins.split(':')[1] : "00"}</TableCell>
                                                <TableCell align="center">{row.colacion ? row.colacion.split(':')[1] : "00"}</TableCell>
                                                <TableCell align="center">{row.nocturno ? "Si" : "No"}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditId(row.horario_id)
                                                            setIdEmpresaEdit(row.empresa?.empresa_id)
                                                            const [hE, mE, sE] = (row.hora_entrada || "00:00:00").split(':');
                                                            setHoraEntradaEdit(hE);
                                                            setMinutoEntradaEdit(mE);
                                                            setSegEntradaEdit(sE);

                                                            const [hS, mS, sS] = (row.hora_salida || "00:00:00").split(':');
                                                            setHoraSalidaEdit(hS);
                                                            setMinutoSalidaEdit(mS);
                                                            setSegSalidaEdit(sS);

                                                            const [, mH] = (row.holgura_mins || "00:00:00").split(':');
                                                            setMinutoHolguraEdit(mH || "00");

                                                            const [, mC] = (row.colacion || "00:00:00").split(':');
                                                            setMinutoColacionEdit(mC || "00");

                                                            setNocturnoEdit(row.nocturno);
                                                            setMostrarEdit(true);
                                                        }}
                                                        sx={{ padding: 0 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {horariosFiltrados
                                                    ? "No se encontraron horarios"
                                                    : "No se encontraron horarios"}
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
                    count={horariosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialog crear */}
            <Dialog open={open} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Agregar Nuevo Horario</DialogTitle>

                                <FormControl size="small" sx={{ mb: 2, width: "40vh", mx: "auto", display: "flex" }} >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select
                                        value={idEmpresaCrear}
                                        onChange={(e) => setIdEmpresaCrear(e.target.value)}
                                        label="Empresa"
                                    >
                                        {empresas.map((e) => (
                                            <MenuItem key={e.empresa_id} value={e.empresa_id}>
                                                {e.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                    {idEmpresaCrear === "" && <FormHelperText>La Empresa es obligatoria</FormHelperText>}
                                </FormControl>



                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORARIO ENTRADA
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={3}>

                                    <TextField
                                        value={horaEntradaCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setHoraEntradaCrear, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setHoraEntradaCrear)}
                                        placeholder="HH"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <Typography variant="h6">:</Typography>
                                    <TextField
                                        value={minutoEntradaCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoEntradaCrear, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoEntradaCrear)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORARIO SALIDA
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={horaSalidaCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setHoraSalidaCrear, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setHoraSalidaCrear)}
                                        placeholder="HH"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                    <Typography variant="h6">:</Typography>
                                    <TextField
                                        value={minutoSalidaCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoSalidaCrear, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoSalidaCrear)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HOLGURA (MINS)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={minutoHolguraCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoHolguraCrear, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoHolguraCrear)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    COLACIÓN (MINS)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={minutoColacionCrear}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoColacionCrear, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoColacionCrear)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <TextField
                                    size="small"
                                    label="Nocturno"
                                    value={nocturno === true ? "Si" : nocturno === false ? "No" : ""}
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2, width: "40vh", mx: "auto" }}
                                />

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary" disabled={horaEntradaCrear === "" || minutoEntradaCrear === "" || horaSalidaCrear === "" || minutoSalidaCrear === "" || idEmpresaCrear === "" || minutoHolguraCrear === "" || minutoColacionCrear === ""}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Editar Horario</DialogTitle>

                                <FormControl size="small" sx={{ mb: 2, width: "40vh", mx: "auto", display: "flex" }} >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select
                                        value={idEmpresaEdit}
                                        onChange={(e) => setIdEmpresaEdit(e.target.value)}
                                        label="Empresa"
                                    >
                                        {empresas.map((e) => (
                                            <MenuItem key={e.empresa_id} value={e.empresa_id}>
                                                {e.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>



                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}
                                >
                                    HORARIO ENTRADA
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={3}>
                                    <TextField
                                        value={horaEntradaEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setHoraEntradaEdit, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setHoraEntradaEdit)}
                                        placeholder="HH"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />

                                    <Typography variant="h6">:</Typography>

                                    <TextField
                                        value={minutoEntradaEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoEntradaEdit, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoEntradaEdit)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }} />
                                </Stack>

                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}
                                >
                                    HORARIO SALIDA
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={horaSalidaEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setHoraSalidaEdit, 23)}
                                        onBlur={e => {
                                            if (e.target.value.length === 1) setHoraSalidaEdit("0" + e.target.value);
                                            else if (e.target.value === "") setHoraSalidaEdit("00");
                                        }}
                                        placeholder="HH"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />

                                    <Typography variant="h6">:</Typography>

                                    <TextField
                                        value={minutoSalidaEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoSalidaEdit, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoSalidaEdit)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }} />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HOLGURA (MINS)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={minutoHolguraEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoHolguraEdit, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoHolguraEdit)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    COLACIÓN (MINS)
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={2}>
                                    <TextField
                                        value={minutoColacionEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setMinutoColacionEdit, 59)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setMinutoColacionEdit)}
                                        placeholder="MM"
                                        size="small"
                                        sx={{ width: '70px' }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <TextField
                                    size="small"
                                    label="Nocturno"
                                    value={nocturnoEdit === true ? "Si" : nocturnoEdit === false ? "No" : ""}
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2, width: "40vh", mx: "auto" }}
                                />
                                <Box>
                                <Button color="error" variant="contained" onClick={() => setEliminar(true)}>Eliminar</Button>
                                </Box>


                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEdit} variant="contained" color="primary" disabled={
                        horaEntradaEdit === "" ||
                        minutoEntradaEdit === "" ||
                        horaSalidaEdit === "" ||
                        minutoSalidaEdit === "" ||
                        idEmpresaEdit === "" ||
                        minutoHolguraEdit === "" ||
                        minutoColacionEdit === ""
                    }>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Alerta de eliminar */}
            <Dialog
                open={eliminar}
                onClose={cerrarEliminar}
                maxWidth="xs"
                fullWidth
            >
                <Box sx={{ textAlign: 'center', pt: 3 }}>
                    <WarningAmberRoundedIcon sx={{ fontSize: 60, color: 'error.main' }} />
                </Box>

                <DialogTitle sx={{ textAlign: "center", fontWeight: 'bold' }}>
                    ¿Eliminar Horario?
                </DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ textAlign: "center", mb: 3 }}>
                        Esta acción es irreversible. Para confirmar que desea borrar este horario, por favor escriba <strong>ELIMINAR</strong> en el cuadro de abajo.
                    </DialogContentText>

                    <TextField
                        autoFocus
                        fullWidth
                        variant="outlined"
                        placeholder="Escriba ELIMINAR"
                        color="error"
                        value={inputConfirmacion}
                        onChange={(e) => setInputConfirmacion(e.target.value)}
                        sx={{ bgcolor: '#fff' }}
                    />
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
                    <Button
                        onClick={cerrarEliminar}
                        variant="outlined"
                        color="inherit"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={() => {
                            cerrarEliminar(),
                                clickEliminarHorario()
                            cerrarDialogEdit()
                        }}
                        variant="contained"
                        color="error"
                        disabled={inputConfirmacion !== "ELIMINAR"}
                        startIcon={<WarningAmberRoundedIcon />}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminHorarios;