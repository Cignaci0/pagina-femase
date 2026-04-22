import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
    Typography, Grid, Button, CircularProgress
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas, actualizarHorarioLegal, actualizarHorarioEmpresa } from "../../../services/empresasServices";

function HorasLaboral() {
    const [empresas, setEmpresas] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
    const [tipoHoras, setTipoHoras] = useState("legales");
    const [horas, setHoras] = useState("");
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const fetchEmpresas = async () => {
        setCargando(true);
        try {
            const data = await obtenerEmpresas();
            const list = Array.isArray(data) ? data : [data];
            setEmpresas(list);
            
            // Si está en legales por defecto, cargar el valor del primer registro
            if (list.length > 0 && tipoHoras === 'legales') {
                setHoras(String(list[0].horario_legal || ""));
            }
        } catch (err) {
            toast.error("Error al cargar empresas");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    // Efecto para cambiar el valor según la selección
    useEffect(() => {
        if (tipoHoras === "legales" && empresas.length > 0) {
            setHoras(String(empresas[0].horario_legal || ""));
        } else if (tipoHoras === "empresa" && empresaSeleccionada) {
            const emp = empresas.find(e => e.empresa_id === empresaSeleccionada);
            setHoras(emp?.horario ? String(emp.horario) : "");
        } else if (tipoHoras === "empresa" && !empresaSeleccionada) {
            setHoras("");
        }
    }, [tipoHoras, empresaSeleccionada, empresas]);

    const handleHorasChange = (e) => {
        const value = e.target.value;
        // Solo permitir números y máximo 2 dígitos
        if (/^\d*$/.test(value) && value.length <= 2) {
            setHoras(value);
        }
    };

    const handleGuardar = async () => {
        if (!horas) {
            toast.error("Por favor ingrese un número de horas");
            return;
        }

        setGuardando(true);
        const tId = toast.loading("Guardando configuración...");
        try {
            if (tipoHoras === "legales") {
                await actualizarHorarioLegal(parseInt(horas));
                toast.success("Horario legal actualizado para todas las empresas", { id: tId });
            } else {
                if (!empresaSeleccionada) {
                    toast.error("Seleccione una empresa", { id: tId });
                    setGuardando(false);
                    return;
                }
                await actualizarHorarioEmpresa(empresaSeleccionada, parseInt(horas));
                toast.success("Horario de empresa actualizado con éxito", { id: tId });
            }
            // Refrescar datos
            await fetchEmpresas();
        } catch (error) {
            toast.error("Error al guardar: " + error.message, { id: tId });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Configuración de Horas Laborales
                </Typography>
            </Box>

            <Paper elevation={2} sx={{
                p: 4, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 180px)", 
                display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Filtros Superiores - Más anchos */}
                <Box sx={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 3, 
                    mb: 4,
                    flexWrap: 'wrap'
                }}>
                    <FormControl size="small" sx={{ width: '300px' }}>
                        <InputLabel>Tipo de Configuración</InputLabel>
                        <Select
                            value={tipoHoras}
                            label="Tipo de Configuración"
                            onChange={(e) => {
                                setTipoHoras(e.target.value);
                                if (e.target.value === "legales") setEmpresaSeleccionada("");
                            }}
                        >
                            <MenuItem value="legales">Horas Legales (General)</MenuItem>
                            <MenuItem value="empresa">Horas por Empresa (Personalizado)</MenuItem>
                        </Select>
                    </FormControl>

                    {tipoHoras === "empresa" && (
                        <FormControl size="small" sx={{ width: '450px' }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select
                                value={empresaSeleccionada}
                                label="Empresa"
                                onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                            >
                                <MenuItem value=""><em>Seleccione una empresa</em></MenuItem>
                                {empresas.map((emp) => (
                                    <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                        {emp.nombre_empresa}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>

                {/* Área Central de Entrada */}
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 3,
                    overflow: 'hidden'
                }}>
                    {/* El recuadro del número editable */}
                    <Box sx={{
                        width: '100%',
                        maxWidth: '380px',
                        border: '2px solid #454d55',
                        borderRadius: '12px',
                        p: { xs: 2, md: 4 },
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: '#fcfcfc'
                    }}>
                        <TextField
                            value={horas}
                            onChange={handleHorasChange}
                            variant="standard"
                            placeholder="00"
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    fontSize: { xs: '80px', md: '120px' },
                                    fontWeight: 'bold',
                                    color: '#454d55',
                                    textAlign: 'center',
                                    '& input': {
                                        textAlign: 'center',
                                        padding: 0
                                    }
                                }
                            }}
                            fullWidth
                        />
                    </Box>

                    {/* El recuadro del texto inferior */}
                    <Box sx={{
                        width: '100%',
                        maxWidth: '380px',
                        border: '2px solid #454d55',
                        borderRadius: '8px',
                        p: 1.5,
                        textAlign: 'center',
                        bgcolor: '#fff'
                    }}>
                        <Typography sx={{ 
                            fontSize: '1.1rem', 
                            color: '#454d55',
                            fontWeight: 'bold',
                            textTransform: 'lowercase',
                            letterSpacing: '1px'
                        }}>
                            ingrese horas laborales
                        </Typography>
                    </Box>

                    {/* Botón Guardar */}
                    <Box sx={{ mt: 2 }}>
                        <Button 
                            variant="contained" 
                            size="large"
                            sx={{ 
                                px: 10, 
                                py: 1.5, 
                                borderRadius: '30px',
                                bgcolor: '#454d55',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: '#333' }
                            }}
                            onClick={handleGuardar}
                            disabled={guardando || (tipoHoras === 'empresa' && !empresaSeleccionada)}
                        >
                            {guardando ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </>
    );
}

export default HorasLaboral;