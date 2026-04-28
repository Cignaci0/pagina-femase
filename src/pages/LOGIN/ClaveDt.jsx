import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, TextField, Button, Typography, Box, CircularProgress, Alert, InputAdornment, Container } from "@mui/material";

import AuthLayout from "../../components/AuthLayout";
import AuthLogo from '../../components/AuthLogo';
import AuthFooter from '../../components/AuthFooter';
import { claveDt } from "../../services/authService";

function ClaveDt() {
    const navigate = useNavigate();
    const location = useLocation();

    // Estados de datos
    const [usuarioCorreo, setUsuarioCorreo] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");



    // Carga de datos
    const clickSolicitar = async () => {
        setCargando(true);
        setError("");
        setMensajeExito("");
        try {
            await claveDt(usuarioCorreo);
            setMensajeExito("Se envió el correo con éxito");
            setTimeout(() => {
                navigate("/ingresarcodigodt", { state: { useremail: usuarioCorreo } });
            }, 2000);
        } catch (error) {
            setError(error.message);
        } finally {
            setCargando(false);
        }
    };


    return (
        <AuthLayout>
            {/* Logo */}
            <AuthLogo />
            {/* Formulario de recuperacion */}
            <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Ingrese su correo
                    </Typography>

                    {/* Alerta de exito */}
                    {mensajeExito && <Alert severity="success">{mensajeExito}</Alert>}
                    
                    {/* Alerta de error */}
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Correo"
                        variant="outlined"
                        fullWidth
                        value={usuarioCorreo}
                        onChange={(e) => setUsuarioCorreo(e.target.value.replace(/@/g, ''))}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Typography color="text.secondary">@gmail.com</Typography>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Grid>

            {/* Botones de accion */}
            <Grid item xs={12}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={clickSolicitar}
                            disabled={cargando || usuarioCorreo.length === 0}
                        >
                            {cargando ? <CircularProgress size={24} color="grey" /> : "SOLICITAR"}
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

            {/* Footer */}
            <AuthFooter />
        </AuthLayout>
    );
}

export default ClaveDt;