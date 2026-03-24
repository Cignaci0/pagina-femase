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


import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { obtenerTiposMarcas, crearTipoMarca, actualizarTipoMarca } from "../../../services/tipoMarcaService";

function AdminTipoMarcasManuales() {

    // Estados de datos
    const [tipoMarcas, setTipoMarcas] = useState([]);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);
    const [busqueda, setBusqueda] = useState("");
    const [filtroVigente, setFiltroVigente] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoOrdenDespliegue, setNuevoOrdenDespliegue] = useState("")
    const [nuevoVigente, setNuevoVigente] = useState("")

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editOrdenDespliegue, setEditOrdenDespliegue] = useState("")
    const [editVigente, setEditVigente] = useState("")

    // Carga de datos
    const cargarDatos = async () => {
        try {
            const data = await obtenerTiposMarcas();
            setTipoMarcas(data);
        } catch (error) {
            toast.error("Error al cargar los tipos de marcas");
        }
    };

    // Crear 
    const handleCrearTipoMarca = async () => {
        if (!nuevoNombre || !nuevoVigente) {
            toast.error("Por favor complete todos los campos");
            return;
        }
        try {
            await crearTipoMarca(nuevoNombre, nuevoVigente);
            setOpen(false)
            setNuevoNombre("")
            setNuevoVigente("")
            setNuevoOrdenDespliegue("")
            cargarDatos()
            toast.success("Tipo de marca creada exitosamente")
        } catch (error) {
            console.error("Error al crear la marca:", error)
            toast.error("Error al crear el tipo de marca")
        }
    }

    // Editar
    const handleEditarTipoMarca = async () => {
        if (!editNombre || !editVigente) {
            toast.error("Por favor complete todos los campos");
            return;
        }
        try {
            await actualizarTipoMarca(editId, editNombre, editVigente);
            setOpenEdit(false)
            cargarDatos()
            toast.success("Tipo de marca editada exitosamente")
        } catch (error) {
            toast.error("Error al editar el tipo de marca")
        }
    }

    // Manejo de dialogs
    const openDialog = () => setOpen(true);
    const closeDialog = () => {
        setOpen(false);
        setNuevoNombre("")
        setNuevoOrdenDespliegue("")
        setNuevoVigente("")
    }

    const closeDialogEdit = () => {
        setOpenEdit(false)
    }

    // Filtrado y paginacion
    const departamentosFiltrados = tipoMarcas.filter((dep) => {
        const nombreDepto = `${dep.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreDepto.includes(term);

        let coincideVigente = true;
        if (filtroVigente !== "") {
            coincideVigente = dep.estado_id?.estado_id === filtroVigente;
        }

        return coincideTexto && coincideVigente;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    // Validacion para numero
    const handleOrdenChange = (e, setter) => {
        const regex = /^[0-9\b]+$/;
        if (e.target.value === '' || regex.test(e.target.value)) {
            setter(e.target.value);
        }
    }

    // Effects
    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroVigente]);

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Tipo Marcas Manuales
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

                    {/* Filtro vigente */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Vigente</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroVigente} onChange={(e) => setFiltroVigente(e.target.value)} label="Vigente">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}><em>Si</em></MenuItem>
                            <MenuItem value={2}><em>No</em></MenuItem>

                        </Select>
                    </FormControl>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={openDialog}>
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
                                    <TableCell width="16%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Vigente</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {departamentosFiltrados.length > 0 ? (
                                    departamentosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell align="center">
                                                    {row.nombre}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: row.estado_id?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditId(row.tipo_marca_id);
                                                            setEditNombre(row.nombre);
                                                            setEditVigente(row.estado_id?.estado_id);
                                                            setOpenEdit(true);
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron tipos de marcas.
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
                    count={departamentosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>

            {/* Dialog crear */}
            <Dialog open={open} onClose={closeDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Tipo Marca</DialogTitle>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }} >
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                />
                            </Box>

                      

                            {/* Campo vigente */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Vigente</InputLabel>
                                <Select label="Vigente" value={nuevoVigente} onChange={(e) => setNuevoVigente(e.target.value)}>
                                    <MenuItem value={1}>Si</MenuItem>
                                    <MenuItem value={2}>No</MenuItem>
                                </Select>
                                {nuevoVigente === "" && <FormHelperText>El campo es obligatorio</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialog} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCrearTipoMarca}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={closeDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Tipo Marca</DialogTitle>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }} >
                                <TextField
                                    fullWidth
                                    label="Nombre"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                />
                            </Box>

                       

                            {/* Campo vigente */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Vigente</InputLabel>
                                <Select label="Vigente" value={editVigente} onChange={(e) => setEditVigente(e.target.value)}>
                                    <MenuItem value={1}>Si</MenuItem>
                                    <MenuItem value={2}>No</MenuItem>
                                </Select>
                                {editVigente === "" && <FormHelperText>El campo es obligatorio</FormHelperText>}
                            </FormControl>

                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={closeDialogEdit} color="error">Cancelar</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditarTipoMarca}
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTipoMarcasManuales;