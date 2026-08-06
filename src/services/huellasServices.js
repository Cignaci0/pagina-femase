import { API_URL } from "../config/config";

// Obtener todas las huellas
export const obtenerHuellas = async () => {
  const token = window.localStorage.getItem("token");
  const peticion = await fetch(`${API_URL}/huellas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al obtener huellas");
  }

  return datos;
};

// Asignar dispositivos a una huella (por ficha y base64)
export const asignarDispositivosHuella = async (num_ficha, huella_base64, dispositivoIds) => {
  const token = window.localStorage.getItem("token");
  const peticion = await fetch(`${API_URL}/huellas/asignar-dispositivos`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      num_ficha,
      huella_base64,
      dispositivoIds
    }),
  });

  const datos = await peticion.json();

  if (!peticion.ok) {
    throw new Error(datos.message || "Error al asignar dispositivos a la huella");
  }

  return datos;
};
