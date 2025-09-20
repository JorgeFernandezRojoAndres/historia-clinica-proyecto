document.addEventListener('DOMContentLoaded', function () {
    const horariosTableBody = document.getElementById('horariosTableBody');
    const buscarMedicoInput = document.getElementById('buscarMedico');
    const agregarHorariosForm = document.getElementById('agregarHorariosForm');
  
    // Función para buscar y mostrar horarios
    function fetchHorarios(query) {
      fetch(`/admin/medico/horarios?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((horarios) => {
          horariosTableBody.innerHTML = '';
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
  
            // Agregar eventos para editar y eliminar
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
  
    // Función para editar horarios
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
  
    // Función para eliminar horarios
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
  
    // Manejar eventos de búsqueda
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
  
    // Manejar el formulario de agregar horarios
    if (agregarHorariosForm) {
      agregarHorariosForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(agregarHorariosForm);
  
        fetch('/admin/agregar-horarios', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            if (response.ok) {
              alert('Horarios agregados correctamente.');
              fetchHorarios(buscarMedicoInput.value);
            } else {
              alert('Error al agregar horarios.');
            }
          })
          .catch((error) => console.error('Error al agregar horarios:', error));
      });
    }
  });
  