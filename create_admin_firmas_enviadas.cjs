const fs = require('fs');
const path = require('path');

const fileContent = `import React, { useEffect, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
    FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Services
import { obtenerFirmasAdmin } from "../../../services/documentosYFirmas";
import { obtenerEmpresas } from "../../../services/empresasServices";

function AdminFirmasEnviadas() {
    const [firmas, setFirmas] = useState([]);
    const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
        const stored = localStorage.getItem('empresaId');
        return stored ? parseInt(stored) : "";
    });
    
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [empresas, setEmpresas] = useState([]);

    // Pagination states
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(10);

    // Modal view state
    const [openModal, setOpenModal] = useState(false);
    const [firmaSeleccionada, setFirmaSeleccionada] = useState(null);

    // Quill Configuration (read only)
    const modules = { toolbar: false };

    useEffect(() => {
        const fetchInitialData = async () => {
            const data = await obtenerEmpresas();
            setEmpresas(data);
            setFiltroEmpresa((prevFiltro) => {
                if (!prevFiltro && data.length > 0) {
                    return data[0].empresa_id;
                }
                return prevFiltro;
            });
        };
        fetchInitialData();
    }, []);

    const fetchFirmas = async (empresa_id) => {
        if (!empresa_id) {
            setFirmas([]);
            return;
        }
        const data = await obtenerFirmasAdmin(empresa_id);
        setFirmas(data);
    };

    useEffect(() => {
        if (filtroEmpresa) {
            fetchFirmas(filtroEmpresa);
        }
    }, [filtroEmpresa]);

    const handleChangePage = (event, newPage) => setPagina(newPage);
    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    const handleAbrir = (firma) => {
        setFirmaSeleccionada(firma);
        setOpenModal(true);
    };

    const firmasFiltradas = firmas.filter(f => filtroEstado === "TODOS" || f.estado === filtroEstado);

    return (
        <>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Documentos Enviados
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 250 }}>
                        <InputLabel>Filtrar por Empresa</InputLabel>
                        <Select
                            value={filtroEmpresa}
                            onChange={(e) => setFiltroEmpresa(e.target.value)}
                            label="Filtrar por Empresa"
                        >
                            {empresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Estado</InputLabel>
                        <Select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            label="Estado"
                        >
                            <MenuItem value="TODOS">Todos</MenuItem>
                            <MenuItem value="P">Pendiente</MenuItem>
                            <MenuItem value="A">Aprobada</MenuItem>
                            <MenuItem value="R">Rechazada</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 800, width: "100%" }}>
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell><strong>Empleado</strong></TableCell>
                                    <TableCell><strong>Documento</strong></TableCell>
                                    <TableCell><strong>Tipo</strong></TableCell>
                                    <TableCell align="center"><strong>Visto en Correo</strong></TableCell>
                                    <TableCell align="center"><strong>Estado</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {firmasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" sx={{ py: 3, color: 'text.secondary' }}>
                                                No hay documentos enviados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    firmasFiltradas
                                        .slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina)
                                        .map((row) => (
                                            <TableRow
                                                key={row.id}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
                                            >
                                                <TableCell>{row.empleado?.nombres} {row.empleado?.apellido_paterno}</TableCell>
                                                <TableCell>{row.nombre}</TableCell>
                                                <TableCell>{row.tipo}</TableCell>
                                                <TableCell align="center">
                                                    {row.leido ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#4caf50' }}>
                                                            <VisibilityIcon fontSize="small" /> Sí
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#9e9e9e' }}>
                                                            <VisibilityOffIcon fontSize="small" /> No
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: row.estado === "A" ? "#4caf50" : row.estado === "R" ? "#f44336" : "#ffeb3b",
                                                                boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                                                            }}
                                                        />
                                                        <Typography variant="body2">
                                                            {row.estado === "A" ? "Aprobada" : row.estado === "R" ? "Rechazada" : "Pendiente"}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button variant="outlined" size="small" onClick={() => handleAbrir(row)}>
                                                        Ver
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={firmasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => \`\${from}-\${to} de \${count}\`}
                />
            </Paper>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ bgcolor: '#0088cc', color: 'white' }}>
                    {firmaSeleccionada?.nombre} - {firmaSeleccionada?.empleado?.nombres} {firmaSeleccionada?.empleado?.apellido_paterno}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', minHeight: '400px' }}>
                        <ReactQuill 
                            theme="snow"
                            value={firmaSeleccionada?.texto || ""}
                            readOnly={true}
                            modules={modules}
                            style={{ height: '350px' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)} variant="contained" disableElevation>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminFirmasEnviadas;
`;

const outputPath = 'C:/proyectos/pagina-femase/src/pages/DASHBOARD/Documentos y Firmas/AdminFirmasEnviadas.jsx';
fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log("Created AdminFirmasEnviadas.jsx");
