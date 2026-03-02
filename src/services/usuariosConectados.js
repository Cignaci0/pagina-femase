const API_URL = "http://localhost:3000";

export const obtenerUsuariosConectados = async () => {
  try {
    const response = await fetch(`${API_URL}/sesion-activa`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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