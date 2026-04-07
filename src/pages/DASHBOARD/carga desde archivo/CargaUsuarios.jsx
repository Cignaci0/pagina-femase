import { Paper, Typography, Button, Box, Stack } from "@mui/material";
import { toast } from "react-hot-toast";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { crearUsuario } from "../../../services/usuariosServices";

function cargaUsuarios() {

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

                // Orden esperado (basado en el Excel): 
                // username, password, estado, nombre, apellido P, apellido M, email, perfil, run, empresa
                const usuarios = lines.slice(1).map((line) => {
                    const columns = line.split(";");
                    return {
                        username: columns[0]?.trim(),
                        password: columns[1]?.trim() || null,
                        estado: columns[2]?.trim() ? parseInt(columns[2].trim()) : 1,
                        nombres: columns[3]?.trim(),
                        apellido_paterno: columns[4]?.trim(),
                        apellido_materno: columns[5]?.trim(),
                        email: columns[6]?.trim(),
                        perfil: columns[7]?.trim() ? parseInt(columns[7].trim()) : null,
                        run_usuario: columns[8]?.trim(),
                        empresa: columns[9]?.trim() ? parseInt(columns[9].trim()) : null,
                    };
                }).filter(user => user.username); // Filtrar filas vacías omitiendo las que no tienen username

                if (usuarios.length === 0) {
                    alert("El archivo CSV está vacío o no tiene el formato correcto.");
                    return;
                }

                let guardadosExito = 0;
                let guardadosError = 0;

                for (let i = 0; i < usuarios.length; i++) {
                    const usr = usuarios[i];

                    try {
                        await crearUsuario(
                            usr.username,
                            usr.password,
                            usr.estado,
                            usr.nombres,
                            usr.apellido_paterno,
                            usr.apellido_materno,
                            usr.email,
                            usr.perfil,
                            usr.run_usuario,
                            usr.empresa
                        );
                        guardadosExito++;
                    } catch (error) {
                        console.error(`Error al guardar usuario ${usr.username}:`, error);
                        guardadosError++;
                    }
                }

                if (guardadosError === 0) {
                    alert(`Proceso finalizado. Se cargaron ${guardadosExito} usuarios exitosamente.`);
                    setFile(null);
                } else {
                    alert(`Proceso finalizado. Se guardaron ${guardadosExito} usuarios, pero hubo ${guardadosError} errores (ver consola para detalles).`);
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
                    Cargar Usuarios
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
                    Sistema de Gestión - FEMASE - Carga masiva de Usuarios
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
export default cargaUsuarios;