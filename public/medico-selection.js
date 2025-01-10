document.addEventListener('DOMContentLoaded', function () {
  const horariosTableBody = document.getElementById('horariosTableBody');
  const buscarMedicoInput = document.getElementById('buscarMedico');

  // Función para cargar los horarios del médico buscado
  function fetchHorarios(query) {
    fetch(`/admin/medico/horarios?query=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((horarios) => {
        horariosTableBody.innerHTML = ''; // Limpia el contenido de la tabla

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
              <td>${horario.estado}</td>
              <td>${horario.tipoTurno || 'No especificado'}</td>
              <td>
                <button class="editar-horario" data-id="${horario.idHorario}">Editar</button>
                <button class="eliminar-horario" data-id="${horario.idHorario}">Eliminar</button>
              </td>`;
            horariosTableBody.appendChild(row);
          });

          // Agregar eventos para editar y eliminar horarios
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
          fetchHorarios(buscarMedicoInput.value);
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
          fetchHorarios(buscarMedicoInput.value);
        } else {
          alert('Error al eliminar el horario.');
        }
      })
      .catch((error) => console.error('Error al eliminar horario:', error));
  }

  // Evento para buscar horarios dinámicamente mientras se escribe en el campo
  if (buscarMedicoInput) {
    buscarMedicoInput.addEventListener('input', function () {
      const query = this.value.trim();
      if (query) {
        fetchHorarios(query);
      } else {
        horariosTableBody.innerHTML = `
          <tr>
            <td colspan="6">No hay horarios disponibles para este médico.</td>
          </tr>`;
      }
    });
  }

  // Función para abrir los horarios del médico en una nueva pestaña
  function abrirEnNuevaPestana(medicoId) {
    window.open(`/admin/medico/${medicoId}/horarios-libres`, '_blank');
  }

  // Agregar evento para abrir en una nueva pestaña cuando se presiona "Enter" en el buscador
  if (buscarMedicoInput) {
    buscarMedicoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = buscarMedicoInput.value.trim();
        if (query) {
          fetch(`/admin/medicos/search?query=${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((medicos) => {
              if (medicos.length > 0) {
                abrirEnNuevaPestana(medicos[0].idMedico);
              } else {
                alert('No se encontraron médicos con ese nombre.');
              }
            })
            .catch((error) => console.error('Error al buscar médico:', error));
        }
      }
    });
  }
});
