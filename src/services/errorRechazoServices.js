import { API_URL } from "../config/config";



//Crear error de rechazo
export const crearErrorRechazo = async (descripcion) => {
    const response = await fetch(`${API_URL}/error-rechazo/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({ descripcion }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al crear el error de rechazo");
    }
    return data || [];
}

//Obtener error de rechazo
export const obtenerErrorRechazo = async () => {

    const response = await fetch(`${API_URL}/error-rechazo`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener el error de rechazo");
    }
    return data.errorRechazo || [];
}

//Actualizar error de rechazo
export const actualizarErrorRechazo = async (id, descripcion) => {
    const response = await fetch(`${API_URL}/error-rechazo/actualizar/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({ descripcion }),
    });
    const data = response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el error de rechazo");
    }
    return data || [];
}
