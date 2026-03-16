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

import { obtenerPerfiles } from "../../../services/perfilUsuariosServices";
import {
    obtenerSubMenus, obtenerSubMenusPerfil, agregarSubMenu
} from "../../../services/menus/menuServices";

import ContentPasteIcon from '@mui/icons-material/ContentPaste';

function AsignacionCiclicaTurnos() {

    // Estados de datos
    const [perfiles, setperfiles] = useState([])
    const [todosMenus, setTodosMenus] = useState([])
    const [asigandosMenus, setAsignadosMenus] = useState([])
    const [listaIzquierda, setlistaIzquierda] = useState([])
    const [listaDerecha, setlistaDerecha] = useState([])
    const [listaSeleccionados, setListaSeleccionados] = useState([])
    const [cargando, setCargando] = useState(false); // Agregado para consistencia con lógica de carga

    // Estados de paginacion y filtrado
    const [filtroPerfil, setFiltroPerfil] = useState("")
    const [busqueda, setBusqueda] = useState(""); // Definido en el original


    // Carga de datos
    const obtenerPerfilesData = async () => {
        try {
            const respuesta = await obtenerPerfiles()
            setperfiles(respuesta)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const llamarDatosDeMenus = async () => {
        try {
            const todos = await obtenerSubMenus();
            const asignados = await obtenerSubMenusPerfil(filtroPerfil);
            const todosPlanos = aplanarMenus(todos);
            const asignadosPlanos = aplanarMenus(asignados);
            const idsAsignados = new Set(asignadosPlanos.map(i => i.modulo_id));
            const disponibles = todosPlanos.filter(i => !idsAsignados.has(i.modulo_id));
            setlistaIzquierda(disponibles);
            setlistaDerecha(asignadosPlanos);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const guardarSubMenus = async () => {
        try {
            const idsHijos = listaDerecha.map((ld) => ld.modulo_id);
            const idsPadres = listaDerecha.map((ld) => ld.padre_id);
            const todosLosIds = [...idsHijos, ...idsPadres];
            const listaFinalSinDuplicados = [...new Set(todosLosIds)];
            console.log("Enviando estos IDs:", listaFinalSinDuplicados);
            await agregarSubMenu(filtroPerfil, listaFinalSinDuplicados);
            toast.success("Turnos asignados correctamente");
        } catch (error) {
            toast.error(error.message || "Error al asignar submenus");
        }
    }

    // Manejo de dialogs
    const aplanarMenus = (data) => {
        let lista = [];
        if (Array.isArray(data)) {
            data.forEach(padre => {
                if (padre.submenus) {
                    padre.submenus.forEach(hijo => {
                        lista.push({
                            ...hijo,
                            nombre_padre: padre.nombre_menu,
                            padre_id: padre.modulo_id
                        });
                    });
                }
            });
        }
        return lista;
    }

    const handleToggle = (subMenu) => () => {
        const nuevaListaSeleccionados = [...listaSeleccionados]
        const indiceActual = listaSeleccionados.indexOf(subMenu)

        if (indiceActual === -1) {
            nuevaListaSeleccionados.push(subMenu)
        } else {
            nuevaListaSeleccionados.splice(indiceActual, 1)
        }
        setListaSeleccionados(nuevaListaSeleccionados)
    }

    const derecha = () => {
        const leftSelect = intersection(listaSeleccionados, listaIzquierda)
        setlistaDerecha([...listaDerecha, ...leftSelect])
        setlistaIzquierda(not(listaIzquierda, leftSelect))
        setListaSeleccionados(not(listaSeleccionados, leftSelect))
        setListaSeleccionados([])
    }

    const allRight = () => {
        setlistaDerecha([...listaDerecha, ...listaIzquierda])
        setlistaIzquierda([])
        setListaSeleccionados([])
    }

    const izquierda = () => {
        const righttSelect = intersection(listaSeleccionados, listaDerecha)
        setlistaIzquierda([...listaIzquierda, ...righttSelect])
        setlistaDerecha(not(listaDerecha, righttSelect))
        setListaSeleccionados(not(listaSeleccionados, righttSelect))
        setListaSeleccionados([])
    }

    const allleft = () => {
        setlistaIzquierda([...listaIzquierda, ...listaDerecha])
        setlistaDerecha([])
        setListaSeleccionados([])
    }

    const intersection = (a, b) => {
        return a.filter((e) => b.some((f) => e.modulo_id === f.modulo_id));
    };

    const not = (a, b) => {
        return a.filter((e) => !b.some((f) => e.modulo_id === f.modulo_id));
    };

    // Filtrado y paginacion
    const disponiblesmenus = todosMenus.filter((e) => !asigandosMenus.some((f) => e.submenus?.modulo_id === f.submenus?.modulo_id))

    // Effects
    useEffect(() => {
        obtenerPerfilesData()
    }, [])

    useEffect(() => {
        if (filtroPerfil) {
            llamarDatosDeMenus();
        }
    }, [filtroPerfil]);



    // Renderizado condicional


    return (
        <>
            {/* Titulo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" color="text.secondary">
                    Admin Acceso Perfil
                </Typography>
            </Box>

            {/* Alerta de exito */}


            {/* Contenedor principal */}
            <Paper elevation={2} sx={{
                p: 3, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", height: "70vh", display: 'flex', flexDirection: 'column', overflow: "hidden",
                boxSizing: "border-box"
            }}>
                {/* Barra de busqueda y filtros */}
                <Box sx={{ mb: 4, borderBottom: "1px solid #e0e0e0", pb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Perfil de usuario</InputLabel>
                            <Select label="Perfil de usuario" defaultValue="" value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value)}>
                                {perfiles.map((p) => (
                                    <MenuItem key={p.perfil_id} value={p.perfil_id}>
                                        {p.nombre_perfil}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Listas de seleccion */}
                <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>

                    {/* Lista izquierda */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Accesos disponibles</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                {listaIzquierda.map((item) => (
                                    <ListItem key={item.modulo_id} button onClick={handleToggle(item)}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={listaSeleccionados.indexOf(item) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.nombre_modulo}
                                            secondary={item.nombre_padre}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Botones de traslado */}
                    <Stack spacing={1} justifyContent="center">
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}
                            onClick={allRight}
                        >
                            &gt;&gt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}
                            onClick={derecha}
                        >
                            &gt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}
                            onClick={izquierda}
                        >
                            &lt;
                        </Button>

                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 40 }}
                            onClick={allleft}
                        >
                            &lt;&lt;
                        </Button>
                    </Stack>

                    {/* Lista derecha */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Accesos seleccionados</Typography>
                        <Box sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                            <List dense>
                                {listaDerecha.map((item) => (
                                    <ListItem key={item.modulo_id} button onClick={handleToggle(item)}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={listaSeleccionados.indexOf(item) !== -1}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.nombre_modulo}
                                            secondary={item.nombre_padre}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                </Box>

                {/* Boton guardar */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ContentPasteIcon />}
                        sx={{ px: 4 }}
                        onClick={guardarSubMenus}
                    >
                        Guardar
                    </Button>
                </Box>
            </Paper>
        </>
    );
}
export default AsignacionCiclicaTurnos;