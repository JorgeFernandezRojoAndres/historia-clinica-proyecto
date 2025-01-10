document.addEventListener('DOMContentLoaded', function () {
  const buscarMedicoInput = document.getElementById('buscarMedico');
  const resultadosContainer = document.getElementById('resultadosBusqueda');
  const horariosTableBody = document.getElementById('horariosTableBody');

  // Función para cargar horarios de un médico
  function cargarHorarios(medicoId) {
    fetch(`/admin/medico/${medicoId}/horarios`)
      .then((response) => response.json())
      .then((horarios) => {
        horariosTableBody.innerHTML = ''; // Limpia los horarios previos

        if (horarios.length === 0) {
          horariosTableBody.innerHTML = `
            <tr>
              <td colspan="6">No hay horarios disponibles para este médico.</td>
            </tr>`;
        } else {
          horarios.forEach((horario) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${horario.fecha}</td>
              <td>${horario.horaInicio}</td>
              <td>${horario.horaFin}</td>
              <td>${horario.tipoTurno || 'No especificado'}</td>
              <td>${horario.estado}</td>
              <td>
                <button class="editar-horario" data-id="${horario.idHorario}">Editar</button>
                <button class="eliminar-horario" data-id="${horario.idHorario}">Eliminar</button>
              </td>`;
            horariosTableBody.appendChild(row);
          });

          // Eventos para editar y eliminar horarios
          document.querySelectorAll('.editar-horario').forEach((button) =>
            button.addEventListener('click', (e) => editarHorario(e.target.dataset.id))
          );
          document.querySelectorAll('.eliminar-horario').forEach((button) =>
            button.addEventListener('click', (e) => eliminarHorario(e.target.dataset.id))
          );
        }
      })
      .catch((error) => console.error('Error al cargar horarios:', error));
  }

  // Función para buscar médicos
  buscarMedicoInput.addEventListener('input', function () {
    const query = this.value.trim();

    fetch(`/admin/medicos/search?query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((medicos) => {
        resultadosContainer.innerHTML = ''; // Limpiar resultados previos

        if (medicos.length === 0) {
          resultadosContainer.innerHTML = '<p>No se encontraron médicos.</p>';
        } else {
          medicos.forEach((medico) => {
            const div = document.createElement('div');
            div.textContent = medico.nombre;
            div.className = 'medico-item';
            div.dataset.id = medico.idMedico;

            // Evento para cargar horarios al hacer clic en un médico
            div.addEventListener('click', () => {
              cargarHorarios(medico.idMedico);
              document.getElementById('idMedicoSeleccionado').value = medico.idMedico;
            });

            resultadosContainer.appendChild(div);
          });
        }
      })
      .catch((error) => console.error('Error al buscar médicos:', error));
  });

  // Función para editar un horario
  function editarHorario(idHorario) {
    const nuevoHorario = prompt('Ingrese el nuevo horario en formato HH:mm (ejemplo: 08:00 - 09:00)');
    if (!nuevoHorario) return;

    const [horaInicio, horaFin] = nuevoHorario.split('-').map((h) => h.trim());

    fetch(`/admin/editar-horario/${idHorario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ horaInicio, horaFin }),
    })
      .then((response) => {
        if (response.ok) {
          alert('Horario actualizado correctamente.');
          cargarHorarios(document.getElementById('idMedicoSeleccionado').value);
        } else {
          alert('Error al actualizar el horario.');
        }
      })
      .catch((error) => console.error('Error al editar horario:', error));
  }

  // Función para eliminar un horario
  function eliminarHorario(idHorario) {
    if (!confirm('¿Estás seguro de que deseas eliminar este horario?')) return;

    fetch(`/admin/eliminar-horario/${idHorario}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          alert('Horario eliminado correctamente.');
          cargarHorarios(document.getElementById('idMedicoSeleccionado').value);
        } else {
          alert('Error al eliminar el horario.');
        }
      })
      .catch((error) => console.error('Error al eliminar horario:', error));
  }
});
