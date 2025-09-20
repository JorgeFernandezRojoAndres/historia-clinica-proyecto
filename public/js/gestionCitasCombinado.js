document.addEventListener('DOMContentLoaded', function () {
    const especialidadSelector = document.getElementById('especialidadSelector');
    const medicoSelector = document.getElementById('idMedico');
    const verAgendaButton = document.getElementById('verAgendaButton');
    const buscarPacienteInput = document.getElementById('buscarPaciente');
    const listaResultados = document.getElementById('listaResultados');
    const especialidadMedicoInput = document.getElementById('especialidadMedico');
    const idPacienteInput = document.getElementById('idPaciente');
    const fechaHoraInput = document.getElementById('fechaHora'); // Campo de fecha y hora
    
    // Cargar datos de médicos desde el script en el Pug
    let medicos = [];
    try {
      medicos = JSON.parse(document.getElementById('medicosData').textContent);
    } catch (error) {
      console.error('Error al cargar los datos de médicos:', error);
      return; // Detener el script si no hay datos válidos
    }
  
    // Configuración dinámica para el botón "Ver Agenda del Médico"
    if (medicoSelector && verAgendaButton) {
      configurarBotonAgenda('idMedico', 'verAgendaButton', 'especialidadMedico');
    }
  
    // Evento para filtrar médicos por especialidad
    if (especialidadSelector && medicoSelector) {
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
  
          // Limpiar el campo de especialidad del médico al cambiar la especialidad
          if (especialidadMedicoInput) especialidadMedicoInput.value = '';
        } catch (error) {
          console.error('Error al filtrar médicos por especialidad:', error);
        }
      });
    }
  
    // Autocompletado para buscar pacientes
    if (buscarPacienteInput && listaResultados) {
      buscarPacienteInput.addEventListener('input', async function () {
        const query = buscarPacienteInput.value.trim();
  
        if (query.length > 0) {
          try {
            const response = await fetch(`/citas/buscar-paciente?term=${query}`);
            if (response.ok) {
              const pacientes = await response.json();
              mostrarResultados(pacientes);
            } else {
              console.error('Error al buscar pacientes: Respuesta no válida');
            }
          } catch (error) {
            console.error('Error al buscar pacientes:', error);
          }
        } else {
          listaResultados.style.display = 'none'; // Ocultar si no hay búsqueda
        }
      });
    }
  
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
      if (buscarPacienteInput) buscarPacienteInput.value = paciente.nombre;
      if (idPacienteInput) idPacienteInput.value = paciente.idPaciente; // Asignar ID al campo oculto
      listaResultados.style.display = 'none'; // Ocultar resultados
    }
  
    // Ocultar la lista de resultados si se hace clic fuera
    document.addEventListener('click', function (e) {
      if (
        buscarPacienteInput &&
        listaResultados &&
        !buscarPacienteInput.contains(e.target) &&
        !listaResultados.contains(e.target)
      ) {
        listaResultados.style.display = 'none';
      }
    });
  
    // Listener para recibir el mensaje de la ventana emergente
    window.addEventListener('message', function (event) {
      console.log("Mensaje recibido:", event); // Log para depuración
  
      // Verifica el origen del mensaje para mayor seguridad
      if (event.origin !== window.location.origin) {
        console.error("Origen del mensaje no permitido:", event.origin);
        return;
      }
  
      // Verifica el tipo de mensaje y actualiza el campo fechaHora
      const { tipo, fechaHora } = event.data;
      if (tipo === 'seleccionarHorario' && fechaHora) {
        console.log(`Actualizando campo fechaHora con: ${fechaHora}`);
        if (fechaHoraInput) {
          fechaHoraInput.value = fechaHora;
          console.log("Campo fechaHora actualizado correctamente.");
        } else {
          console.error("No se encontró el campo 'fechaHora' en el formulario.");
        }
      } else {
        console.warn("El mensaje recibido no contiene el tipo o la fechaHora esperados.");
      }
    });
  });
  