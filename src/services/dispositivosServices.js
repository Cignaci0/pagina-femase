import { API_URL } from "../config/config";


//Obtener dispotivos
export const obtenerDispositivo = async () => {
  try {
    const response = await fetch(`${API_URL}/dispositivo`, {
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

//Crear dispotivos
export const crearDispositivo = async (
  ubicacion,
  comuna,
  modelo,
  fabricante,
  version_firmware,
  direccion_ip,
  gateway,
  dns,
  estado,
  tipo_dispositivo,
  nombre,
) => {
  const peticion = await fetch(`${API_URL}/dispositivo/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      ubicacion: ubicacion,
      comuna: comuna,
      modelo: modelo,
      fabricante: fabricante,
      version_firmware: version_firmware,
      direccion_ip: direccion_ip,
      gateway: gateway,
      dns: dns,
      estado_id: estado,
      tipo_dispositivo_id: tipo_dispositivo,
      nombre: nombre,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el dispositivo");
  }
  return datos;
};

//Actualizar dispositivo
export const actualizarDispositivo = async (
  editId,
  ubicacion,
  comuna,
  modelo,
  fabricante,
  version_firmware,
  direccion_ip,
  gateway,
  dns,
  estado,
  tipo_dispositivo,
  nombre,
) => {
  const peticion = await fetch(`${API_URL}/dispositivo/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      ubicacion: ubicacion,
      comuna: comuna,
      modelo: modelo,
      fabricante: fabricante,
      version_firmware: version_firmware,
      direccion_ip: direccion_ip,
      gateway: gateway,
      dns: dns,
      estado_id: estado,
      tipo_dispositivo_id: tipo_dispositivo,
      nombre: nombre,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el dispositivo");
  }
  return datos;
};

export const obtenerDispositivosPorEmpleado = async (rut) => {
  try {
    const response = await fetch(`${API_URL}/dispositivo/buscarPorEmpleado/${rut}`, {
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
