import React, { useState, useEffect } from "react";
import {
  AppBar, Box, CssBaseline, Drawer, List, ListItemButton,
  ListItemText, Toolbar, Collapse, Typography, IconButton
} from "@mui/material";
import { toast } from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import logoFundacion from '../../assets/logo_fundacion_mi_casa.png';
import logoFemase from '../../assets/logo_femase.png';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

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
import AdminTurnosRotativo from "./turnos/AdminTurnosRotativo";
import AdminAsignacionTurnoRotativo from "../DASHBOARD/turnos/AdminAsignacionTurnoRotativo";
import AdminHorarios from "../DASHBOARD/turnos/AdminHorarios";
// AUDITORIA
import AdminEventosSistema from "../DASHBOARD/auditoria/AdminEventosSistema";
import AdminUsuariosConectados from "../DASHBOARD/auditoria/AdminUsuariosConectados";

// AUSENCIAS
import AdminTipoAusencia from "../DASHBOARD/ausencias/AdminTipoAusencia";
import IngresarAusencia from "../DASHBOARD/ausencias/IngresarAusencias";

// CALCULO ASISTENCIA
import AutorizacionHoraExtra from "./calculo asistencia/AutorizacionHorasExtras";

// CARGA DESDE ARCHIVO
import CargaCencos from "../DASHBOARD/carga desde archivo/CargaCencos";
import CargaDepartamentos from "../DASHBOARD/carga desde archivo/CargaDepartamentos";
import CargaEmpleados from "../DASHBOARD/carga desde archivo/CargaEmpleados";
import CargaInfoVacaciones from "../DASHBOARD/carga desde archivo/CargaInfoVacaciones";
import CargaMarcas from "../DASHBOARD/carga desde archivo/CargaMarcas";
import CargaUsuarios from "../DASHBOARD/carga desde archivo/CargaUsuarios";
import CargaVacaciones from "../DASHBOARD/carga desde archivo/CargaVacaciones";
import CargaFeriados from "../DASHBOARD/carga desde archivo/Cargaferiados";


// MARCAS ASISTENCIA
import AdminTiposMarcasManuales from "../DASHBOARD/marcas asistencia/AdminTiposMarcasManuales";
import AdminMarcas from "../DASHBOARD/marcas asistencia/AdminMarcas";

// REPORTES/INFORMES
import ReporteAsistencia from "./reportes informes/ReporteAsistencia";
import ReporteAusencia from "./reportes informes/ReporteAusencias";
import ReporteVacaciones from "./reportes informes/ReporteVacaciones";

// VACACIONES
import AdminVacaciones from "../DASHBOARD/vacaciones/AdminVacaciones";
import AdminIngresarSolicitudVacaciones from "../DASHBOARD/vacaciones/IngresarSolicitudVacaciones";
import AdminAusencia from "../DASHBOARD/ausencias/AdminAusencias";
import AdminVacacionesProgresivas from "../DASHBOARD/vacaciones/VacacionesProgresivas";

// FISCALIZADOR
import BusquedaMarcas from "../DASHBOARD/Fiscalizador/BusquedaMarcas";
import ReportesFiscaliza from "../DASHBOARD/Fiscalizador/ReportesFiscalizador";

// TELETRABAJO
import MarcaTeletrabajo from "../DASHBOARD/teletrabajo/marcaTeletrabajo";
import AsignacionTeletrabajos from "../DASHBOARD/teletrabajo/AsignacionTeletrabajo";
import AdminTeletrabajos from "../DASHBOARD/teletrabajo/AdminTeletrabajo";

// CONFIGURACION SISTEMA
import HorasLaboral from "../DASHBOARD/ConfgSistema/HorasLaborales";

import { obtenerSubMenusPerfil } from "../../services/menus/menuServices";
import { cerrarSesion } from "../../services/usuariosConectados";

const drawerWidth = 240;

const COMPONENTES_VISTA = {
  // ADMINISTRACION
  "Empresas": <AdminEmpresas />, //
  "Cargos": <AdminCargos />, //
  "AFP": <AdminAFPs />,
  "Centros de costo": <AdminCentroCosto />, //
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
  "Admin Turnos Rotativos": <AdminTurnosRotativo />,//
  "Asignacion turno Rotativo": <AdminAsignacionTurnoRotativo />,//
  "Horarios": <AdminHorarios />, //

  // AUDITORIA
  "Eventos Sistema": <AdminEventosSistema />,//
  "Usuarios Conectados": <AdminUsuariosConectados />,//

  // AUSENCIAS
  "Tipo Ausencia": <AdminTipoAusencia />,
  "Ingreso Ausencia": <IngresarAusencia />,
  "Admin Ausencias": <AdminAusencia />,

  // CALCULO ASISTENCIA
  "Autorizacion Horas Extras": <AutorizacionHoraExtra />,

  // CARGA DESDE ARCHIVO
  "Carga Cenco": <CargaCencos />,
  "Carga Departamentos": <CargaDepartamentos />,
  "Carga Empleados": <CargaEmpleados />,
  "Carga Info Vacaciones": <CargaInfoVacaciones />,
  "Carga Marcas": <CargaMarcas />,
  "Carga Usuarios": <CargaUsuarios />,
  "Carga Vacaciones": <CargaVacaciones />,
  "Carga Feriados": <CargaFeriados />,

  // MARCAS ASISTENCIA
  "Tipos Marcas Manuales": <AdminTiposMarcasManuales />,
  "Admin Marcas": <AdminMarcas />,

  // REPORTES/INFORMES
  "Reporte Asistencia": <ReporteAsistencia />,
  "Reporte Ausencias": <ReporteAusencia />,
  "Reporte Vacaciones": <ReporteVacaciones />,

  // VACACIONES
  "Admin Vacaciones": <AdminVacaciones />,
  "Ingresar Solicitud Vacaciones": <AdminIngresarSolicitudVacaciones />,
  "Vacaciones Progresivas": <AdminVacacionesProgresivas />,

  // FISCALIZADOR
  "Busqueda De Marcas": <BusquedaMarcas />,
  "Reportes Fiscalizador": <ReportesFiscaliza />,

  // TELETRABAJO
  "Marca Teletrabajo": <MarcaTeletrabajo />,
  "Asignacion Teletrabajo": <AsignacionTeletrabajos />,
  "Admin Teletrabajo": <AdminTeletrabajos />,

  // CONFIGURACION SISTEMA
  "Horas Laborales": <HorasLaboral />,

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

  const handleLogout = async () => {
    try {
      // Intentamos llamar al endpoint del backend para cerrar sesión activamente
      await cerrarSesion();
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      // Limpiamos los tokens y variables importantes siempre, incluso si falla el endpoint
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("perfilId");

      // Eliminamos el historial de navegación para evitar "Atrás" y redirigimos a login
      navigate("/", { replace: true });
    }
  };



  useEffect(() => {
    // Protección de ruta: Si no hay token, redirigir al login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Box sx={{ overflow: "auto", flexGrow: 1 }}>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <MenuConHijos key={index} item={item} onNavegar={handleNavegacion} />
          ))}
        </List>
      </Box>

      {/* Logout button at bottom */}
      <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0", mt: 'auto' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            backgroundColor: "#ffebee",
            color: "#d32f2f",
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "#ffcdd2",
            }
          }}
        >
          <ExitToAppIcon sx={{ mr: 2, transform: 'rotate(180deg)' }} />
          <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontWeight: 'bold' }} />
        </ListItemButton>
      </Box>
    </Box>
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