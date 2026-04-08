import { API_URL } from "../config/config";


export const reporteAsistencia = async (numFicha, fechaInicio, fechaFin) => {
    try {
        const response = await fetch(`${API_URL}/reportes/asistencia/pdf?numFicha=${numFicha}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
        });
        if (!response.ok) {
            throw new Error('Error al descargar el reporte');
        }
        const blob = await response.blob();
        return blob;
    } catch (error) {
        return [];
    }
}