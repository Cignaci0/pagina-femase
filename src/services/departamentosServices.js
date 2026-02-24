const API_URL = "http://localhost:3000";

//Obtener departamentos
export const obtenerDepartamentos = async () => {
  try {
    const response = await fetch(`${API_URL}/departamentos`, {
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
    return data.departamentos || [];
  } catch (error) {
    return [];
  }
};

//Crear departamento
export const crearDepto = async (nuevoNombre, nuevoEstado, nuevaEmpresa) => {
  const peticion = await fetch(`${API_URL}/departamentos/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_departamento: nuevoNombre,
      estado: nuevoEstado,
      empresa: nuevaEmpresa,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el departamento");
  }
  return datos;
};

//Actualizar departamento
export const actualizarDepto = async (
  editId,
  editNombre,
  editEstado,
  editEmpresa,
) => {
  const peticion = await fetch(
    `${API_URL}/departamentos/actualizar/${editId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("token"),
      },
      body: JSON.stringify({
        nombre_departamento: editNombre,
        estado: editEstado,
        empresa: editEmpresa,
      }),
    },
  );

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el departamento");
  }
  return datos;
};
