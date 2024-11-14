// Función para filtrar médicos por especialidad 
function filtrarMedicosPorEspecialidad(especialidadSelector, medicoSelector, medicos) {
  console.log('Filtrando médicos por especialidad...'); // Verifica si la función se llama

  especialidadSelector.addEventListener('change', function () {
    const especialidadSeleccionada = this.value;
    console.log('Especialidad seleccionada:', especialidadSeleccionada); // Verifica el valor de la especialidad seleccionada

    medicoSelector.innerHTML = '<option value="">-- Selecciona un médico --</option>';
    medicos.forEach(medico => {
      console.log('Comprobando médico:', medico); // Muestra cada médico en el array de médicos
      if (medico.especialidad === especialidadSeleccionada) {
        const option = document.createElement('option');
        option.value = medico.idMedico;
        option.textContent = medico.nombre;
        option.setAttribute('data-especialidad', medico.especialidad);
        medicoSelector.appendChild(option);
        console.log('Agregado médico:', medico.nombre); // Verifica si se agregó un médico
      }
    });
  });
}

// Exponer la función globalmente
window.filtrarMedicosPorEspecialidad = filtrarMedicosPorEspecialidad;
// Función para cambiar la especialidad del médico seleccionado
function cambiarEspecialidadMedico(medicoSelector, especialidadMedicoInput, verAgendaButton) {
  console.log('Configurando cambio de especialidad de médico...'); // Verifica si la función se llama

  medicoSelector.addEventListener('change', function () {
    const medicoSeleccionado = this.options[this.selectedIndex];
    const medicoId = medicoSeleccionado.value;
    console.log('Médico seleccionado:', medicoId); // Muestra el ID del médico seleccionado

    especialidadMedicoInput.value = medicoSeleccionado.getAttribute('data-especialidad') || '';
    console.log('Especialidad del médico:', especialidadMedicoInput.value); // Verifica la especialidad del médico

    if (medicoId) {
      verAgendaButton.href = `/medicos/${medicoId}/agenda`;
      verAgendaButton.style.display = 'inline-block'; // Mostrar botón solo si se selecciona un médico
      console.log('Agenda habilitada para el médico con ID:', medicoId); // Verifica si se habilita la agenda
    } else {
      verAgendaButton.style.display = 'none'; // Ocultar botón si no hay médico seleccionado
      console.log('No se seleccionó médico. Botón oculto.');
    }
  });
}

// Exponer la función globalmente
window.cambiarEspecialidadMedico = cambiarEspecialidadMedico;
// Función para configurar el autocompletado de pacientes
async function configurarAutocompletadoPaciente(buscarPacienteInput, listaResultados) {
  console.log('Configurando autocompletado de pacientes...'); // Verifica si la función se llama

  buscarPacienteInput.addEventListener('input', async function () {
    const query = buscarPacienteInput.value.trim();
    console.log('Valor de búsqueda:', query); // Muestra el valor ingresado en el campo de búsqueda

    if (query.length > 0) {
      try {
        const response = await fetch(`/citas/buscar-paciente?term=${query}`);
        const pacientes = await response.json();
        console.log('Pacientes encontrados:', pacientes); // Verifica si se encontraron pacientes
        mostrarResultados(pacientes, listaResultados);
      } catch (error) {
        console.error('Error al buscar pacientes:', error);
      }
    } else {
      listaResultados.style.display = 'none'; // Ocultar si no hay query
      console.log('No hay búsqueda, ocultando resultados.');
    }
  });

  function mostrarResultados(pacientes, listaResultados) {
    console.log('Mostrando resultados de pacientes...'); // Verifica si la función es llamada

    listaResultados.innerHTML = ''; // Limpiar resultados anteriores
    if (pacientes.length > 0) {
      listaResultados.style.display = 'block'; // Mostrar el contenedor de resultados
      pacientes.forEach(paciente => {
        console.log('Paciente encontrado:', paciente); // Muestra cada paciente encontrado
        const li = document.createElement('li');
        li.textContent = `${paciente.nombre} (ID: ${paciente.idPaciente})`;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => seleccionarPaciente(paciente, buscarPacienteInput, listaResultados));
        listaResultados.appendChild(li);
      });
    } else {
      listaResultados.style.display = 'none'; // Ocultar si no hay resultados
      console.log('No se encontraron resultados.');
    }
  }

  function seleccionarPaciente(paciente, buscarPacienteInput, listaResultados) {
    console.log('Paciente seleccionado:', paciente); // Verifica qué paciente ha sido seleccionado

    buscarPacienteInput.value = paciente.nombre;
    listaResultados.style.display = 'none'; // Ocultar resultados
    document.getElementById('idPaciente').value = paciente.idPaciente; // Asignar ID al campo oculto
  }

  // Ocultar la lista de resultados si se hace clic fuera
  document.addEventListener('click', function (e) {
    if (!buscarPacienteInput.contains(e.target) && !listaResultados.contains(e.target)) {
      listaResultados.style.display = 'none';
      console.log('Lista de resultados oculta al hacer clic fuera.');
    }
  });
}

// Exponer la función globalmente
window.configurarAutocompletadoPaciente = configurarAutocompletadoPaciente;
// Función para manejar la selección de la clínica
function configurarSeleccionClinica(btnSelectClinic, modalId) {
  console.log('Configurando selección de clínica...'); // Verifica si la función se llama

  btnSelectClinic.onclick = function () {
    console.log('Botón de selección de clínica clickeado.');
    document.getElementById(modalId).style.display = 'block';
  };
}

// Exponer la función globalmente
window.configurarSeleccionClinica = configurarSeleccionClinica;
