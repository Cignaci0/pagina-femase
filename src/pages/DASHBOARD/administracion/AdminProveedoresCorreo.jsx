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
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import * as XLSX from 'xlsx';

function AdminPreoveedorCorreo() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoDominio, setNuevoDominio] = useState("")

    // Estados editar
    const [openEdit, setOpenEdit] = useState(false)
    const [editNombre, setEditNombre] = useState("")
    const [editDominio, setEditDominio] = useState("")

    // Carga de datos
    const cargarDatos = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas(window.localStorage.getItem('token'))
            ]);
            console.log(dataEmpresas);
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    // Exportacion
    const prepararDatosParaExportar = () => {
        return empresasFiltradas.map(empresa => ({
            "Nombre": empresa.nombre_empresa,
            "Rut": empresa.rut_empresa,
            "Direccion": empresa.direccion_empresa,
            "Comuna": empresa.comuna_empresa,
            "Estado": empresa.estado?.estado_id === 1 ? 'Vigente' : 'No Vigente',
            "Email": empresa.email_empresa,
            "Fecha Creación": empresa.fecha_creacion,
            "Fecha Actualización": empresa.fecha_actualizacion,
            "Usuario Creador": empresa.usuario_creador
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Empresas");
        XLSX.writeFile(wb, "Reporte_Empresas.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Empresas.csv");
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
            setMensajeExito("¡Datos copiados al portapapeles!");
        });
    };

    const imprimirDatos = () => {
        const data = prepararDatosParaExportar();
        const ventanaImpresion = window.open('', '', 'height=600,width=800');
        let html = '<html><head><title>Imprimir Empresas</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Empresas</h1><table>';

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
    const closeDialog = () => {
        setOpen(false);
        setNuevoDominio("")
        setNuevonombre("")
    }

    const closeDialogEdit = () => {
        setOpenEdit(false)
    }

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const textoBusqueda = `${empresa.nombre_empresa || ''} ${empresa.rut_empresa || ''} ${empresa.direccion_empresa || ''} ${empresa.rut_empresa || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)

        return coincideTexto;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const filasVacias = filaPorPagina - Math.min(filaPorPagina, empresasFiltradas.length - pagina * filaPorPagina);

    // Effects
    useEffect(() => {
        cargarDatos();
    }, []);

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
                    Admin Proveedores Correo
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

                    {/* Botones de exportacion */}
                    <Stack direction="row" spacing={2} sx={{ ml: 3 }} >
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

                    {/* Boton nuevo registro */}
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ height: "40px", ml: 'auto', }} onClick={(e) => setOpen(true)}>
                        Nuevo Registro
                    </Button>

                </Box>

                {/* Tabla principal */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="14.28%" align="center"><strong>Id</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Dominio</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Fecha Creación</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">
                                        FEMASE
                                    </TableCell>
                                    <TableCell align="center">
                                        FEMASE.CL
                                    </TableCell>
                                    <TableCell align="center">
                                        femase.cl
                                    </TableCell>
                                    <TableCell align="center">
                                        2020-06-27 11:39:12
                                    </TableCell>
                                    <TableCell align="center">
                                        2020-06-27 18:00:00
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={() => setOpenEdit(true)}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>

                                {filasVacias > 0 && (
                                    <TableRow style={{ height: 53 * filasVacias }}>
                                        <TableCell colSpan={10} />
                                    </TableRow>
                                )}

                                {empresas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ alignItems: "center" }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron AFPs.
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
                    rowsPerPageOptions={[]}
                    component="div"
                    count={empresasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >

            {/* Dialog crear */}
            <Dialog open={open} onClose={closeDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Nuevo Correo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo dominio */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Dominio"
                                        value={nuevoDominio}
                                        onChange={(e) => setNuevoDominio(e.target.value)}
                                        helperText={nuevoDominio.trim() === "" ? "El Dominio es obligatorio" : ""}
                                    />
                                </Box>

                            </Paper>
                        </Box>
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
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Correo</DialogTitle>

                                {/* Campo nombre */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                    />
                                </Box>

                                {/* Campo dominio */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Dominio"
                                        value={editDominio}
                                        onChange={(e) => setEditDominio(e.target.value)}
                                        helperText={editDominio.trim() === "" ? "El Dominio es obligatorio" : ""}
                                    />
                                </Box>

                            </Paper>
                        </Box>
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
export default AdminPreoveedorCorreo