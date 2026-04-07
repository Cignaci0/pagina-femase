import React, { useEffect, useState, useRef } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack,
    FormHelperText
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerUsuariosConectados } from "../../../services/usuariosConectados";

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
    
    const [usuariosConectados, setUsuariosConectados] = useState([]);
    

    // Estados de paginacion y filtrado
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(7);



    // Carga de datos
    const cargarUsuariosConectados = async () => {
        try {
            const respuesta = await obtenerUsuariosConectados()
            setUsuariosConectados(respuesta)
        } catch (error) {
            toast.error("Error al traer los usuarios conectados")
            console.log(error)
        }
    }

    // Exportacion
    const prepararDatosParaExportar = () => {
        return usuariosFiltrados.map(sesion => ({
            "Nombre": `${sesion.user?.nombres || ''} ${sesion.user?.apellido_paterno || ''} ${sesion.user?.apellido_materno || ''}`.trim(),
            "Usuario": sesion.user?.username || '',
            "Perfil": sesion.user?.perfil?.nombre_perfil || '',
            "IP": sesion.ip || '',
            "Navegador": sesion.navegador || '',
            "Sistema Operativo": sesion.sistema_operativo || '',
            "Conectado desde": dayjs(sesion.fecha_conexion).format('DD-MM-YYYY HH:mm:ss'),
        }));
    };

    const descargarExcel = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Usuarios Conectados");
        XLSX.writeFile(wb, "Reporte_Usuarios_Conectados.xlsx");
    };

    const descargarCSV = () => {
        const data = prepararDatosParaExportar();
        const ws = XLSX.utils.json_to_sheet(data);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Reporte_Usuarios_Conectados.csv");
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
        let html = '<html><head><title>Imprimir Usuarios Conectados</title>';
        html += '<style>table {width: 100%; border-collapse: collapse; font-family: Arial;} th, td {border: 1px solid black; padding: 8px; text-align: left;} th {background-color: #f2f2f2;}</style>';
        html += '</head><body><h1>Reporte de Usuarios Conectados</h1><table>';

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

    // Calcular perfiles conectados dinámicamente
    const datosEstadisticos = Object.values(
        usuariosConectados.reduce((acc, sesion) => {
            const perfil = sesion.user?.perfil?.nombre_perfil || 'Sin Perfil';
            if (!acc[perfil]) {
                acc[perfil] = { label: perfil, numero: 0 };
            }
            acc[perfil].numero++;
            return acc;
        }, {})
    );

    // Filtrado y paginacion
    const usuariosFiltrados = usuariosConectados.filter((sesion) => {
        const nombreCompleto = `${sesion.user?.nombres || ''} ${sesion.user?.apellido_paterno || ''} ${sesion.user?.apellido_materno || ''} ${sesion.user?.username || ''}`.toLowerCase();
        const term = busqueda.toLowerCase();
        return nombreCompleto.includes(term);
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
        cargarUsuariosConectados()
    }, [])

    useEffect(() => {
        setPagina(0);
    }, [busqueda]);

    

    // Renderizado condicional
    

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Usuarios Conectados
                </Typography>
            </Box>

            {/* Alerta de exito */}
            

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
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de usuarios">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell width="10%" align="center"><strong>Nombre</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Usuario</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Perfil</strong></TableCell>
                                    <TableCell width="1%" align="center"><strong>Ip</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Navegador</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Sistema Operativo</strong></TableCell>
                                    <TableCell width="10%" align="center"><strong>Conectado desde</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {usuariosFiltrados.length > 0 ? (
                                    usuariosFiltrados
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((sesion) => (
                                            <TableRow key={sesion.sesion_id}>
                                                <TableCell align="center">
                                                    {`${sesion.user?.nombres || ''} ${sesion.user?.apellido_paterno || ''} ${sesion.user?.apellido_materno || ''}`.trim()}
                                                </TableCell>
                                                <TableCell align="center">{sesion.user?.username}</TableCell>
                                                <TableCell align="center">{sesion.user?.perfil?.nombre_perfil}</TableCell>
                                                <TableCell align="center">{sesion.ip}</TableCell>
                                                <TableCell align="center">{sesion.navegador}</TableCell>
                                                <TableCell align="center">{sesion.sistema_operativo}</TableCell>
                                                <TableCell align="center">
                                                    {dayjs(sesion.fecha_conexion).format('DD-MM-YYYY HH:mm:ss')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                No se encontraron usuarios conectados.
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
                    count={usuariosFiltrados.length}
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
export default AdminUsuariosConectados;