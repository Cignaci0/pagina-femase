import { API_URL } from "../config/config";

export const tieneteletrabajo = async (runEmpleado) => {
    try {
        const response = await fetch(`${API_URL}/teletrabajo/tiene/${runEmpleado}`, {
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
