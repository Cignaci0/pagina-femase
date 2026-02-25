import React, { useState, useEffect } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography,
    Container,
    Alert,
    FormHelperText
} from "@mui/material";

import CircleIcon from '@mui/icons-material/Circle';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import { 
    obtenerPerfiles, 
    crearPerfilUsuario, 
    actualizarPerfil 
} from "../../../services/perfilUsuariosServices";

function AdminPerfilUsuarios() {

    // Estados de datos
    const [perfiles, setPerfiles] = useState([]);
    const [mensajeExito, setMensajeExito] = useState("");
    const [error, setError] = useState("");

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    // Estados crear
    const [mostrar, setMostrar] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("");
    const [nuevoEstado, setNuevoEstado] = useState("");

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false);
    const [editFilaId, setEditFilaId] = useState(null);
    const [editNombre, setEditNombre] = useState("");
    const [editEstado, setEditEstado] = useState("");

    // Carga de datos
    const cargarPerfiles = async () => {
        try {
            const data = await obtenerPerfiles();
            setPerfiles(data);
        } catch (error) {
            console.error("Error cargando datos:", error.message);
        }
    };

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    const cerrarDialog = () => {
        setMostrar(false)
        setNuevoEstado("")
        setNuevoNombre("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    const clickCrear = async () => {
        try {
            if (!nuevoNombre || !nuevoEstado) {
                setError("Por favor completa todos los campos");
                return;
            }
            await crearPerfilUsuario(nuevoNombre, nuevoEstado)
            setMostrar(false)
            setMensajeExito("Perfil creado con exito")
            cargarPerfiles()
        } catch (error) {
            setError(error.message)
        }
    }

    const clickEditar = async () => {
        try {
            await actualizarPerfil(editFilaId, editNombre, editEstado)
            setMostrarEdit(false)
            cargarPerfiles()
            setMensajeExito("Perfil actualizado con exito")
        } catch (error) {
            setError("Error al actualizar perfil")
        }
    }

    // Filtrado y paginacion
    const filasFiltradas = perfiles.filter((row) =>
        row.nombre_perfil ? row.nombre_perfil.toLowerCase().includes(busqueda.toLowerCase()) : false
    );

    const CambiarPagina = (evento, nuevaPag) => setPagina(nuevaPag);

    const handleBusquedaChange = (event) => {
        setBusqueda(event.target.value);
        setPagina(0);
    };

    // Effects
    useEffect(() => {
        cargarPerfiles();
    }, []);

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
                    Perfiles Usuarios
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
            <Paper elevation={2} sx={{ p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh" }}>
                
                {/* Barra de busqueda */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", sm: "400px" }, height: "50px" }}>
                        <TextField
                            placeholder="NOMBRE"
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={handleBusquedaChange}
                        />
                        <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>

                    <Button
                        variant="contained" startIcon={<AddIcon />} disableElevation sx={{ height: "40px", ml: 'auto' }}
                        onClick={() => setMostrar(true)}>
                        Nuevo registro
                    </Button>
                </Box>

                {/* Tabla principal */}
                <TableContainer sx={{ minHeight: '366px' }}>
                    <Table stickyHeader sx={{ minWidth: 650 }} aria-label="tabla de usuarios">
                        <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                            <TableRow>
                                <TableCell width="20%"><strong>Id</strong></TableCell>
                                <TableCell width="20%"><strong>Nombre</strong></TableCell>
                                <TableCell width="20%" align="center"><strong>Estado</strong></TableCell>
                                <TableCell width="20%" align="center"><strong>Estado nombre</strong></TableCell>
                                <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filasFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row) => {
                                return (
                                    <TableRow key={row.perfil_id || Math.random()} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}>
                                        <TableCell component="th" scope="row">{row.perfil_id}</TableCell>
                                        <TableCell>
                                            {row.nombre_perfil}
                                        </TableCell>
                                        <TableCell align="center">
                                            <CircleIcon
                                                sx={{
                                                    color: row.estado?.estado_id === 1 ? '#4caf50' : '#f44336',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">{row.estado?.nombre_estado}</TableCell>
                                        <TableCell align="center">
                                            <IconButton sx={{ padding: 0 }} onClick={() => {
                                                setEditFilaId(row.perfil_id)
                                                setEditNombre(row.nombre_perfil)
                                                setEditEstado(row.estado?.estado_id)
                                                setMostrarEdit(true)
                                            }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}

                            
                            {perfiles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center">
                                        <Typography variant="body1" color="text.secondary">
                                            No se encontraron perfiles.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Paginacion */}
                <TablePagination
                    component="div"
                    count={filasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    rowsPerPageOptions={[]}
                    page={pagina}
                    onPageChange={CambiarPagina}
                    labelRowsPerPage=""
                />
            </Paper>

            {/* Dialog crear */}
            <Dialog open={mostrar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "40vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle>Crear Perfil</DialogTitle>
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField fullWidth label="Nombre"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        helperText={nuevoNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado"
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <MenuItem value={1}>Activo</MenuItem>
                                        <MenuItem value={2}>Inactivo</MenuItem>
                                    </Select>
                                    {nuevoEstado === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary"
                        disabled={nuevoEstado === "" || nuevoNombre.trim() === ""}
                    >Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, width: "40vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle>Editar Perfil</DialogTitle>
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField fullWidth label="Nombre"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        helperText={editNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>
                                <FormControl size="small" fullWidth >
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado"
                                        value={editEstado}
                                        onChange={(e) => setEditEstado(e.target.value)}
                                    >
                                        <MenuItem value={1}>Activo</MenuItem>
                                        <MenuItem value={2}>Inactivo</MenuItem>
                                    </Select>
                                    {editEstado === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEditar} variant="contained" color="primary"
                        disabled={editEstado === "" || editNombre.trim() === ""}
                    >Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminPerfilUsuarios;