document.addEventListener('DOMContentLoaded', function () {
  // Función para abrir la agenda asegurando que la clínica esté seleccionada
 window.abrirAgenda = function () {
  window.open(`/medicos/agenda`, 'AgendaMedico',
    'width=800,height=600,resizable=yes,scrollbars=yes');
};



  // Función para abrir sobreturno
  window.abrirSobreturno = function () {
    window.open('/medicos/atender-sobreturno', 'Atender Sobreturno', 'width=800,height=600,resizable=yes,scrollbars=yes');
  };

  // Función para abrir historial del médico
  window.abrirHistorial = function () {
    window.open('/medicos/historial', 'BuscarHistorial', 'width=800,height=600,resizable=yes,scrollbars=yes');
  };

  // Función genérica para abrir ventanas emergentes
  window.abrirVentana = function (url, titulo) {
    window.open(url, titulo, 'width=800,height=600,resizable=yes,scrollbars=yes');
  };

  // Autocompletado de búsqueda de pacientes para sobreturno
  const inputBuscarPaciente = document.getElementById('buscarPacienteSobreturno');
  const listaResultados = document.getElementById('listaResultadosSobreturno');

  if (inputBuscarPaciente) {
    inputBuscarPaciente.addEventListener('input', function () {
      const query = this.value;
      if (query.length >= 2) {
        fetch(`/pacientes/buscar?query=${query}`)
          .then(response => response.json())
          .then(pacientes => {
            listaResultados.innerHTML = '';
            pacientes.forEach(paciente => {
              const li = document.createElement('li');
              li.textContent = `${paciente.nombre} - DNI: ${paciente.dni}`;
              li.onclick = () => seleccionarPacienteSobreturno(paciente);
              listaResultados.appendChild(li);
            });
          })
          .catch(error => console.error('Error al buscar pacientes:', error));
      } else {
        listaResultados.innerHTML = '';
      }
    });
  }

  // Función para seleccionar un paciente en el sobreturno
  window.seleccionarPacienteSobreturno = function (paciente) {
    document.getElementById('buscarPacienteSobreturno').value = paciente.nombre;
    window.open(`/medicos/historial/${paciente.idPaciente}`, 'HistorialPaciente', 'width=800,height=600,resizable=yes,scrollbars=yes');
  };
});
