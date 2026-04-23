import { API_URL } from "../config/config";


//Obtener empresas
export const obtenerEmpresas = async () => {
  try {
    const response = await fetch(`${API_URL}/empresas`, {
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
    return data.empresas || [];
  } catch (error) {
    return [];
  }
};

//Crear empresa
export const crearEmpresa = async (
  nombre_empresa,
  rut_empresa,
  direccion_empresa,
  comuna_empresa,
  email_empresa,
  estado,
  email_noti
) => {
  const peticion = await fetch(`${API_URL}/empresas/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token")
    },
    body: JSON.stringify({
      nombre_empresa: nombre_empresa,
      rut_empresa: rut_empresa,
      direccion_empresa: direccion_empresa,
      comuna_empresa: comuna_empresa,
      email_empresa: email_empresa,
      estado: estado,
      email_noti: email_noti,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear la empresa");
  }
  return datos;
};

//Actulizar empresa
export const actualizarEmpresa = async (
  editId,
  editNombre,
  editRun,
  editDireccion,
  editComuna,
  editEstado,
  editEmail,
  editNombreContacto,
  editTelefonoContacto,
  editEmailNoti

) => {
  const peticion = await fetch(`${API_URL}/empresas/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      nombre_empresa: editNombre,
      rut_empresa: editRun,
      direccion_empresa: editDireccion,
      comuna_empresa: editComuna,
      email_empresa: editEmail,
      estado: editEstado,
      nombre_contacto: editNombreContacto || null,
      telefono_contacto: editTelefonoContacto || null,
      email_noti: editEmailNoti || null,
    }),
  });
  
  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar la empresa");
  }
  return datos;
};

export const actualizarHorarioLegal = async (horario) => {
  const peticion = await fetch(`${API_URL}/horas-legales/1`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },body: JSON.stringify({
      hora: horario
    })
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el horario legal");
  }
  return datos;
};

export const actualizarHorarioEmpresa = async (id, horario) => {
  const peticion = await fetch(`${API_URL}/empresas/actualizarHorario/${id}/${horario}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el horario");
  }
  return datos;
};

export const obtenerHorarioLegal = async() => {
  const peticion = await fetch(`${API_URL}/horas-legales`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al obtener el horario legal");
  }
  return datos;
};
