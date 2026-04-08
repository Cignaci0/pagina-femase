import { API_URL } from "../../config/config";


//Obtener todos los sub menus (configuración)
export const obtenerSubMenus = async () => {
  try {
    const response = await fetch(`${API_URL}/menus`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + window.localStorage.getItem("token") 
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al cargar todos los menús");
    }
    return data;
  } catch (error) {
    throw error;
  }
};

//Obtener menus por perfil (navigación)
export const obtenerSubMenusPerfil = async (profileId) => {
  try {
    const response = await fetch(`${API_URL}/menus/buscar/${profileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + window.localStorage.getItem("token")
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error API: ${response.status}`);
    }
    
    const data = await response.json();
    return data; 
  } catch (error) {
    return []; 
  }
};

//Asignar/Agregar sub menus a perfil
export const agregarSubMenu = async (perfilId, moduloIds) => {
  const peticion = await fetch(`${API_URL}/perfiles/asignar-menus/${perfilId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      moduloIds: moduloIds
    }),
  });

  const datos = await peticion.json();
  
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar los menús al perfil");
  }

  return datos;
};

//Obtener el menu por el perfil
export const obtenerMenuPorPerfil = async (profileId) => {
    try {
        const response = await fetch(`http://192.140.56.186:3000/menus/buscar/${profileId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window.localStorage.getItem("token")
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }
        
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Error en el servicio obtenerMenuPorPerfil:", error);
        return []; 
    }
};