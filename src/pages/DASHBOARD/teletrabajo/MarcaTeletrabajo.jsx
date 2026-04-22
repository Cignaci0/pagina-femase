import React, { useEffect, useState } from "react";
import {
    Box, Paper, Button, Select, MenuItem, FormControl, Typography, CircularProgress
} from "@mui/material";
import { toast } from "react-hot-toast";

import WatchLaterOutlinedIcon from '@mui/icons-material/WatchLaterOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import dayjs from "dayjs";
import "dayjs/locale/es";

import { obtenerDispositivosPorEmpleado } from "../../../services/dispositivosServices";
import { crearMarca } from "../../../services/marcasServices";
import { tieneteletrabajo } from "../../../services/teletrabajo";
dayjs.locale("es");

const ClockFace = () => {
    const radius = 33;
    return (
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
                {/* Ticks */}
                {[...Array(60)].map((_, i) => {
                    const angle = i * 6 * Math.PI / 180;
                    const isHour = i % 5 === 0;
                    const r1 = isHour ? 43 : 45.5;
                    const r2 = 47.5;
                    return (
                        <line
                            key={`tick-${i}`}
                            x1={50 + r1 * Math.sin(angle)}
                            y1={50 - r1 * Math.cos(angle)}
                            x2={50 + r2 * Math.sin(angle)}
                            y2={50 - r2 * Math.cos(angle)}
                            stroke="#333"
                            strokeWidth={isHour ? 1.2 : 0.5}
                        />
                    );
                })}
                {/* Numbers */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i + 1) * 30 * Math.PI / 180;
                    return (
                        <text
                            key={`num-${i}`}
                            x={50 + radius * Math.sin(angle)}
                            y={50 - radius * Math.cos(angle) + 3}
                            fill="#111"
                            fontSize="9"
                            fontWeight="500"
                            fontFamily="Arial, sans-serif"
                            textAnchor="middle"
                        >
                            {i + 1}
                        </text>
                    );
                })}
            </svg>
        </Box>
    );
};

