const API_URL = "http://localhost:3000";

export const crearAusencia = async (datos) => {
    const response = await fetch(`${API_URL}/ausencias`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            num_ficha: datos.empleado,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin,
            hora_inicio: datos.hora_inicio,
            hora_fin: datos.hora_fin,
            dia_completo: datos.dia_completo,
            tipo_ausencia: datos.tipo_ausencia
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al crear la ausencia");
    }
    return data;
};
