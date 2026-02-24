const API_URL = "http://localhost:3000";

//Obtener empleados
export const obtenerEmpleados = async () => {
  try {
    const response = await fetch(`${API_URL}/empleado`, {
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

//crear empleado
export const crearEmpleado = async (datosEmpleado) => {
  const peticion = await fetch(`${API_URL}/empleado`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      run: datosEmpleado.run,
      nombres: datosEmpleado.nombres,
      apellido_paterno: datosEmpleado.apellido_paterno,
      apellido_materno: datosEmpleado.apellido_materno,
      fecha_nacimiento: datosEmpleado.fecha_nacimiento,
      direccion: datosEmpleado.direccion,
      email: datosEmpleado.email,
      sexo: datosEmpleado.sexo,
      telefono_fijo: datosEmpleado.telefono_fijo,
      telefono_movil: datosEmpleado.telefono_movil,
      comuna: datosEmpleado.comuna,
      fecha_ini_contrato: datosEmpleado.fecha_ini_contrato,
      contrato_indefinido: datosEmpleado.contrato_indefinido,
      fecha_fin_contrato: datosEmpleado.fecha_fin_contrato,
      art_22: datosEmpleado.art_22,
      autoriza_ausencia: datosEmpleado.autoriza_ausencia,
      clave: datosEmpleado.clave,
      empresa: datosEmpleado.empresa,
      cargo: datosEmpleado.cargo,
      turno: datosEmpleado.turno,
      estado: datosEmpleado.estado,
    }),
  });


  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al crear el empleado");
  }
  return datos;
};

// Actualizar empleado ( se debe cambiar la url para que funcione)
export const actualizarEmpleado = async (id, datosEmpleado) => {
  const peticion = await fetch(`${API_URL}/empleado/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + window.localStorage.getItem("token"),
    },
    body: JSON.stringify({
      run: datosEmpleado.run,
      nombres: datosEmpleado.nombres,
      apellido_paterno: datosEmpleado.apellido_paterno,
      apellido_materno: datosEmpleado.apellido_materno,
      fecha_nacimiento: datosEmpleado.fecha_nacimiento,
      direccion: datosEmpleado.direccion,
      email: datosEmpleado.email,
      sexo: datosEmpleado.sexo,
      telefono_fijo: datosEmpleado.telefono_fijo,
      telefono_movil: datosEmpleado.telefono_movil,
      comuna: datosEmpleado.comuna,
      fecha_ini_contrato: datosEmpleado.fecha_ini_contrato,
      contrato_indefinido: datosEmpleado.contrato_indefinido,
      fecha_fin_contrato: datosEmpleado.fecha_fin_contrato,
      art_22: datosEmpleado.art_22,
      autoriza_ausencia: datosEmpleado.autoriza_ausencia,
      clave: datosEmpleado.clave,
      empresa: datosEmpleado.empresa,
      cargo: datosEmpleado.cargo,
      turno: datosEmpleado.turno,
      estado: datosEmpleado.estado,
    }),
  });

  const datos = await peticion.json();
  if (!peticion.ok) {
    throw new Error(datos.message || "Error al actualizar el empleado");
  }
  return datos;
}


