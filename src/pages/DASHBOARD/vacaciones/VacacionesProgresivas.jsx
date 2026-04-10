import React, { useEffect, useState } from "react";
import {
    Box, Paper, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Select, MenuItem, FormControl, InputLabel,
    Typography, TablePagination,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { toast } from "react-hot-toast";

import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerPorEmpresa } from "../../../services/empleadosServices";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function AdminVacacionesProgresivas() {
    const [userInfo, setUserInfo] = useState({});
    useEffect(() => {
        const decodeToken = () => {
            try {
                const token = window.localStorage.getItem("token");
                if (!token) return {};
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo(payload);
            } catch (e) {
                setUserInfo({});
            }
        };
        decodeToken();
    }, []);

    // Estados de paginacion
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Estados base (catalogos)
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);

    // Opciones cascada
    const [opcionesEmpresas, setOpcionesEmpresas] = useState([]);
    const [opcionesDeptos, setOpcionesDeptos] = useState([]);
    const [opcionesCencos, setOpcionesCencos] = useState([]);

    // Filtros generales
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const [empleadosFiltro, setEmpleadosFiltro] = useState([]);

    // Estados para el Dialog de Edición
    const [openEdit, setOpenEdit] = useState(false);
    const [afpCertificado, setAfpCertificado] = useState("Ninguna");
    const [fechaEmision, setFechaEmision] = useState(null);
    const [numCotizaciones, setNumCotizaciones] = useState("");
    const [diasEspeciales, setDiasEspeciales] = useState("No");
    const [diasAdicionales, setDiasAdicionales] = useState(0);
    const [archivoCertificado, setArchivoCertificado] = useState(null);

    const handleOpenEdit = () => setOpenEdit(true);
    const handleCloseEdit = () => {
        setOpenEdit(false);
        setArchivoCertificado(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error("El archivo supera el límite de 1MB");
                e.target.value = null;
                return;
            }
            setArchivoCertificado(file);
        }
    };
    const handleSaveEdit = () => {
        toast.success("Cambios guardados correctamente");
        handleCloseEdit();
    };

    // Carga inicial
    useEffect(() => {
        const fetchCatalogos = async () => {
            try {
                const cencos = await obtenerCentroCostos();

                setCencosGlobal(cencos || []);

                const empresasMap = new Map();
                (cencos || []).forEach(c => {
                    const e = c.departamento?.empresa;
                    if (e && !empresasMap.has(e.empresa_id)) {
                        empresasMap.set(e.empresa_id, e);
                    }
                });
                setOpcionesEmpresas(Array.from(empresasMap.values()));
            } catch (error) {
                toast.error("Error al cargar datos base");
            }
        };
        fetchCatalogos();
    }, []);

    // Cascada: Empresa -> Deptos
    useEffect(() => {
        const actualizarDatosEmpresa = async () => {
            if (filtroEmpresa !== "") {
                const deptosMap = new Map();
                cencosGlobal.forEach(c => {
                    if (c.departamento?.empresa?.empresa_id === filtroEmpresa && c.departamento) {
                        if (!deptosMap.has(c.departamento.departamento_id)) {
                            deptosMap.set(c.departamento.departamento_id, c.departamento);
                        }
                    }
                });
                setOpcionesDeptos(Array.from(deptosMap.values()));

                const tId = toast.loading("Cargando empleados...");
                try {
                    const empsRes = await obtenerPorEmpresa(filtroEmpresa);
                    setEmpleadosGlobal(empsRes || []);
                    toast.success("Empleados cargados", { id: tId });
                } catch (error) {
                    toast.error("Error al cargar empleados", { id: tId });
                    setEmpleadosGlobal([]);
                }
            } else {
                setOpcionesDeptos([]);
                setEmpleadosGlobal([]);
            }
            setFiltroDepto("");
        };
        actualizarDatosEmpresa();
    }, [filtroEmpresa, cencosGlobal]);

    // Cascada: Depto -> Cencos
    useEffect(() => {
        if (filtroDepto !== "") {
            const cencosValidos = cencosGlobal.filter(c => c.departamento?.departamento_id === filtroDepto);
            setOpcionesCencos(cencosValidos);
        } else {
            setOpcionesCencos([]);
        }
        setFiltroCenco("");
    }, [filtroDepto, cencosGlobal]);

    // Cascada: Cenco -> Empleados
    useEffect(() => {
        if (filtroCenco !== "") {
            const empsFiltrados = empleadosGlobal.filter(e => e.cenco?.cenco_id === filtroCenco || e.cenco === filtroCenco);
            setEmpleadosFiltro(empsFiltrados);
        } else {
            setEmpleadosFiltro([]);
        }
        setFiltroEmpleado("");
    }, [filtroCenco, empleadosGlobal]);

    const handleChangePage = (event, newPage) => {
        setPagina(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Vacaciones Progresivas
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mb: 3, gap: 2, ml: 2 }}>




                    {/* Filtros de seleccion */}
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empresa</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesEmpresas.map(emp => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Depto</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Depto" value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)} disabled={!filtroEmpresa}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesDeptos.map(dep => (
                                <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Cenco</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Cenco" value={filtroCenco} onChange={(e) => setFiltroCenco(e.target.value)} disabled={!filtroDepto}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {opcionesCencos.map(c => (
                                <MenuItem key={c.cenco_id} value={c.cenco_id}>{c.nombre_cenco}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <InputLabel>Empleado</InputLabel>
                        <Select sx={{ width: "15vh" }} label="Empleado" value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)} disabled={!filtroCenco || empleadosFiltro.length === 0}>
                            <MenuItem value=""><em>Todos</em></MenuItem>
                            {empleadosFiltro.map(emp => (
                                <MenuItem key={emp.empleado_id || emp.run} value={emp.empleado_id || emp.run}>
                                    {emp.nombres} {emp.apellido_paterno}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box>
                        <Button variant="contained" color="primary" >
                            Buscar
                        </Button>
                    </Box>

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

                </Box>

                {/* Tabla principal */}
                <Box sx={{
                    flex: 1,
                    overflow: "hidden",
                    width: "100%",
                    position: "relative"
                }}>
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto", textAlign: "center" }}>

                        {filtroEmpleado && (() => {
                            const empSel = empleadosFiltro.find(e => e.empleado_id === filtroEmpleado || e.run === filtroEmpleado);
                            return empSel ? (
                                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                                    <Typography sx={{ fontSize: "20px" }}>
                                        <strong>Nombre:</strong> {empSel.nombres} {empSel.apellido_paterno} ||
                                        <strong> Num Ficha:</strong> <span> {empSel.num_ficha || "-"}</span>
                                    </Typography>
                                </Box>
                            ) : null;
                        })()}

                        <Table stickyHeader sx={{ minWidth: 650, width: "100%", mt: 2 }} aria-label="tabla de vacaciones">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha Inicio Contrato</strong></TableCell>
                                    <TableCell align="center"><strong>AFP Certificado</strong></TableCell>
                                    <TableCell align="center"><strong>Días Progresivos</strong></TableCell>
                                    <TableCell align="center"><strong>Días Acumulados</strong></TableCell>
                                    <TableCell align="center"><strong>Asignados</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo VBA</strong></TableCell>
                                    <TableCell align="center"><strong>Saldo VBA</strong></TableCell>
                                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <TableRow >
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">hola</TableCell>
                                    <TableCell align="center">
                                        <IconButton onClick={handleOpenEdit}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Paginacion */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"

                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página"
                />
            </Paper >

            {/* Dialog de Edición */}
            <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Editar datos de vacaciones</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 1 }} justifyContent="center" alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                                Adjuntar Certificado (Máx 1MB)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                fullWidth
                                sx={{ height: '40px', textTransform: 'none', borderColor: 'rgba(0,0,0,0.23)', color: 'text.primary' }}
                            >
                                {archivoCertificado ? archivoCertificado.name : "Elegir archivo"}
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                                Fecha emisión certificado
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                <DatePicker
                                    value={fechaEmision}
                                    onChange={(newValue) => setFechaEmision(newValue)}
                                    format="DD-MM-YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: "small",
                                            sx: { '& .MuiInputBase-root': { height: '40px' } }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                                Num cotizaciones certificado
                            </Typography>
                            <TextField
                                type="number"
                                fullWidth
                                size="small"
                                value={numCotizaciones}
                                onChange={(e) => setNumCotizaciones(e.target.value)}
                                sx={{ '& .MuiInputBase-root': { height: '40px' } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCloseEdit}
                        variant="contained"
                        sx={{ bgcolor: '#777e89', '&:hover': { bgcolor: '#5f6771' } }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        color="primary"
                    >
                        Guardar cambios
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AdminVacacionesProgresivas;