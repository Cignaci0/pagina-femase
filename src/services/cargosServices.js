const API_URL = "http://localhost:3000";

// Obtener cargos
export const obtenerCargos = async () => {
  try {
    const response = await fetch(`${API_URL}/cargos`, {
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
    return data.cargos || [];
  } catch (error) {
    return [];
  }
};

// Crear cargo
export const crearCargo = async (nombre, estado, empresa_id, tipo_cargo) => {
  const peticion = await fetch(`${API_URL}/cargos/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre: nombre,
      estado: estado,
      empresa: empresa_id,
      tipo_cargo: tipo_cargo,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el cargo");
  }
  return datos;
};

// Actualizar cargo
export const actualizarCargo = async (editId, nombre, estado, empresa_id, tipo_cargo) => {
  const peticion = await fetch(`${API_URL}/cargos/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre: nombre,
      estado: estado,
      empresa: empresa_id,
      tipo_cargo: tipo_cargo,
    }),
  });
  
  const data = await peticion.json();
  if (!peticion.ok) {
    throw new Error(data.message || "Error al actualizar el cargo");
  }
  return data;
};
