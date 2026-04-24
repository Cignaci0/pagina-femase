import React, { useEffect, useState, useRef } from "react";
import { 
    Paper, Typography, Button, Box, Stack, Select, MenuItem, 
    FormControl, InputLabel, TextField, IconButton 
} from "@mui/material";
import { toast } from "react-hot-toast";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import { obtenerEmpresas, subirLogoEmpresa } from "../../../services/empresasServices";

function ImgEmpresas() {
    const [empresas, setEmpresas] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const cargarEmpresas = async () => {
            const data = await obtenerEmpresas();
            setEmpresas(data);
        };
        cargarEmpresas();
    }, []);

    const handleFile = (selectedFile) => {
        // Validación estricta de imagen
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setImageUrl("");
            toast.success("Imagen cargada correctamente");
        } else {
            toast.error("El archivo seleccionado no es una imagen válida");
        }
    };

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        setImageUrl("");
    };

    const handleUpload = async () => {
        if (!empresaSeleccionada) return toast.error("Selecciona una empresa primero");
        
        let fileToUpload = file;

        // Si se pegó una URL, intentamos convertirla a Blob para enviarla como archivo
        if (!fileToUpload && imageUrl) {
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                if (!blob.type.startsWith("image/")) throw new Error();
                fileToUpload = new File([blob], "logo_url.png", { type: blob.type });
            } catch (e) {
                return toast.error("La URL no apunta a una imagen válida");
            }
        }

        if (!fileToUpload) return toast.error("Selecciona una imagen");

        const tId = toast.loading("Actualizando logo corporativo...");
        try {
            await subirLogoEmpresa(empresaSeleccionada, fileToUpload);
            toast.success("Logo actualizado correctamente", { id: tId });
            handleRemove();
        } catch (error) {
            toast.error(error.message || "Error al subir el logo", { id: tId });
        }
    };

    return (
        <Box sx={{ 
            p: 2, 
            maxWidth: "80%", 
            margin: "0 auto", 
            maxHeight: 'calc(100vh - 100px)', 
            overflow: 'auto' 
        }}>
            <Typography variant="h5" sx={{ 
                textAlign: 'center', mb: 2, fontWeight: 700, 
                color: '#1a2027' 
            }}>
                Gestión de Logos Corporativos
            </Typography>

            <Paper elevation={0} sx={{
                p: 3, borderRadius: 3, border: '1px solid #e0e4e8',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <Stack spacing={2.5}>
                    <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>Seleccionar Empresa</InputLabel>
                        <Select
                            value={empresaSeleccionada}
                            onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                            label="Seleccionar Empresa"
                            sx={{ borderRadius: 2 }}
                        >
                            {empresas.map((emp) => (
                                <MenuItem key={emp.empresa_id} value={emp.empresa_id}>
                                    {emp.nombre_empresa}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => !preview && fileInputRef.current.click()}
                        sx={{
                            height: 220,
                            borderRadius: 3,
                            border: `2px dashed ${isDragging ? '#3f51b5' : '#cbd5e0'}`,
                            bgcolor: isDragging ? 'rgba(63, 81, 181, 0.05)' : '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: preview ? 'default' : 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                            '&:hover': {
                                borderColor: preview ? '#cbd5e0' : '#3f51b5',
                            }
                        }}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />

                        {preview ? (
                            <Box sx={{ position: 'relative', width: '100%', height: '100%', p: 1 }}>
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                                />
                                <IconButton 
                                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                                    size="small"
                                    sx={{ 
                                        position: 'absolute', top: 8, right: 8, 
                                        bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ) : (
                            <>
                                <CloudUploadIcon sx={{ fontSize: 40, color: '#3f51b5', mb: 1 }} />
                                <Typography variant="subtitle1" sx={{ color: '#4a5568', fontWeight: 600 }}>
                                    Arrastra tu imagen aquí
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                    o haz clic para buscar
                                </Typography>
                            </>
                        )}
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleUpload}
                        disabled={!empresaSeleccionada || (!file && !imageUrl)}
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)'
                        }}
                    >
                        Guardar Logo Corporativo
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}

export default ImgEmpresas;
