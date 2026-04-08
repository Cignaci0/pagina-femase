import { API_URL } from "../config/config";


//Obtener proveedores de correo
export async function obtenerProveedorCorreo() {
   const response = await fetch(`${API_URL}/proveedor-correo`, {
      method: 'GET',
      headers: {
         "Content-Type": "application/json",
         "Authorization": "Bearer " + window.localStorage.getItem("token"),
      },
   });
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.message || "Error al obtener los proveedores de correo");
   }
   return data.proveedorCorreo;
}

//Crear proveedor de correo
export async function crearProveedorCorreo(dominio, id) {
   const response = await fetch(`${API_URL}/proveedor-correo/crear`, {
      method: 'POST',
      headers: {
         "Content-Type": "application/json",
         "Authorization": "Bearer " + window.localStorage.getItem("token"),
      },
      body: JSON.stringify({
         dominio,
         ...(id ? { empresa: id } : {})
      }),
   });
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.message || "Error al crear el proveedor de correo");
   }
   return data;
}

//Actualizar proveedor de correo
export async function actualizarProveedorCorreo(id, dominio, empresa) {
   const response = await fetch(`${API_URL}/proveedor-correo/actualizar/${id}`, {
      method: 'PATCH',
      headers: {
         "Content-Type": "application/json",
         "Authorization": "Bearer " + window.localStorage.getItem("token"),
      },
      body: JSON.stringify({
         dominio,
         ...(empresa ? { empresa } : {})
      }),
   });
   const data = await response.json();
   if (!response.ok) {
      throw new Error(data.message || "Error al actualizar el proveedor de correo");
   }
   return data;
}



