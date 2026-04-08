import { API_URL } from "../config/config";


export const obtenerDiasDisponibles = async () => {
    try {
        const response = await fetch(`${API_URL}/vacaciones/dias-disponibles`, {
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
}

export const obtenerVacaciones = async (numFicha, fechaInicio, fechaFin) => {
    try {
        const response = await fetch(`${API_URL}/vacaciones?numFicha=${numFicha}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
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
}

export const generarSolicitudVacaciones = async (datosPayload) => {
    try {
        const response = await fetch(`${API_URL}/vacaciones/solicitud`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                fechaInicio: datosPayload.fechaInicio,
                fechaFin: datosPayload.fechaFin,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al generar la solicitud de vacaciones");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

export const crearSolicitudVacaciones = async (numFicha, fechaInicio, fechaFin, estado) => {
    try {
        const response = await fetch(`${API_URL}/vacaciones/solicitud?numFicha=${numFicha}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify({
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                estadoId: estado,
            }),
        });
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data || [];
    } catch (error) {
        return [];
    }
}

export const aprobarRechazar = async (id, estado) => {
    try {
        const response = await fetch(`${API_URL}/vacaciones/aprobar-rechazar?idSolicitud=${id}&estado=${estado}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error al aprobar o rechazar la solicitud de vacaciones");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

export const generarreporte = async (numFicha) => {
    try {
        const response = await fetch(`${API_URL}/reportes/vacaciones/pdf?numFicha=${numFicha}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + window.localStorage.getItem("token"),
            },
        });
        if (!response.ok) {
            throw new Error('Error al descargar el reporte');
        }
        const blob = await response.blob();
        return blob;
    } catch (error) {
        return null;
    }
}