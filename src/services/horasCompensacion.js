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

export const descontarHorasCompensacion = async (idRegistro, horasADescontar) => {
    try {
        const response = await fetch(`${API_URL}/dias-compensacion/${idRegistro}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                horas_descontar: horasADescontar,
            }),
        });
        if (!response.ok) {
            throw new Error("Error al descontar horas de compensación");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
};
