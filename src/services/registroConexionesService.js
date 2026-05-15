import { API_URL } from "../config/config";

export const obtenerConexiones = async (idEmpresa, page, limit, idUsuario) => {
    try {
        let url = `${API_URL}/registro-conexiones?page=${page}&limit=${limit}`;
        if (idEmpresa) {
            url += `&empresa_id=${idEmpresa}`;
        }
        if (idUsuario) {
            url += `&idUsuario=${idUsuario}`;
        }
        const response = await fetch(url, {
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
