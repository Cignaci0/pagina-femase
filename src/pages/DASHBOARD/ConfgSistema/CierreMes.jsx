import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Select, MenuItem, FormControl, InputLabel,
    Typography, Button, CircularProgress
} from "@mui/material";
import { toast } from "react-hot-toast";

import { obtenerEmpresas, obtenerCierreMes, actualizarCierreMes } from "../../../services/empresasServices";

function CierreMes() {
    const [empresas, setEmpresas] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
    const [dias, setDias] = useState("");
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const fetchEmpresas = async () => {
        setCargando(true);
        try {
            const dataEmpresas = await obtenerEmpresas();
            const listEmpresas = Array.isArray(dataEmpresas) ? dataEmpresas : [dataEmpresas];
            setEmpresas(listEmpresas);
        } catch (err) {
            toast.error("Error al cargar las empresas");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    // Efecto para obtener el cierre de mes cuando cambia la empresa seleccionada
    useEffect(() => {
        const fetchCierreMes = async () => {
            if (empresaSeleccionada) {
                try {
                    setCargando(true);
                    const data = await obtenerCierreMes(empresaSeleccionada);
                    setDias(data.cierre_mes ? String(data.cierre_mes) : "0");
                } catch (error) {
                    toast.error("Error al cargar el cierre de mes");
                    setDias("");
                } finally {
                    setCargando(false);
                }
            } else {
                setDias("");
            }
        };
        fetchCierreMes();
    }, [empresaSeleccionada]);

    const handleDiasChange = (e) => {
        const value = e.target.value;
        // Solo permitir números y máximo 2 dígitos
        if (/^\d*$/.test(value) && value.length <= 2) {
            if (value !== "" && parseInt(value) > 31) {
                return;
            }
            setDias(value);
        }
    };

    const handleGuardar = async () => {
        if (!empresaSeleccionada) {
            toast.error("Seleccione una empresa");
            return;
        }

        if (!dias || dias === "") {
            toast.error("Por favor ingrese el día de cierre de mes");
            return;
        }

        const diasInt = parseInt(dias);
        if (diasInt < 1 || diasInt > 31) {
            toast.error("El día de cierre de mes debe estar entre 1 y 31");
            return;
        }

        setGuardando(true);
        const tId = toast.loading("Guardando configuración...");
        try {
            await actualizarCierreMes(empresaSeleccionada, diasInt);
            toast.success("Cierre de mes actualizado con éxito", { id: tId });
        } catch (error) {
            toast.error("Error al guardar: " + error.message, { id: tId });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        Configuración de Cierre de Mes
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
                            value={dias}
                            onChange={handleDiasChange}
                            variant="standard"
                            placeholder="00"
                            disabled={!empresaSeleccionada}
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
                            ingrese día de cierre (máx 31)
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
                            disabled={guardando || !empresaSeleccionada || cargando}
                        >
                            {guardando ? <CircularProgress size={24} color="inherit" /> : "Guardar Cambios"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </>
    );
}

export default CierreMes;
