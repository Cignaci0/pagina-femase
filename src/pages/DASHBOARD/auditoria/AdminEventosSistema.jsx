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
    const [eventos, setEventos] = useState([]);
    const [totalEventos, setTotalEventos] = useState(0);
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);
    const [busqueda, setBusqueda] = useState("");
    const [filtrotipoEvento, setFiltroTipoEvento] = useState("");
    const [filtroFechaInicio, setFiltroFechaInicio] = useState(null);
    const [filtroFechaFin, setFiltroFechaFin] = useState(null);

   

    // Exportacion
    const prepararDatosParaExportar = () => {
        return eventos.map(evento => ({
            "Usuario": evento.usuario || "-",
            "Evento": evento.evento || "-",
            "IP": evento.ip || "-",
            "Tipo": evento.tipo_evento || "-",
            "Fecha": evento.fecha ? dayjs(evento.fecha).format("DD-MM-YYYY") : "-",
            "Hora": evento.hora || "-",
            "S.O.": evento.sistema_operativo || "-",
            "Browser": evento.browser || "-",
            "Empresa": evento.empresa?.nombre_empresa || "-",
            "Depto": evento.depto?.nombre_departamento || "-",
            "Cenco": evento.cenco?.nombre_cenco || "-",
            "Rut": evento.rut || "-"
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Eventos");
        XLSX.writeFile(wb, "Reporte_Eventos.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Eventos.csv");
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
        let html = '<html><head><title>Imprimir Eventos</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial; font-size: 10px;} th, td {border: 1px solid black; padding: 4px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Eventos de Sistema</h1><table>';

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

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    
    useEffect(() => {
        setPagina(0);
    }, [busqueda, filtrotipoEvento, filtroFechaInicio, filtroFechaFin]);

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
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
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
                                    <TableCell width={100}><strong>Usuario</strong></TableCell>
                                    <TableCell width={200} align="center"><strong>Evento</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Ip</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Tipo Evento</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Fecha/hora</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>S.O</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Browser</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Empresa</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Depto</strong></TableCell>
                                    <TableCell width={200} align="center"><strong>Cenco</strong></TableCell>
                                    <TableCell width={100} align="center"><strong>Rut</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {cargando ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : eventos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            No hay registros para mostrar
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    eventos.map((evento) => (
                                        <TableRow key={evento.id}>
                                            <TableCell>{evento.usuario || "-"}</TableCell>
                                            <TableCell align="center">{evento.evento || "-"}</TableCell>
                                            <TableCell align="center">{evento.ip || "-"}</TableCell>
                                            <TableCell align="center">{evento.tipo_evento || "-"}</TableCell>
                                            <TableCell align="center">
                                                {evento.fecha ? dayjs(evento.fecha).format("DD-MM-YYYY") : "-"} {evento.hora || ""}
                                            </TableCell>
                                            <TableCell align="center">{evento.sistema_operativo || "-"}</TableCell>
                                            <TableCell align="center">{evento.browser || "-"}</TableCell>
                                            <TableCell align="center">{evento.empresa?.nombre_empresa || "-"}</TableCell>
                                            <TableCell align="center">{evento.depto?.nombre_departamento || "-"}</TableCell>
                                            <TableCell align="center">{evento.cenco?.nombre_cenco || "-"}</TableCell>
                                            <TableCell align="center">{evento.rut || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalEventos}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper>
        </>
    );
}
export default AdminEventosSistema;