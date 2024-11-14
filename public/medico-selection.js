document.addEventListener('DOMContentLoaded', function() {
  const clinicaSelector = document.getElementById('clinicaSelector');
  const especialidadSelector = document.getElementById('especialidadSelector');
  const medicoSelector = document.getElementById('idMedico');
  const verHorariosButton = document.getElementById('verHorariosButton');

  // Función para obtener los médicos según clínica y especialidad
  function fetchDoctors() {
      const clinicId = clinicaSelector.value;
      const specialtyId = especialidadSelector.value; // Debe ser el ID numérico de la especialidad

      console.log("fetchDoctors ejecutado con clinicId:", clinicId, "y specialtyId:", specialtyId);

      if (clinicId && specialtyId) {
          fetch(`/admin/get-doctors?clinicId=${clinicId}&specialtyId=${specialtyId}`)
              .then(response => response.json())
              .then(doctors => {
                  console.log("Lista de médicos recibidos:", doctors);

                  // Limpiamos el selector de médicos y mostramos la opción predeterminada
                  medicoSelector.innerHTML = '<option value="">-- Selecciona un médico --</option>';

                  if (doctors.length > 0) {
                      doctors.forEach(medico => {
                          const option = document.createElement('option');
                          option.value = medico.idMedico;
                          option.textContent = medico.nombre;
                          medicoSelector.appendChild(option);
                      });
                  } else {
                      medicoSelector.innerHTML = '<option value="">-- No hay médicos disponibles --</option>';
                  }
              })
              .catch(error => {
                  console.error("Error al obtener los médicos:", error);
                  alert('Hubo un problema al cargar los médicos. Intenta nuevamente.');
              });
      } else {
          medicoSelector.innerHTML = '<option value="">-- Selecciona un médico --</option>';
      }
  }

  if (clinicaSelector && especialidadSelector) {
      clinicaSelector.addEventListener('change', fetchDoctors);
      especialidadSelector.addEventListener('change', fetchDoctors);
  } else {
      console.warn("El elemento 'clinicaSelector' o 'especialidadSelector' no existe en el DOM.");
  }

  if (verHorariosButton) {
      verHorariosButton.addEventListener('click', function() {
          const medicoId = medicoSelector ? medicoSelector.value : null;
          if (medicoId) {
              window.open(`/admin/medico/${medicoId}/horarios-libres`, 'Horarios del Médico', 'width=800,height=600,resizable=yes,scrollbars=yes');
          } else {
              alert('Por favor, selecciona un médico para ver sus horarios.');
          }
      });
  } else {
      console.warn("El elemento 'verHorariosButton' no existe en el DOM.");
  }
});
