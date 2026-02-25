import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";


import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';



function AdminTipoMarcasManuales() {

    // Estados de datos
    const [departamentos, setDepartamentos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

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
    const [nuevaEmpresa, setNuevaEmpresa] = useState("") // Para limpieza de estados
    const [nuevoDespliegue, setNuevoDespliegue] = useState("") // Para limpieza de estados

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editNombre, setEditNombre] = useState("")
    const [editOrdenDespliegue, setEditOrdenDespliegue] = useState("")
    const [editVigente, setEditVigente] = useState("")

    // Carga de datos
    // (Funciones de carga no definidas explícitamente en el original)

    // Exportacion
    // (Lógica de exportación no definida en este archivo)

    // Manejo de dialogs
    const openDialog = () => setOpen(true);
    const closeDialog = () => {
        setOpen(false);
        setNuevaEmpresa("")
        setNuevoDespliegue("")
        setNuevoNombre("")
    }

    const closeDialogEdit = () => {
        setOpenEdit(false)
    }

    // Filtrado y paginacion
    const departamentosFiltrados = departamentos.filter((dep) => {
        const nombreDepto = `${dep.nombre_departamento || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreDepto.includes(term);

        return coincideTexto;
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
        setPagina(0);
    }, [busqueda]);

    useEffect(() => {
        if (mensajeExito) {
            const timer = setTimeout(() => {
                setMensajeExito("")
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [mensajeExito])

    // Renderizado condicional
    if (cargando) return <Container sx={{ mt: 5, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (mensajeExito) <Container sx={{ mt: 5 }}><Alert severity="success">{mensajeExito}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Tipo Marcas Manuales
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
                                    <TableCell width="16%" align="center"><strong>Orden Despliegue</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Vigente</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Fecha creacion</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Actualización</strong></TableCell>
                                    <TableCell width="16%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">
                                        Olvido marca
                                    </TableCell>

                                    <TableCell align="center">
                                        1
                                    </TableCell>
                                    <TableCell align="center">
                                        Si
                                    </TableCell>
                                    <TableCell align="center">
                                        2019-05-30 00:11:35
                                    </TableCell>

                                    <TableCell align="center">
                                        2019-05-30 00:11:35
                                    </TableCell>

                                    <TableCell align="center">
                                        <IconButton onClick={() => setOpenEdit(true)}>
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
                    count={departamentosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
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

                            {/* Campo orden */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Orden Despliegue</InputLabel>
                                <Select label="Orden Despleigue" value={nuevoOrdenDespliegue} onChange={(e) => setNuevoOrdenDespliegue(e.target.value)}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((e) => (
                                        <MenuItem value={e} key={e}>
                                            {e}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {nuevoOrdenDespliegue === "" && <FormHelperText>La orden es obligatoria</FormHelperText>}
                            </FormControl>

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

                            {/* Campo orden */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Orden Despliegue</InputLabel>
                                <Select label="Orden Despleigue" value={editOrdenDespliegue} onChange={(e) => setEditOrdenDespliegue(e.target.value)}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((e) => (
                                        <MenuItem value={e} key={e}>
                                            {e}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editOrdenDespliegue === "" && <FormHelperText>La orden es obligatoria</FormHelperText>}
                            </FormControl>

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
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTipoMarcasManuales;