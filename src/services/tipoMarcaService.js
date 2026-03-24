const API_URL = "http://localhost:3000";


export const obtenerTiposMarcas = async () => {
    try {
        const response = await fetch(`${API_URL}/tipo-marcas`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
        })
        if (!response.ok) {
            throw new Error("Error al obtener los tipos de marcas");
        }

        const data = await response.json()
        return data || []
    } catch (error) {
        return []
    }
};

export const crearTipoMarca = async (nombre, estado_id) => {
    try {
        const response = await fetch(`${API_URL}/tipo-marcas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                nombre: nombre,
                estado_id: estado_id,
            }),
        })
        if (!response.ok) {
            throw new Error("Error al crear el tipo de marca");
        }
        return true;
    } catch (error) {
        throw error;
    }
};

export const actualizarTipoMarca = async (id, nombre, estado_id, orden) => {
    try {
        const response = await fetch(`${API_URL}/tipo-marcas/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                nombre: nombre,
                estado_id: estado_id,
            }),
        })
        if (!response.ok) {
            throw new Error("Error al actualizar el tipo de marca");
        }
        return true;
    } catch (error) {
        throw error;
    }
};



