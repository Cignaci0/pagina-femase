import { API_URL } from "../config/config";

export const obtenerConexiones = async (idEmpresa, fechaInicio, fechaFin) => {
    try {
        const response = await fetch(`${API_URL}/registro-conexiones?empresa_id=${idEmpresa}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
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
