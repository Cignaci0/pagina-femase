import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Stack
} from "@mui/material";
import { toast } from "react-hot-toast";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getTipoAusencia } from "../../../services/tiposAusencia";
import { crearAusencia } from "../../../services/ausencias";

function AdminAusenciasEmpleado() {
    // Datos globales para listas
    const [cargando, setCargando] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [tiposAusenciaBack, setTiposAusenciaBack] = useState([]);
    const [userInfo, setUserInfo] = useState({});

    // Datos del formulario
    const [motivoAusencia, setMotivoAusencia] = useState("");
    const [tipoAusenciaVisual, setTipoAusenciaVisual] = useState("Ausencia por todo el dia");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    
    // Tiempos (solo si es "Ausencia por hora")
    const [horaInicioH, setHoraInicioH] = useState("");
    const [horaInicioM, setHoraInicioM] = useState("");
    const [horaFinH, setHoraFinH] = useState("");
    const [horaFinM, setHoraFinM] = useState("");

    const [diasSolicitados, setDiasSolicitados] = useState(0);

    // Carga inicial y token
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

        const cargarCatalogos = async () => {
            setCargando(true);
            try {
                const dataTipos = await getTipoAusencia();
                setTiposAusenciaBack(Array.isArray(dataTipos) ? dataTipos : []);
            } catch (error) {
                toast.error("Error cargando catálogos");
            } finally {
                setCargando(false);
            }
        };
        cargarCatalogos();
    }, []);

    const tiposVigentes = tiposAusenciaBack.filter(ta => ta.estado?.estado_id === 1);

    // Lógica Fechas
    const handleFechaInicioChange = (e) => {
        const val = e.target.value;
        setFechaInicio(val);
        // Autocompletar la fecha fin para ahorrar clicks
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
                setDiasSolicitados(diffDays + 1); // Inclusivo
            } else {
                setDiasSolicitados(0);
            }
        } else {
            setDiasSolicitados(0);
        }
    }, [fechaInicio, fechaFin]);

    // Formatters para inputs de tiempo (ej: 00 a 23 / 00 a 59)
    const handleTimeChange = (e, setter, max) => {
        let val = e.target.value.replace(/\D/g, ""); // Solo números
        if (val !== "") {
            let num = parseInt(val, 10);
            if (num > max) val = max.toString();
        }
        if (val.length > 2) val = val.slice(0, 2);
        setter(val);
    };

    // Auto-completar con cero al salir del input si solo tiene 1 dígito
    const handleTimeBlur = (setter, val) => {
        if (val.length === 1) {
            setter("0" + val);
        }
    };

    const handleGuardar = async () => {
        if (!motivoAusencia || !fechaInicio || !fechaFin) {
            toast.error("Complete todos los campos obligatorios (*)");
            return;
        }

        const esPorHora = tipoAusenciaVisual === "Ausencia por hora";

        if (esPorHora) {
            if (!horaInicioH || !horaInicioM || !horaFinH || !horaFinM) {
                toast.error("Ingrese los horarios de entrada y salida");
                return;
            }
        }

        const numFicha = userInfo?.num_ficha;
        if (!numFicha) {
            toast.error("No se encontró información del empleado en el token");
            return;
        }

        const datos = {
            empleado: numFicha,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            hora_inicio: esPorHora ? `${horaInicioH}:${horaInicioM}` : null,
            hora_fin: esPorHora ? `${horaFinH}:${horaFinM}` : null,
            dia_completo: !esPorHora,
            tipo_ausencia: motivoAusencia
        };

        setCargandoEnvio(true);
        try {
            await crearAusencia(datos);
            toast.success("Ausencia registrada correctamente");
            // Limpiar formulario
            setMotivoAusencia("");
            setFechaInicio("");
            setFechaFin("");
            setHoraInicioH("");
            setHoraInicioM("");
            setHoraFinH("");
            setHoraFinM("");
            setTipoAusenciaVisual("Ausencia por todo el dia");
        } catch (error) {
            toast.error(error.message || "Error al registrar la ausencia");
        } finally {
            setCargandoEnvio(false);
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Ingresar Ausencia
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
                    Formulario de Ingreso
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
                        {/* Controles y Selectores */}
                        <FormControl size="small" fullWidth>
                            <InputLabel>Motivo ausencia/justificación</InputLabel>
                            <Select label="Motivo ausencia/justificación" value={motivoAusencia} onChange={(e) => setMotivoAusencia(e.target.value)} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                <MenuItem value=""><em>- Seleccione motivo -</em></MenuItem>
                                {tiposVigentes.map(ta => (
                                    <MenuItem key={ta.id} value={ta.id}>{ta.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" fullWidth>
                            <InputLabel>Tipo de ausencia</InputLabel>
                            <Select label="Tipo de ausencia" value={tipoAusenciaVisual} onChange={(e) => setTipoAusenciaVisual(e.target.value)} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                <MenuItem value="Ausencia por todo el dia">Ausencia por todo el dia</MenuItem>
                                <MenuItem value="Ausencia por hora">Ausencia por hora</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Periodo */}
                        <Box sx={{ 
                            p: { xs: 2, sm: 3 }, 
                            borderRadius: 3, 
                            bgcolor: '#fff', 
                            border: '1px solid #eaeaea', 
                            boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                        }}>
                            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                Periodo
                            </Typography>
                            
                            <Stack spacing={3}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
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
                                        <Typography variant="body2" color="text.secondary" mb={1}>Fecha de Fin</Typography>
                                        <TextField 
                                            type="date" 
                                            fullWidth 
                                            size="small"
                                            value={fechaFin} 
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            sx={{ bgcolor: "#fff" }} 
                                        />
                                    </Box>
                                </Box>

                                {tipoAusenciaVisual === "Ausencia por hora" && (
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" color="text.secondary" mb={1}>Hora de Entrada</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TextField 
                                                    size="small" placeholder="HH" 
                                                    value={horaInicioH} onChange={(e) => handleTimeChange(e, setHoraInicioH, 23)}
                                                    onBlur={() => handleTimeBlur(setHoraInicioH, horaInicioH)}
                                                    inputProps={{ maxLength: 2, style: { textAlign: 'center' }, inputMode: 'numeric' }}
                                                    sx={{ flex: 1, bgcolor: "#fff" }} 
                                                />
                                                <Typography fontWeight="bold">:</Typography>
                                                <TextField 
                                                    size="small" placeholder="MM" 
                                                    value={horaInicioM} onChange={(e) => handleTimeChange(e, setHoraInicioM, 59)}
                                                    onBlur={() => handleTimeBlur(setHoraInicioM, horaInicioM)}
                                                    inputProps={{ maxLength: 2, style: { textAlign: 'center' }, inputMode: 'numeric' }}
                                                    sx={{ flex: 1, bgcolor: "#fff" }} 
                                                />
                                            </Box>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" color="text.secondary" mb={1}>Hora de Salida</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TextField 
                                                    size="small" placeholder="HH" 
                                                    value={horaFinH} onChange={(e) => handleTimeChange(e, setHoraFinH, 23)}
                                                    onBlur={() => handleTimeBlur(setHoraFinH, horaFinH)}
                                                    inputProps={{ maxLength: 2, style: { textAlign: 'center' }, inputMode: 'numeric' }}
                                                    sx={{ flex: 1, bgcolor: "#fff" }} 
                                                />
                                                <Typography fontWeight="bold">:</Typography>
                                                <TextField 
                                                    size="small" placeholder="MM" 
                                                    value={horaFinM} onChange={(e) => handleTimeChange(e, setHoraFinM, 59)}
                                                    onBlur={() => handleTimeBlur(setHoraFinM, horaFinM)}
                                                    inputProps={{ maxLength: 2, style: { textAlign: 'center' }, inputMode: 'numeric' }}
                                                    sx={{ flex: 1, bgcolor: "#fff" }} 
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Box>

                        {/* Días y Botón de Enviar */}
                        <Box sx={{ 
                            p: 3, borderRadius: 3, bgcolor: '#fff', border: '1px solid #eaeaea', 
                            display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, 
                            alignItems: 'center', justifyContent: 'space-around', gap: 3
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ 
                                    width: 80, height: 80, borderRadius: '50%', 
                                    border: '4px solid #8baac2', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}>
                                    <Typography variant="h4" color="text.primary" sx={{ fontWeight: 500 }}>
                                        {diasSolicitados}
                                    </Typography>
                                </Box>
                                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                                    Días
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                onClick={handleGuardar}
                                disabled={cargandoEnvio}
                                startIcon={<EventAvailableIcon />}
                                sx={{ 
                                    bgcolor: "#0f355c", 
                                    '&:hover': { bgcolor: "#0a243e" },
                                    px: 4, py: 1.5, 
                                    borderRadius: 6, 
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    boxShadow: '0px 4px 10px rgba(15,53,92,0.4)',
                                    width: { xs: '100%', sm: 'auto' },
                                    fontSize: '0.85rem'
                                }}
                            >
                                Registrar Ausencia
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </>
    );
}

export default AdminAusenciasEmpleado;