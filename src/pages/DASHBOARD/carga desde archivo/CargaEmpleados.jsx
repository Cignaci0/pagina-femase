import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import { toast } from "react-hot-toast";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { crearEmpleado } from "../../../services/empleadosServices";

function cargaEmpleado() {

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

                const parseDate = (dateStr) => {
                    if (!dateStr) return null;
                    const str = dateStr.trim();
                    if (str.includes('-')) {
                        const parts = str.split('-');
                        if (parts[0].length === 4) return str;
                        if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    if (str.includes('/')) {
                        const parts = str.split('/');
                        if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`;
                        if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                    return str;
                };

                const parseBoolean = (val) => val?.trim().toLowerCase() === "true" || val?.trim() === "1" ? true : false;

                // Orden esperado (basado en el Excel): 
                // run, nombre, apellido P, apellido M, fecha nacimiento, direccion, email, sexo, telefono fijo, telefono movil, 
                // comuna, fecha ini contra, contrado inde, fecha fin contra, art 22, autoriza ausencia, clave, empresa, cargo, 
                // turno, estado, email laboral, num ficha, cenco
                const empleados = lines.slice(1).map((line) => {
                    const columns = line.split(";");
                    return {
                        run: columns[0]?.trim(),
                        nombres: columns[1]?.trim(),
                        apellido_paterno: columns[2]?.trim(),
                        apellido_materno: columns[3]?.trim(),
                        fecha_nacimiento: parseDate(columns[4]),
                        direccion: columns[5]?.trim(),
                        email: columns[6]?.trim(),
                        sexo: columns[7]?.trim(),
                        telefono_fijo: columns[8]?.trim(),
                        telefono_movil: columns[9]?.trim(),
                        comuna: columns[10]?.trim(),
                        fecha_ini_contrato: parseDate(columns[11]),
                        contrato_indefinido: parseBoolean(columns[12]),
                        fecha_fin_contrato: parseDate(columns[13]),
                        art_22: parseBoolean(columns[14]),
                        autoriza_ausencia: parseBoolean(columns[15]),
                        clave: columns[16]?.trim() || null,
                        empresa: columns[17]?.trim() ? parseInt(columns[17].trim()) : null,
                        cargo: columns[18]?.trim() ? parseInt(columns[18].trim()) : null,
                        turno: columns[19]?.trim() ? parseInt(columns[19].trim()) : null,
                        estado: columns[20]?.trim() ? parseInt(columns[20].trim()) : 1,
                        email_laboral: columns[21]?.trim(),
                        num_ficha: columns[22]?.trim(),
                        cenco_id: columns[23]?.trim() ? parseInt(columns[23].trim()) : null,
                    };
                }).filter(emp => emp.run); // Filtrar filas vacías

                if (empleados.length === 0) {
                    alert("El archivo CSV está vacío o no tiene el formato correcto.");
                    return;
                }

                let guardadosExito = 0;
                let guardadosError = 0;

                for (let i = 0; i < empleados.length; i++) {
                    const empleado = empleados[i];

                    try {
                        await crearEmpleado(empleado);
                        guardadosExito++;
                    } catch (error) {
                        console.error(`Error al guardar empleado ${empleado.run}:`, error);
                        guardadosError++;
                    }
                }

                if (guardadosError === 0) {
                    alert(`Proceso finalizado. Se cargaron ${guardadosExito} empleados exitosamente.`);
                    setFile(null);
                } else {
                    alert(`Proceso finalizado. Se guardaron ${guardadosExito} empleados, pero hubo ${guardadosError} errores (ver consola para detalles).`);
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
                    Cargar Empleados
                </Typography>
            </Box>

            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "calc(100vh - 200px)", display: 'flex', flexDirection: 'column', overflow: "hidden",
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