function MarcaTeletrabajo() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [device, setDevice] = useState("");
    const [dispositivos, setDispositivos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [tienePermiso, setTienePermiso] = useState(null);

    useEffect(() => {
        const verificarPermisos = async () => {
            const token = window.localStorage.getItem("token");
            if (!token) {
                setTienePermiso(false);
                return;
            }
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const run = payload.rut;
                
                if (!run) {
                    console.error("No se encontró el RUN en el token:", payload);
                    setTienePermiso(false);
                    return;
                }

                const result = await tieneteletrabajo(run);
                
                if (result && !Array.isArray(result)) {
                    setTienePermiso(result);
                    // Solo si tiene permiso cargamos dispositivos por empleado
                    const devData = await obtenerDispositivosPorEmpleado(run);
                    setDispositivos(devData);
                    if (devData.length > 0) {
                        setDevice(devData[0].dispositivo_id);
                    }
                } else {
                    setTienePermiso(false);
                }
            } catch (error) {
                console.error("Error al verificar permisos:", error);
                setTienePermiso(false);
            }
        }
        verificarPermisos();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatoFecha = dayjs(currentTime).format('dddd DD - MM - YYYY');
    const formatoHoraDigital = dayjs(currentTime).format('HH:mm');

    const secondsDegrees = (currentTime.getSeconds() / 60) * 360;
    const minsDegrees = ((currentTime.getMinutes() + currentTime.getSeconds() / 60) / 60) * 360;
    const hourDegrees = (((currentTime.getHours() % 12) + currentTime.getMinutes() / 60) / 12) * 360;

    const handleRegistrarMarca = async (evento) => {
        if (!device) {
            toast.error("Seleccione un dispositivo");
            return;
        }

        setCargando(true);
        const tId = toast.loading("Registrando marca...");

        try {
            const token = window.localStorage.getItem("token");
            if (!token) throw new Error("No hay sesión activa");
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const numFicha = payload.num_ficha;

            if (!numFicha) throw new Error("No se encontró el número de ficha en el token");

            const datosMarca = {
                fecha_marca: dayjs(currentTime).format("YYYY-MM-DD"),
                hora_marca: dayjs(currentTime).format("HH:mm:ss"),
                evento: evento,
                dispositivo_id: device,
                num_ficha: numFicha,
                comentario: "Marca realizada desde portal de teletrabajo",
                tipo_marca_id: 3 // Teletrabajo por defecto CAMBIAR SI CAMBIA EL ID EN LA BASE DE DATOS
            };

            await crearMarca(datosMarca);
            toast.success(`Marca de ${evento === 1 ? 'entrada' : 'salida'} registrada con éxito`, { id: tId });
        } catch (error) {
            toast.error(error.message || "Error al registrar la marca", { id: tId });
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Marca Teletrabajo
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box", justifyContent: 'center', alignItems: 'center'
            }}>
                {tienePermiso === null ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">Verificando asignación de teletrabajo...</Typography>
                    </Box>
                ) : tienePermiso === false ? (
                    <Box sx={{ textAlign: 'center', p: 4 }}>
                        <WatchLaterOutlinedIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500 }}>
                            No presenta teletrabajo el día de hoy
                        </Typography>
                        <Typography variant="body1" color="text.disabled" sx={{ mt: 1 }}>
                            Comuníquese con su supervisor si esto es un error.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        flex: 1,
                        overflowY: "auto",
                        width: "100%",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center', // Centra todo verticalmente en el contenedor
                        pt: 2,
                        pb: 2
                    }}>
                    {/* Device Selector */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%', justifyContent: 'center' }}>
                        <Typography variant="h6" sx={{ mr: 2, color: '#333', fontWeight: 400, fontSize: '1.2rem' }}>dispositivo:</Typography>
                        <FormControl sx={{ minWidth: 300, bgcolor: 'white' }}>
                            <Select
                                value={device}
                                onChange={(e) => setDevice(e.target.value)}
                                sx={{ 
                                    borderRadius: 3, 
                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                                    '& .MuiSelect-select': { py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } 
                                }}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                                renderValue={(selected) => {
                                    if (!selected && dispositivos.length === 0) return "Cargando dispositivos...";
                                    if (!selected) return "Seleccione dispositivo";
                                    const disp = dispositivos.find(d => d.dispositivo_id === selected);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Typography sx={{ fontSize: '1.1rem' }}>{disp ? disp.nombre : selected}</Typography>
                                        </Box>
                                    );
                                }}
                            >
                                {dispositivos.map((disp) => (
                                    <MenuItem key={disp.dispositivo_id} value={disp.dispositivo_id}>
                                        {disp.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: '85%', maxWidth: 500, height: 16, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.06) 0%, transparent 60%)', mb: 2, opacity: 0.8 }} />

                    {/* Date */}
                    <Typography variant="h6" sx={{ mb: 1, color: '#111', fontWeight: 400, fontSize: '1.2rem' }}>
                        {formatoFecha}
                    </Typography>

                    {/* Horario Asignado */}
                    {tienePermiso && (tienePermiso.horario_id || tienePermiso.horario) && (
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                Horario asignado: {
                                    (tienePermiso.horario_id?.hora_entrada || tienePermiso.horario?.hora_entrada || "").slice(0, 5)
                                } - {
                                    (tienePermiso.horario_id?.hora_salida || tienePermiso.horario?.hora_salida || "").slice(0, 5)
                                }
                            </Typography>
                        </Box>
                    )}

                    {/* Analog Clock */}
                    <Box sx={{
                        position: 'relative', width: 200, height: 200, borderRadius: '50%',
                        border: '4px solid #e8e8e8', mb: 2, bgcolor: '#fdfdfd',
                        boxShadow: 'inset 0px 0px 15px rgba(0,0,0,0.03), 0px 8px 15px rgba(0,0,0,0.08)'
                    }}>
                        <ClockFace />
                        {/* Shadow inner ring */}
                        <Box sx={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.02)', pointerEvents: 'none' }} />
                        
                        {/* Hour Hand */}
                        <Box sx={{ position: 'absolute', top: '25%', left: 'calc(50% - 3px)', width: 6, height: '25%', bgcolor: '#222', transformOrigin: 'bottom center', transform: `rotate(${hourDegrees}deg)`, borderRadius: 4, zIndex: 2 }} />
                        {/* Minute Hand */}
                        <Box sx={{ position: 'absolute', top: '12%', left: 'calc(50% - 2px)', width: 4, height: '38%', bgcolor: '#222', transformOrigin: 'bottom center', transform: `rotate(${minsDegrees}deg)`, borderRadius: 4, zIndex: 3 }} />
                        {/* Second Hand */}
                        <Box sx={{ position: 'absolute', top: '5%', left: 'calc(50% - 1px)', width: 2, height: '55%', bgcolor: '#d32f2f', transformOrigin: 'calc(50%) 81.81%', transform: `rotate(${secondsDegrees}deg)`, zIndex: 4 }} />
                        {/* Center dots */}
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, bgcolor: '#d32f2f', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 5 }} />
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 4, height: 4, bgcolor: 'white', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 6 }} />
                    </Box>

                    {/* Digital Clock */}
                    <Typography variant="h1" sx={{ fontWeight: 400, mb: 3, fontSize: '4.5rem', color: '#000', letterSpacing: '-1px' }}>
                        {formatoHoraDigital}
                    </Typography>

                    {/* Buttons */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 1, width: '100%', justifyContent: 'center' }}>
                        <Button 
                            variant="contained" 
                            disabled={cargando}
                            onClick={() => handleRegistrarMarca(1)}
                            sx={{ 
                                bgcolor: '#aadc23', color: '#111', '&:hover': { bgcolor: '#9ac920' }, 
                                py: 1.5, px: 4, borderRadius: 3, fontSize: '1.1rem', textTransform: 'none', 
                                boxShadow: 'none', minWidth: 200, fontWeight: 400
                            }}
                        >
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Registrar entrada"}
                        </Button>
                        <Button 
                            variant="contained" 
                            disabled={cargando}
                            onClick={() => handleRegistrarMarca(2)}
                            sx={{ 
                                bgcolor: '#e52c2c', color: '#fff', '&:hover': { bgcolor: '#d12828' }, 
                                py: 1.5, px: 4, borderRadius: 3, fontSize: '1.1rem', textTransform: 'none', 
                                boxShadow: 'none', minWidth: 200, fontWeight: 400
                            }}
                        >
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "Registrar Salida"}
                        </Button>
                    </Box>
                </Box>
            )}
        </Paper>
    </>
);
}

export default MarcaTeletrabajo;