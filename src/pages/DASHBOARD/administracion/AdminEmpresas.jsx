import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";
import { obtenerEmpresas, crearEmpresa, actualizarEmpresa } from "../../../services/empresasServices";
import { regiones, comunas } from "../../../utils/dataGeografica";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DraftsIcon from '@mui/icons-material/Drafts';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CircleIcon from '@mui/icons-material/Circle';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import * as XLSX from 'xlsx';

function AdminEmpresas() {

    // Estados de datos
    const [empresas, setEmpresas] = useState([])
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState("")

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEmpresa, setFiltroEmpresa] = useState("");

    // Estados crear
    const [open, setOpen] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState("")
    const [nuevoRun, setNuevoRun] = useState("")
    const [nuevoDireccion, setNuevoDireccion] = useState("")
    const [nuevoRegion, setNuevoRegion] = useState("")
    const [nuevoComuna, setNuevoComuna] = useState("")
    const [nuevoEstado, setNuevoEstado] = useState("")
    const [nuevoEmail, setNuevoEmail] = useState("")

    // Estados editar
    const [mostrarEdit, setMostrarEdit] = useState(false)
    const [editId, setEditId] = useState("")
    const [editNombre, setEditNombre] = useState("")
    const [editRun, setEditRun] = useState("")
    const [editDireccion, setEditDireccion] = useState("")
    const [editRegion, setEditRegion] = useState("")
    const [editComuna, setEditComuna] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editEmail, setEditEmail] = useState("")

    // Estados region y comuna
    const [comunasFiltradas, setComunasFiltradas] = useState([]);

    // Estados email
    const [abrirEmail, setAbrirEmail] = useState("")
    const [EmpresaSeleccionada, setEmpresaSeleccionada] = useState(null);

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

    // Validacion RUT
    const calcularDV = (cuerpo) => {
        let suma = 0;
        let multiplicador = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += parseInt(cuerpo.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = 11 - (suma % 11);
        if (resto === 11) return '0';
        if (resto === 11) return 'K';
        return resto.toString();
    };

    const esRutValido = (rut) => {
        if (!rut) return false;
        const valor = rut.replace(/[^0-9kK]/g, "");
        if (valor.length < 8 || valor.length > 9) return false;

        const cuerpo = valor.slice(0, -1);
        const dv = valor.slice(-1).toUpperCase();

        return /^\d+$/.test(cuerpo) && calcularDV(cuerpo) === dv;
    };

    const formatearRut = (rut) => {
        let value = rut.replace(/[^0-9kK]/g, "");

        value = value.replace(/k(?!$)/gi, "");

        if (value.length > 9) {
            value = value.slice(0, 9);
        }

        if (value.length > 1) {
            const cuerpo = value.slice(0, -1);
            const dv = value.slice(-1).toUpperCase();
            return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, "")}-${dv}`;
        }

        return value;
    };

    // Validacion email
    const esEmailValido = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validacion formulario
    const formularioValido =
        nuevoNombre.trim() !== "" &&
        nuevoRun.trim() !== "" &&
        nuevoDireccion.trim() !== "" &&
        nuevoRegion !== "" &&
        nuevoComuna !== "" &&
        esEmailValido(nuevoEmail);

    // Manejo de region y comuna
    const handleCambioRegion = (evento) => {
        const idSeleccionado = evento.target.value
        setNuevoRegion(idSeleccionado)

        const filtro = comunas.filter(c => c.regionId === idSeleccionado)
        setComunasFiltradas(filtro)
        setNuevoComuna("")
    }

    // Manejo de dialogs
    const cerrarDialog = () => {
        setOpen(false);
        setNuevoNombre("")
        setNuevoRun("")
        setNuevoDireccion("")
        setNuevoRegion("")
        setNuevoComuna("")
        setNuevoEstado("")
        setNuevoEmail("")
    }

    const cerrarDialogEdit = () => {
        setMostrarEdit(false)
    }

    const cerrarEmail = () => {
        setAbrirEmail(false)
    }

    // Acciones crear y editar
    const clickCrearEmpresa = async () => {
        try {
            const respuesta = await crearEmpresa(nuevoNombre,
                nuevoRun.trim(),
                nuevoDireccion,
                nuevoComuna,
                nuevoEmail,
                nuevoEstado)
            setOpen(false)
            setMensajeExito("Empresa creada con exito")
            cargarDatos()

        } catch (error) {
            if (error.message === "Failed fetch") {
                setError("Error de conexion")
            } else {
                setError(error.message || "Error al crear la empresa")
            }
        }
    }

    const clickGuardarEdit = async () => {
        try {
            const respuesta = await actualizarEmpresa(editId,
                editNombre,
                editRun,
                editDireccion,
                editComuna,
                editEstado,
                editEmail)
            setMostrarEdit(false)
            setMensajeExito("Se edito con exito")
            cargarDatos()

        } catch (error) {
            setError(err.message);
        }
    }

    // Filtrado y paginacion
    const empresasFiltradas = empresas.filter((empresa) => {
        const textoBusqueda = `${empresa.nombre_empresa || ''} ${empresa.rut_empresa || ''} ${empresa.direccion_empresa || ''} ${empresa.rut_empresa || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = textoBusqueda.includes(term)
        const coincideEmpresa = filtroEmpresa ? empresa?.empresa_id === parseInt(filtroEmpresa) : true;
        return coincideTexto && coincideEmpresa;
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
                    Admin Empresas
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
                                    <TableCell width="14.28%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Rut</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Direccion</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Comuna</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Estado</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Email</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha creación</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Fecha Actualización</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Creador</strong></TableCell>
                                    <TableCell width="14.28%" align="center"><strong>Editar</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {empresasFiltradas
                                    .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                    .map((empresa) => {
                                        return (
                                            <TableRow key={empresa.empresa_id} sx={{ height: 70 }}>
                                                <TableCell align="center">
                                                    {empresa.nombre_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.rut_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.direccion_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.comuna_empresa}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <CircleIcon
                                                        sx={{
                                                            fontSize: '1rem',
                                                            color: empresa.estado?.estado_id === 1 ? '#4caf50' : '#f44336'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton onClick={() => { setEmpresaSeleccionada(empresa); setAbrirEmail(true); }}>
                                                        <DraftsIcon />
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.fecha_creacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.fecha_actualizacion}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {empresa.usuario_creador}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton sx={{ padding: 0 }} onClick={() => {
                                                        setEditId(empresa.empresa_id);
                                                        setEditNombre(empresa.nombre_empresa);
                                                        setEditRun(empresa.rut_empresa);
                                                        setEditDireccion(empresa.direccion_empresa);
                                                        setEditEmail(empresa.email_empresa);
                                                        setEditEstado(empresa.estado?.estado_id);
                                                        const comunaEncontrada = comunas.find(c => c.nombre === empresa.comuna_empresa);
                                                        if (comunaEncontrada) {
                                                            setEditRegion(comunaEncontrada.regionId);
                                                            const filtro = comunas.filter(c => c.regionId === comunaEncontrada.regionId);
                                                            setComunasFiltradas(filtro);
                                                            setEditComuna(empresa.comuna_empresa);
                                                        }
                                                        setMostrarEdit(true);
                                                    }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                {filasVacias > 0 && (
                                    <TableRow style={{ height: 53 * filasVacias }}>
                                        <TableCell colSpan={10} />
                                    </TableRow>
                                )}
                                {empresas.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center" sx={{ alignItems: "center" }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron empresas.
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
            <Dialog open={open} onClose={cerrarDialog} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Agregar Nueva Empresa</DialogTitle>

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

                                {/* Campo RUT */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Run"
                                        placeholder="12.345.678-K"
                                        value={nuevoRun}
                                        onChange={(e) => setNuevoRun(formatearRut(e.target.value))}
                                        inputProps={{ maxLength: 12 }}
                                        error={nuevoRun.length > 0 && !esRutValido(nuevoRun)}
                                        helperText={
                                            nuevoRun.trim() === ""
                                                ? "El Run es obligatorio"
                                                : (!esRutValido(nuevoRun) ? "RUT inválido" : "")
                                        }
                                    />
                                </Box>

                                {/* Campo direccion */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Dirección"
                                        value={nuevoDireccion}
                                        onChange={(e) => setNuevoDireccion(e.target.value)}
                                        helperText={nuevoDireccion.trim() === "" ? "La dirección es obligatoria" : ""}
                                    />
                                </Box>

                                {/* Campo region */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Región</InputLabel>
                                    <Select
                                        label="Región"
                                        value={nuevoRegion}
                                        onChange={handleCambioRegion}
                                    >
                                        {regiones.map((reg) => (
                                            <MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {nuevoRegion === "" && <FormHelperText>La Región es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo comuna */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Comuna</InputLabel>
                                    <Select
                                        label="Comuna"
                                        value={nuevoComuna}
                                        onChange={(e) => setNuevoComuna(e.target.value)}
                                        disabled={comunasFiltradas.length === 0}
                                    >
                                        {comunasFiltradas.map((com, index) => (
                                            <MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {nuevoComuna === "" && <FormHelperText>La Comuna es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo estado */}
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

                                {/* Campo email */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={nuevoEmail}
                                        onChange={(e) => setNuevoEmail(e.target.value)}
                                        error={nuevoEmail.length > 0 && !esEmailValido(nuevoEmail)}
                                        helperText={
                                            nuevoEmail === ""
                                                ? "El email es obligatorio"
                                                : (!esEmailValido(nuevoEmail) ? "Ingrese un email válido (ej: usuario@dominio.com)" : "")
                                        }
                                    />
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialog} color="error">Cancelar</Button>
                    <Button
                        onClick={clickCrearEmpresa}
                        variant="contained"
                        color="primary"
                        disabled={!formularioValido || !esRutValido(nuevoRun)}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog editar */}
            <Dialog open={mostrarEdit} onClose={cerrarDialogEdit} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle sx={{ p: 0, mb: 3 }}>Editar Empresa</DialogTitle>

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

                                {/* Campo RUT */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Run"
                                        placeholder="12.345.678-K"
                                        value={editRun}
                                        onChange={(e) => setEditRun(formatearRut(e.target.value))}
                                        helperText={
                                            editRun.trim() === ""
                                                ? "El Run es obligatorio"
                                                : (!esRutValido(editRun) ? "RUT inválido" : "")
                                        }
                                        error={editRun.length > 0 && !esRutValido(editRun)}
                                    />
                                </Box>

                                {/* Campo direccion */}
                                <Box sx={{ mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Dirección"
                                        value={editDireccion}
                                        onChange={(e) => setEditDireccion(e.target.value)}
                                        helperText={editDireccion.trim() === "" ? "La dirección es obligatoria" : ""}
                                    />
                                </Box>

                                {/* Campo region */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Región</InputLabel>
                                    <Select
                                        label="Región"
                                        value={editRegion}
                                        onChange={handleCambioRegion}
                                    >
                                        {regiones.map((reg) => (
                                            <MenuItem key={reg.id} value={reg.id}>{reg.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {editRegion === "" && <FormHelperText>La región es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo comuna */}
                                <FormControl size="small" fullWidth sx={{ mb: 2 }} >
                                    <InputLabel>Comuna</InputLabel>
                                    <Select
                                        label="Comuna"
                                        value={editComuna}
                                        onChange={(e) => setEditComuna(e.target.value)}
                                        disabled={comunasFiltradas.length === 0}
                                    >
                                        {comunasFiltradas.map((com, index) => (
                                            <MenuItem key={index} value={com.nombre}>{com.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                    {editComuna === "" && <FormHelperText>La comuna es obligatoria</FormHelperText>}
                                </FormControl>

                                {/* Campo estado */}
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
                                    {editEstado === "" && <FormHelperText>El estado es obligatorio</FormHelperText>}
                                </FormControl>

                                {/* Campo email */}
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        error={editEmail.length > 0 && !esEmailValido(editEmail)}
                                        helperText={
                                            editEmail.trim() === ""
                                                ? "El email es obligatorio"
                                                : (!esEmailValido(editEmail) ? "Ingrese un email válido (ej: usuario@dominio.com)" : "")
                                        }
                                    />
                                </Box>

                            </Paper>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={cerrarDialogEdit} color="error">Cancelar</Button>
                    <Button
                        onClick={clickGuardarEdit}
                        variant="contained"
                        color="primary"
                        disabled={
                            editNombre.trim() === "" ||
                            editRun.trim() === "" ||
                            !esRutValido(editRun) ||
                            editDireccion.trim() === "" ||
                            editRegion === "" ||
                            editComuna === "" ||
                            editEstado === "" ||
                            !esEmailValido(editEmail)
                        }
                    >
                        Guardar Cambios
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog email */}
            <Dialog open={abrirEmail} sx={{ textAlign: "center" }}>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", mt: 1, maxWidth: "55vh", minWidth: "55vh" }}>
                        <Box width="100%">
                            <Paper variant="outlined" sx={{ p: 3, bgcolor: "#f9f9f9" }}>

                                <DialogTitle>Emails</DialogTitle>

                                <Box sx={{ mb: 2 }}>
                                    {EmpresaSeleccionada && (
                                        <>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        border: '1px solid #E0E0E0',
                                                        borderRadius: '40px',
                                                        p: 0.5,
                                                        color: '#424242'
                                                    }}
                                                >
                                                    {EmpresaSeleccionada.email_empresa}
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>

                                <Button variant="outlined" color="error" onClick={cerrarEmail}>
                                    cerrar
                                </Button>

                            </Paper>
                        </Box>
                    </Box>

                </DialogContent>
            </Dialog>
        </>
    );
}
export default AdminEmpresas