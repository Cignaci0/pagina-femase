import { Paper, Typography, Button, Box, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { toast } from "react-hot-toast";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";


function reporteUsuarios() {

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

    // Exportacion
    // (Lógica de descarga no definida en este archivo)

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
                    Reporte Usuarios
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
                    Reporte Usuarios
                </Typography>

                {/* Barra de busqueda */}
                <Stack direction="row" spacing={2} alignItems="center">

                    <FormControl sx={{width:"30vh"}}>
                        <InputLabel>Formato</InputLabel>
                        <Select label="Formato" value={file} onChange={(e) => setFile(e.target.value)}>
                            <MenuItem value={1}>
                                PDF
                            </MenuItem>

                            <MenuItem value ={2}>
                                CSV
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        color="primary"
                    >
                        Cargar Archivo
                    </Button>
                </Stack>
            </Paper >
        </>
    );
}
export default reporteUsuarios;