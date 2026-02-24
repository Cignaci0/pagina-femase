const API_URL = "http://localhost:3000";

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
export const crearHorario = async (hora_entrada, hora_salida, empresa_id) => {
  const peticion = await fetch(`${API_URL}/horario`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      hora_entrada: hora_entrada,
      hora_salida: hora_salida,
      empresa: empresa_id
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el horario");
  }
  return datos;
};

//Actualizar horario
export const actualizarHorario = async (editId, hora_entrada, hora_salida, empresa) => {
  const peticion = await fetch(`${API_URL}/horario/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      hora_entrada: hora_entrada,
      hora_salida: hora_salida,
      empresa: empresa
    }),
  });
  
  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el horario");
  }
  return datos;
};