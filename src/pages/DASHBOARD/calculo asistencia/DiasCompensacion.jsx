import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel,
    Typography, CircularProgress, Stack, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableRow, TableCell
} from "@mui/material";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { obtenerDiasDisponibles, generarSolicitudVacaciones } from "../../../services/vacaciones";
import { obtenerHorasCompensacion, descontarHorasCompensacion } from "../../../services/horasCompensacion";

function AdminDiasCompensacion() {

    const [cargando, setCargando] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    const decodeToken = () => {
        try {
            const token = window.localStorage.getItem("token");
            if (!token) return {};
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error("Error decode token", e);
            return {};
        }
    };
    const userInfo = decodeToken();

    // Datos del formulario
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [diasSolicitados, setDiasSolicitados] = useState(0);

    // Saldos
    const [saldoDiasDisponibles, setSaldoDiasDisponibles] = useState("00:00:00");
    const [diasEquivalentes, setDiasEquivalentes] = useState("0.00");
    const [registroCompensacion, setRegistroCompensacion] = useState(null);

    const cargarDias = async () => {
        try {
            if (!userInfo || !userInfo.usuario_id) return;
            const data = await obtenerHorasCompensacion(userInfo.usuario_id);
            if (Array.isArray(data)) {
                if (data.length > 0) {
                    setRegistroCompensacion(data[0]);
                } else {
                    setRegistroCompensacion(null);
                }

                let totalMinutos = 0;
                data.forEach(item => {
                    if (item.horas_extras) {
                        const parts = item.horas_extras.split(":");
                        const h = parseInt(parts[0], 10) || 0;
                        const m = parseInt(parts[1], 10) || 0;
                        const s = parseInt(parts[2], 10) || 0;
                        totalMinutos += (h * 60) + m + Math.round(s / 60);
                    }
                });

                const hrs = Math.floor(totalMinutos / 60);
                const mins = totalMinutos % 60;
                const formatted = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;

                setSaldoDiasDisponibles(formatted);

                // Cada 6 horas equivale a un día (6 horas = 360 minutos)
                const dias = (totalMinutos / 360).toFixed(2);
                setDiasEquivalentes(dias);
            }
        } catch (error) {
            console.error("Error al cargar días de compensación:", error);
        }
    };

    useEffect(() => {
        if (userInfo && userInfo.usuario_id) {
            cargarDias();
        }
    }, [userInfo?.usuario_id]);

    // Lógica Fechas
    const handleFechaInicioChange = (e) => {
        setFechaInicio(e.target.value);
    };

    // Calculo dias
    useEffect(() => {
        if (fechaInicio && fechaFin) {
            const fi = new Date(fechaInicio + "T12:00:00");
            const ff = new Date(fechaFin + "T12:00:00");
            if (fi <= ff) {
                const diffTime = Math.abs(ff - fi);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setDiasSolicitados(diffDays + 1);
            } else {
                setDiasSolicitados(0);
            }
        } else {
            setDiasSolicitados(0);
        }
    }, [fechaInicio, fechaFin]);

    const [openVistaPrevia, setOpenVistaPrevia] = useState(false);

    const handleAbrirVistaPrevia = () => {
        if (!fechaInicio || !fechaFin) {
            toast.error("Complete las fechas de inicio y término para continuar");
            return;
        }
        if (diasSolicitados > parseFloat(diasEquivalentes)) {
            toast.error(`No posee suficientes días de compensación. Disponibles: ${diasEquivalentes}, Solicitados: ${diasSolicitados}`);
            return;
        }
        setOpenVistaPrevia(true);
    };

    const handleGuardar = async () => {
        if (!registroCompensacion || !registroCompensacion.id) {
            toast.error("No se encontró un registro de compensación para descontar horas.");
            return;
        }

        if (diasSolicitados > parseFloat(diasEquivalentes)) {
            toast.error("No posee suficientes días de compensación.");
            return;
        }

        const horasADescontar = diasSolicitados * 6;

        setCargandoEnvio(true);
        const toastId = toast.loading("Ingresando solicitud y descontando horas...");
        try {
            await descontarHorasCompensacion(registroCompensacion.id, horasADescontar);
            toast.success("Solicitud ingresada y horas descontadas correctamente", { id: toastId });
            setOpenVistaPrevia(false);
            setFechaInicio("");
            setFechaFin("");
            setDiasSolicitados(0);
            await cargarDias();
        } catch (error) {
            toast.error(error.message || "Error al registrar la solicitud", { id: toastId });
        } finally {
            setCargandoEnvio(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Ingresar Días Compensación
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "auto",
            }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, color: "#333", borderBottom: '1px solid #ddd', pb: 2 }}>
                    Nueva Solicitud de Días De Compensación
                </Typography>

                {cargando ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{
                        p: 4, borderRadius: 3, bgcolor: '#f8f9fa', border: '1px solid #eaeaea',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', 
                        width: { xs: '90%', md: '50%' }, 
                        height: '50%', 
                        minHeight: 350,
                        mx: 'auto', my: 'auto',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center'
                    }}>
                        {/* Saldos */}
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Horas Extras Disponibles:</Typography>
                                <Typography variant="h6" fontWeight="bold">{saldoDiasDisponibles}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Días Equivalentes:</Typography>
                                <Typography variant="h6" fontWeight="bold">{diasEquivalentes}</Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ borderBottom: '1px solid #ddd', mb: 3 }} />

                        {/* Fechas */}
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                            Periodo
                        </Typography>
                        <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="text.secondary" mb={1}>Fecha de Inicio</Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={fechaInicio}
                                    onChange={handleFechaInicioChange}
                                    sx={{ bgcolor: "#fff" }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="text.secondary" mb={1}>Fecha de Término</Typography>
                                <TextField
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    sx={{ bgcolor: "#fff" }}
                                />
                            </Box>
                        </Stack>

                            <Button
                                variant="contained"
                                onClick={handleAbrirVistaPrevia}
                                disabled={cargandoEnvio || !fechaInicio || !fechaFin || diasSolicitados > parseFloat(diasEquivalentes)}
                            startIcon={<EventAvailableIcon />}
                            sx={{
                                mt: 3,
                                bgcolor: "#0f355c",
                                '&:hover': { bgcolor: "#0a243e" },
                                px: 3, py: 1.5,
                                borderRadius: 6,
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                boxShadow: '0px 4px 10px rgba(15,53,92,0.4)',
                                width: '100%',
                                fontSize: '0.85rem'
                            }}
                        >
                            Vista Previa
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Dialog Vista Previa */}
            <Dialog open={openVistaPrevia} onClose={() => setOpenVistaPrevia(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Vista Previa - Solicitud de Días de Compensación</DialogTitle>
                <DialogContent>
                    <Table size="small" sx={{ mb: 2 }}>
                        <TableBody>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold", width: "40%" }}>Num ficha trabajador</TableCell>
                                <TableCell align="left">{userInfo.num_ficha || "-"}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Nombre trabajador</TableCell>
                                <TableCell align="left">{userInfo.nombre_completo || "-"}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Nombre de usuario solicitante</TableCell>
                                <TableCell align="left">{userInfo.username || "-"}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Institucion</TableCell>
                                <TableCell align="left">{userInfo.empresa || "-"}</TableCell>
                            </TableRow>
                            <TableRow>  
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Fecha/Hora solicitud</TableCell>
                                <TableCell align="left">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Inicio periodo</TableCell>
                                <TableCell align="left">{fechaInicio}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>Término periodo</TableCell>
                                <TableCell align="left">{fechaFin}</TableCell>
                            </TableRow>
                            <TableRow sx={{ bgcolor: "#f1fff1" }}>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "green" }}>Dias solicitados</TableCell>
                                <TableCell align="left" sx={{ fontWeight: "bold", color: "green" }}>{diasSolicitados}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button variant="contained" color="info" onClick={handleGuardar}>
                        Ingresar Solicitud de Días de Compensación
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminDiasCompensacion;