import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Grid, TextField, Button, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { login } from "../../services/authService";

import AuthLayout from '../../components/AuthLayout';
import AuthLogo from '../../components/AuthLogo';
import AuthFooter from '../../components/AuthFooter';

function Login() {
  const navigate = useNavigate();

  // Estados de datos
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  // Carga de datos
  const clickEntrar = async () => {
    setError("");
    setCargando(true);
    try {
      const respuesta = await login(nombreUsuario.trim(), contrasena.trim());
      if (respuesta.token) {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('perfilId', respuesta.profile_id);
      }
      navigate("/dashboard");
    } catch (error) {
      setError(error.message === "Failed fetch" ? "Error de conexion" : "Usuario o contraseña incorrectos");
    } finally { setCargando(false); }
  };


  // Effects
  useEffect(() => { localStorage.removeItem('token'); }, []);

  return (
    <AuthLayout>
      <Grid container direction="column" spacing={3}>
        {/* Logo */}
        <AuthLogo />

        {/* Titulo */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h1" textAlign="center" fontWeight="400">
            Inicio sesion
          </Typography>
          {/* Alerta de error */}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Grid>

        {/* Formulario de acceso */}
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Usuario" variant="outlined" fullWidth value={nombreUsuario} onChange={(e) => { setNombreUsuario(e.target.value); if (error) setError(""); }} />
            <TextField label="Contraseña" type="password" variant="outlined" fullWidth value={contrasena} onChange={(e) => { setContrasena(e.target.value); if (error) setError(""); }} />
          </Box>
          <Button onClick={() => navigate("/recuperarcontrasena")}>
            <Typography variant="caption">Olvidaste tu contraseña?</Typography>
          </Button>
        </Grid>

        {/* Botones de accion */}
        <Grid item xs={12}>
          <Grid container spacing={2} justifyContent={"center"}>
            <Grid item xs={6}><Button variant="contained" fullWidth size="large" onClick={clickEntrar} disabled={cargando}>{cargando ? <CircularProgress size={24} color="grey" /> : "ENTRAR"}</Button></Grid>
            <Grid item xs={6}><Button variant="contained" fullWidth size="large" onClick={() => navigate("/clavedt")}>CLAVE DT</Button></Grid>
          </Grid>
        </Grid>

        {/* Footer */}
        <AuthFooter />
      </Grid>
    </AuthLayout>
  );
}

export default Login;