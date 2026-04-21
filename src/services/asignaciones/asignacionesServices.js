import { API_URL } from "../../config/config";


//Asignar centros de costo a usuario
export const asignarCencos = async (userId, cencosIds) => {
  const peticion = await fetch(`${API_URL}/users/asignar-cencos/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      cencoIds: cencosIds,
    }),
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar centros de costo");
  }

  return datos;
};

//Asiganr turnos a centros de costo
export const asignarTurnos = async (cencoId, turnoIds) => {
  const peticion = await fetch(`${API_URL}/cencos/asignar-turnos/${cencoId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      turnoIds: turnoIds
    }),
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar turnos");
  }

  return datos;
};

//Asignar dispositivos a centro de costo 
export const asignarDispositivo = async (
  cencoId,
  nombre_cenco,
  direccion,
  region,
  comuna,
  email_general,
  email_notificacion,
  zona_extrema,
  usuario_creador,
  estado_id,
  departamento_id,
  dispositivos
) => {
  const peticion = await fetch(`${API_URL}/cencos/actualizar/${cencoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_cenco,
      direccion,
      region,
      comuna,
      email_general,
      email_notificacion,
      zona_extrema,
      usuario_creador,
      estado_id,
      departamento_id,
      dispositivos
    }),
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar dispositivos al centro de costo");
  }
  return datos;
};


//Asignar centros de costo a empleados
export const asignarCencosAEmpleados = async (runUsuario, cencoIds) => {
  const peticion = await fetch(`${API_URL}/empleado/asignar-cencos/${runUsuario}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      cencoIds,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar cencos");
  }
  return datos;
};

export const asignarTeletrabajo = async (idEmpleado, fecha_inicio, fecha_fin) => {
  const peticion = await fetch(`${API_URL}/teletrabajo/asignar/${idEmpleado}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      fecha_inicio,
      fecha_fin
    }),
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar teletrabajo");
  }
  return datos;
};