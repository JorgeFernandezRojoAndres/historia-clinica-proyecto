document.addEventListener('DOMContentLoaded', function () {
  var citasContainer = document.getElementById('citasContainer');

  // Extraer el ID del médico directamente de la URL
  const pathParts = window.location.pathname.split('/');
  const idMedico = pathParts[pathParts.length - 2];

  // Obtener las citas del médico
  fetch(`/api/medicos/${idMedico}/agenda`)
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener las citas');
      return response.json();
    })
    .then(data => {
      // Crear una lista o tabla para mostrar las citas
      if (data.length === 0) {
        citasContainer.innerHTML = '<p>No hay citas disponibles para este médico.</p>';
      } else {
        let citasList = '<ul>';
        data.forEach(cita => {
          citasList += `<li><strong>Fecha:</strong> ${new Date(cita.start).toLocaleString()} <br> 
                        <strong>Motivo:</strong> ${cita.title}</li><br>`;
        });
        citasList += '</ul>';
        citasContainer.innerHTML = citasList;
      }
    })
    .catch(error => {
      console.error('Error al cargar las citas:', error);
      citasContainer.innerHTML = '<p>Error al cargar las citas.</p>';
    });
});
