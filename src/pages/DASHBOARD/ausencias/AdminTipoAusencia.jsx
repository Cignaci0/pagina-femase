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

import { obtenerEmpresas, crearEmpresa, actualizarEmpresa } from "../../../services/empresasServices";
import { regiones, comunas } from "../../../utils/dataGeografica";

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DraftsIcon from '@mui/icons-material/Drafts';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import * as XLSX from 'xlsx';
import { getTipoAusencia, updateTipoAusencia, createTipoAusencia } from "../../../services/tiposAusencia";



function AdminTipoAusencia() {

    // Estados de datos
    const [tipoAusencia, setTipoAusencia] = useState([])
    const [cargando, setCargando] = useState(false);
    
    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("")
    const [filtroEstado, setfiltroEstado] = useState("")
    const [filtrojustificaHrs, setFiltrojustificaHrs] = useState("")
    const [filtroPagada, setFiltroPagada] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoTipo, setNuevoTipo] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")
    const [nuevoJustificaHora, setNuevoJustificaHora] = useState("")
    const [nuevoPagadas, setNuevoPagadas] = useState("")

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editTipo, setEditTipo] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editJustidicaHora, setEditJustidicaHora] = useState("")
    const [editPagadas, setEditPagadas] = useState("")

    // Carga de datos
    const cargarDatos = async () => {
        try {
            const datos = await getTipoAusencia();
            setTipoAusencia(datos);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const clickGuardarEdit = async () => {
        try {
            const datos = {
                nombre: editNombre,
                tipo: editTipo,
                estado_id: editEstado,
                justifica_hrs: editJustidicaHora,
                pagada_empleador: editPagadas
            }
            const respuesta = await updateTipoAusencia(editId, datos)
            toast.success("Tipo de ausencia actualizado correctamente");
            setOpenEdit(false);
            cargarDatos();
        } catch (error) {
            toast.error(error.message);
        }
    }

    const clickGuardarCrear = async () => {
        try {
            const datos = {
                nombre: nuevoNombre,
                tipo: nuevoTipo,
                estado_id: nuevoEstado,
                justifica_hrs: nuevoJustificaHora,
                pagada_empleador: nuevoPagadas
            }
            const respuesta = await createTipoAusencia(datos)
            toast.success("Tipo de ausencia creado correctamente");
            setOpen(false);
            setNuevoNombre("")
            setNuevoTipo("")
            setNuevoEstado("")
            setNuevoJustificaHora("")
            setNuevoPagadas("")
            cargarDatos();
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Exportacion
    const prepararDatosParaExportar = () => {
        return tipoAusenciaFiltradas.map(tipoAu => ({
            "Nombre": tipoAu.nombre,
            "Tipo": tipoAu.tipo === 1 ? "Remunerada" : "No Remunerada",
            "Estado": tipoAu.estado?.estado_id === 1 ? 'Vigente' : 'No Vigente',
            "Justifica Hrs": tipoAu.justifica_hrs ? "Si" : "No",
            "Pagada por empleador": tipoAu.pagada_empleador ? "Si" : "No",
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tipo Ausencia");
        XLSX.writeFile(wb, "Reporte_Tipo_Ausencia.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Tipo_Ausencia.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copiarPortapapeles = () => {
        const data = prepararDatosParaExportar();
        if (data.length === 0) return;
        const headers = Object.keys(data[0]).join("\t");
        const rows = data.map(row => Object.values(row).join("\t")).join("\n");
        const texto = `${headers}\n${rows}`;
        navigator.clipboard.writeText(texto).then(() => {
            toast.success("¡Datos copiados al portapapeles!");
        });
    };

    const imprimirDatos = () => {
        const data = prepararDatosParaExportar();
        const ventanaImpresion = window.open('', '', 'height=600,width=800');
        let html = '<html><head><title>Imprimir Tipo Ausencia</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Tipo Ausencia</h1><table>';

        if (data.length > 0) {
            html += '<thead><tr>';
            Object.keys(data[0]).forEach(header => html += `<th>${header}</th>`);
            html += '</tr></thead><tbody>';
            data.forEach(row => {
                html += '<tr>';
                Object.values(row).forEach(val => html += `<td>${val || ''}</td>`);
                html += '</tr>';
            });
        } else {
            html += '<tr><td>No hay datos para mostrar</td></tr>';
        }
        html += '</tbody></table></body></html>';
        ventanaImpresion.document.write(html);
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
        setTimeout(() => {
            ventanaImpresion.print();
            ventanaImpresion.close();
        }, 500);
    };

    // Manejo de dialogs
    const [openDesplegar, setOpenDesplagar] = useState("")

    const cerrarDialog = () => {
        setOpen(false);
        setNuevoNombre("")
        setNuevoTipo("")
        setNuevoEstado("")
        setNuevoJustificaHora("")
        setNuevoPagadas("")

    }

    const cerrarDialogEdit = () => {
        setOpenEdit(false)
    }

    const cerrarEmail = () => {
        setOpenDesplagar(false)
    }

    // Filtrado y paginacion
    const tipoAusenciaFiltradas = tipoAusencia.filter((tipoAu) => {
        const textoBusqueda = `${tipoAu.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)

        const coincideTipo = filtroTipo ? tipoAu.tipo === filtroTipo : true
        const coincideEstado = filtroEstado ? tipoAu.estado?.estado_id === filtroEstado : true
        const coincideJustifica = filtrojustificaHrs !== "" ? tipoAu.justifica_hrs === filtrojustificaHrs : true
        const coincidePagada = filtroPagada !== "" ? tipoAu.pagada_empleador === filtroPagada : true

        return coincideTexto && coincideTipo && coincideEstado && coincideJustifica && coincidePagada;
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
        cargarDatos();
    }, []);

    // Renderizado condicional
    if (cargando) return ;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Tipo Ausencia
                </Typography>
            </Box>

            {/* Alerta de exito */}
            

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, }}>

                    {/* Barra de busqueda */}
                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", alignItems: "center", width: { xs: "100%", md: "200px" }, height: "40px", }}>
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

                    {/* Filtros de seleccion */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value={1}>Remunerada</MenuItem>
                            <MenuItem value={2}>No Remunerada</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }} >
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Estado" value={filtroEstado} onChange={(e) => setfiltroEstado(e.target.value)} >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value={1}>Vigente</MenuItem>
                            <MenuItem value={2}>No vigente</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Justifica Hrs</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Justifica Hrs" value={filtrojustificaHrs} onChange={(e) => setFiltrojustificaHrs(e.target.value)}>
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value={true}>Si</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Pagada</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Pagada" value={filtroPagada} onChange={(e) => setFiltroPagada(e.target.value)}>
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value={true}>Si</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Boton desplegar */}
                    <Paper
                        onClick={() => setOpenDesplagar(true)}
                        sx={{
                            bgcolor: "#8E67AD", color: "white", width: 80, height: 40,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                        }}>
                        <AddIcon sx={{ fontSize: 20 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>DESPLEGAR</Typography>
                    </Paper>

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>
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
                                    <TableCell width="14.28%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Tipo</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Justifica hrs</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Pagada por empleador</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {tipoAusenciaFiltradas.length > 0 ? (
                                    tipoAusenciaFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((tipoAu) => (
                                            <TableRow key={tipoAu.id}>
                                                <TableCell align="center">
                                                    {tipoAu.nombre}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tipoAu.tipo === 1 ? "Remunerada" : "No Remunerada"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon sx={{ fontSize: "1rem", color: tipoAu.estado?.estado_id === 1 ? "#4caf50" : "#f44336" }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tipoAu.justifica_hrs ? "Si" : "No"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {tipoAu.pagada_empleador ? "Si" : "No"}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => {
                                                        setOpenEdit(true);
                                                        setEditId(tipoAu.id);
                                                        setEditNombre(tipoAu.nombre);
                                                        setEditTipo(tipoAu.tipo);
                                                        setEditEstado(tipoAu.estado?.estado_id);
                                                        setEditJustidicaHora(tipoAu.justifica_hrs);
                                                        setEditPagadas(tipoAu.pagada_empleador);
                                                    }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography variant="body1" color="text.secondary">No se encontraron registros.</Typography></TableCell></TableRow>
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={tipoAusenciaFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Nuevo Tipo Ausencia</DialogTitle>
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        label="Tipo"
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value={1}>Remunerada</MenuItem>
                                        <MenuItem value={2}>No remunerada</MenuItem>
                                    </Select>
                                    {nuevoTipo === "" && <FormHelperText>El Tipo es obligatorio</FormHelperText>}
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        label="Estado"
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
                                    </Select>
                                    {nuevoEstado === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>

                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Justifica horas</InputLabel>
                                    <Select
                                        label="Justifica horas"
                                        value={nuevoJustificaHora}
                                        onChange={(e) => setNuevoJustificaHora(e.target.value)}
                                    >
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                    {nuevoJustificaHora === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                                </FormControl>
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Pagadas</InputLabel>
                                    <Select
                                        label="Pagadas"
                                        value={nuevoPagadas}
                                        onChange={(e) => setNuevoPagadas(e.target.value)}
                                    >
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                    {nuevoPagadas === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickGuardarCrear} variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={openEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                                <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Tipo Ausencia</DialogTitle>
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        label="Tipo"
                                        value={editTipo}
                                        onChange={(e) => setEditTipo(e.target.value)}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value={1}>Remunerada</MenuItem>
                                        <MenuItem value={2}>No remunerada</MenuItem>
                                    </Select>
                                    {editTipo === "" && <FormHelperText>El Tipo es obligatorio</FormHelperText>}
                                </FormControl>
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        label="Estado"
                                        value={editEstado}
                                        onChange={(e) => setEditEstado(e.target.value)}
                                    >
                                        <MenuItem value={1}>Vigente</MenuItem>
                                        <MenuItem value={2}>No Vigente</MenuItem>
                                    </Select>
                                    {editEstado === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Justifica horas</InputLabel>
                                    <Select
                                        label="Justifica horas"
                                        value={editJustidicaHora}
                                        onChange={(e) => setEditJustidicaHora(e.target.value)}
                                    >
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                    {editJustidicaHora === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                                </FormControl>
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Pagadas</InputLabel>
                                    <Select
                                        label="Pagadas"
                                        value={editPagadas}
                                        onChange={(e) => setEditPagadas(e.target.value)}
                                    >
                                        <MenuItem value={true}>Si</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                    {editPagadas === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickGuardarEdit} variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog desplegar */}
            <Dialog open={openDesplegar} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9"}}>
                                <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                                    <Stack direction="row" spacing={2}>
                                        <Paper
                                            onClick={copiarPortapapeles}
                                            sx={{
                                                bgcolor: "#4682B4", color: "white", width: 60, height: 40,
                                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                                            }} >
                                            <ContentPasteIcon sx={{ fontSize: 20 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>COPIAR</Typography>
                                        </Paper>
                                        <Paper
                                            onClick={descargarExcel}
                                            sx={{
                                                bgcolor: "#40A333", color: "white", width: 60, height: 40,
                                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                                            }}>
                                            <FaFileExcel size={20} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>EXCEL</Typography>
                                        </Paper>
                                        <Paper
                                            onClick={descargarCSV}
                                            sx={{
                                                bgcolor: "#E67E45", color: "white", width: 60, height: 40,
                                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                                            }}>
                                            <FaFileCsv size={20} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>CSV</Typography>
                                        </Paper>
                                        <Paper
                                            onClick={imprimirDatos}
                                            sx={{
                                                bgcolor: "#8E67AD", color: "white", width: 60, height: 40,
                                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                                cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                                            }}>
                                            <PrintIcon sx={{ fontSize: 20 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>IMPRIMIR</Typography>
                                        </Paper>
                                    </Stack>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <Button variant="outlined" color="error" onClick={cerrarEmail}>
                                        cerrar
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}
export default AdminTipoAusencia;