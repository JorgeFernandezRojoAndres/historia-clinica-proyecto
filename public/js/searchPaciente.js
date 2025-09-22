// Función para dar formato a la fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`; // Formato DD/MM/YYYY
}

// Evento de búsqueda
document.getElementById('buscarPaciente').addEventListener('input', function (e) { 
  const query = e.target.value.trim(); 
  console.log('Valor de búsqueda:', query);

  if (query.length === 0) {
    actualizarTabla([]); // Limpiar la tabla si el input está vacío
    return;
  }

  fetch(`/secretaria/pacientes/search?query=${encodeURIComponent(query)}`)
    .then(response => {
      console.log('Respuesta del servidor:', response);
      if (!response.ok) {
        throw new Error('Error al realizar la búsqueda');
      }
      return response.json();
    })
    .then(data => {
      console.log('Datos de pacientes:', data);
      actualizarTabla(data);
    })
    .catch(error => console.error('Error al buscar pacientes:', error));
});

// Función para actualizar la tabla de pacientes
function actualizarTabla(pacientes) {
  const tablaPacientes = document.getElementById('tablaPacientes');
  tablaPacientes.innerHTML = ''; // Limpia la tabla existente

  if (pacientes.length === 0) {
    const fila = document.createElement('tr');
    const celda = document.createElement('td');
    celda.colSpan = 6;
    celda.textContent = 'No se encontraron pacientes.';
    fila.appendChild(celda);
    tablaPacientes.appendChild(fila);
    return;
  }

  // Crear filas para cada paciente
  pacientes.forEach(paciente => {
    const fila = document.createElement('tr');

    const nombre = document.createElement('td');
    nombre.textContent = paciente.nombre;
    fila.appendChild(nombre);

    const fechaNacimiento = document.createElement('td');
    fechaNacimiento.textContent = formatearFecha(paciente.fechaNacimiento); // Formatear la fecha aquí
    fila.appendChild(fechaNacimiento);

    const dni = document.createElement('td');
    dni.textContent = paciente.dni;
    fila.appendChild(dni);

    const direccion = document.createElement('td');
    direccion.textContent = paciente.direccion;
    fila.appendChild(direccion);

    const telefono = document.createElement('td');
    telefono.textContent = paciente.telefono;
    fila.appendChild(telefono);

    const acciones = document.createElement('td');
    const editar = document.createElement('a');
    editar.href = `/secretaria/pacientes/${paciente.idPaciente}/edit`;
    editar.textContent = 'Editar';
    acciones.appendChild(editar);

    const eliminarForm = document.createElement('form');
    eliminarForm.action = `/secretaria/pacientes/${paciente.idPaciente}/delete?_method=DELETE`;
    eliminarForm.method = 'POST';
    eliminarForm.style.display = 'inline';
    eliminarForm.onsubmit = () => confirm('¿Estás seguro de que deseas eliminar a este paciente?');
    const eliminarButton = document.createElement('button');
    eliminarButton.type = 'submit';
    eliminarButton.textContent = 'Eliminar';
    eliminarForm.appendChild(eliminarButton);
    acciones.appendChild(eliminarForm);

    fila.appendChild(acciones);
    tablaPacientes.appendChild(fila);
  });
}
