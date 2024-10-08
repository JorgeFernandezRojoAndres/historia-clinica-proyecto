document.getElementById('buscarMedico').addEventListener('input', function() {
  var query = this.value;
  fetch(`/medicos/search?query=${query}`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('resultadosBusqueda').innerHTML = html;
    })
    .catch(error => console.error('Error al buscar médicos:', error));
});

document.getElementById('buscarPaciente').addEventListener('input', function() {
  var query = this.value;
  fetch(`/pacientes/search?query=${query}`)
    .then(response => response.text())
    .then(html => {
      document.getElementById('resultadosPaciente').innerHTML = html;
    })
    .catch(error => console.error('Error al buscar pacientes:', error));
});
