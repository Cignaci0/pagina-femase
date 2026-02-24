import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";


function cargaEmpleado() {

    // Estados de datos
    const [file, setFile] = useState(null);

    // Estados de paginacion y filtrado
    // (No definidos en este archivo)

    // Estados crear
    // (No definidos en este archivo)

    // Estados editar
    // (No definidos en este archivo)

    // Carga de datos
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Seleccione un archivo CSV");
            return;
        }
        console.log("Archivo seleccionado:", file);
    };

    // Exportacion
    // (No definida en este archivo)

    // Manejo de dialogs
    // (No definidos en este archivo)

    // Filtrado y paginacion
    // (No definidos en este archivo)

    // Effects
    // (No definidos en este archivo)

    // Renderizado condicional
    // (No definido en este archivo)

    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Cargar Empleados
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Titulo de seccion */}
                <Typography
                    variant="h4"
                    sx={{ color: "#1e40af", fontWeight: "bold", mb: 4 }}
                >
                    Sistema de Gestión - FEMASE - Carga masiva de Empleados
                </Typography>

                {/* Barra de carga de archivos */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">
                        Seleccione archivo CSV:
                    </Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<UploadFileIcon />}
                    >
                        Seleccionar archivo
                        <input
                            type="file"
                            hidden
                            accept=".csv"
                            onChange={handleFileChange}
                        />
                    </Button>

                    <Typography variant="body2" color="text.secondary">
                        {file ? file.name : "Ningún archivo seleccionado"}
                    </Typography>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                    >
                        Cargar Archivo
                    </Button>
                </Stack>
            </Paper >
        </>
    );
}
export default cargaEmpleado;