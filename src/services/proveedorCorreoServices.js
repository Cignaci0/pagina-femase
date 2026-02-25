const API_URL = "http://localhost:3000";

//Obtener proveedores de correo
export async function obtenerProveedorCorreo() {
 const response = await fetch(`${API_URL}/proveedor-correo`, {
    method: 'GET',
    headers: {
        "Content-Type": "application/json",
    },
 });
 const data = await response.json();
 if (!response.ok) {
    throw new Error(data.message || "Error al obtener los proveedores de correo");
 }
 return data.proveedorCorreo;
}

//Crear proveedor de correo
export async function crearProveedorCorreo(nombre,dominio) {
 const response = await fetch(`${API_URL}/proveedor-correo/crear`, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({nombre,dominio}),
 });
 const data = await response.json();
 if (!response.ok) {
    throw new Error(data.message || "Error al crear el proveedor de correo");
 }
 return data;
}

//Actualizar proveedor de correo
export async function actualizarProveedorCorreo(id,nombre,dominio) {
 const response = await fetch(`${API_URL}/proveedor-correo/actualizar/${id}`, {
    method: 'PATCH',
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({nombre,dominio}),
 });
 const data = await response.json();
 if (!response.ok) {
    throw new Error(data.message || "Error al actualizar el proveedor de correo");
 }
 return data;
}



