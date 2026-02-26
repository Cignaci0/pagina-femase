import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText,
    Radio,
    Checkbox
} from "@mui/material";

import { obtenerEmpresas } from "../../../services/empresasServices";

import SearchIcon from '@mui/icons-material/Search';


function AdminTurnosRotativosAsignacion() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
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
    const [detalleCrear, setDetalleCrear] = useState(false)

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

    const cerrarAsignar = () => { setAsignar(false) }
    const cerrarDetalle = () => { setDetalle(false) }
    const cerrarCrear = () => { setCrear(false) }
    const cerrarEditar = () => { setEditar(false) }
    const cerrarDetallesCrear = () => { setDetalleCrear(false) }
    const cerrarDetalleEditar = () => { setDetalleEditar(false) }

    // Filtrado y paginacion
    /*
        const cargosFiltrados = cargos.filter((car) => {
            const nombreCargo = `${car.nombre || ''}`.toLowerCase();
            const term = busqueda.toLowerCase();
            const coincideTexto = nombreCargo.includes(term);
            const coincideEstado = filtroestado ? car.estado?.estado_id === filtroestado : true;
            return coincideTexto && coincideEstado;
        });
    */

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
                    Admin Turnos Rotativos Asignación
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
                            <MenuItem value={1}> Vigente </MenuItem>
                            <MenuItem value={2}> No Vigente </MenuItem>
                        </Select>
                    </FormControl>

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
                                    <TableCell width="15%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Departamento</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Cenco</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Num Ficha</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Rut</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="30%" align="center"><strong>Asignación</strong></TableCell>
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
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            onClick={() => setEditar(true)}
                                            sx={{
                                                fontSize: "0.7rem", lineHeight: 1, color: "black", p: 0.9, bgcolor: "rgb(241, 241, 241)"
                                            }}
                                        >
                                            Asignación
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/*<TablePagination
                    rowsPerPageOptions={[]}
                    component="div"
                    count={cargosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                /> */}
            </Paper>

            {/* Dialog editar/asignación */}
            <Dialog open={editar} sx={{ textAlign: "center", }} maxWidth="lg" fullWidth>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "100%", }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9", mx: "auto" }}>
                                <DialogTitle>Historial de turnos asignados</DialogTitle>
                                <TableContainer component={Paper} variant="outlined" sx={{ flex: 1, minHeight: '366px', width: '100%', overflow: 'auto' }}>
                                    <Table stickyHeader sx={{ minWidth: 650 }} aria-label="tabla de turnos">
                                        <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                            <TableRow>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Seleccionar</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Eliminar</TableCell>
                                                <TableCell width="20%" align="left" sx={{ fontWeight: 'bold' }}>Nombre Turno</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Desde</TableCell>
                                                <TableCell width="20%" align="center" sx={{ fontWeight: 'bold' }}>Hasta</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            <TableRow hover>
                                                <TableCell align="center">
                                                    <Radio size="small" name="seleccion-turno" />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Checkbox size="small" />
                                                </TableCell>
                                                <TableCell align="left">
                                                    Turno 43 - 15:00:00 a 23:30:00
                                                </TableCell>
                                                <TableCell align="center">2025-10-06</TableCell>
                                                <TableCell align="center">2025-10-10</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box display={"flex"} gap={2} mt={2}>
                                    <Button variant="contained" color="primary" sx={{ px: 2, py: 0.5, fontSize: "0.8rem" }}>Asignar / Remplazar Turno</Button>
                                    <Button variant="outlined" color="error" sx={{ px: 2, py: 0.5, fontSize: "0.8rem" }}>Eliminar Seleccionado(S)</Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error" >Salir</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTurnosRotativosAsignacion;