import { API_URL } from "../config/config";


//Obtener tipos dispositvos
export const obtenerTiposDispositivo = async () => {
  try {
    const response = await fetch(`${API_URL}/tipo-dispositivo`, {
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
    return data.tipos || [];
  } catch (error) {
    return [];
  }
};

//Crear tipo de dispotivos
export const crearTipoDispo = async (nuevoNombre, nuevoDescripcion) => {
  const peticion = await fetch(`${API_URL}/tipo-dispositivo/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + window.localStorage.getItem("token")
    },
    body: JSON.stringify({
      nombre_tipo: nuevoNombre,
      descripcion: nuevoDescripcion,
      estado: 1 
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el tipo de dispositivo");
  }
  return datos;
};

//Actualizar tipo de dispositivo
export const actualizarTipoDis = async (editId, editNombre, editDescripcion) => {
  const peticion = await fetch(`${API_URL}/tipo-dispositivo/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_tipo: editNombre,
      descripcion: editDescripcion,
      estado: 1 // Mantenido como activo
    }),
  });
  
  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el tipo de dispositivo");
  }
  return datos;
};