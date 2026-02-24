const API_URL = "http://localhost:3000";

// Funcion para iniciar sesion
export const login = async (usuario, password) => {
  const peticion = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usuario, password: password })
  });
  const datos = await peticion.json();
  if (!peticion.ok) throw new Error(datos.message || "Error al conectar");
  return datos;
};

// Función para solicitar el código de recuperación
export const obtenerCodigo = async (run) => {
  const response = await fetch(`${API_URL}/users/recuperar-clave/${run}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + window.localStorage.getItem("token"),
    },
  });
  
  const datos = await response.json();
  
  if (!response.ok) {
    throw new Error(datos.message || "Error al solicitar código");
  }
  return datos;
};

// Función para cambiar la contraseña usando el código
export const resetearClave = async (run, codigo, nuevaClave) => {
  const peticion = await fetch(`${API_URL}/users/resetear-clave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      run: run,
      codigo: codigo,
      nuevaClave: nuevaClave
    }),
  });
  
  const datos = await peticion.json();
  
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al resetear la clave");
  }
  return datos;
};