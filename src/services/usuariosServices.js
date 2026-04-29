import { API_URL } from "../config/config";


//Obtener usuarios
export const obtenerUsuarios = async () => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.localStorage.getItem("token")
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al cargar los usuarios');
  }

  return data.usuarios || [];
};

//Crear usuario
export const crearUsuario = async (
  username,
  password,
  estado,
  nombres,
  apellido_paterno,
  apellido_materno,
  email,
  perfil,
  run_usuario,
  empresa
) => {
  const peticion = await fetch(`${API_URL}/users/crear`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      username,
      password,
      estado,
      nombres,
      apellido_paterno,
      apellido_materno,
      email,
      perfil,
      run_usuario,
      empresa,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el usuario");
  }
  return datos;
};

//Actualizar usuario
export const actualizarUsuario = async (
  editId,
  username,
  estado,
  nombres,
  apellido_paterno,
  apellido_materno,
  email,
  perfil,
  run_usuario,
  empresa
) => {
  const peticion = await fetch(`${API_URL}/users/actualizar/${editId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      username,
      estado,
      nombres,
      apellido_paterno,
      apellido_materno,
      email,
      perfil,
      run_usuario,
      empresa,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el usuario");
  }
  return datos;
};

export const cambiarPassword = async (idUser, passwordActual, passwordNueva) => {
  const peticion = await fetch(`${API_URL}/users/cambiar-password/${idUser}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      contrasena_actual: passwordActual,
      contrasena_nueva: passwordNueva
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al cambiar la contraseña");
  }
  return datos;
}