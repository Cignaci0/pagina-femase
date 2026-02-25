import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";
import { obtenerCargos } from "../../../services/cargosServices";
import SearchIcon from '@mui/icons-material/Search';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminEventosSistema() {

    // Estados de datos
    const [cargos, setCargos] = useState([])
    const [error, setError] = useState(null);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);
    const [busqueda, setBusqueda] = useState("");
    const [filtrotipoEvento, setFiltroTipoEvento] = useState("")
    const [filtroFechaInicio, setFiltroFechaInicio] = useState(null)
    const [filtroFechaFin, setFiltroFechaFin] = useState(null)

    // Carga de datos
    const cargarCargos = async () => {
        try {
            const respuesta = await obtenerCargos()
            setCargos(respuesta)
        } catch (error) {
            setError("Error al traer los cargos")
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

    // Filtrado y paginacion
    const cargosFiltrados = cargos.filter((car) => {
        const nombreCargo = `${car.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreCargo.includes(term);
        const coincideEstado = filtrotipoEvento ? car.estado?.estado_id === filtrotipoEvento : true;
        return coincideTexto && coincideEstado;
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
        cargarCargos()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtrotipoEvento,]);

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Registro de Eventos
                </Typography>
            </Box>

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

                    {/* Filtro de tipo evento */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Tipo Evento</InputLabel>
                        <Select sx={{ width: "26vh" }} value={filtrotipoEvento} onChange={(e) => setFiltroTipoEvento(e.target.value)} label="Estado">
                            <MenuItem value=""><em>Todos</em></MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filtro fecha inicio */}
                    <Box size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Fecha de inicio"
                                format="DD-MM-YYYY"
                                value={filtroFechaInicio}
                                onChange={(newValue) => setFiltroFechaInicio(newValue)}
                                slotProps={{ textField: { size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    {/* Filtro fecha fin */}
                    <Box size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Fecha de fin"
                                format="DD-MM-YYYY"
                                value={filtroFechaFin}
                                onChange={(newValue) => setFiltroFechaFin(newValue)}
                                slotProps={{ textField: { size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

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
                                    <TableCell width="10%"><strong>Usuario</strong></TableCell>
                                    <TableCell width="20%" align="center"><strong>Evento</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Ip</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Tipo Evento</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Fecha/hora</strong></TableCell>
                                    <TableCell width="5%" align="center"><strong>S.O</strong></TableCell>
                                    <TableCell width="5%" align="center"><strong>Browser</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width="5%" align="center"><strong>Depto</strong></TableCell>
                                    <TableCell width="5%" align="center"><strong>Cenco</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Rut</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        17997287-5
                                    </TableCell>
                                    <TableCell align="center">
                                        Inserta notificacion: usuario [17997287-5], mailFrom [notificacionfmc@femase.cl], subject [Sistema de Gestion-Ingreso de Solicitud de Vacaciones], empresaId [emp01], cencoId [95], rutEmpleado [17997287-5], comentario [Ingreso de Solicitud de Vacaciones], latitud [null], longitud [null]
                                    </TableCell>
                                    <TableCell align="center">
                                        198.41.230.234
                                    </TableCell>
                                    <TableCell align="center">
                                        Notificacion
                                    </TableCell>
                                    <TableCell align="center">
                                        2026-02-06 17:24:17
                                    </TableCell>
                                    <TableCell align="center">
                                        Mac
                                    </TableCell>
                                    <TableCell align="center">
                                        Safari-18.1.1
                                    </TableCell>
                                    <TableCell align="center">
                                        Fundacion Mi Casa
                                    </TableCell>
                                    <TableCell align="center">
                                        X- Los Lagos
                                    </TableCell>
                                    <TableCell align="center">
                                        RLP PER RESIDENCIA OSORNO
                                    </TableCell>
                                    <TableCell align="center">
                                        17997287-5
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
                    count={cargosFiltrados.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage=""
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>
        </>
    );
}
export default AdminEventosSistema;