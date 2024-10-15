document.addEventListener('DOMContentLoaded', () => {
    const medicoSelect = document.getElementById('idMedico');
    const verAgendaButton = document.getElementById('verAgendaButton');
    const especialidadInput = document.getElementById('especialidadMedico'); // Campo de especialidad

    // Ocultar el botón al inicio
    verAgendaButton.style.display = 'none';

    // Escuchar cambios en el select del médico
    medicoSelect.addEventListener('change', function () {
        const medicoId = medicoSelect.value;
        const selectedOption = medicoSelect.options[medicoSelect.selectedIndex];

        if (medicoId) {
            // Configurar el enlace y mostrar el botón
            verAgendaButton.onclick = () => {
                window.open(`/medicos/${medicoId}/agenda`, '_blank', 'width=800,height=600');
            };
            verAgendaButton.style.display = 'inline-block';

            // Mostrar la especialidad en el campo correspondiente
            const especialidad = selectedOption.getAttribute('data-especialidad');
            especialidadInput.value = especialidad;
        } else {
            // Ocultar el botón y limpiar la especialidad si no hay médico seleccionado
            verAgendaButton.style.display = 'none';
            especialidadInput.value = '';
        }
    });
});
