const API_URL = "http://localhost:3000";

export const getTipoAusencia = async () => {
    try {
        const response = await fetch(`${API_URL}/tipo-ausencia`, {
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
        return data || [];
    } catch (error) {
        return [];
    }
}

export const createTipoAusencia = async (data) =>{
    const response = await fetch(`${API_URL}/tipo-ausencia/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            nombre: data.nombre,
            tipo: data.tipo,
            estado_id: data.estado_id,
            justifica_hrs: data.justifica_hrs,
            pagada_empleador: data.pagada_empleador
        }),
    });

    const datos = await response.json();
    if (!response.ok) {
        throw new Error(datos.message || "Error al crear el tipo de ausencia");
    }
    return datos;
}

export const updateTipoAusencia = async (id, data) => {
    const response = await fetch(`${API_URL}/tipo-ausencia/actualizar/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nombre: data.nombre,
            tipo: data.tipo,
            estado_id: data.estado_id,
            justifica_hrs: data.justifica_hrs,
            pagada_empleador: data.pagada_empleador
        }),
    });

    const datos = await response.json();
    if (!response.ok) {
        throw new Error(datos.message || "Error al actualizar el tipo de ausencia");
    }
    return datos;
}