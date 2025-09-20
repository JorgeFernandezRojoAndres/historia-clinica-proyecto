/**
 * Configura dinámicamente el botón "Ver Agenda del Médico".
 * @param {string} selectId - ID del selector de médicos.
 * @param {string} buttonId - ID del botón para abrir la agenda.
 * @param {string} [especialidadId] - ID del campo de especialidad (opcional).
 */
function configurarBotonAgenda(selectId, buttonId, especialidadId = null) {
    console.log("Configurando el botón 'Ver Agenda del Médico'...");
  
    const medicoSelect = document.getElementById(selectId);
    const verAgendaButton = document.getElementById(buttonId);
    const especialidadInput = especialidadId ? document.getElementById(especialidadId) : null;
  
    if (!medicoSelect || !verAgendaButton) {
      console.error("No se encontraron los elementos necesarios para configurar el botón.");
      return;
    }
  
    // Ocultar el botón al inicio
    verAgendaButton.style.display = 'none';
  
    // Escuchar cambios en el selector de médicos
    medicoSelect.addEventListener('change', function () {
      const medicoId = medicoSelect.value;
      const selectedOption = medicoSelect.options[medicoSelect.selectedIndex];
  
      if (medicoId) {
        // Actualizar el enlace del botón
        verAgendaButton.onclick = (e) => {
          e.preventDefault(); // Evita la navegación predeterminada
          window.open(`/medicos/${medicoId}/agenda`, '_blank', 'width=800,height=600');
        };
        verAgendaButton.style.display = 'inline-block'; // Mostrar el botón
  
        // Actualizar el campo de especialidad, si existe
        if (especialidadInput) {
          const especialidad = selectedOption.getAttribute('data-especialidad') || '';
          especialidadInput.value = especialidad;
        }
      } else {
        // Ocultar el botón y limpiar el campo de especialidad si no hay médico seleccionado
        verAgendaButton.style.display = 'none';
        if (especialidadInput) especialidadInput.value = '';
      }
    });
  }
  