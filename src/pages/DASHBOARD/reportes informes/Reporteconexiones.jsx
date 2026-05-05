import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Button, Box, Stack, FormControl, InputLabel,
    Select, MenuItem, TextField, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, TablePagination
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerConexiones } from "../../../services/registroConexionesService";

function ReporteConexion() {
    // Estados base
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [conexiones, setConexiones] = useState([]);

    // Filtros
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
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

    const handleBuscar = async () => {
        if (!filtroEmpresa) {
            toast.error("Seleccione una empresa");
            return;
        }

        const tId = toast.loading("Buscando registros...");
        try {
            const data = await obtenerConexiones(filtroEmpresa, fechaInicio, fechaFin);
            setConexiones(data || []);
            toast.success("Registros encontrados", { id: tId });
            setPage(0);
        } catch (error) {
            toast.error("Error al buscar conexiones", { id: tId });
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
                {/* Filtros Superiores */}
                <Box sx={{ mb: 3, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select 
                                label="Empresa" 
                                value={filtroEmpresa} 
                                onChange={(e) => setFiltroEmpresa(e.target.value)}
                            >
                                <MenuItem value=""><em>Seleccionar</em></MenuItem>
                                {opcionesEmpresas.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Tabla de Resultados (Centro) */}
                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    Por favor seleccione una empresa y un rango de fechas
                </Box>

                {conexiones.length > 0 && (
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50]}
                        component="div"
                        count={conexiones.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página"
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
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', pt: 2.5, ml: 'auto' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBuscar}
                            >
                                generar Reporte
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </>
    );
}

export default ReporteConexion;