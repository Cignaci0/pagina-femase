import { API_URL } from "../config/config";


export const crearAusencia = async (datos) => {
    const response = await fetch(`${API_URL}/ausencias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            num_ficha: datos.empleado,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin,
            hora_inicio: datos.hora_inicio,
            hora_fin: datos.hora_fin,
            dia_completo: datos.dia_completo,
            tipo_ausencia: datos.tipo_ausencia
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al crear la ausencia");
    }
    return data;
};

export const obtenerAusencias = async (numFicha, fechaInicio, fechaFin) => {
    const response = await fetch(`${API_URL}/ausencias?numFicha=${numFicha}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener las ausencias");
    }
    return data;
};

export const editarAusencia = async (id, datos) =>{
    const response = await fetch(`${API_URL}/ausencias/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin,
            hora_inicio: datos.hora_inicio,
            num_ficha: datos.num_ficha,
            hora_fin: datos.hora_fin,
            dia_completo: datos.dia_completo,
            tipo_ausencia: datos.tipo_ausencia
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al editar la ausencia");
    }
    return data;
}

