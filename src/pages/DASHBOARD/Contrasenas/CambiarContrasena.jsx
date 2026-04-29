import React, { useState } from "react";
import {
    Box, Paper, TextField, Button, IconButton, Typography, InputAdornment, Stack
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockResetIcon from '@mui/icons-material/LockReset';
import { toast } from "react-hot-toast";
import { cambiarPassword } from "../../../services/usuariosServices";

function AdminCambiarContrasena() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handleChange = (prop) => (event) => {
        setPasswords({ ...passwords, [prop]: event.target.value });
    };

    const [idUser, setIdUser] = useState(null);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setIdUser(payload.usuario_id);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
    }, []);

    const handleSave = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("La nueva contraseña y la confirmación no coinciden");
            return;
        }

        if (!idUser) {
            toast.error("No se pudo identificar al usuario");
            return;
        }

        const tId = toast.loading("Cambiando contraseña...");
        try {
            await cambiarPassword(idUser, passwords.current, passwords.new);
            toast.success("Contraseña actualizada con éxito", { id: tId });
            setPasswords({ current: "", new: "", confirm: "" });
        } catch (error) {
            toast.error(error.message || "Error al cambiar la contraseña", { id: tId });
        }
    };

    return (
        <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LockResetIcon fontSize="large" color="primary" />
                    Cambiar Contraseña
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={3} sx={{
                p: 4,
                bgcolor: "#FFFFFD",
                borderRadius: 4,
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <Stack spacing={4} sx={{ width: '100%', maxWidth: 400 }}>
                    <TextField
                        fullWidth
                        label="Introduzca su contraseña actual"
                        type={showCurrent ? "text" : "password"}
                        variant="outlined"
                        value={passwords.current}
                        onChange={handleChange('current')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Introduzca su nueva contraseña"
                        type={showNew ? "text" : "password"}
                        variant="outlined"
                        value={passwords.new}
                        onChange={handleChange('new')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                                        {showNew ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Repita su nueva contraseña"
                        type={showConfirm ? "text" : "password"}
                        variant="outlined"
                        value={passwords.confirm}
                        onChange={handleChange('confirm')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3 }
                        }}
                    />

                    <Box sx={{ pt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSave}
                            disabled={!passwords.current || !passwords.new || !passwords.confirm}
                            sx={{
                                px: 6,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                '&:hover': {
                                    boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                                }
                            }}
                        >
                            Guardar Cambios
                        </Button>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
}

export default AdminCambiarContrasena;
