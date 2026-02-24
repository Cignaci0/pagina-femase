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
import { obtenerDepartamentos } from "../../../services/departamentosServices"
import { crearDepto } from "../../../services/departamentosServices"
import CircleIcon from '@mui/icons-material/Circle';
import { actualizarDepto } from "../../../services/departamentosServices"
import * as XLSX from 'xlsx';
import { obtenerCargos } from "../../../services/cargosServices"
import { crearCargo } from "../../../services/cargosServices"
import { actualizarCargo } from "../../../services/cargosServices"

function AdminCargos() {

    // Estados de datos
    const [error, setError] = useState(null);
    const [cargos, setCargos] = useState([])
    const [empresas, setEmpresas] = useState([""])
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);
    const [busqueda, setBusqueda] = useState("");
    const [filtroestado, setFiltroEstado] = useState("")

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")
    const [idEmpresaCrear, setIdEmpresaCrear] = useState("")

    // Estados editar
    const [editId, setEditId] = useState("")
    const [mostrarEdit, setMostrarEdit] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [idEmpresaEdit, setIdEmpresaEdit] = useState("")

    // Carga de datos
    const cargarCargos = async () => {
        try {
            const respuesta = await obtenerCargos()
            setCargos(respuesta)
        } catch (error) {
            setError("Error al traer los cargos")
        }
    }

    const obtenerEmpresasCrear = async () => {
        try {
            const respuesta = await obtenerEmpresas()
            setEmpresas(respuesta)
        } catch (error) {
            setError(error.message || " error al traer empresas")
        }
    }

    // Exportacion
    const prepararDatosParaExportar = () => {
        return cargosFiltrados.map(cargo => ({
            "ID Cargo": cargo.cargo_id,
            "Nombre Cargo": cargo.nombre,
            "Empresa": cargo.empresa?.nombre_empresa || 'Sin Empresa',
            "Estado": cargo.estado?.estado_id === 1 ? 'Vigente' : 'No Vigente',
            "Fecha Creación": cargo.fecha_creacion,
            "Fecha Actualización": cargo.fecha_actualizacion,
            "Usuario Creador": cargo.usuario_creador
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Cargos");
        XLSX.writeFile(wb, "Reporte_Cargos.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Cargos.csv");
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
        let html = '<html><head><title>Imprimir Cargos</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Cargos</h1><table>';

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
        setOpen(false)
        setNuevoNombre("")
        setNuevoEstado("")
        setIdEmpresaCrear("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    // Acciones crear y editar
    const clickCrear = async () => {
        try {
            const respuesta = await crearCargo(nuevoNombre, nuevoEstado, idEmpresaCrear)
            setMensajeExito("Se creo con exito")
            setOpen(false)
            cargarCargos()
            setNuevoNombre("")
            setNuevoEstado("")
            setIdEmpresaCrear("")
        } catch (error) {
            setError(error.message || "Error al crear el cargo")
        }
    }

    const clickEdit = async () => {
        try {
            const respuesta = await actualizarCargo(editId, editNombre, editEstado, idEmpresaEdit)
            setMostrarEdit(false)
            setMensajeExito("Se edito con exito")
            cargarCargos()
        } catch (error) {
            setError(error.message || "error al editar")
        }
    }

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

    const filasVacias = filaPorPagina - Math.min(filaPorPagina, cargosFiltrados.length - pagina * filaPorPagina);

    // Effects
    useEffect(() => {
        obtenerEmpresasCrear()
    }, [])

    useEffect(() => {
        cargarCargos()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtroestado,]);

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
                    Admin Cargos
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

                    {/* Filtro estado */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtroestado} onChange={(e) => setFiltroEstado(e.target.value)} label="Estado">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            <MenuItem value={1}> Vigente </MenuItem>
                            <MenuItem value={2}> No Vigente </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Botones de exportacion */}
                    <Stack direction="row" spacing={2} sx={{ ml: 3 }}>
                        <Paper
                            onClick={copiarPortapapeles}
                            sx={{
                                bgcolor: "#4682B4", color: "white",
                                width: 60, height: 40,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", borderRadius: 1.5,
                                '&:hover': { opacity: 0.8 }
                            }}>
                            <ContentPasteIcon sx={{ fontSize: 20 }} />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>COPIAR</Typography>
                        </Paper>

                        <Paper
                            onClick={descargarExcel}
                            sx={{
                                bgcolor: "#40A333", color: "white",
                                width: 60, height: 40,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", borderRadius: 1.5,
                                '&:hover': { opacity: 0.8 }
                            }}>
                            <FaFileExcel size={20} />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>EXCEL</Typography>
                        </Paper>

                        <Paper
                            onClick={descargarCSV}
                            sx={{
                                bgcolor: "#E67E45", color: "white",
                                width: 60, height: 40,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", borderRadius: 1.5,
                                '&:hover': { opacity: 0.8 }
                            }}>
                            <FaFileCsv size={20} />
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 'bold' }}>CSV</Typography>
                        </Paper>

                        <Paper
                            onClick={imprimirDatos}
                            sx={{
                                bgcolor: "#8E67AD", color: "white",
                                width: 60, height: 40,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                cursor: "pointer", borderRadius: 1.5,
                                '&:hover': { opacity: 0.8 }
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
                                    <TableCell width="20%"><strong>Id</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Creador</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargosFiltrados.length > 0 ? (
                                    cargosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow key={row.cargo_id}>
                                                <TableCell>{row.cargo_id}</TableCell>
                                                <TableCell align="center">{row.nombre}</TableCell>
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
                                                            setEditId(row.cargo_id)
                                                            setEditNombre(row.nombre)
                                                            setIdEmpresaEdit(row.empresa?.empresa_id)
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
                                                {cargosFiltrados
                                                    ? "No se encontraron cargos"
                                                    : "No se encontraron cargos. "}
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
            <Dialog open={open} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Agregar Nuevo Cargo</DialogTitle>

                                <FormControl size="small" fullWidth >
                                    <InputLabel>Empresa</InputLabel>
                                    <Select
                                        value={idEmpresaCrear}
                                        onChange={(e) => setIdEmpresaCrear(e.target.value)}
                                        label="Empresa"
                                        sx={{ width: "40vh" }}
                                    >
                                        {empresas.map((e) => (
                                            <MenuItem key={e.empresa_id} value={e.empresa_id}>
                                                {e.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                    {idEmpresaCrear === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>


                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        fullWidth label="Nombre"
                                        helperText={nuevoNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>

                                <FormControl size="small" fullWidth >
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                        label="Estado"


                                    >
                                        <MenuItem value={1}>
                                            Vigente
                                        </MenuItem>

                                        <MenuItem value={2}>
                                            No Vigente
                                        </MenuItem>
                                    </Select>
                                    {nuevoEstado === "" && <FormHelperText>El Estado es obligatorio</FormHelperText>}
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button onClick={clickCrear} variant="contained" color="primary" disabled={nuevoEstado === "" || nuevoNombre.trim() === ""}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Editar Cargo</DialogTitle>

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Empresa</InputLabel>
                                    <Select
                                        value={idEmpresaEdit}
                                        onChange={(e) => setIdEmpresaEdit(e.target.value)}
                                        label="Empresa"
                                        sx={{ width: "40vh" }}
                                    >
                                        {empresas.map((e) => (
                                            <MenuItem key={e.empresa_id} value={e.empresa_id}>
                                                {e.nombre_empresa}
                                            </MenuItem>
                                        ))}

                                    </Select>
                                </FormControl>


                                <Box sx={{ mt: 2, mb: 2 }}>
                                    <TextField
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        fullWidth label="Nombre"
                                        helperText={editNombre.trim() === "" ? "El Nombre es obligatorio" : ""}>
                                    </TextField>
                                </Box>

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={editEstado}
                                        onChange={(e) => setEditEstado(e.target.value)}
                                        label="Estado"
                                        helperText={editEstado === "" ? "El Estado es obligatorio" : ""}

                                    >
                                        <MenuItem value={1}>
                                            Vigente
                                        </MenuItem>

                                        <MenuItem value={2}>
                                            No Vigente
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button onClick={clickEdit} variant="contained" color="primary" disabled={editEstado === "" || editNombre.trim() === ""}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminCargos;