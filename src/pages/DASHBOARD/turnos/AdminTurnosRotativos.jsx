import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";

import { obtenerEmpresas } from "../../../services/empresasServices";


import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';



function AdminTurnosRotativos() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargos, setcargos] = useState([])
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

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [detalleEditar, setDetalleEditar] = useState(false)

    // Carga de datos
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

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    const [asignar, setAsignar] = useState("")
    const [detalle, setDetalle] = useState(false)
    const [detalleCrear, setDetalleCrear] = useState(false)

    const cerrarAsignar = () => { setAsignar(false) }
    const cerrarDetalle = () => { setDetalle(false) }
    const cerrarCrear = () => { setCrear(false) }
    const cerrarEditar = () => { setEditar(false) }
    const cerrarDetallesCrear = () => { setDetalleCrear(false) }
    const cerrarDetalleEditar = () => { setDetalleEditar(false) }

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

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    // Renderizado condicional
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos Rotativos
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
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "75vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Agregar Nuevo Turno Rotativo</DialogTitle>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                        <InputLabel>Empresa</InputLabel>
                                        <Select label="Empresa"></Select>
                                    </FormControl>

                                    <TextField fullWidth label="Nombre" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <TextField fullWidth label="Hora entrada" size="small" />
                                    <TextField fullWidth label="Hora salida" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <TextField fullWidth label="Holgura(mins)" size="small" />
                                    <TextField fullWidth label="Mins Colación" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <FormControl size="small" fullWidth   >
                                        <InputLabel>Nocturno</InputLabel>
                                        <Select label="Nocturno">
                                            <MenuItem value={1}> Si </MenuItem>
                                            <MenuItem value={2}> No  </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <FormControl size="small" fullWidth   >
                                        <InputLabel>Permite feriado</InputLabel>
                                        <Select label="Permite feriado">
                                            <MenuItem value={1}> Si </MenuItem>
                                            <MenuItem value={2}> No  </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" fullWidth   >
                                        <InputLabel>Estado</InputLabel>
                                        <Select label="Estado">
                                            <MenuItem value={1}> Vigente </MenuItem>
                                            <MenuItem value={2}> No Vigente  </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
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
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "75vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Editar Turno Rotativo</DialogTitle>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <FormControl size="small" fullWidth sx={{ mb: 2 }}  >
                                        <InputLabel>Empresa</InputLabel>
                                        <Select label="Empresa"></Select>
                                    </FormControl>

                                    <TextField fullWidth label="Nombre" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <TextField fullWidth label="Hora entrada" size="small" />
                                    <TextField fullWidth label="Hora salida" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <TextField fullWidth label="Holgura(mins)" size="small" />
                                    <TextField fullWidth label="Mins Colación" size="small" />
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <FormControl size="small" fullWidth >
                                        <InputLabel>Aplicar a todos los turnos</InputLabel>
                                        <Select label="Aplicar a todos los turnos" >
                                            <MenuItem value={1}> Si </MenuItem>
                                            <MenuItem value={2}> No  </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" fullWidth  >
                                        <InputLabel>Nocturno</InputLabel>
                                        <Select label="Nocturno">
                                            <MenuItem value={1}> Si </MenuItem>
                                            <MenuItem value={2}> No  </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                    <FormControl size="small" fullWidth  >
                                        <InputLabel>Permite feriado</InputLabel>
                                        <Select label="Permite feriado">
                                            <MenuItem value={1}> Si </MenuItem>
                                            <MenuItem value={2}> No  </MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" fullWidth  >
                                        <InputLabel>Estado</InputLabel>
                                        <Select label="Estado">
                                            <MenuItem value={1}> Vigente </MenuItem>
                                            <MenuItem value={2}> No Vigente  </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
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