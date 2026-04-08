import { API_URL } from "../config/config";


export const obtenerUsuariosConectados = async () => {
  try {
    const response = await fetch(`${API_URL}/sesion-activa`, {
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


export const cerrarSesion = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),

    },
  });

  if (!response.ok) {
    throw new Error("Error al cerrar la sesión");
  }

  return response.json();
}