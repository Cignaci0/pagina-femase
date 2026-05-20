import { API_URL } from "../config/config";


export const obtenerHorasCompensacion = async (idUsuario) => {
    try {
        const response = await fetch(`${API_URL}/dias-compensacion?idUsuario=${idUsuario}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
};

export const descontarHorasCompensacion = async (idRegistro, horasADescontar, fechaInicio, fechaFin, estado = "P") => {
    try {
        const body = {
            horas_descontar: horasADescontar,
            estado
        };
        if (fechaInicio) body.fecha_inicio_descanso = fechaInicio; // Formato: "YYYY-MM-DD"
        if (fechaFin) body.fecha_fin_descanso = fechaFin;         // Formato: "YYYY-MM-DD"

        const response = await fetch(`${API_URL}/dias-compensacion/${idRegistro}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.message || "Error al procesar solicitud de días de compensación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export const aprobarRechazarHorasCompensacion = async (idRegistro, estado) => {
    try {
        const response = await fetch(`${API_URL}/dias-compensacion/${idRegistro}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                estado:estado
            }),
        });
        if (!response.ok) {
            throw new Error("Error al aprobar horas de compensación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export const buscarHorasCompensacionPendientes = async (idEmpleado) => {
    try {
        const response = await fetch(`${API_URL}/dias-compensacion/pendiente/${idEmpleado}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
}
