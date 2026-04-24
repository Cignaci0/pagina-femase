import { API_URL } from "../config/config";

export const tieneteletrabajo = async (runEmpleado) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/tiene/${runEmpleado}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }
        const datos = await response.json();
        return datos || [];
    } catch (error) {
        return [];
    }
}

export const obtenerEmpleadosPorTeletrabajo = async (idEmpresa, pagina, limite) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/obtenerTeletrabajos/${idEmpresa}?page=${pagina}&limit=${limite}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }
        const datos = await response.json();
        return datos || [];
    } catch (error) {
        return [];
    }
}

export const obtenerTeletrabajosPorEmpleado = async (idEmpleado, pagina) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/obtenerTeleEmpleado/${idEmpleado}?page=${pagina}&limit=50`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }
        const datos = await response.json();
        return datos || [];
    } catch (error) {
        return [];
    }
}


export const editarTeletrabajo = async (idEmpleado, id, horarioId) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/editarTeletrabajo/${idEmpleado}/${id}/${horarioId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }
        const datos = await response.json();
        return datos || [];
    } catch (error) {
        return [];
    }
}

export const eliminarTeletrabajo = async (idEmpleado, id) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/eliminarTeletrabajo/${idEmpleado}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }
        const datos = await response.json();
        return datos || [];
    } catch (error) {
        return [];
    }
}
