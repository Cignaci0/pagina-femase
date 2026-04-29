import { API_URL } from "../config/config";


//Obtener horarios
export const obtenerHorarios = async () => {
  try {
    const response = await fetch(`${API_URL}/horario`, {
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

//Crear horario
export const crearHorario = async (hora_entrada, hora_salida, empresa_id, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion) => {
  const peticion = await fetch(`${API_URL}/horario/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      hora_entrada: hora_entrada,
      hora_salida: hora_salida,
      empresa: empresa_id,
      holgura_mins: holgura_mins,
      colacion: colacion,
      nocturno:nocturno,
      hora_inicio_colacion: hora_entrada_colacion,
      hora_fin_colacion: hora_salida_colacion,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el horario");
  }
  return datos;
};

//Actualizar horario
export const actualizarHorario = async (editId, hora_entrada, hora_salida, empresa, holgura_mins, colacion, nocturno, hora_entrada_colacion, hora_salida_colacion) => {
  const peticion = await fetch(`${API_URL}/horario/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      hora_entrada: hora_entrada,
      hora_salida: hora_salida,
      empresa: empresa,
      holgura_mins: holgura_mins,
      colacion: colacion,
      nocturno:nocturno,
      hora_inicio_colacion: hora_entrada_colacion,
      hora_fin_colacion: hora_salida_colacion,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el horario");
  }
  return datos;
};