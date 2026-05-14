import { API_URL } from "../config/config";


//Obtener documentos
export const obtenerDocumento = async (empresa_id) => {
    try {
        const response = await fetch(`${API_URL}/documento?empresa_id=${empresa_id}`, {
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

//Crear documento
export const crearDocumento = async (
    nombre,
    tipo,
    texto,
    empresa_id
) => {
    const peticion = await fetch(`${API_URL}/documento`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            nombre: nombre,
            tipo: tipo,
            texto: texto,
            empresa: empresa_id
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al crear el documento");
    }
    return datos;
};

//Actualizar documento
export const actualizarDocumento = async (
    editId,
    nombre,
    tipo,
    texto,
    empresa_id
) => {
    const peticion = await fetch(`${API_URL}/documento/${editId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            nombre: nombre,
            tipo: tipo,
            texto: texto,
            empresa: empresa_id
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al actualizar el documento");
    }
    return datos;
};


export const crearFirma = async (
    nombre,
    tipo,
    texto,
    empresa_id,
    empleado_id,
    usuario_id
) => {
    const peticion = await fetch(`${API_URL}/firmas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            nombre: nombre,
            tipo: tipo,
            texto: texto,
            empresa: empresa_id,
            id_empleado: empleado_id,
            usuario: usuario_id
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al crear la firma");
    }
    return datos;
};

export const obtenerFirma = async (empresa_id, usuario_id) => {
    try {
        const response = await fetch(`${API_URL}/firmas?empresa_id=${empresa_id}&usuario_id=${usuario_id}`, {
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

export const aprobarRechazarFirma = async (id_firma, usuario_id, pin, estado,motivo) => {
    const peticion = await fetch(`${API_URL}/firmas/${id_firma}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
        body: JSON.stringify({
            estado: estado,
            usuario_id: usuario_id,
            pin: pin,
            motivo: motivo
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al aprobar la firma");
    }
    return datos;
};

export const eliminarDocumento = async (id) => {
    const peticion = await fetch(`${API_URL}/documento/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("token"),
        },
    });
    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al eliminar el documento");
    }
    return datos;
};
