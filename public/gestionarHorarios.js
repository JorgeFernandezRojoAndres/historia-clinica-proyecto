// gestionarHorarios.js

// Sincronizar la fecha seleccionada en todos los formularios de generación de horarios
document.addEventListener('DOMContentLoaded', () => {
  const fechaParaGenerar = document.getElementById('fechaParaGenerar');
  const clinicaSelector = document.getElementById('clinicaSelector');
  
  if (fechaParaGenerar) {
    fechaParaGenerar.addEventListener('change', function() {
      const selectedDate = this.value;
      document.getElementById('fechaManana').value = selectedDate;
      document.getElementById('fechaTarde').value = selectedDate;
      document.getElementById('fechaGuardia').value = selectedDate;
    });
  }
// Sincronizar el idClinica seleccionado en todos los formularios de generación de horarios
if (clinicaSelector) {
  clinicaSelector.addEventListener('change', function() {
    const selectedClinica = this.value;
    document.querySelectorAll('input[name="idClinica"]').forEach(input => {
      input.value = selectedClinica;
    });
  });
}
});

// Función para cargar los horarios según la fecha seleccionada
function cargarHorariosPorFecha(fecha) {
  console.log("Fecha seleccionada para cargar horarios:", fecha);
  const idMedico = document.querySelector('input[name="idMedico"]').value; // Obtener idMedico del formulario oculto
  
  // Hacer una solicitud al servidor para obtener los horarios según la fecha y el id del médico
  fetch(`/admin/horarios-libres?fecha=${fecha}&idMedico=${idMedico}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la respuesta de la red");
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos de horarios recibidos del servidor:", data);
      const container = document.querySelector('.containeradm');
      container.innerHTML = ''; // Limpiar el contenido previo

      if (data.horarios && data.horarios.length > 0) {
        // Iterar sobre cada horario y agregarlo al contenedor
        data.horarios.forEach(horario => {
          container.innerHTML += `
            <div class="targetaH">
              <div class="infoh">
                <h5>Hora:</h5>
                <p>${horario.hora}</p>
              </div>
              <form action="/admin/eliminar-horario-libre" method="POST" onsubmit="return confirm('¿Estás seguro de que deseas eliminar este horario?');">
                <input type="hidden" name="idMedico" value="${idMedico}">
                <input type="hidden" name="fecha" value="${fecha}">
                <input type="hidden" name="hora" value="${horario.hora}">
                <button type="submit" class="BotnEli">Eliminar</button>
              </form>
            </div>`;
        });
      } else {
        container.innerHTML = '<p>No hay horarios libres para mostrar.</p>';
      }
    })
    .catch(error => {
      console.error('Error al cargar horarios:', error);
      const container = document.querySelector('.containeradm');
      container.innerHTML = '<p>Error al cargar los horarios. Intenta nuevamente.</p>';
    });
}
