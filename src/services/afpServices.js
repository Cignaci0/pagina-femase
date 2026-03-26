const API_URL = "http://localhost:3000";

//Obtener todas las afp
export async function obtenerAfp() {
    const peticion = await fetch(`${API_URL}/afp`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
    });
    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al obtener las AFP");
    }
    return datos.afp;
}

//Crear Afp
export async function crearAfp(nombre_afp, estado_id) {
    const peticion = await fetch(`${API_URL}/afp/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({ nombre_afp, estado_id }),
    });
    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al crear la AFP");
    }
    return datos;
}

export async function editarAfp(id, nombre_afp, estado_id) {
    const peticion = await fetch(`${API_URL}/afp/actualizar/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({ nombre_afp, estado_id }),
    });
    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al editar la AFP");
    }
    return datos;
}