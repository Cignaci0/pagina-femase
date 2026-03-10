import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import { toast } from "react-hot-toast";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { crearCentroCosto } from "../../../services/centroCostosServices";

function cargaCencos() {

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

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const lines = text.split(/\r?\n/);

                // Esperamos un formato (por lo general separado por punto y coma desde Excel en español):
                // nombre_cenco ; direccion ; region ; comuna ; email_general ; email_notificacion ; zona_extrema ; estado_id ; departamento_id
                const cencos = lines.slice(1).map((line) => {
                    const columns = line.split(";");
                    return {
                        nombre_cenco: columns[0]?.trim(),
                        direccion: columns[1]?.trim(),
                        region: columns[2]?.trim(),
                        comuna: columns[3]?.trim(),
                        email_general: columns[4]?.trim(),
                        email_notificacion: columns[5]?.trim(),
                        zona_extrema: columns[6]?.trim().toLowerCase() === "true" || columns[6]?.trim() === "1" ? true : false,
                        estado_id: columns[7]?.trim() ? parseInt(columns[7].trim()) : 1,
                        departamento_id: columns[8]?.trim() ? parseInt(columns[8].trim()) : null,
                    };
                }).filter(cenco => cenco.nombre_cenco);

                if (cencos.length === 0) {
                    alert("El archivo CSV está vacío o no tiene el formato correcto.");
                    return;
                }
                let guardadosExito = 0;
                let guardadosError = 0;
                for (let i = 0; i < cencos.length; i++) {
                    const cencoActual = cencos[i];

                    try {
                        await crearCentroCosto(
                            cencoActual.nombre_cenco,
                            cencoActual.direccion,
                            cencoActual.region,
                            cencoActual.comuna,
                            cencoActual.email_general,
                            cencoActual.email_notificacion,
                            cencoActual.zona_extrema,
                            cencoActual.estado_id,
                            cencoActual.departamento_id
                        );
                        guardadosExito++;
                    } catch (error) {
                        console.error(`Error al guardar el centro de costo ${cencoActual.nombre_cenco}:`, error);
                        guardadosError++;
                    }
                }
                if (guardadosError === 0) {
                    alert(`Proceso finalizado. Se cargaron ${guardadosExito} centros de costo exitosamente.`);
                    setFile(null);
                } else {
                    alert(`Proceso finalizado. Se guardaron ${guardadosExito} centros de costo, pero hubo ${guardadosError} errores (ver consola para detalles).`);
                }
            } catch (errorGeneral) {
                console.error("Error catastrofico al procesar el archivo:", errorGeneral);
                alert("Ocurrió un error inesperado al leer o procesar el archivo CSV.");
            }
        };
        reader.readAsText(file, "UTF-8");
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
                    Cargar Cencos
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
                    Sistema de Gestión - FEMASE - Carga masiva de Centros de costo
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
export default cargaCencos;