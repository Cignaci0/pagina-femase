import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Stack
} from "@mui/material";
import { toast } from "react-hot-toast";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { obtenerEmpresas } from "../../../services/empresasServices";
import { obtenerDepartamentos } from "../../../services/departamentosServices";
import { obtenerCentroCostos } from "../../../services/centroCostosServices";
import { obtenerEmpleados } from "../../../services/empleadosServices";
import { getTipoAusencia } from "../../../services/tiposAusencia";
import { crearAusencia } from "../../../services/ausencias";

function AdminAusencias() {
    // Datos globales para listas
    const [cargando, setCargando] = useState(false);
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const [empresasGlobal, setEmpresasGlobal] = useState([]);
    const [deptosGlobal, setDeptosGlobal] = useState([]);
    const [cencosGlobal, setCencosGlobal] = useState([]);
    const [empleadosGlobal, setEmpleadosGlobal] = useState([]);
    const [tiposAusenciaBack, setTiposAusenciaBack] = useState([]);

    // Filtros de selección
    const [filtroEmpresa, setFiltroEmpresa] = useState("");
    const [filtroDepto, setFiltroDepto] = useState("");
    const [filtroCenco, setFiltroCenco] = useState("");
    const [filtroEmpleado, setFiltroEmpleado] = useState("");

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

    // Carga inicial
    useEffect(() => {
        const cargarCatalogos = async () => {
            setCargando(true);
            try {
                const [dataEmpresa, dataDepto, dataCenco, dataEmpleado, dataTipos] = await Promise.all([
                    obtenerEmpresas(),
                    obtenerDepartamentos(),
                    obtenerCentroCostos(),
                    obtenerEmpleados(),
                    getTipoAusencia()
                ]);
                setEmpresasGlobal(Array.isArray(dataEmpresa) ? dataEmpresa : []);
                setDeptosGlobal(Array.isArray(dataDepto?.departamentos || dataDepto) ? (dataDepto?.departamentos || dataDepto) : []);
                setCencosGlobal(Array.isArray(dataCenco) ? dataCenco : []);
                setEmpleadosGlobal(Array.isArray(dataEmpleado) ? dataEmpleado : []);
                setTiposAusenciaBack(Array.isArray(dataTipos) ? dataTipos : []);
            } catch (error) {
                toast.error("Error cargando catálogos");
            } finally {
                setCargando(false);
            }
        };
        cargarCatalogos();
    }, []);

    // Handlers cascada
    const handleEmpresaChange = (e) => {
        setFiltroEmpresa(e.target.value);
        setFiltroDepto("");
        setFiltroCenco("");
        setFiltroEmpleado("");
    };

    const handleDeptoChange = (e) => {
        setFiltroDepto(e.target.value);
        setFiltroCenco("");
        setFiltroEmpleado("");
    };

    const handleCencoChange = (e) => {
        setFiltroCenco(e.target.value);
        setFiltroEmpleado("");
    };

    // Filtros calculados
    const deptosFiltrados = filtroEmpresa
        ? deptosGlobal.filter(d => d.empresa?.empresa_id === filtroEmpresa)
        : [];

    const cencosFiltrados = filtroDepto
        ? cencosGlobal.filter(c => c.departamento_id === filtroDepto)
        : [];

    const empleadosFiltrados = empleadosGlobal.filter((emp) => {
        if (!filtroCenco) return false;
        if (emp.cenco?.cenco_id === filtroCenco) return true;
        if (emp.cencos && emp.cencos.some(c => c.cenco_id === filtroCenco)) return true;
        return false;
    });

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
        if (!filtroEmpleado || !motivoAusencia || !fechaInicio || !fechaFin) {
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

        // Buscar el empleado seleccionado para obtener num_ficha
        const empleadoSeleccionado = empleadosGlobal.find(emp => emp.empleado_id === filtroEmpleado);
        if (!empleadoSeleccionado || !empleadoSeleccionado.num_ficha) {
            toast.error("No se encontró el número de ficha del empleado");
            return;
        }

        const datos = {
            empleado: empleadoSeleccionado.num_ficha,
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
            setFiltroEmpleado("");
            setMotivoAusencia("");
            setFechaInicio("");
            setFechaFin("");
            setHoraInicioH("");
            setHoraInicioM("");
            setHoraFinH("");
            setHoraFinM("");
            setTipoAusenciaVisual("Ausencia por todo el dia");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setCargandoEnvio(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Ingresar Ausencia
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 5, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", overflowY: "auto", boxSizing: "border-box"
            }}>
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 4, color: "#333", borderBottom: '1px solid #ddd', pb: 2 }}>
                    Formulario de Ingreso
                </Typography>

                {cargando ? (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4} justifyContent="center">
                        {/* Columna Izquierda: Controles y Selectores */}
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Empresa</InputLabel>
                                    <Select label="Empresa" value={filtroEmpresa} onChange={handleEmpresaChange} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value=""><em>Seleccione...</em></MenuItem>
                                        {empresasGlobal.map(emp => (
                                            <MenuItem key={emp.empresa_id} value={emp.empresa_id}>{emp.nombre_empresa}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Departamento</InputLabel>
                                    <Select label="Departamento" value={filtroDepto} onChange={handleDeptoChange} disabled={!filtroEmpresa} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value=""><em>Seleccione...</em></MenuItem>
                                        {deptosFiltrados.map(dep => (
                                            <MenuItem key={dep.departamento_id} value={dep.departamento_id}>{dep.nombre_departamento}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Centro de Costo</InputLabel>
                                    <Select label="Centro de Costo" value={filtroCenco} onChange={handleCencoChange} disabled={!filtroDepto} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value=""><em>Seleccione...</em></MenuItem>
                                        {cencosFiltrados.map(cen => (
                                            <MenuItem key={cen.cenco_id} value={cen.cenco_id}>{cen.nombre_cenco}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Empleado</InputLabel>
                                    <Select label="Empleado" value={filtroEmpleado} onChange={(e) => setFiltroEmpleado(e.target.value)} disabled={!filtroCenco} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value=""><em>Seleccione Empleado</em></MenuItem>
                                        {empleadosFiltrados.map(emp => (
                                            <MenuItem key={emp.empleado_id} value={emp.empleado_id}>
                                                ({emp.run}) {emp.nombres} {emp.apellido_paterno}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ borderBottom: '1px solid #ddd', my: 1, width: 300 }} />

                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Motivo ausencia/justificación</InputLabel>
                                    <Select label="Motivo ausencia/justificación" value={motivoAusencia} onChange={(e) => setMotivoAusencia(e.target.value)} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value=""><em>- Seleccione motivo -</em></MenuItem>
                                        {tiposVigentes.map(ta => (
                                            <MenuItem key={ta.id} value={ta.id}>{ta.nombre}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ width: 300 }}>
                                    <InputLabel>Tipo de ausencia</InputLabel>
                                    <Select label="Tipo de ausencia" value={tipoAusenciaVisual} onChange={(e) => setTipoAusenciaVisual(e.target.value)} sx={{ bgcolor: "#fff", '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }}>
                                        <MenuItem value="Ausencia por todo el dia">Ausencia por todo el dia</MenuItem>
                                        <MenuItem value="Ausencia por hora">Ausencia por hora</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Grid>

                        {/* Columna Derecha: Fechas grandes */}
                        {/* Columna Centro: Periodo */}
                        <Grid item xs={12} md={4}>
                            <Box sx={{ 
                                p: 3, borderRadius: 3, bgcolor: '#f8f9fa', border: '1px solid #eaeaea', 
                                height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', maxWidth: 700, minWidth: 700
                            }}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                                    Periodo
                                </Typography>
                                
                                <Stack spacing={3}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                                        <Box sx={{ display: 'flex', gap: 2 }}>
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
                        </Grid>

                        {/* Columna Derecha: Días y Botón */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ 
                                p: 3, borderRadius: 3, bgcolor: '#f8f9fa', border: '1px solid #eaeaea', 
                                height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4
                            }}>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ 
                                        width: 100, height: 100, borderRadius: '50%', 
                                        border: '5px solid #8baac2', // Color de anillo gris/azul
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography variant="h3" color="text.primary" sx={{ fontWeight: 500 }}>
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
                                        bgcolor: "#0f355c", // Azul oscuro
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
                                    Registrar Ausencia
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>
                )}
            </Paper>
        </>
    );
}

export default AdminAusencias;