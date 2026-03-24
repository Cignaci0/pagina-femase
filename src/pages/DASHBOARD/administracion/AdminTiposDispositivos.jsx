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
import {
    obtenerTiposDispositivo,
    crearTipoDispo,
    actualizarTipoDis
} from "../../../services/tiposDispositivosServices";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';

function AdminTiposDispositivos() {

    // Estados de datos
    const [tipoDispositivos, setTiposDispositivos] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState("");

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoDescripcion, setNuevoDescripcion] = useState("")

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editDescripcion, setEditDescripcion] = useState("")

    // Carga de datos
    const cargarTiposDis = async () => {
        setCargando(true)
        try {
            const data = await obtenerTiposDispositivo()
            setTiposDispositivos(data)
        } catch (err) {
            toast.error(err.message);
            setTiposDispositivos([])
        } finally {
            setCargando(false);
        }
    }

    // Exportacion
    const prepararDatosParaExportar = () => {
        return tipoDispositivosFiltrados.map(tipo => ({
            "ID Tipo": tipo.tipo_dispositivo_id,
            "Nombre": tipo.nombre_tipo || 'Sin Nombre',
            "Descripción": tipo.descripcion || 'Sin Descripción',
            "Fecha Creación": tipo.fecha_creacion,
            "Fecha Actualización": tipo.fecha_actualizacion,
            "Usuario Creador": tipo.usuario_creador
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        if (data.length === 0) return;

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tipos de Dispositivos");
        XLSX.writeFile(wb, "Reporte_Tipos_Dispositivos.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        if (data.length === 0) return;

        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Tipos_Dispositivos.csv");
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
            toast.success("¡Datos de tipos de dispositivos copiados!");
        });
    };

    const imprimirDatos = () => {
        const data = prepararDatosParaExportar();
        const ventanaImpresion = window.open('', '', 'height=600,width=800');

        let html = '<html><head><title>Imprimir Tipos de Dispositivos</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Tipos de Dispositivos</h1><table>';

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
    const abrirDialog = () => setOpen(true);

    const cerrarDialog = () => {
        setNuevoNombre("")
        setNuevoDescripcion("")
        setOpen(false);
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    const clickCrearTipoDis = async () => {
        try {
            const respuesta = await crearTipoDispo(nuevoNombre, nuevoDescripcion)
            setOpen(false)
            toast.success("Tipo dispositivo creado con exito")
            cargarTiposDis()
            setNuevoNombre("")
            setNuevoDescripcion("")
        } catch (error) {
            toast.error(error.message)
        }
    }

    const clickGuardarEdit = async () => {
        try {
            const respuesta = await actualizarTipoDis(editId, editNombre, editDescripcion)
            setMostrarEdit(false)
            toast.success("Se edito con exito")
            cargarTiposDis()
            setNuevoNombre("")
            setNuevoDescripcion("")
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Filtrado y paginacion
    const tipoDispositivosFiltrados = (tipoDispositivos || []).filter((TipoDis) => {
        const nombreTipoDis = `${TipoDis.nombre_tipo || ''} ${TipoDis.descripcion || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        return nombreTipoDis.includes(term);
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
        cargarTiposDis()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroEmpresa,]);

    

    // Renderizado condicional
    if (cargando) return ;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Tipos Dispositivos
                </Typography>
            </Box>

            {/* Alerta de exito */}
            

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column',
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

                    {/* Botones de exportacion */}
                    <Stack direction="row" spacing={2} sx={{ ml: 3 }}>
                        <Paper
                            onClick={copiarPortapapeles}
                            sx={{
                                bgcolor: "#4682B4", color: "white", width: 60, height: 40,
                                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", borderRadius: 1.5, '&:hover': { opacity: 0.8 }
                            }}>
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

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={abrirDialog}>
                        Nuevo Registro
                    </Button>

                </Box>

                {/* Tabla principal */}
                <TableContainer sx={{ flex: 1, overflowY: "auto", }}>
                    <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} >
                        <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                            <TableRow>
                                <TableCell width="8%"><strong>Id</strong></TableCell>
                                <TableCell width="14%"><strong>Nombre</strong></TableCell>
                                <TableCell width="14%" align="center"><strong>Descripción</strong></TableCell>
                                <TableCell width="14%" align="center"><strong>Fecha creación</strong></TableCell>
                                <TableCell width="14%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                <TableCell width="14%" align="center"><strong>Creador</strong></TableCell>
                                <TableCell width="8%" align="center"><strong>Editar</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tipoDispositivosFiltrados
                                .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                .map((tipoDis) => {
                                    return (
                                        <TableRow key={tipoDis.tipo_dispositivo_id}>
                                            <TableCell>
                                                {tipoDis.tipo_dispositivo_id}
                                            </TableCell>
                                            <TableCell>
                                                {tipoDis.nombre_tipo}
                                            </TableCell>
                                            <TableCell>
                                                {tipoDis.descripcion}
                                            </TableCell>
                                            <TableCell align="center">
                                                {tipoDis.fecha_creacion}
                                            </TableCell>
                                            <TableCell align="center">
                                                {tipoDis.fecha_actualizacion}
                                            </TableCell>
                                            <TableCell align="center">
                                                {tipoDis.usuario_creador}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => {
                                                    setEditId(tipoDis.tipo_dispositivo_id)
                                                    setEditNombre(tipoDis.nombre_tipo)
                                                    setEditDescripcion(tipoDis.descripcion)
                                                    setMostrarEdit(true)
                                                }}>
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            
                            {tipoDispositivos.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ alignItems: "center" }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No se encontraron tipos de dispositvos.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={tipoDispositivosFiltrados.length}
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

                                <DialogTitle>Agregar Nuevo Tipo de Dispositivo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        fullWidth label="Nombre"
                                        helperText={nuevoNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>

                                {/* Campo descripcion */}
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={nuevoDescripcion}
                                        onChange={(e) => setNuevoDescripcion(e.target.value)}
                                        helperText={nuevoDescripcion.trim() === "" ? "La Descripción es obligatoria" : ""}
                                        fullWidth label="Descripción">
                                    </TextField>
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrearTipoDis} variant="contained" color="primary"
                        disabled={
                            nuevoNombre.trim() === "" ||
                            nuevoDescripcion.trim() === ""
                        }>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Agregar Nuevo Tipo de Dispositivo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        fullWidth label="Nombre"
                                        helperText={editNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>

                                {/* Campo descripcion */}
                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={editDescripcion}
                                        onChange={(e) => setEditDescripcion(e.target.value)}
                                        fullWidth label="Descripción"
                                        helperText={editDescripcion.trim() === "" ? "La Descripción es obligatoria" : ""}>
                                    </TextField>
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickGuardarEdit} variant="contained" color="primary" disabled={
                        editNombre.trim() === "" ||
                        editDescripcion.trim() === ""
                    }>Guardar</Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
export default AdminTiposDispositivos;