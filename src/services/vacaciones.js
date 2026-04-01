const API_URL = "http://localhost:3000";

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