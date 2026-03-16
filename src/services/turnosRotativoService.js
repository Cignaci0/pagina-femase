const API_URL = "http://localhost:3000";


export const getTurnosRotativos = async () => {
    try {
        const response = await fetch(`${API_URL}/turno-rotativo`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
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

export const CrearTurnosRotativos = async (empresa, nombre, nocturno, estado) => {
    const peticion = await fetch(`${API_URL}/turno-rotativo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            empresa: empresa,
            nombre: nombre,
            nocturno: nocturno,
            estado: estado,
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al crear el turno rotativo");
    }
    return datos;
}


export const ActualizarTurnosRotativos = async (id, empresa, nombre, nocturno, estado) => {
    const peticion = await fetch(`${API_URL}/turno-rotativo/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            empresa: empresa,
            nombre: nombre,
            nocturno: nocturno,
            estado: estado,
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al actualizar el turno rotativo");
    }
    return datos;
}

export const asignarTurnosRotativos = async (datos) => {
    const peticion = await fetch(`${API_URL}/turno-rotativo/asignar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            empleado: datos.empleado,
            turnoRotativo: datos.turnoRotativo,
            horario: datos.horario,
            fecha_turno: datos.fecha_turno,
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al asignar turnos rotativos");
    }
    return datos;
}