import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";
import { obtenerEmpresas } from "../../../services/empresasServices"
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { FaFileExcel } from "react-icons/fa";
import { FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { crearDepto } from "../../../services/departamentosServices"
import { actualizarDepto } from "../../../services/departamentosServices"
import * as XLSX from 'xlsx';

function AdminDepartamentos() {

    // Estados de datos
    const [departamentos, setDepartamentos] = useState([]);
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState("");

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevaEmpresa, setNuevaEmpresa] = useState("")
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editEmpresa, setEditEmpresa] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editEstado, setEditEstado] = useState("")

    // Carga de datos
    const cargarDatos = async () => {
        try {
            const [dataEmpresas] = await Promise.all([
                obtenerEmpresas()
            ]);
            setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas]);
        } catch (err) {
            console(err)
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }

    const cargarDepto = async () => {
        setCargando(true);
        try {
            const data = await obtenerDepartamentos();
            setDepartamentos(data);
        } catch (err) {
            setDepartamentos([]);
        } finally {
            setCargando(false);
        }
    };

    // Exportacion
    const prepararDatosParaExportar = () => {
        return departamentosFiltrados.map(dep => ({
            "ID Departamento": dep.departamento_id,
            "Empresa": dep.empresa?.nombre_empresa || 'Sin Empresa',
            "Nombre Departamento": dep.nombre_departamento,
            "Estado": dep.estado?.estado_id === 1 ? 'Vigente' : 'No Vigente',
            "Fecha Creación": dep.fecha_creacion,
            "Fecha Actualización": dep.fecha_actualizacion,
            "Usuario Creador": dep.usuario_creador
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Departamentos");
        XLSX.writeFile(wb, "Reporte_Departamentos.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Departamentos.csv");
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
        let html = '<html><head><title>Imprimir Departamentos</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Departamentos</h1><table>';

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
        setOpen(false);
        setNuevaEmpresa("")
        setNuevoEstado("")
        setNuevoNombre("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    const clickCrearDepto = async () => {
        try {
            const respuesta = await crearDepto(nuevoNombre, nuevoEstado, nuevaEmpresa)
            setOpen(false)
            setMensajeExito("Departamento creado con exito")
            cargarDatos()
            setNuevoEstado("")
            setNuevaEmpresa("")
            setNuevoNombre("")
            cargarDepto()
        } catch (error) {
            if (error.message === "Failed fetch") {
                setError("Error de conexion")
            } else {
                setError(error.message || "Error al crear el departamento")
            }
        }
    }

    const clickEditar = async () => {
        try {
            await actualizarDepto(
                editId,
                editNombre,
                editEstado,
                editEmpresa,
            )
            if (filtroEmpresa) {
                const dataActualizada = await obtenerDepartamentos(filtroEmpresa);
                setDepartamentos(dataActualizada);
            }
            setMostrarEdit(false)
            setMensajeExito("Se edito con exito")
            cargarDepto()
        } catch (err) {
            setError(err.message);
        }
    }

    // Filtrado y paginacion
    const departamentosFiltrados = departamentos.filter((dep) => {
        const nombreDepto = `${dep.nombre_departamento || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreDepto.includes(term);

        const coincideEmpresa = filtroEmpresa
            ? dep.empresa?.empresa_id == filtroEmpresa
            : true;

        return coincideTexto && coincideEmpresa;
    });

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const filasVacias = filaPorPagina - Math.min(filaPorPagina, departamentosFiltrados.length - pagina * filaPorPagina);

    // Effects
    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        cargarDepto();
    }, [filtroEmpresa]);

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroEmpresa,]);

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
                    Admin Departamentos
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

                    {/* Filtro de empresa */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)} label="Empresa">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empresas.map((empresa) => (
                                <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

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
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative" 
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="20%"><strong>Empresa</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Creador</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {departamentosFiltrados.length > 0 ? (
                                    departamentosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow key={row.departamento_id}>
                                                <TableCell>{row.empresa?.nombre_empresa}</TableCell>
                                                <TableCell align="center">{row.nombre_departamento}</TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: row.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.fecha_creacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.fecha_actualizacion}
                                                </TableCell>
                                                <TableCell>
                                                    {row.usuario_creador}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        onClick={() => {
                                                            setEditId(row.departamento_id)
                                                            setEditEmpresa(row.empresa?.empresa_id)
                                                            setEditNombre(row.nombre_departamento)
                                                            setEditEstado(row.estado?.estado_id)
                                                            setMostrarEdit(true);
                                                        }}
                                                        sx={{ padding: 0 }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {departamentosFiltrados
                                                    ? "Seleccione una empresa para ver los departamentos."
                                                    : "No se encontraron departamentos. "}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {filasVacias > 0 && (
                                    <TableRow style={{ height: 53 * filasVacias }}>
                                        <TableCell colSpan={7} />
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
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Nuevo Departamento</DialogTitle>

                            {/* Campo empresa */}
                            <FormControl size="small" fullWidth  sx={{ mb: 2 }}>
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    label="Empresa"
                                    value={nuevaEmpresa}
                                    onChange={(e) => setNuevaEmpresa(e.target.value)}
                                >
                                    {Array.isArray(empresas) && empresas.map((emp) => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                            {emp.nombre_empresa}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {nuevaEmpresa === "" && <FormHelperText>Seleccione una empresa</FormHelperText>}
                            </FormControl>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Nombre Departamento"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    helperText={nuevoNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                />
                            </Box>

                            {/* Campo estado */}
                            <FormControl size="small" fullWidth>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    label="Estado"
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                >
                                    <MenuItem value={1}>Vigente</MenuItem>
                                    <MenuItem value={2}>No Vigente</MenuItem>
                                </Select>
                                {nuevoEstado === "" && <FormHelperText>Seleccione un estado</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrearDepto}
                        variant="contained"
                        color="primary"
                        disabled={nuevaEmpresa === "" || nuevoNombre.trim() === "" || nuevoEstado === ""}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, minWidth: "50vh" }}>
                        <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>
                            <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Departamento</DialogTitle>

                            {/* Campo empresa */}
                            <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Empresa</InputLabel>
                                <Select
                                    label="Empresa"
                                    value={editEmpresa}
                                    onChange={(e) => setEditEmpresa(e.target.value)}
                                >
                                    {Array.isArray(empresas) && empresas.map((emp) => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                            {emp.nombre_empresa}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editEmpresa === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>

                            {/* Campo nombre */}
                            <Box sx={{ mb: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Nombre Departamento"
                                    value={editNombre}
                                    onChange={(e) => setEditNombre(e.target.value)}
                                    helperText={editNombre.trim() === "" ? "El nombre es obligatorio" : ""}
                                />
                            </Box>

                            {/* Campo estado */}
                            <FormControl size="small" fullWidth >
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    label="Estado"
                                    value={editEstado}
                                    onChange={(e) => setEditEstado(e.target.value)}
                                >
                                    <MenuItem value={1}>Vigente</MenuItem>
                                    <MenuItem value={2}>No Vigente</MenuItem>
                                </Select>
                                {editEstado === "" && <FormHelperText>Campo obligatorio</FormHelperText>}
                            </FormControl>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button
                        onClick={clickEditar}
                        variant="contained"
                        color="primary"
                        disabled={editEmpresa === "" || editNombre.trim() === "" || editEstado === ""}
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminDepartamentos;