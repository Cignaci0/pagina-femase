import { API_URL } from "../config/config";


//Obtener perfiles
export const obtenerPerfiles = async () => {
  try {
    const response = await fetch(`${API_URL}/perfiles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + window.localStorage.getItem("token"),
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    return [];
  }
};

//Crear perfil
export const crearPerfilUsuario = async (nombre_perfil, estado) => {
  const peticion = await fetch(`${API_URL}/perfiles/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + window.localStorage.getItem("token")
    },
    body: JSON.stringify({
      nombre_perfil: nombre_perfil,
      estado: estado
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el perfil");
  }
  return datos;
};

//Actualizar perfil
export const actualizarPerfil = async (editId, editNombre, editEstado) => {
  const peticion = await fetch(`${API_URL}/perfiles/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_perfil: editNombre,
      estado: editEstado,
    }),
  });
  
  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el perfil");
  }
  return datos;
};