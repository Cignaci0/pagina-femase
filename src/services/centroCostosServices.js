import { API_URL } from "../config/config";


// Obtener centros de costo
export const obtenerCentroCostos = async () => {
  try {
    const response = await fetch(`${API_URL}/cencos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("token"),
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

// Crear centro de costo
export const crearCentroCosto = async (
  nombre_cenco,
  direccion,
  region,
  comuna,
  email_general,
  email_notificacion,
  zona_extrema,
  estado,
  depto,
  permite_turno_r
) => {
  const peticion = await fetch(`${API_URL}/cencos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_cenco: nombre_cenco,
      direccion: direccion,
      region: region,
      comuna: comuna,
      email_general: email_general,
      email_notificacion: email_notificacion,
      zona_extrema: zona_extrema,
      estado_id: estado,
      departamento_id: depto,
      permite_turno_r: permite_turno_r
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el centro de costo");
  }
  return datos;
};

// Actualizar centro de costo
export const actualizarCentroCosto = async (
  editId,
  nombre_cenco,
  direccion,
  region,
  comuna,
  email_general,
  email_notificacion,
  zona_extrema,
  estado,
  depto,
  permite_turno_r
) => {
  const peticion = await fetch(`${API_URL}/cencos/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_cenco: nombre_cenco,
      direccion: direccion,
      region: region,
      comuna: comuna,
      email_general: email_general,
      email_notificacion: email_notificacion,
      zona_extrema: zona_extrema,
      estado_id: estado,
      departamento_id: depto,
      permite_turno_r: permite_turno_r
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el centro de costo");
  }
  return datos;
};

export const obtenerCencosPorDepto = async (deptoId) => {
  try {
    const response = await fetch(`${API_URL}/cencos/por-departamento/${deptoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("token"),
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