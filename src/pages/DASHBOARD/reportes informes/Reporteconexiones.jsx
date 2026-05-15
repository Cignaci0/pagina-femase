import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Button, Box, Stack, FormControl, InputLabel,
    Select, MenuItem, TextField, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerConexiones } from "../../../services/registroConexionesService";
import { reporteConexiones } from "../../../services/reportes";
import { obtenerusuarioPorEmpresa } from "../../../services/usuariosServices";

function ReporteConexion() {
    // Estados base
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [conexiones, setConexiones] = useState([]);
    const [total, setTotal] = useState(0);

    // Filtros
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [opcionesUsuarios, setOpcionesUsuarios] = useState([]);
    const [filtroUsuario, setFiltroUsuario] = useState("");
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
    const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const empresas = await obtenerEmpresas();
                setOpcionesEmpresas(empresas || []);
            } catch (error) {
                toast.error("Error al cargar empresas");
            }
        };
        fetchCatalogos();
    }, []);

    const fetchConexiones = async () => {
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            setConexiones([]);
            setTotal(0);
            return;
        }
        try {
            const response = await obtenerConexiones(filtroEmpresa, page + 1, rowsPerPage, filtroUsuario);
            // La respuesta viene como { data: [], total: X, page: Y, lastPage: Z }
            setConexiones(response.data || []);
            setTotal(response.total || 0);
        } catch (error) {
            toast.error("Error al buscar conexiones");
        }
    };

    // Carga de usuarios por empresa
    useEffect(() => {
        const fetchUsuarios = async () => {
            if (!filtroEmpresa) {
                setOpcionesUsuarios([]);
                setFiltroUsuario("");
                return;
            }
            try {
                const data = await obtenerusuarioPorEmpresa(filtroEmpresa);
                setOpcionesUsuarios(data || []);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            }
        };
        fetchUsuarios();
    }, [filtroEmpresa]);

    // Efecto para buscar automáticamente cuando cambie la empresa, usuario, página o filas por página o fechas
    useEffect(() => {
        fetchConexiones();
    }, [filtroEmpresa, filtroUsuario, page, rowsPerPage, fechaInicio, fechaFin]);

    const handleGenerarPDF = async () => {
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            toast.error("La fecha de inicio no puede ser mayor a la fecha de término");
            return;
        }
        const tId = toast.loading("Generando reporte PDF...");
        try {
            const blob = await reporteConexiones(fechaInicio, fechaFin, filtroEmpresa, filtroUsuario);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte_conexiones_${fechaInicio}_${fechaFin}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success("Reporte generado con éxito", { id: tId });
            } else {
                toast.error("No se pudo generar el reporte", { id: tId });
            }
        } catch (error) {
            toast.error("Error al generar el reporte", { id: tId });
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Reporte de Conexiones
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Filtros Superiores - ELIMINADO */}

                {/* Tabla de Resultados (Centro) */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Usuario</strong></TableCell>
                                    <TableCell align="center"><strong>Correo</strong></TableCell>
                                    <TableCell align="center"><strong>RUT</strong></TableCell>
                                    <TableCell align="center"><strong>Fecha</strong></TableCell>
                                    <TableCell align="center"><strong>Hora</strong></TableCell>
                                    <TableCell align="center"><strong>IP</strong></TableCell>
                                    <TableCell align="center"><strong>Empresa</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {conexiones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No se encontraron registros
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    conexiones.map((reg) => (
                                            <TableRow key={reg.id} hover sx={{ height: 60 }}>
                                                <TableCell align="center">{reg.username || "---"}</TableCell>
                                                <TableCell align="center">{reg.correo}</TableCell>
                                                <TableCell align="center">{reg.rut}</TableCell>
                                                <TableCell align="center">{new Date(reg.fecha).toLocaleDateString()}</TableCell>
                                                <TableCell align="center">{reg.hora}</TableCell>
                                                <TableCell align="center">{reg.ip}</TableCell>
                                                <TableCell align="center">{reg.empresa?.nombre_empresa}</TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {conexiones.length > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Páginas"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    />
                )}

                {/* Formulario Inferior */}
                <Box sx={{ mt: 3, border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                    <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha inicio</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                sx={{ minWidth: 180, bgcolor: '#fff' }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Fecha fin</Typography>
                            <TextField
                                type="date"
                                size="small"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                sx={{ minWidth: 180, bgcolor: '#fff' }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Empresa</Typography>
                            <FormControl size="small" sx={{ minWidth: 250, bgcolor: '#fff' }}>
                                <Select 
                                    value={filtroEmpresa} 
                                    onChange={(e) => {
                                        setFiltroEmpresa(e.target.value);
                                        setFiltroUsuario(""); // Reset usuario al cambiar empresa
                                        setPage(0);
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Todas las empresas</em></MenuItem>
                                    {opcionesEmpresas.map((emp) => (
                                        <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>Usuario</Typography>
                            <FormControl size="small" sx={{ minWidth: 200, bgcolor: '#fff' }} disabled={!filtroEmpresa}>
                                <Select 
                                    value={filtroUsuario} 
                                    onChange={(e) => {
                                        setFiltroUsuario(e.target.value);
                                        setPage(0);
                                    }}
                                    displayEmpty
                                >
                                    <MenuItem value=""><em>Todos los usuarios</em></MenuItem>
                                    {opcionesUsuarios.map((user) => (
                                        <MenuItem key={user.usuario_id} value={user.usuario_id}>
                                            {user.username || user.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', pt: 2.5, ml: 'auto' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGenerarPDF}
                            >
                                Generar Reporte
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </>
    );
}

export default ReporteConexion;