document.addEventListener('DOMContentLoaded', function() {
    const clinicaSelector = document.getElementById('clinicaSelector');
    const especialidadSelector = document.getElementById('especialidadSelector');
    const medicoSelector = document.getElementById('idMedico');
    const verHorariosButton = document.getElementById('verHorariosButton');
  
    function fetchDoctors() {
      const clinicId = clinicaSelector.value;
      const specialty = especialidadSelector.value;
  
      if (clinicId && specialty) {
        fetch(`/admin/get-doctors?clinicId=${clinicId}&specialty=${specialty}`)
          .then(response => response.json())
          .then(doctors => {
            medicoSelector.innerHTML = '<option value="">-- Selecciona un médico --</option>';
            doctors.forEach(medico => {
              const option = document.createElement('option');
              option.value = medico.idMedico;
              option.textContent = medico.nombre;
              medicoSelector.appendChild(option);
            });
          })
          .catch(error => console.error("Error al obtener los médicos:", error));
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
  