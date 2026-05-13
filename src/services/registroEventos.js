import { API_URL } from "../config/config";

export const registrarEvento = async () => {
    try {
        const response = await fetch(`${API_URL}/registro-evento`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
        });
        if (!response.ok) {
            throw new Error('Error al registrar el evento');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}