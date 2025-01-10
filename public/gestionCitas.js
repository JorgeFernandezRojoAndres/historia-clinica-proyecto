document.addEventListener('DOMContentLoaded', function () {
    const especialidadSelector = document.getElementById('especialidadSelector');
    const medicoSelector = document.getElementById('idMedico');
    const verAgendaButton = document.getElementById('verAgendaButton');
    const buscarPacienteInput = document.getElementById('buscarPaciente');
    const listaResultados = document.getElementById('listaResultados');
    const especialidadMedicoInput = document.getElementById('especialidadMedico');
  
    // Verificar si el script de datos está disponible
    let medicos = [];
    try {
      medicos = JSON.parse(document.getElementById('medicosData').textContent);
    } catch (error) {
      console.error('Error al cargar los datos de médicos:', error);
      return; // Detener el script si no hay datos válidos
    }
  
    // Evento para filtrar médicos por especialidad
    especialidadSelector.addEventListener('change', function () {
      const especialidadSeleccionada = this.value;
      medicoSelector.innerHTML = '<option value="">-- Selecciona un médico --</option>';
  
      try {
        medicos.forEach(medico => {
          if (medico.especialidad === especialidadSeleccionada) {
            const option = document.createElement('option');
            option.value = medico.idMedico;
            option.textContent = medico.nombre;
            option.setAttribute('data-especialidad', medico.especialidad);
            medicoSelector.appendChild(option);
          }
        });
  
        // Ocultar botón y limpiar campo de especialidad al cambiar especialidad
        verAgendaButton.style.display = 'none';
        especialidadMedicoInput.value = '';
      } catch (error) {
        console.error('Error al filtrar médicos por especialidad:', error);
      }
    });
  
    // Evento para mostrar la especialidad del médico seleccionado
    medicoSelector.addEventListener('change', function () {
      const medicoSeleccionado = this.options[this.selectedIndex];
      const medicoId = medicoSeleccionado.value;
  
      if (medicoSeleccionado) {
        especialidadMedicoInput.value = medicoSeleccionado.getAttribute('data-especialidad') || '';
      }
  
      if (medicoId) {
        verAgendaButton.href = `/medicos/${medicoId}/agenda`;
        verAgendaButton.style.display = 'inline-block'; // Mostrar botón si hay un médico seleccionado
      } else {
        verAgendaButton.style.display = 'none'; // Ocultar si no hay médico seleccionado
      }
    });
  
    // Autocompletado para Buscar Paciente
    buscarPacienteInput.addEventListener('input', async function () {
      const query = buscarPacienteInput.value.trim();
  
      if (query.length > 0) {
        try {
          const response = await fetch(`/citas/buscar-paciente?term=${query}`);
          const pacientes = await response.json();
          mostrarResultados(pacientes);
        } catch (error) {
          console.error('Error al buscar pacientes:', error);
        }
      } else {
        listaResultados.style.display = 'none'; // Ocultar si no hay query
      }
    });
  
    function mostrarResultados(pacientes) {
      listaResultados.innerHTML = ''; // Limpiar resultados anteriores
  
      if (pacientes.length > 0) {
        listaResultados.style.display = 'block'; // Mostrar el contenedor de resultados
        pacientes.forEach(paciente => {
          const li = document.createElement('li');
          li.textContent = `${paciente.nombre} (ID: ${paciente.idPaciente})`;
          li.style.cursor = 'pointer';
          li.addEventListener('click', () => seleccionarPaciente(paciente));
          listaResultados.appendChild(li);
        });
      } else {
        listaResultados.style.display = 'none'; // Ocultar si no hay resultados
      }
    }
  
    function seleccionarPaciente(paciente) {
      buscarPacienteInput.value = paciente.nombre;
      listaResultados.style.display = 'none'; // Ocultar resultados
      document.getElementById('idPaciente').value = paciente.idPaciente; // Asignar ID al campo oculto
    }
  
    // Ocultar la lista de resultados si se hace clic fuera
    document.addEventListener('click', function (e) {
      if (!buscarPacienteInput.contains(e.target) && !listaResultados.contains(e.target)) {
        listaResultados.style.display = 'none';
      }
    });
  });
  