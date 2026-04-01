const API_URL = "http://localhost:3000";

export const getMarcas = async (numFicha, fechaInicio, fechaFin) => {
    try {
        const response = await fetch(`${API_URL}/marcas?numFicha=${numFicha}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
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

export const crearMarca = async (datos) => {
    try {
        const response = await fetch(`${API_URL}/marcas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                fecha_marca: datos.fecha_marca,
                hora_marca: datos.hora_marca,
                evento: datos.evento,
                dispositivo_id: datos.dispositivo_id,
                num_ficha: datos.num_ficha,
                comentario: datos.comentario,
                id_tipo_marca: datos.tipo_marca_id,
            }),
        });
        if (!response.ok) {
            throw new Error("Error al crear marca");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

export const actualizarMarcas = async (editId, fecha_marca, hora_marca, evento, comentario) => {
    try {
        const response = await fetch(`${API_URL}/marcas/${editId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                fecha_marca: fecha_marca,
                hora_marca: hora_marca,
                evento: evento,
                comentario: comentario,
            }),
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

export const historialMarcas = async (idMarca) => {
    try {
        const response = await fetch(`${API_URL}/marcas-auditoria?idMarca=${idMarca}`, {
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

export const eliminarMarca = async (idMarca) => {
    try {
        const response = await fetch(`${API_URL}/marcas/${idMarca}`, {
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