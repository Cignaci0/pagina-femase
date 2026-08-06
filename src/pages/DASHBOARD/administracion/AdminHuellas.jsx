import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem,
  ListItemIcon, ListItemText, Checkbox, Tooltip, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, TextField, InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FaxIcon from '@mui/icons-material/Fax';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast, Toaster } from "react-hot-toast";
import { obtenerHuellas, asignarDispositivosHuella } from "../../../services/huellasServices";
import { obtenerDispositivo } from "../../../services/dispositivosServices";
import { obtenerEmpresas } from "../../../services/empresasServices";

function AdminHuellas() {
  const [huellas, setHuellas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState(() => {
    const stored = localStorage.getItem('empresaId');
    return stored ? parseInt(stored) : "";
  });
  const [busqueda, setBusqueda] = useState("");

  // Estados dispositivos
  const [todosDispositivos, setTodosDispositivos] = useState([]);
  const [dialogDispositivo, setDialogDispositivo] = useState(false);
  const [huellaSeleccionada, setHuellaSeleccionada] = useState(null);

  // Estados info base64
  const [dialogBase64, setDialogBase64] = useState(false);
  const [base64Content, setBase64Content] = useState("");

  // Variables para listas de transferencia
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    cargarDatosGenerales();
  }, []);

  const cargarDatosGenerales = async () => {
    try {
      const [dataEmpresas, dataDispo] = await Promise.all([
        obtenerEmpresas(),
        obtenerDispositivo()
      ]);
      setEmpresas(Array.isArray(dataEmpresas) ? dataEmpresas : []);
      setTodosDispositivos(dataDispo || []);
    } catch (e) {
      console.error("Error al cargar empresas o dispositivos", e);
    }
  };

  useEffect(() => {
    if (filtroEmpresa) {
      cargarHuellas();
    } else {
      setHuellas([]);
    }
  }, [filtroEmpresa]);

  const cargarHuellas = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataHuellas = await obtenerHuellas();
      
      // Agrupar huellas por num_ficha y huella_base64
      if (dataHuellas && dataHuellas.length > 0) {
        const agrupar = dataHuellas.reduce((acc, curr) => {
          const key = `${curr.num_ficha}-${curr.huella_base64}`;
          if (!acc[key]) {
            acc[key] = {
              num_ficha: curr.num_ficha,
              huella_base64: curr.huella_base64,
              dispositivos: [],
              // Guardamos la referencia del empleado para filtrar
              empleado: curr.empleado
            };
          }
          if (curr.dispositivo) {
            acc[key].dispositivos.push(curr.dispositivo);
          }
          return acc;
        }, {});
        
        const huellasAgrupadas = Object.values(agrupar);
        
        // Filtramos por empresa si el backend retorna la info del empleado/empresa, 
        // de lo contrario mostramos las que vengan (si backend ya filtra o si no se puede).
        const huellasFiltradasPorEmpresa = huellasAgrupadas.filter(h => {
          if (!filtroEmpresa) return true;
          if (!h.empleado) return true; // Si no hay info, lo mostramos para no perderlo
          if (h.empleado.empresa_id === filtroEmpresa) return true;
          if (h.empleado.empresa && h.empleado.empresa.empresa_id === filtroEmpresa) return true;
          return false;
        });

        setHuellas(huellasFiltradasPorEmpresa);
      } else {
        setHuellas([]);
      }
    } catch (e) {
      setError(e.message || "Error al cargar las huellas");
      toast.error("Error al cargar huellas");
    } finally {
      setLoading(false);
    }
  };

  // Logica info base64
  const abrirDialogBase64 = (base64) => {
    setBase64Content(base64);
    setDialogBase64(true);
  };
  const cerrarDialogBase64 = () => setDialogBase64(false);

  // Logica dispositivos
  const abrirDialogDispositivo = (huella) => {
    setHuellaSeleccionada(huella);
    
    const asignados = huella.dispositivos || [];
    
    const asignadosIds = asignados.map(d => d.dispositivo_id);
    const disponibles = todosDispositivos.filter(d => !asignadosIds.includes(d.dispositivo_id));

    setLeft(disponibles);
    setRight(asignados);
    setChecked([]);
    setDialogDispositivo(true);
  };

  const cerrarDialogDispositivo = () => {
    setDialogDispositivo(false);
    setHuellaSeleccionada(null);
  };

  const guardarCambiosDispositivos = async () => {
    if (!huellaSeleccionada) return;
    
    try {
      const dispositivoIds = right.map(item => item.dispositivo_id);
      
      await asignarDispositivosHuella(
        huellaSeleccionada.num_ficha,
        huellaSeleccionada.huella_base64,
        dispositivoIds
      );
      
      toast.success("Dispositivos asignados correctamente");
      cerrarDialogDispositivo();
      cargarHuellas();
    } catch (error) {
      toast.error(error.message || "Error al asignar dispositivos");
    }
  };

  // Lógica lista de transferencia
  const intersection = (a, b) => a.filter((value) => b.some((item) => item.dispositivo_id === value.dispositivo_id));
  const not = (a, b) => a.filter((value) => !b.some((item) => item.dispositivo_id === value.dispositivo_id));

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.findIndex(item => item.dispositivo_id === value.dispositivo_id);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (items) => (
    <Paper sx={{ width: 300, height: 350, overflow: 'auto' }}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.dispositivo_id}-label`;
          return (
            <ListItem key={value.dispositivo_id} role="listitem" button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.findIndex(item => item.dispositivo_id === value.dispositivo_id) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.nombre_dispositivo} secondary={value.ip_dispositivo} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Paper>
  );

  // Filtrado final para la tabla
  const huellasFiltradas = huellas.filter(h => 
    h.num_ficha.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Card 1: Titulo y Filtros */}
      <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", boxSizing: "border-box" }}>
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Administración de Huellas
            </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 1 }}>
          <TextField
              size="small"
              placeholder="Buscar Nº Ficha..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                          <SearchIcon />
                      </InputAdornment>
                  ),
              }}
              sx={{ minWidth: 200 }}
          />

          <FormControl size="small" variant="outlined" sx={{ minWidth: 150 }}>
              <InputLabel>Empresa</InputLabel>
              <Select sx={{ width: "20vh" }} value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
                  {empresas.map((empresa) => (
                    <MenuItem key={empresa.empresa_id} value={empresa.empresa_id}>{empresa.nombre_empresa}</MenuItem>
                  ))}
              </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Card 2: Tabla Principal */}
      <Paper elevation={2} sx={{ p: 2, bgcolor: "#FFFFFD", borderRadius: 2, width: "100%", flex: 1, minHeight: "calc(100vh - 280px)", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
        <Box sx={{ flex: 1, overflow: "hidden", width: "100%", position: "relative", }}>
            <TableContainer sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflowX: "auto", overflowY: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 800 }}>
                    <TableHead sx={{ '& th': { bgcolor: '#FFFFFD', borderBottom: '2px solid #ddd' } }}>
                        <TableRow>
                            <TableCell align="center"><strong>Nº Ficha</strong></TableCell>
                            <TableCell align="center"><strong>Huella Base64</strong></TableCell>
                            <TableCell align="center"><strong>Dispositivos Asignados</strong></TableCell>
                            <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {!filtroEmpresa ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Seleccione una empresa para la búsqueda
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <Alert severity="error">{error}</Alert>
                                </TableCell>
                            </TableRow>
                        ) : huellasFiltradas.length > 0 ? (
                            huellasFiltradas.map((row, index) => (
                              <TableRow key={index} hover>
                                <TableCell align="center">{row.num_ficha}</TableCell>
                                <TableCell align="center">
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => abrirDialogBase64(row.huella_base64)}
                                  >
                                    Ver Huella
                                  </Button>
                                </TableCell>
                                <TableCell align="center">
                                  {row.dispositivos && row.dispositivos.length > 0 
                                    ? row.dispositivos.map(d => d.nombre_dispositivo).join(", ") 
                                    : "Sin dispositivos asignados"}
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Asignar Dispositivos">
                                    <IconButton onClick={() => abrirDialogDispositivo(row)}>
                                      <FaxIcon color="primary" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No se encontraron huellas.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
      </Paper>

      {/* Dialog para mostrar Base64 */}
      <Dialog open={dialogBase64} onClose={cerrarDialogBase64} maxWidth="md" fullWidth>
        <DialogTitle>Información de Huella (Base64)</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ 
            wordBreak: 'break-all', 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace'
          }}>
            {base64Content}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogBase64} color="primary" variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para asignar dispositivos */}
      <Dialog open={dialogDispositivo} fullWidth maxWidth="md" onClose={cerrarDialogDispositivo}>
        <DialogTitle>Asignar Dispositivos</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Dispositivos Disponibles ({left.length})</Typography>
              {customList(left)}
            </Grid>
            <Grid item>
              <Grid container direction="column" alignItems="center">
                <Button
                  sx={{ my: 1 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0}
                  aria-label="move selected right"
                >
                  &gt;
                </Button>
                <Button
                  sx={{ my: 1 }}
                  variant="outlined"
                  size="small"
                  onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0}
                  aria-label="move selected left"
                >
                  &lt;
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Dispositivos Asignados ({right.length})</Typography>
              {customList(right)}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogDispositivo} color="error">Cancelar</Button>
          <Button onClick={guardarCambiosDispositivos} variant="contained" color="success">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminHuellas;
