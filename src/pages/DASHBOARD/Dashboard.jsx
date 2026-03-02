import React, { useState, useEffect } from "react";
import {
  AppBar, Box, CssBaseline, Drawer, List, ListItemButton,
  ListItemText, Toolbar, Collapse, Typography, IconButton
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import logoFundacion from '../../assets/logo_fundacion_mi_casa.png';
import logoFemase from '../../assets/logo_femase.png';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// ADMINISTRACION
import AdminEmpresas from "../DASHBOARD/administracion/AdminEmpresas"
import AdminCargos from "../DASHBOARD/administracion/AdminCargos";
import AdminAFPs from "../DASHBOARD/administracion/AdminAFPs";
import AdminCentroCosto from "../DASHBOARD/administracion/AdminCentroCosto";
import AdminCodErrorRechazos from "../DASHBOARD/administracion/AdminCodErrorRechazos";
import AdmiminDepartamentos from "../DASHBOARD/administracion/AdminDepartamentos";
import AdminDispositivos from "../DASHBOARD/administracion/AdminDispositivos";
import AdminEmpleados from "../DASHBOARD/administracion/AdminEmpleados";
import AdminPreoveedorCorreo from "../DASHBOARD/administracion/AdminProveedoresCorreo";
import AdminTiposDispositivos from "../DASHBOARD/administracion/AdminTiposDispositivos";
import AdminFeriados from "../DASHBOARD/administracion/AdminFeriados";

// USUARIOS
import AdminUsuarios from "../DASHBOARD/usuarios/AdminUsuario";
import AdminPerfilDeUsuarios from "../DASHBOARD/usuarios/AdminPerfilDeUsuarios";
import AdminAccesosPerfil from "../DASHBOARD/usuarios/AdminAccesosPerfil";

// TURNOS
import AdminTurnos from "../DASHBOARD/turnos/AdminTurnos";
import AdminTurnosRotativos from "../DASHBOARD/turnos/AdminTurnosRotativos";
import AdminTurnosRotativosAsignacion from "../DASHBOARD/turnos/AdminTurnosRotativosAsignacion";
import AdminAsignacionCiclica from "../DASHBOARD/turnos/AdminAsignacionCiclica";
import AdminHorarios from "../DASHBOARD/turnos/AdminHorarios";

// AUDITORIA
import AdminEventosSistema from "../DASHBOARD/auditoria/AdminEventosSistema";
import AdminUsuariosConectados from "../DASHBOARD/auditoria/AdminUsuariosConectados";

// AUSENCIAS
import AdminTipoAusencia from "../DASHBOARD/ausencias/AdminTipoAusencia";

// CALCULO ASISTENCIA
import AdminCalculoAsis from "../DASHBOARD/calculo asistencia/AdminCalculoAsistencia";
import AdminCalculoAsishistorico from "../DASHBOARD/calculo asistencia/AdminCalcularAsistenciaHistorico";
import AdminAsisHorasExtras from "../DASHBOARD/calculo asistencia/AdminAsistencia-HorasExtras";

// CARGA DESDE ARCHIVO
import CargaCencos from "../DASHBOARD/carga desde archivo/CargaCencos";
import CargaDepartamentos from "../DASHBOARD/carga desde archivo/CargaDepartamentos";
import CargaEmpleados from "../DASHBOARD/carga desde archivo/CargaEmpleados";
import CargaInfoVacaciones from "../DASHBOARD/carga desde archivo/CargaInfoVacaciones";
import CargaMarcas from "../DASHBOARD/carga desde archivo/CargaMarcas";
import CargaUsuarios from "../DASHBOARD/carga desde archivo/CargaUsuarios";
import CargaVacaciones from "../DASHBOARD/carga desde archivo/CargaVacaciones";

// CONFIGURACION DE SISTEMA
import AdminModuloSistea from "../DASHBOARD/configuracion de sistema/AdminModulosSistema";
import AdminAccesos from "../DASHBOARD/configuracion de sistema/AdminAccesos";

// MARCAS ASISTENCIA
import AdminTiposMarcasManuales from "../DASHBOARD/marcas asistencia/AdminTiposMarcasManuales";

// REPORTES/INFORMES
import ReporteUsuarios from "../DASHBOARD/reportes informes/ReporteUsuarios";

import { obtenerSubMenusPerfil} from "../../services/menus/menuServices";

const drawerWidth = 240;

const COMPONENTES_VISTA = {
  // ADMINISTRACION
  "Empresas": <AdminEmpresas />, //
  "Cargos": <AdminCargos />, //
  "AFP": <AdminAFPs />,
  "Centros de costo": <AdminCentroCosto />, //
  "Error Rechazos": <AdminCodErrorRechazos />,
  "Departamentos": <AdmiminDepartamentos />, //
  "Dispositivos": <AdminDispositivos />, //
  "Empleados": <AdminEmpleados />,//
  "Proveedor Correo": <AdminPreoveedorCorreo />,
  "Tipos de dispositivos": <AdminTiposDispositivos />, //
  "Feriados": <AdminFeriados />,

  // USUARIOS
  "Gestion": <AdminUsuarios />,//
  "Perfiles": <AdminPerfilDeUsuarios />,//
  "Acceso perfil": <AdminAccesosPerfil />,//

  // TURNOS
  "Gestion turnos": <AdminTurnos />, //
  "Rotativos": <AdminTurnosRotativos />,//
  "Rotativos - Asignacion": <AdminTurnosRotativosAsignacion />,//
  "Asignacion Ciclica": <AdminAsignacionCiclica />,//
  "Horarios": <AdminHorarios />, //

  // AUDITORIA
  "Eventos Sistema": <AdminEventosSistema />,//
  "Usuarios Conectados": <AdminUsuariosConectados />,//

  // AUSENCIAS
  "Tipo Ausencia": <AdminTipoAusencia />,

  // CALCULO ASISTENCIA
  "Calculo Asistencia": <AdminCalculoAsis />,
  "Calculo Asistencia Historico": <AdminCalculoAsishistorico />,
  "Asistencia Horas Extras": <AdminAsisHorasExtras />,

  // CARGA DESDE ARCHIVO
  "Carga Cenco": <CargaCencos />,
  "Carga Departamentos": <CargaDepartamentos />,
  "Carga Empleados": <CargaEmpleados />,
  "Carga Info Vacaciones": <CargaInfoVacaciones />,
  "Carga Marcas": <CargaMarcas />,
  "Carga Usuarios": <CargaUsuarios />,
  "Carga Vacaciones": <CargaVacaciones />,

  // CONFIGURACION DE SISTEMA
  //"Sistema": <AdminModuloSistea />,
  //"Accesos": <AdminAccesos />,

  // MARCAS ASISTENCIA
  "Tipos Marcas Manuales": <AdminTiposMarcasManuales />,

  // REPORTES/INFORMES
  "Reporte Usuarios": <ReporteUsuarios />
}



const MenuConHijos = ({ item, onNavegar }) => {
  const [open, setOpen] = useState(false);
  const AbrirOpciones = () => { setOpen(!open) };
  const hijos = item.children || [];


  const [nuevoTitulo, setNuevoTitulo] = useState("")
  const [nuevoSubTitulo, setNuevoSubTitulo] = useState("")
  const [nuevoImg, setNuevoImg] = useState("")

  const [editNombre, setEditNombre] = useState("")
  const [editEstado, setEditEstado] = useState("")
  const [editOrden, setEditOrden] = useState("")
  const [editAccRapido, setEditAccRapido] = useState("")
  const [editTitulo, setEditTitulo] = useState("")
  const [editSubTitulo, setEditSubTitulo] = useState("")
  const [editImg, setEditImg] = useState("")


  return (
    <>
      <ListItemButton onClick={AbrirOpciones}>
        <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: '18px', fontWeight: 'bold', color: "black", fontFamily: 'Roboto, sans-serif' }} />
        {hijos.length > 0 ? (open ? <ExpandLess /> : <ExpandMore />) : null}
      </ListItemButton>

      {hijos.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {hijos.map((childText, index) => (
              <ListItemButton key={index} sx={{ pl: 4 }} onClick={() => onNavegar(childText)}>
                <ListItemText primary={childText} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}


function Dashboard(props) {

  const navigate = useNavigate();

  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");
  const [menuItems, setMenuItems] = useState([]);

  const InteruptorDrawer = () => setMobileOpen(!mobileOpen);

  const handleNavegacion = (opcionSeleccionada) => {
    console.log("Navegando a:", opcionSeleccionada);
    setVistaActual(opcionSeleccionada);
    if (mobileOpen) setMobileOpen(false);
  };



  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const storedUser = localStorage.getItem("perfilId");

        const data = await obtenerSubMenusPerfil(storedUser);

        if (Array.isArray(data)) {
          const menusFormateados = data.map(m => ({
            title: m.nombre_menu,
            children: m.submenus ? m.submenus.map(sub => sub.nombre_modulo) : []
          }));
          setMenuItems(menusFormateados);
        }
      } catch (error) {
        console.error("Error al obtener menús:", error);
      }
    };
    fetchMenu();
  }, []);

  const drawerContent = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: "auto" }}>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <MenuConHijos key={index} item={item} onNavegar={handleNavegacion} />
          ))}
        </List>
      </Box>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" color="" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "white", boxShadow: "none", borderBottom: "1px solid #e0e0e0" }}>
        <Toolbar sx={{ p: 1 }}>
          <IconButton color="inherit" edge="start" onClick={InteruptorDrawer} sx={{ mr: 2, display: { sm: 'none' }, color: 'black', "&:focus": { outline: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexGrow: 1, alignItems: 'center' }}>
            <img src={logoFundacion} alt="Logo" style={{ maxHeight: '60px' }} />
            <img src={logoFemase} alt="Logo" style={{ maxHeight: '60px' }} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer container={container} variant="temporary" open={mobileOpen} onClose={InteruptorDrawer} disableScrollLock={true} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, } }}>
          {drawerContent}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, } }} open>
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#F5F5F5" }}>
        <Toolbar />
        <Box sx={{ mt: 1, width: '100%' }}>

          {vistaActual === 'inicio' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <Typography variant="h4" color="text.secondary">Bienvenido</Typography>
            </Box>
          )}

          {COMPONENTES_VISTA[vistaActual] || (vistaActual !== 'inicio' && <Typography>Vista no encontrada: {vistaActual}</Typography>)}

        </Box>
      </Box>
    </Box>
  );
}
export default Dashboard;