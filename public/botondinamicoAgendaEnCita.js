// Al cargar el DOM, configura dinámicamente el botón de agenda del médico
document.addEventListener('DOMContentLoaded', () => {
    configurarBotonAgenda('idMedico', 'verAgendaButton', 'especialidadMedico');
  });
  
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
      
      return;
    }
  
    // Ocultar el botón al inicio
    verAgendaButton.style.display = 'none';
  
    // Escuchar cambios en el selector de médicos
    medicoSelect.addEventListener('change', function () {
      const medicoId = medicoSelect.value;
      const selectedOption = medicoSelect.options[medicoSelect.selectedIndex];
  
      if (medicoId) {
        // Configurar el enlace del botón para abrir la agenda en una ventana emergente
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
  
    console.log("Configuración del botón 'Ver Agenda del Médico' completada.");
  }
  