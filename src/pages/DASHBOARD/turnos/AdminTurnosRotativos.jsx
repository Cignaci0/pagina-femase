import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, CircularProgress,
    Container, TablePagination,
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';


function AdminTurnosRotativos() {

    // Estados de datos
    const [turnosRotativos, setTurnosRotativos] = useState([])
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(false);

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
    const [nocturnoCrear, setNocturnoCrear] = useState("")
    const [estadoCrear, setEstadoCrear] = useState("")

    // Estados editar
    const [editar, setEditar] = useState(false)
    const [idEdit, setIdEdit] = useState("")
    const [empresaEdit, setEmpresaEdit] = useState("")
    const [nombreEdit, setNombreEdit] = useState("")
    const [nocturnoEdit, setNocturnoEdit] = useState("")
    const [estadoEdit, setEstadoEdit] = useState("")

    const cargarEmpresas = async () => {
        try {
            const dataEmpresas = await obtenerEmpresas();
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Manejo de dialogs
    const cerrarCrear = () => {
        setCrear(false)
        setEmpresaCrear("")
        setNombreCrear("")
        setNocturnoCrear("")
        setEstadoCrear("")
    }
    const cerrarEditar = () => {
        setEditar(false)
        setIdEdit("")
        setEmpresaEdit("")
        setNombreEdit("")
        setNocturnoEdit("")
        setEstadoEdit("")
    }


    // Filtrado y paginacion
    const turnosFiltrados = turnosRotativos.filter((tr) => {
        const nombreTurno = `${tr.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreTurno.includes(term);
        const coincideEstado = filtroestado ? tr.estado?.estado_id === filtroestado : true;
        const coincideEmpresa = empresasFiltro ? tr.empresa?.empresa_id === empresasFiltro : true;
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
        cargarTurnosRotativos();
        cargarEmpresas();
    }, []);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado, empresasFiltro]);


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Turnos Rotativos
                </Typography>
            </Box>

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
                            <MenuItem value=""><em>Todos</em></MenuItem>
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
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de turnos rotativos">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="20%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Nocturno</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="15%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {turnosFiltrados.length > 0 ? (
                                    turnosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((tr) => (
                                            <TableRow key={tr.id}>
                                                <TableCell align="center">
                                                    {tr.empresa?.nombre_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tr.nombre}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tr.nocturno === true ? "Sí" : "No"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: tr.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tr.fecha_creacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tr.fecha_actualizacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setEditar(true)
                                                        setIdEdit(tr.id)
                                                        setEmpresaEdit(tr.empresa?.empresa_id || "")
                                                        setNombreEdit(tr.nombre || "")
                                                        setNocturnoEdit(tr.nocturno != null ? tr.nocturno : "")
                                                        setEstadoEdit(tr.estado?.estado_id || "")
                                                    }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell align="center" colSpan={7}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron turnos rotativos
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
                    count={turnosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
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
                                    <Select label="Empresa" value={empresaCrear} onChange={(e) => setEmpresaCrear(e.target.value)}>
                                        {empresas.map((emp) => (
                                            <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                                {emp.nombre_empresa}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth label="Nombre" size="small" sx={{ mb: 2 }}
                                    value={nombreCrear}
                                    onChange={(e) => setNombreCrear(e.target.value)}
                                />

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Nocturno</InputLabel>
                                    <Select label="Nocturno" value={nocturnoCrear} onChange={(e) => setNocturnoCrear(e.target.value)}>
                                        <MenuItem value={true}>Sí</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoCrear} onChange={(e) => setEstadoCrear(e.target.value)}>
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
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
                                    <Select label="Empresa" value={empresaEdit} onChange={(e) => setEmpresaEdit(e.target.value)}>
                                        {empresas.map((emp) => (
                                            <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                                {emp.nombre_empresa}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth label="Nombre" size="small" sx={{ mb: 2 }}
                                    value={nombreEdit}
                                    onChange={(e) => setNombreEdit(e.target.value)}
                                />

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Nocturno</InputLabel>
                                    <Select label="Nocturno" value={nocturnoEdit} onChange={(e) => setNocturnoEdit(e.target.value)}>
                                        <MenuItem value={true}>Sí</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select label="Estado" value={estadoEdit} onChange={(e) => setEstadoEdit(e.target.value)}>
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
                                    </Select>
                                </FormControl>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarEditar} color="error">Cancelar</Button>
                    <Button onClick={clickEditar} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminTurnosRotativos;