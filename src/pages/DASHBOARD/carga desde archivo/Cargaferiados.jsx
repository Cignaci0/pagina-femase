import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import { toast } from "react-hot-toast";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { crearFeriado } from "../../../services/feriadosServices";


function CargaFeriados() {

    // Estados de datos
    const [file, setFile] = useState(null);
    // Carga de datos
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert("Seleccione un archivo CSV");
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const lines = text.split(/\r?\n/);

                const feriados = lines.slice(1).map((line) => {
                    const columns = line.split(";");
                    return {
                        fecha: columns[0]?.trim(),
                        tipo_feriado: columns[1]?.trim(),
                        nombre: columns[2]?.trim(),
                        observacion: columns[3]?.trim(),
                        irrenunciable: columns[4]?.trim(),
                        tipo: columns[5]?.trim(),
                        respaldo_legal: columns[6]?.trim(),
                        region: columns[7]?.trim(),
                        comuna: columns[8]?.trim(),
                    };
                }).filter(feriado => feriado.fecha);

                if (feriados.length === 0) {
                    alert("El archivo CSV está vacío o no tiene el formato correcto.");
                    return;
                }
                let guardadosExito = 0;
                let guardadosError = 0;
                for (let i = 0; i < feriados.length; i++) {
                    const feriadoActual = feriados[i];

                    try {
                        await crearFeriado(feriadoActual);
                        guardadosExito++;
                    } catch (error) {
                        console.error(`Error al guardar el feriado de la fecha ${feriadoActual.fecha}:`, error);
                        guardadosError++;
                    }
                }
                if (guardadosError === 0) {
                    alert(`Proceso finalizado. Se cargaron ${guardadosExito} feriados exitosamente.`);
                    setFile(null);
                } else {
                    alert(`Proceso finalizado. Se guardaron ${guardadosExito} feriados, pero hubo ${guardadosError} errores (ver consola para detalles).`);
                }
            } catch (errorGeneral) {
                console.error("Error catastrofico al procesar el archivo:", errorGeneral);
                alert("Ocurrió un error inesperado al leer o procesar el archivo CSV.");
            }
        };
        reader.readAsText(file, "UTF-8");

    };


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Cargar Feriados
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
                    Sistema de Gestión - FEMASE - Carga masiva de Feriados
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
export default CargaFeriados;