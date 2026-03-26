const API_URL = "http://localhost:3000";

//Obtener feriados
export const obtenerFeriados = async () => {
    const response = await fetch(`${API_URL}/feriados`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener los feriados");
    }
    return data || [];
}

export const crearFeriado = async (feriado) => {
    const response = await fetch(`${API_URL}/feriados/crear`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify(
            {
                fecha: feriado.fecha,
                tipo_feriado: feriado.tipo_feriado,
                nombre: feriado.nombre,
                observacion: feriado.observacion,
                irrenunciable: feriado.irrenunciable,
                tipo: feriado.tipo,
                respaldo_legal: feriado.respaldo_legal,
                region: feriado.region,
                comuna: feriado.comuna
            }
        )
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || "Error al crear el feriado");
    }
    return data;
}

export const editarFeriado = async (id,feriado) => {
    const response = await fetch(`${API_URL}/feriados/actualizar/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify(
            {
                fecha: feriado.fecha,
                tipo_feriado: feriado.tipo_feriado,
                nombre: feriado.nombre,
                observacion: feriado.observacion,
                irrenunciable: feriado.irrenunciable,
                tipo: feriado.tipo,
                respaldo_legal: feriado.respaldo_legal,
                region: feriado.region,
                comuna: feriado.comuna
            }
        )
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || "Error al crear el feriado");
    }
    return data;
}
