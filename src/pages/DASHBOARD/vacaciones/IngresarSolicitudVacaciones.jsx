import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel,
    Typography, CircularProgress, Stack, Grid
} from "@mui/material";
import { toast } from "react-hot-toast";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";

function AdminIngresarSolicitudVacaciones() {

    const [cargando, setCargando] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);

    // Datos del formulario
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [diasSolicitados, setDiasSolicitados] = useState(0);

    // Saldos (demo por ahora)
    const saldoDiasDisponibles = 8.5;
    const progresivos = 0.0;

    // Lógica Fechas
    const handleFechaInicioChange = (e) => {
        const val = e.target.value;
        setFechaInicio(val);
        if (val) {
            setFechaFin(val);
        }
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

    const handleGuardar = () => {
        if (!filtroEmpleado || !fechaInicio || !fechaFin) {
            toast.error("Complete todos los campos obligatorios (*)");
            return;
        }
        // TODO: conectar con endpoint
        toast.success("Solicitud registrada correctamente (Local/Visual)");
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Ingresar Solicitud Vacaciones
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 5, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", overflowY: "auto", boxSizing: "border-box"
            }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, color: "#333", borderBottom: '1px solid #ddd', pb: 2 }}>
                    Nueva Solicitud de Vacaciones
                </Typography>

                {cargando ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{
                        p: 3, borderRadius: 3, bgcolor: '#f8f9fa', border: '1px solid #eaeaea',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)', maxWidth: 420, mx: 'auto'
                    }}>
                        {/* Saldos */}
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Saldo días disponibles:</Typography>
                                <Typography variant="h6" fontWeight="bold">{saldoDiasDisponibles}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" color="text.secondary">Progresivos:</Typography>
                                <Typography variant="h6" fontWeight="bold">{progresivos}</Typography>
                            </Box>
                        </Stack>

                        <Box sx={{ borderBottom: '1px solid #ddd', mb: 3 }} />

                        {/* Fechas */}
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                            Periodo
                        </Typography>
                        <Stack spacing={3}>
                            <Box>
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
                            <Box>
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
                            onClick={handleGuardar}
                            disabled={cargandoEnvio}
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
        </>
    );
}
export default AdminIngresarSolicitudVacaciones;