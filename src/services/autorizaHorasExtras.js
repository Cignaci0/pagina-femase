import { API_URL } from "../config/config";


//Obtener autorizaciones de horas extras
export const obtenerAutorizacionesHE = async (numFicha, fechaInicio, fechaFin) => {
    try {
        const response = await fetch(`${API_URL}/autoriza-horas-extras?numFicha=${numFicha}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
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

//Actualizar estado de autorizacion de horas extras
export const actualizarAutorizacionHE = async (id, estado, multiplicador, horas_extras ) => {
    try {
        const body = { estado };
        if (multiplicador !== undefined) {
            body.multiplicador = multiplicador;
        }
        if (horas_extras !== undefined) {
            body.horas_extras = horas_extras;
        }

        const response = await fetch(`${API_URL}/autoriza-horas-extras/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + window.localStorage.getItem("token"),
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return data || false;
    } catch (error) {
        return false;
    }
};

