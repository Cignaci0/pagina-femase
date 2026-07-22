import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Button, Container } from "@mui/material";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { FILE_URL } from "../../../config/config";
import { toast } from "react-hot-toast";

const Instructivos = () => {
  const [manual, setManual] = useState(null);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const perfilId = parseInt(payload.profile || payload.perfil_id || payload.perfil);

        let file = "";
        let title = "";

        if (perfilId === 1) {
          file = "manual administrador.pdf";
          title = "Manual de Administrador";
        } else if (perfilId === 2) {
          file = "Manual SuperAdministrador.pdf";
          title = "Manual de SuperAdministrador";
        } else if (perfilId === 3) {
          file = "Manual Fiscalizador.pdf";
          title = "Manual de Fiscalizador";
        } else if (perfilId === 8) {
          file = "Manual Empleado.pdf";
          title = "Manual de Empleado";
        }

        if (file) {
          setManual({ file, title });
        } else {
          toast.error("No hay un manual asociado a tu perfil.");
        }
      } catch (error) {
        console.error("Error al leer el token:", error);
      }
    }
  }, []);

  const handleDownload = () => {
    if (manual) {
      window.open(`${FILE_URL}/utils/${manual.file}`, '_blank');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <MenuBookIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">Instructivos y Manuales</Typography>
      </Box>

      {manual ? (
        <Card elevation={3} sx={{ borderRadius: 2, p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {manual.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Aquí puedes descargar o visualizar el manual de usuario correspondiente a tu perfil en el sistema.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MenuBookIcon />}
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Ver Manual
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" color="text.secondary">
          Cargando manual... o no tienes un manual asignado.
        </Typography>
      )}
    </Container>
  );
};

export default Instructivos;
