import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Typography, CircularProgress,
    TablePagination, IconButton
} from "@mui/material";
import { toast } from "react-hot-toast";

import { getMarcas } from "../../../services/marcasServices";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import SearchIcon from '@mui/icons-material/Search';
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

function MarcasAsistencia() {

    const [cargando, setCargando] = useState(false);
    const [userInfo, setUserInfo] = useState({});
    
    const [desdeFecha, setDesdeFecha] = useState(null);
    const [hastaFecha, setHastaFecha] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    // Paginacion
    const [pagina, setPagina] = useState(0);
    const [filaPorPagina, setFilaPorPagina] = useState(5);

    // Datos reales
    const [marcas, setMarcas] = useState([]);
    const [haBuscado, setHaBuscado] = useState(false);

    useEffect(() => {
        const decodeToken = () => {
            try {
                const token = window.localStorage.getItem("token");
                if (!token) return;
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo(payload);
            } catch (e) {
                console.error("Error decoding token", e);
            }
        };
        decodeToken();
    }, []);

    const handleBuscarMarcas = async () => {
        if (!desdeFecha || !hastaFecha) {
            toast.error("Seleccione fechas desde/hasta");
            return;
        }

        const numFicha = userInfo?.num_ficha;
        if (!numFicha) {
            toast.error("No se encontró información del empleado en el token");
            return;
        }

        setCargando(true);
        try {
            const fi = desdeFecha.format("YYYY-MM-DD");
            const ff = hastaFecha.format("YYYY-MM-DD");
            const res = await getMarcas(numFicha, fi, ff);
            setMarcas(res);
            setHaBuscado(true);
            setPagina(0);
        } catch (error) {
            toast.error("Error al buscar marcas");
        } finally {
            setCargando(false);
        }
    };

    const formatTurno = (empleado) => {
        if (!empleado?.turno?.detalle_turno?.horario) return "-";
        const { hora_entrada, hora_salida } = empleado.turno.detalle_turno.horario;
        if (hora_entrada && hora_salida) {
            return `${hora_entrada} - ${hora_salida}`;
        } else if (hora_entrada) {
            return hora_entrada;
        }
        return "-";
    };

    const marcasFiltradas = marcas.filter(m => {
        if (!busqueda) return true;
        const term = busqueda.toLowerCase();
        return (
            m.fecha_marca?.toLowerCase().includes(term) ||
            m.info_adicional?.toLowerCase().includes(term) ||
            m.hora_marca?.toLowerCase().includes(term) ||
            m.hashcode?.toLowerCase().includes(term)
        );
    });

    const handleChangePage = (event, newPage) => setPagina(newPage);
    const handleChangeRowsPerPage = (event) => {
        setFilaPorPagina(parseInt(event.target.value, 10));
        setPagina(0);
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Marcas
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Controles y Filtros */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 3 }}>
                    
                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Desde"
                                format="DD-MM-YYYY"
                                value={desdeFecha}
                                onChange={(val) => setDesdeFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Box sx={{ maxWidth: "20%" }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                            <DatePicker
                                label="Hasta"
                                format="DD-MM-YYYY"
                                value={hastaFecha}
                                onChange={(val) => setHastaFecha(val)}
                                slotProps={{ textField: { fullWidth: true, size: "small" } }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Button variant="contained" color="secondary" onClick={handleBuscarMarcas} disabled={!desdeFecha || !hastaFecha || cargando}>
                        Buscar
                    </Button>

                    <Paper component="form" sx={{ bgcolor: "#F5F5F5", p: "2px 4px", display: "flex", ml: 2, alignItems: "center", width: { xs: "100%", md: "160px" }, height: "40px", }}>
                        <TextField
                            placeholder="Buscar..."
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{ ml: 1, flex: 1, px: 1 }}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <IconButton type="button" sx={{ p: '5px' }}>
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
                    <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                        <Table stickyHeader sx={{ minWidth: 650, width: "100%" }} aria-label="tabla de marcas">
                            <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                                <TableRow>
                                    <TableCell align="center"><strong>Fecha Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Hora Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Evento</strong></TableCell>
                                    <TableCell align="center"><strong>Turno</strong></TableCell>
                                    <TableCell align="center"><strong>Más Info</strong></TableCell>
                                    <TableCell align="center"><strong>Hashcode</strong></TableCell>
                                    <TableCell align="center"><strong>Tipo Marca</strong></TableCell>
                                    <TableCell align="center"><strong>Comentario</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {!haBuscado ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                Seleccione un rango de fechas para comenzar la búsqueda
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : marcasFiltradas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                                                No se encontraron resultados
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    marcasFiltradas.slice(pagina * filaPorPagina, pagina * filaPorPagina + filaPorPagina).map((row, idx) => {
                                        const esRoja = (row.id_marca === null && row.tieneTurno === true && row.info_adicional?.trim() === "Sin marca") || row.info_adicional?.trim() === "Falta Marca Salida" || row.info_adicional?.trim() === "Faltan ambas marcas" || row.info_adicional?.trim() === "Falta Marca Entrada";
                                        return (
                                            <TableRow key={idx} sx={{ backgroundColor: esRoja ? "#cf4c60ff" : "inherit", "& .MuiTableCell-root": { color: esRoja ? "white" : "inherit" } }}>
                                                <TableCell align="center">{row.fecha_marca}</TableCell>
                                                <TableCell align="center">{row.hora_marca || "-"}</TableCell>
                                                <TableCell align="center">{row.evento === 1 ? "Entrada" : !row.evento ? "-" : "Salida"}</TableCell>
                                                <TableCell align="center">{formatTurno(row.empleado)}</TableCell>
                                                <TableCell align="center">{row.info_adicional || "-"}</TableCell>
                                                <TableCell align="center">{row.hashcode || "-"}</TableCell>
                                                <TableCell align="center">{row.tipo_marca?.nombre}</TableCell>
                                                <TableCell align="center">{row.comentario}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={marcasFiltradas.length}
                    rowsPerPage={filaPorPagina}
                    page={pagina}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Paginas"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
            </Paper >
        </>
    );
}

export default MarcasAsistencia;