import { API_URL } from "../config/config";


export const obtenerHorasCompensacion = async (usuarioId) => {
    try {
        const response = await fetch(`${API_URL}/horas-compensacion/empleado/${usuarioId}`, {
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

export const transferirHorasCompensacion = async (usuarioId, periodo, horasATransferir) => {
    try {
        const body = { usuarioId, periodo, horasATransferir };
        console.log("--> POST /horas-compensacion/transferir PAYLOAD:", body);
        
        const response = await fetch(`${API_URL}/horas-compensacion/transferir`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err?.message || "Error al transferir horas");
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const descontarHorasCompensacion = async (usuarioId, horas_solicitadas, fecha_solicitada, momento_jornada = null) => {
    try {
        const body = {
            usuarioId,
            horas_solicitadas,
            fecha_solicitada
        };
        if (momento_jornada) body.momento_jornada = momento_jornada;

        console.log("--> POST /solicitud-horas-compensacion PAYLOAD:", body);

        const response = await fetch(`${API_URL}/solicitud-horas-compensacion`, {
            method: "POST",
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

export const aprobarRechazarHorasCompensacion = async (idRegistro, estado, autorizador = "Supervisor") => {
    try {
        let response;
        if (estado === "A") {
            response = await fetch(`${API_URL}/solicitud-horas-compensacion/${idRegistro}/aprobar`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + window.localStorage.getItem("token"),
                },
                body: JSON.stringify({ autorizador })
            });
        } else {
            response = await fetch(`${API_URL}/solicitud-horas-compensacion/${idRegistro}/rechazar`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + window.localStorage.getItem("token"),
                }
            });
        }

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const backendMessage = Array.isArray(err?.message) ? err.message.join(", ") : err?.message;
            throw new Error(backendMessage || "Error al aprobar/rechazar horas de compensación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};

export const buscarHorasCompensacionPendientes = async (empleadoId) => {
    try {
        const response = await fetch(`${API_URL}/solicitud-horas-compensacion/buscar?empleadoId=${empleadoId}`, {
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
