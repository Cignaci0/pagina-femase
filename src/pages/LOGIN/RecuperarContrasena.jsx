import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Grid, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import { obtenerCodigo } from "../../services/authService";

import AuthLayout from '../../components/AuthLayout';
import AuthLogo from "../../components/AuthLogo"

function RecuperarContrasena() {
    const navigate = useNavigate();

    // Estados de datos
    const [rut, setRut] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Estados de paginacion y filtrado
    // (No definidos en este archivo)

    // Estados crear
    // (No definidos en este archivo)

    // Estados editar
    // (No definidos en este archivo)

    // Carga de datos
    const clickEnviar = async () => {
        setCargando(true);
        try {
            await obtenerCodigo(rut);
            setMensaje("Rut enviado con éxito");
            setTimeout(() => {
                navigate("/ingresarcodigo", { state: { rutUsuario: rut } });
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    // (No definidos en este archivo)

    // Filtrado y paginacion
    // (No definidos en este archivo)

    // Effects
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Renderizado condicional
    // (No definido en este archivo)

    return (
        <AuthLayout>
            {/* Logo */}
            <AuthLogo />

            {/* Titulo y mensajes */}
            <Grid item xs={12}>
                <Typography variant="h5" component="h1" textAlign="center" fontWeight="400">
                    Recuperar contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Ingrese su RUT sin puntos y con guion
                </Typography>
                {/* Alerta de exito */}
                {mensaje && <Alert severity="success" sx={{ mt: 2 }}>{mensaje}</Alert>}
                {/* Alerta de error */}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Grid>

            {/* Formulario de entrada */}
            <Grid item xs={12}>
                <TextField
                    label="RUT"
                    variant="outlined"
                    fullWidth
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="Ej: 00000000-0"
                />
            </Grid>

            {/* Botones de accion */}
            <Grid item xs={12}>
                <Grid container columnSpacing={2} justifyContent="center">
                    <Grid item xs={6}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" fullWidth size="large" sx={{ height: 56 }}>
                                VOLVER
                            </Button>
                        </Link>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ height: 56 }}
                            disabled={cargando}
                            onClick={clickEnviar}
                        >
                            {cargando ? <CircularProgress size={24} color="inherit" /> : "ENVIAR"}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </AuthLayout>
    );
}

export default RecuperarContrasena;