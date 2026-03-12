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

import { obtenerEmpresas } from "../../../services/empresasServices";


import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';



function AdminTurnosRotativos() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargos, setcargos] = useState([])

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [empresasFiltro, setEmpresasFiltro] = useState("")
    const [filtroestado, setFiltroEstado] = useState("")

    // Estados crear
    const [crear, setCrear] = useState(false)
    const [horaEntradaCrear, setHoraEntradaCrear] = useState("")
    const [minutoEntradaCrear, setMinutoEntradaCrear] = useState("")
    const [horaSalidaCrear, setHoraSalidaCrear] = useState("")
    const [minutoSalidaCrear, setMinutoSalidaCrear] = useState("")
    const [minutoHolguraCrear, setMinutoHolguraCrear] = useState("")
    const [minutoColacionCrear, setMinutoColacionCrear] = useState("")

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [detalleEditar, setDetalleEditar] = useState(false)
    const [horaEntradaEdit, setHoraEntradaEdit] = useState("")
    const [minutoEntradaEdit, setMinutoEntradaEdit] = useState("")
    const [horaSalidaEdit, setHoraSalidaEdit] = useState("")
    const [minutoSalidaEdit, setMinutoSalidaEdit] = useState("")
    const [minutoHolguraEdit, setMinutoHolguraEdit] = useState("")
    const [minutoColacionEdit, setMinutoColacionEdit] = useState("")

    // Carga de datos
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

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    const [asignar, setAsignar] = useState("")
    const [detalle, setDetalle] = useState(false)
    const [detalleCrear, setDetalleCrear] = useState(false)

    const cerrarAsignar = () => { setAsignar(false) }
    const cerrarDetalle = () => { setDetalle(false) }
    const cerrarCrear = () => {
        setCrear(false)
        setHoraEntradaCrear("")
        setMinutoEntradaCrear("")
        setHoraSalidaCrear("")
        setMinutoSalidaCrear("")
        setMinutoHolguraCrear("")
        setMinutoColacionCrear("")
    }
    const cerrarEditar = () => {
        setEditar(false)
        setHoraEntradaEdit("")
        setMinutoEntradaEdit("")
        setHoraSalidaEdit("")
        setMinutoSalidaEdit("")
        setMinutoHolguraEdit("")
        setMinutoColacionEdit("")
    }
    const cerrarDetallesCrear = () => { setDetalleCrear(false) }
    const cerrarDetalleEditar = () => { setDetalleEditar(false) }

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
    const cargosFiltrados = cargos.filter((car) => {
        const nombreCargo = `${car.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreCargo.includes(term);
        const coincideEstado = filtroestado ? car.estado?.estado_id === filtroestado : true;
        return coincideTexto && coincideEstado;
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
        cargarEmpresasFiltro();
    }, []);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado]);



    // Renderizado condicional


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos Rotativos
                </Typography>
            </Box>

            {/* Alerta de exito */}


            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
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
                    <TableContainer sx={{ flex: 1, minHeight: '366px' }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="20%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Hora Entrada</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Hora Salida</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Holgura(mins)</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Mins Colación</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Nocturno</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Permite feriado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">02</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => { setEditar(true) }} >
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={cargosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialog crear */}
            <Dialog open={crear} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "45vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Agregar Nuevo Turno Rotativo</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"></Select>
                                </FormControl>

                                <TextField fullWidth label="Nombre" size="small" sx={{ mb: 2 }} />



                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Nocturno</InputLabel>
                                    <Select label="Nocturno">
                                        <MenuItem value={1}> Si </MenuItem>
                                        <MenuItem value={2}> No  </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Permite feriado</InputLabel>
                                    <Select label="Permite feriado">
                                        <MenuItem value={1}> Si </MenuItem>
                                        <MenuItem value={2}> No  </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado">
                                        <MenuItem value={1}> Vigente </MenuItem>
                                        <MenuItem value={2}> No Vigente  </MenuItem>
                                    </Select>
                                </FormControl>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORA ENTRADA
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
                                    HORA SALIDA
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={3}>
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
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarCrear} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={editar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "45vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Editar Turno Rotativo</DialogTitle>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa"></Select>
                                </FormControl>

                                <TextField fullWidth label="Nombre" size="small" sx={{ mb: 2 }} />



                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Aplicar a todos los turnos</InputLabel>
                                    <Select label="Aplicar a todos los turnos">
                                        <MenuItem value={1}> Si </MenuItem>
                                        <MenuItem value={2}> No  </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Nocturno</InputLabel>
                                    <Select label="Nocturno">
                                        <MenuItem value={1}> Si </MenuItem>
                                        <MenuItem value={2}> No  </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Permite feriado</InputLabel>
                                    <Select label="Permite feriado">
                                        <MenuItem value={1}> Si </MenuItem>
                                        <MenuItem value={2}> No  </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado">
                                        <MenuItem value={1}> Vigente </MenuItem>
                                        <MenuItem value={2}> No Vigente  </MenuItem>
                                    </Select>
                                </FormControl>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORA ENTRADA
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
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                </Stack>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                    HORA SALIDA
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={3}>
                                    <TextField
                                        value={horaSalidaEdit}
                                        onChange={(e) => handleChangeTime(e.target.value, setHoraSalidaEdit, 23)}
                                        onBlur={(e) => handleBlurTime(e.target.value, setHoraSalidaEdit)}
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
                                        inputProps={{ style: { textAlign: 'center' } }}
                                    />
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
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error">Cancelar</Button>
                    <Button variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTurnosRotativos;