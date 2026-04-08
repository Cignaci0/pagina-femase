import { API_URL } from "../config/config";


//Obtener autorizaciones de horas extras
export const obtenerAutorizacionesHE = async () => {
    try {
        const response = await fetch(`${API_URL}/autoriza-horas-extras`, {
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
        return data || [];
    } catch (error) {
        return [];
    }
};
