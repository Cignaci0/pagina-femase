import React, { useEffect, useState, useRef } from "react";
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; 
import { FaFileExcel, FaFileCsv } from "react-icons/fa";
import PrintIcon from '@mui/icons-material/Print';
import * as XLSX from 'xlsx';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminUsuariosConectados() {

    // Estados de datos
    const [error, setError] = useState(null);
    const [cargos, setCargos] = useState([]);
    const [mensajeExito, setMensajeExito] = useState(""); // Agregado para consistencia con lógica de copiar

    // Estados de paginacion y filtrado
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);

    // Estados crear
    // (No definidos en este archivo)

    // Estados editar
    // (No definidos en este archivo)

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

    // Manejo de dialogs
    const scrollContainerRef = useRef(null);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 200; 
            if (direction === "left") {
                current.scrollLeft -= scrollAmount;
            } else {
                current.scrollLeft += scrollAmount;
            }
        }
    };

    const datosEstadisticos = [
        { id: 1, numero: 2, label: "Jefe (a) Tecnico (a) Nacional" },
        { id: 2, numero: 5, label: "Administrativo" },
        { id: 3, numero: 1, label: "Super Admin" },
        { id: 4, numero: 8, label: "Vendedores" },
        { id: 5, numero: 3, label: "Soporte TI" },
        { id: 6, numero: 0, label: "Logística" },
        { id: 7, numero: 2, label: "Recursos Humanos" },
        { id: 8, numero: 2, label: "Jefe (a) Tecnico (a) Nacional" },
        { id: 9, numero: 5, label: "Administrativo" },
        { id: 10, numero: 1, label: "Super Admin" },
        { id: 11, numero: 8, label: "Vendedores" },
        { id: 12, numero: 3, label: "Soporte TI" },
        { id: 13, numero: 0, label: "Logística" },
        { id: 14, numero: 2, label: "Recursos Humanos" },
    ];

    // Filtrado y paginacion
    const cargosFiltrados = cargos.filter((car) => {
        const nombreCargo = `${car.nombre || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        const coincideTexto = nombreCargo.includes(term);
        return coincideTexto;
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
        cargarCargos()
    }, [])

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
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Registro de Eventos
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

                    {/* Carrusel de estadisticas */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: 4,
                        flex: 1,
                        overflow: 'hidden',
                        maxWidth: '800px'
                    }}>

                        <IconButton onClick={() => handleScroll("left")} size="small" sx={{ mr: 1 }}>
                            <ArrowBackIosNewIcon fontSize="small" />
                        </IconButton>

                        <Box
                            ref={scrollContainerRef}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                overflowX: 'auto',
                                scrollBehavior: 'smooth',
                                py: 1,
                                px: 1,
                                '&::-webkit-scrollbar': { display: 'none' },
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {datosEstadisticos.map((dato, index) => (
                                <Paper
                                    key={index}
                                    elevation={4}
                                    sx={{
                                        minWidth: 100,
                                        width: 100,
                                        height: 100,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 3,
                                        flexShrink: 0
                                    }}
                                >
                                    <Typography color="primary" sx={{ fontSize: '40px', fontWeight: 'bold', lineHeight: 1, mb: 0.5 }}>
                                        {dato.numero}
                                    </Typography>
                                    <Typography align="center" color="text.secondary" sx={{ fontSize: '10px', fontWeight: 'bold', px: 1 }}>
                                        {dato.label}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>

                        <IconButton onClick={() => handleScroll("right")} size="small" sx={{ ml: 1 }}>
                            <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                    </Box>

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
                                    <TableCell width="10%"  align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Usuario</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Perfil</strong></TableCell>
                                    <TableCell width="1%" align="center"><strong>Ip</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Navegador</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Sistema Operativo</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Conectado desde</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow>
                                    <TableCell align="center">Super Administrador</TableCell>
                                    <TableCell align="center">superadmin</TableCell>
                                    <TableCell align="center">Super Admin</TableCell>
                                    <TableCell align="center">141.101.100.183</TableCell>
                                    <TableCell align="center">Chrome-144.0.0.0</TableCell>
                                    <TableCell align="center">Windows</TableCell>
                                    <TableCell align="center">06-02-2026 17:30:55</TableCell>
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
export default AdminUsuariosConectados;