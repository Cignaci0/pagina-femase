const API_URL = "http://localhost:3000";


export const getTurnosRotativos = async () => {
    try {
        const response = await fetch(`${API_URL}/asignacion-turno-rotativo`, {
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




export const asignarTurnosRotativos = async (datosAsignar) => {
    const peticion = await fetch(`${API_URL}/asignacion-turno-rotativo`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            empleado_id: datosAsignar.empleado,
            horario_id: datosAsignar.horario,
            fecha_inicio_turno: datosAsignar.fecha_inicio_turno,
            fecha_fin_turno: datosAsignar.fecha_fin_turno,
        }),
    });

    const datos = await peticion.json();
    if (!peticion.ok) {
        throw new Error(datos.message || "Error al asignar turnos rotativos");
    }
    return datos;
}