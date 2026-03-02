import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Grid, TextField, Button, Typography, Box, Alert, CircularProgress, Container } from "@mui/material";
import { resetearClave } from "../../services/authService"

import AuthLayout from '../../components/AuthLayout';
import AuthLogo from '../../components/AuthLogo';

function IngresarCodigo() {
    const location = useLocation();
    const navigate = useNavigate();

    // Estados de datos
    const rutUsuario = location.state?.rutUsuario || "No disponible";
    const [mensajeExito, setMensajeExito] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Estados crear
    const [codigo, setCodigo] = useState("");
    const [clave1, setClave1] = useState("");
    const [clave2, setClave2] = useState("");
    const hayError = clave2.length > 0 && clave1 !== clave2;

    const esClaveValida = (clave) => {
        const regex = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{5,}$/;
        return regex.test(clave);
    };

    const formValido = codigo.length === 6 && esClaveValida(clave1) && clave1 === clave2;

    // Carga de datos
    const clickVerificar = async () => {
        setCargando(true);
        setError("");
        try {
            await resetearClave(rutUsuario, codigo, clave1);
            setMensajeExito("Contraseña cambiada con éxito");
            setTimeout(() => { navigate("/"); }, 2000);
        } catch (err) {
            setError(err.message || "Código o datos inválidos");
        } finally { setCargando(false); }
    };

    return (
        <AuthLayout>
            <Grid container direction="column" spacing={3}>
                {/* Logo */}
                <AuthLogo />

                {/* Alerta de exito */}
                <Grid item xs={12}>
                    {mensajeExito && <Container sx={{ mb: 2 }}><Alert severity="success">{mensajeExito}</Alert></Container>}

                    {/* Titulo */}
                    <Typography variant="h5" component="h1" textAlign="center" fontWeight="400">Ingrese código de verificación</Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>Enviado al correo asociado al RUT: <b>{rutUsuario}</b></Typography>

                    {/* Alerta de error */}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Grid>

                {/* Formulario de verificacion */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="center">
                        <TextField label="Código 6 dígitos" variant="outlined" value={codigo} onChange={(e) => { const val = e.target.value; if (/^\d*$/.test(val) && val.length <= 6) setCodigo(val); }} inputProps={{ style: { textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem' } }} placeholder="000000" fullWidth />
                    </Box>
                </Grid>

                {/* Campos de clave */}
                <Grid item xs={12}><TextField label="Nueva Clave" type="password" value={clave1} onChange={(e) => setClave1(e.target.value)} variant="outlined" inputProps={{ style: { textAlign: 'center' } }} fullWidth helperText={clave1 !== "" && !esClaveValida(clave1) ? "Debe tener mín. 5 caracteres, 1 número y 1 símbolo" : ""} /></Grid>
                <Grid item xs={12}><TextField label="Repetir Clave" type="password" value={clave2} onChange={(e) => setClave2(e.target.value)} variant="outlined" inputProps={{ style: { textAlign: 'center' } }} fullWidth error={hayError} helperText={hayError ? "Las contraseñas no coinciden" : ""} /></Grid>

                {/* Boton de accion */}
                <Grid item xs={12}><Button variant="contained" fullWidth size="large" disabled={cargando || !formValido} onClick={clickVerificar}>{cargando ? <CircularProgress size={24} color="inherit" /> : "VERIFICAR"}</Button></Grid>
            </Grid>
        </AuthLayout>
    );
}

export default IngresarCodigo;