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
import { obtenerHorasCompensacion, descontarHorasCompensacion, transferirHorasCompensacion } from "../../../services/horasCompensacion";

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
    const [saldoCompensacion, setSaldoCompensacion] = useState("00:00:00");
    const [saldoPagas, setSaldoPagas] = useState("00:00:00");
    const [saldoConsumidas, setSaldoConsumidas] = useState("00:00:00");
    const [diasEquivalentes, setDiasEquivalentes] = useState("0.00");
    const [registrosHoras, setRegistrosHoras] = useState([]);

    // Transferencia
    const [openTransferir, setOpenTransferir] = useState(false);
    const [periodoTransferir, setPeriodoTransferir] = useState(dayjs().format("YYYY-MM"));
    const [horasTransferir, setHorasTransferir] = useState("");
    const [cargandoTransferir, setCargandoTransferir] = useState(false);

    const cargarDias = async () => {
        try {
            const usuarioId = userInfo?.usuario_id;
            if (!usuarioId) return;
            const data = await obtenerHorasCompensacion(usuarioId);
            
            if (Array.isArray(data)) {
                setRegistrosHoras(data);
                let totalMinutosExtras = 0;
                let totalMinutosCompensacion = 0;
                let totalMinutosPagas = 0;
                let totalMinutosConsumidas = 0;

                data.forEach(item => {
                    // Horas Extras Totales
                    const hrsExtra = item.horas_extras || "00:00:00"; 
                    if (hrsExtra) {
                        const parts = hrsExtra.split(":");
                        const h = parseInt(parts[0], 10) || 0;
                        const m = parseInt(parts[1], 10) || 0;
                        const s = parseInt(parts[2], 10) || 0;
                        totalMinutosExtras += (h * 60) + m + Math.round(s / 60);
                    }

                    // Horas Pagas
                    const hrsPagas = item.horas_pagas || "00:00:00"; 
                    if (hrsPagas) {
                        const partsP = hrsPagas.split(":");
                        const hp = parseInt(partsP[0], 10) || 0;
                        const mp = parseInt(partsP[1], 10) || 0;
                        const sp = parseInt(partsP[2], 10) || 0;
                        totalMinutosPagas += (hp * 60) + mp + Math.round(sp / 60);
                    }

                    // Horas Compensación
                    const hrsComp = item.horas_compensacion;
                    const hrsCompCons = item.horas_compensacion_consumidas || "00:00:00";
                    if (hrsComp) {
                        const partsC = hrsComp.split(":");
                        const hc = parseInt(partsC[0], 10) || 0;
                        const mc = parseInt(partsC[1], 10) || 0;
                        const minsComp = (hc * 60) + mc;

                        const partsCC = hrsCompCons.split(":");
                        const hcc = parseInt(partsCC[0], 10) || 0;
                        const mcc = parseInt(partsCC[1], 10) || 0;
                        const minsCompCons = (hcc * 60) + mcc;

                        totalMinutosConsumidas += minsCompCons;
                        totalMinutosCompensacion += Math.max(0, minsComp - minsCompCons);
                    }
                });

                const hrs = Math.floor(totalMinutosExtras / 60);
                const mins = totalMinutosExtras % 60;
                setSaldoDiasDisponibles(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`);

                const hrsP = Math.floor(totalMinutosPagas / 60);
                const minsP = totalMinutosPagas % 60;
                setSaldoPagas(`${String(hrsP).padStart(2, '0')}:${String(minsP).padStart(2, '0')}:00`);

                const hrsC = Math.floor(totalMinutosCompensacion / 60);
                const minsC = totalMinutosCompensacion % 60;
                setSaldoCompensacion(`${String(hrsC).padStart(2, '0')}:${String(minsC).padStart(2, '0')}:00`);

                const hrsCons = Math.floor(totalMinutosConsumidas / 60);
                const minsCons = totalMinutosConsumidas % 60;
                setSaldoConsumidas(`${String(hrsCons).padStart(2, '0')}:${String(minsCons).padStart(2, '0')}:00`);

                // Cada 6 horas equivale a un día (6 horas = 360 minutos) usando el saldo de compensacion!
                const dias = (totalMinutosCompensacion / 360).toFixed(2);
                setDiasEquivalentes(dias);
            } else {
                setSaldoDiasDisponibles("00:00:00");
                setSaldoPagas("00:00:00");
                setSaldoCompensacion("00:00:00");
                setSaldoConsumidas("00:00:00");
                setDiasEquivalentes("0.00");
            }
        } catch (error) {
            console.error("Error al cargar días de compensación:", error);
            setSaldoDiasDisponibles("00:00:00");
            setSaldoPagas("00:00:00");
            setSaldoCompensacion("00:00:00");
            setSaldoConsumidas("00:00:00");
            setDiasEquivalentes("0.00");
        }
    };

    const [tipoSolicitud, setTipoSolicitud] = useState("DIAS"); // DIAS o HORAS
    const [cantidadHoras, setCantidadHoras] = useState(1);
    const [momentoJornada, setMomentoJornada] = useState("INICIO");

    useEffect(() => {
        if (userInfo && userInfo.usuario_id) {
            cargarDias();
        }
    }, [userInfo?.usuario_id]);

    const handleTransferir = async () => {
        if (!periodoTransferir || !horasTransferir) {
            toast.error("Complete el periodo y las horas a transferir");
            return;
        }

        const usuarioId = userInfo?.usuario_id;
        if (!usuarioId) {
            toast.error("ID de usuario no encontrado");
            return;
        }

        setCargandoTransferir(true);
        const toastId = toast.loading("Transfiriendo horas...");
        try {
            const horasString = horasTransferir.length === 5 ? horasTransferir + ":00" : horasTransferir;
            await transferirHorasCompensacion(usuarioId, periodoTransferir, horasString);
            toast.success("Horas transferidas exitosamente a compensación", { id: toastId });
            setOpenTransferir(false);
            setPeriodoTransferir("");
            setHorasTransferir("");
            await cargarDias();
        } catch (error) {
            toast.error(error.message || "Error al transferir", { id: toastId });
        } finally {
            setCargandoTransferir(false);
        }
    };

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
        if (tipoSolicitud === "DIAS") {
            if (!fechaInicio || !fechaFin) {
                toast.error("Complete las fechas de inicio y término para continuar");
                return;
            }
            if (diasSolicitados > parseFloat(diasEquivalentes)) {
                toast.error(`No posee suficientes días de compensación. Disponibles: ${diasEquivalentes}, Solicitados: ${diasSolicitados}`);
                return;
            }
        } else {
            if (!fechaInicio) {
                toast.error("Complete la fecha para continuar");
                return;
            }
        }
        setOpenVistaPrevia(true);
    };

    const handleGuardar = async () => {
        const usuarioId = userInfo?.usuario_id;
        setCargandoEnvio(true);
        const toastId = toast.loading("Ingresando solicitud...");
        
        try {
            if (tipoSolicitud === "DIAS") {
                let currentDate = new Date(fechaInicio + "T12:00:00");
                const endDate = new Date(fechaFin + "T12:00:00");
                let exitoCount = 0;
                
                while (currentDate <= endDate) {
                    const fecha_solicitada = currentDate.toISOString().split("T")[0];
                    
                    try {
                        await descontarHorasCompensacion(usuarioId, "DIA_COMPLETO", fecha_solicitada, "DIA_COMPLETO");
                        toast.success(`Día ${fecha_solicitada} solicitado correctamente`);
                        exitoCount++;
                    } catch (error) {
                        toast.error(`Omisión en ${fecha_solicitada}: ${error.message}`, { duration: 6000 });
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                
                toast.dismiss(toastId);
                setOpenVistaPrevia(false);
                if (exitoCount > 0) {
                    setFechaInicio("");
                    setFechaFin("");
                    setCantidadHoras("");
                    setDiasSolicitados(0);
                    cargarDias(usuarioId);
                }
                setCargandoEnvio(false);
                return; 
            } else {
                // Por horas
                const horasString = `${String(cantidadHoras).padStart(2, '0')}:00:00`;
                await descontarHorasCompensacion(usuarioId, horasString, fechaInicio, momentoJornada);
            }

            toast.success("Solicitud ingresada correctamente. Pendiente de aprobación.", { id: toastId });
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="text.secondary" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    Ingresar Días Compensación
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: { xs: 2, md: 3 }, 
                bgcolor: "#FFFFFD", 
                borderRadius: 2, 
                width: "100%", 
                minHeight: "calc(100vh - 200px)", 
                height: "auto", 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: "auto",
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
                        p: { xs: 2.5, sm: 4 }, 
                        borderRadius: 3, 
                        bgcolor: '#f8f9fa', 
                        border: '1px solid #eaeaea',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', 
                        width: '100%',
                        maxWidth: { xs: '100%', md: '600px' },
                        mx: 'auto', 
                        my: { xs: 2, md: 'auto' },
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3
                    }}>
                        {/* Saldos */}
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Horas Extras Totales:</Typography>
                                <Typography variant="h6" fontWeight="bold">{saldoDiasDisponibles}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Horas a Pagar:</Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#f57c00' }}>{saldoPagas}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Horas Compensación Disponibles:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">{saldoCompensacion}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Horas Compensación Consumidas:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="error">{saldoConsumidas}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button variant="outlined" color="primary" onClick={() => setOpenTransferir(true)} size="small" sx={{ borderRadius: 4 }}>
                                    Pasar a Compensación
                                </Button>
                            </Box>
                        </Stack>

                        {/* Tipo de Solicitud */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Button 
                                variant={tipoSolicitud === "DIAS" ? "contained" : "outlined"} 
                                onClick={() => setTipoSolicitud("DIAS")}
                                sx={{ mr: 2, borderRadius: 2 }}
                            >
                                Días Completos
                            </Button>
                            <Button 
                                variant={tipoSolicitud === "HORAS" ? "contained" : "outlined"} 
                                onClick={() => setTipoSolicitud("HORAS")}
                                sx={{ borderRadius: 2 }}
                            >
                                Por Horas
                            </Button>
                        </Box>

                        <Box sx={{ borderBottom: '1px solid #ddd' }} />

                        {/* Fechas / Horas */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                {tipoSolicitud === "DIAS" ? "Período Solicitado" : "Fecha y Horas"}
                            </Typography>
                            
                            {tipoSolicitud === "DIAS" ? (
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
                            ) : (
                                <Stack spacing={3} direction={{ xs: 'column', sm: 'row' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="text.secondary" mb={1}>Fecha</Typography>
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
                                        <Typography variant="body2" color="text.secondary" mb={1}>Cantidad de Horas</Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={cantidadHoras}
                                                onChange={(e) => setCantidadHoras(e.target.value)}
                                                sx={{ bgcolor: "#fff" }}
                                            >
                                                <MenuItem value={1}>1 Hora</MenuItem>
                                                <MenuItem value={2}>2 Horas</MenuItem>
                                                <MenuItem value={3}>3 Horas</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" color="text.secondary" mb={1}>Momento</Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={momentoJornada}
                                                onChange={(e) => setMomentoJornada(e.target.value)}
                                                sx={{ bgcolor: "#fff" }}
                                            >
                                                <MenuItem value="INICIO">Al inicio de la jornada</MenuItem>
                                                <MenuItem value="FIN">Al final de la jornada</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Stack>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            onClick={handleAbrirVistaPrevia}
                            disabled={cargandoEnvio || saldoCompensacion === "00:00:00" || !fechaInicio || (tipoSolicitud === "DIAS" && (!fechaFin || diasSolicitados > parseFloat(diasEquivalentes)))}
                            startIcon={<EventAvailableIcon />}
                            sx={{
                                mt: 2,
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
                            {tipoSolicitud === "DIAS" ? (
                                <>
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
                                </>
                            ) : (
                                <>
                                    <TableRow>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                                        <TableCell align="left">{fechaInicio}</TableCell>
                                    </TableRow>
                                    <TableRow sx={{ bgcolor: "#f1fff1" }}>
                                        <TableCell align="right" sx={{ fontWeight: "bold", color: "green" }}>Horas solicitadas</TableCell>
                                        <TableCell align="left" sx={{ fontWeight: "bold", color: "green" }}>
                                            {cantidadHoras} {cantidadHoras == 1 ? "Hora" : "Horas"} ({momentoJornada === "INICIO" ? "Al inicio de la jornada" : "Al final de la jornada"})
                                        </TableCell>
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button variant="contained" color="info" onClick={handleGuardar}>
                        {tipoSolicitud === "DIAS" ? "Ingresar Solicitud de Días de Compensación" : "Ingresar Solicitud de Horas de Compensación"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Transferir */}
            <Dialog open={openTransferir} onClose={() => setOpenTransferir(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>Transferir a Compensación</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            Asigne las horas que desea transferir a su saldo de compensación para el período actual ({periodoTransferir}).
                        </Typography>
                        <TextField
                            label="Horas a Transferir"
                            type="time"
                            fullWidth
                            size="small"
                            value={horasTransferir}
                            onChange={(e) => setHorasTransferir(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }} // 5 min
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button variant="outlined" onClick={() => setOpenTransferir(false)}>Cancelar</Button>
                    <Button variant="contained" color="primary" onClick={handleTransferir} disabled={cargandoTransferir}>
                        Transferir
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default AdminDiasCompensacion;