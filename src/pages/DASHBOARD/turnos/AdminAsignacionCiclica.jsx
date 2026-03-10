import React, { useEffect, useState } from "react";
import {
    Box, Paper, TextField, Button, Table, TableContainer, TableHead,
    TableRow, TableCell, TableBody, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    IconButton, Typography, List, ListItem, ListItemText, CircularProgress,
    Container, Alert, TablePagination, Stack, Checkbox,
    ListItemIcon,
    FormHelperText
} from "@mui/material";
import { toast } from "react-hot-toast";


import ContentPasteIcon from '@mui/icons-material/ContentPaste';

function AdminAsignacionCiclica() {




    const [perfiles, setperfiles] = useState([])





    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Asignación Cíclica Turnos
                </Typography>
            </Box>



            <Paper elevation={2} sx={{
                p: 3, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                <Box sx={{ mb: 4, borderBottom: "1px solid #e0e0e0", pb: 2 }}>

                    <Stack direction="row" spacing={2} alignItems="center">

                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Empresa</InputLabel>
                            <Select label="Empresa" defaultValue="" >

                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Departamento</InputLabel>
                            <Select label="Departamento" defaultValue="" >

                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Cenco</InputLabel>
                            <Select label="Cenco" defaultValue="" >
                            </Select>
                        </FormControl>
                    </Stack>

                </Box>

                <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados disponibles</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>

                            <List dense>
                                izquierda

                            </List>


                        </Box>
                    </Box>

                    <Stack spacing={1} justifyContent="center">
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}

                        >
                            &gt;&gt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}

                        >
                            &gt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}

                        >
                            &lt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}

                        >
                            &lt;&lt;
                        </Button>

                    </Stack>

                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Empleados seleccionados</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                derecha
                            </List>
                        </Box>
                    </Box>

                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ContentPasteIcon />}
                        sx={{ px: 4 }}


                    >
                        Guardar
                    </Button>
                </Box>
            </Paper>
        </>
    );
}
export default AdminAsignacionCiclica;