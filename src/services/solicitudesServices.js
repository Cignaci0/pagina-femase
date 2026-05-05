import { API_URL } from "../config/config";

export const obtenerSolicitudes = async (empresa_id) => {
    try {
        const response = await fetch(`${API_URL}/solicitudes?id_empresa=${empresa_id}`, {
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

export const getByEmpleado = async (usuario_id) => {
    try {
        const response = await fetch(`${API_URL}/solicitudes/empleado/${usuario_id}`, {
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
}

export const crearSolicitud = async (tipo, texto, idUsuario, estado, id_usuario_empleador) => {
    const peticion = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            tipo,
            texto,
            estado,
            idUsuario,
            id_usuario_empleador

        }),
    });

    const datosRes = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datosRes.message || "Error al crear la solicitud");
    }
    return datosRes;
};

export const actualizarEstadoSolicitud = async (id, estado, motivo) => {
    const peticion = await fetch(`${API_URL}/solicitudes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({ estado, motivo:motivo || null }),
    });

    const datosRes = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datosRes.message || "Error al actualizar la solicitud");
    }
    return datosRes;
};
