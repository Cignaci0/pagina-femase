const API_URL = "http://localhost:3000";

//Obtener turnos
export const obtenerTurnos = async () => {
  try {
    const response = await fetch(`${API_URL}/turno`, {
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

//Crear turno
export const crearTurno = async (nombre, empresa, estado,) => {
  const peticion = await fetch(`${API_URL}/turno`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre: nombre,
      empresa: empresa,
      estado: estado,
      
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el turno");
  }
  return datos;
};

//Actualizar turno
export const actualizarTurno = async (editId, nombre, empresa, estado) => {
  const peticion = await fetch(`${API_URL}/turno/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre: nombre,
      empresa: empresa,
      estado: estado,
      
    }),
  });

  const data = await peticion.json();

  if (!peticion.ok) {
    throw new Error(data.message || "Error al actualizar el turno");
  }
  return data;
};



export const asignarEmpleados = async (id, empleadosIds)=>{
  const peticion = await fetch(`${API_URL}/turno/asignar-empleados/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      empleadosIds: empleadosIds
    }),
  });

  const data = await peticion.json();
  if (!peticion.ok) {
    throw new Error(data.message || "Error al asignar empleados al turno");
  }
  return data;
}

export const asignarTurnoACenco = async (turnoId, cencoId) => {
  const peticion = await fetch(`${API_URL}/turno/asignar-turnos/${turnoId}/${cencoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
   
  });

  const data = await peticion.json();
  if (!peticion.ok) {
    throw new Error(data.message || "Error al asignar turno al cenco");
  }
  return data;
}

export const asignarHorario = async(turnoId, diasIds, horariosId) => {
  const peticion = await fetch(`${API_URL}/turno/asignar-horario/${turnoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      id_dia: diasIds,
      id_horario: horariosId
    }),
  });

  const data = await peticion.json();
  if (!peticion.ok) {
    throw new Error(data.message || "Error al asignar horario al turno");
  }
  return data;
}

export const obtenerHorariosTurno= async(idturno) =>{
  const peticion = await fetch(`${API_URL}/turno/obtener-horario/${idturno}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
  });

  const data = await peticion.json();
  if (!peticion.ok) {
    throw new Error(data.message || "Error al obtener horarios");
  }
  return data;
}
