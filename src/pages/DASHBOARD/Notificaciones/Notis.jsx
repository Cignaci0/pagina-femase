import React, { useEffect, useState } from "react";
import {
    Box, Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Switch, Divider, CircularProgress
} from "@mui/material";
import {
    Login as LoginIcon,
    Logout as LogoutIcon
} from "@mui/icons-material";
import { toast } from "react-hot-toast";

// Services
import { cambiarNoti, obtenerNoti } from "../../../services/empleadosServices";

function Notifi() {
    const [idUsuario, setIdUsuario] = useState(null);
    const [noti30Entrada, setNoti30Entrada] = useState(false);
    const [noti30Salida, setNoti30Salida] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const uId = payload.usuario_id;
                    setIdUsuario(uId);

                    if (uId) {
                        const data = await obtenerNoti(uId);
                        if (data) {
                            setNoti30Entrada(!!data.noti_30_entrada);
                            setNoti30Salida(!!data.noti_30_salida);
                        }
                    }
                } catch (error) {
                    console.error("Error decoding token or fetching notifications:", error);
                }
            }
            setLoading(false);
        };
        fetchInitialData();
    }, []);

    const handleToggle = async (type, value) => {
        try {
            // Update local state first (optimistic update)
            if (type === 'entrada') setNoti30Entrada(value);
            if (type === 'salida') setNoti30Salida(value);

            // We need to pass the current values of both to the service
            // because cambiarNoti expects both (or at least handles them)
            const nuevoEntrada = type === 'entrada' ? value : noti30Entrada;
            const nuevoSalida = type === 'salida' ? value : noti30Salida;

            await cambiarNoti(idUsuario, nuevoEntrada, nuevoSalida);
            toast.success("Preferencia actualizada");
        } catch (error) {
            // Rollback on error
            if (type === 'entrada') setNoti30Entrada(!value);
            if (type === 'salida') setNoti30Salida(!value);
            toast.error(error.message || "Error al actualizar notificación");
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                    Notificaciones
                </Typography>
            </Box>

            <Paper elevation={3} sx={{
                width: '100%',
                maxWidth: 600,
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: '#FFFFFD',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <List disablePadding>
                    <ListItem sx={{ py: 3, px: 4 }}>
                        <ListItemIcon sx={{ minWidth: 56 }}>
                            <LoginIcon color="primary" sx={{ fontSize: 32 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Notificacion 30 minutos de entrada"
                            secondary="Recibir alerta 30 minutos despues de la hora de entrada"
                            primaryTypographyProps={{ variant: 'h6', fontWeight: 600, color: '#333' }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        />
                        <Switch
                            checked={noti30Entrada}
                            onChange={(e) => handleToggle('entrada', e.target.checked)}
                            color="primary"
                        />
                    </ListItem>

                    <Divider variant="inset" component="li" sx={{ ml: 12 }} />

                    <ListItem sx={{ py: 3, px: 4 }}>
                        <ListItemIcon sx={{ minWidth: 56 }}>
                            <LogoutIcon color="primary" sx={{ fontSize: 32 }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Notificacion 30 minutos de salida"
                            secondary="Recibir alerta 30 minutos despues de la hora de salida"
                            primaryTypographyProps={{ variant: 'h6', fontWeight: 600, color: '#333' }}
                            secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        />
                        <Switch
                            checked={noti30Salida}
                            onChange={(e) => handleToggle('salida', e.target.checked)}
                            color="primary"
                        />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
}

export default Notifi;
