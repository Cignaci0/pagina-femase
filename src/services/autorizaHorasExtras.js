const API_URL = "http://localhost:3000";

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
