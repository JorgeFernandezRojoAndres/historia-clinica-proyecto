document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  // Obtener el ID del médico desde la URL (opcional si es dinámico)
  const params = new URLSearchParams(window.location.search);
  const idMedico = params.get('id') || 4;  // Por defecto a 4 si no hay parámetro

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    events: function (info, successCallback, failureCallback) {
      fetch(`/citas/api/medicos/${idMedico}/agenda`)
        .then(response => {
          if (!response.ok) throw new Error('Error al obtener las citas');
          return response.json();
        })
        .then(data => successCallback(data))
        .catch(error => {
          console.error('Error al cargar las citas:', error);
          failureCallback(error);
        });
    },
    businessHours: true,  // Mostrar solo horas hábiles
    editable: false  // No permitir edición directa en el calendario
  });

  calendar.render();
});
