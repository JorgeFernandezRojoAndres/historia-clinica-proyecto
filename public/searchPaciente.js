document.getElementById('buscarPaciente').addEventListener('input', function (e) { 
  const query = e.target.value.trim(); 

  if (query.length === 0)  {
    limpiarSugerencias(); // Limpiar si el input está vacío
    return;
}
  fetch(`/secretaria/pacientes/search?query=${encodeURIComponent(query)}`) 
      .then(response => {
          if (!response.ok) {
              throw new Error('Error al realizar la búsqueda');
          }
          return response.json();
      })
      .then(data => {
          if (data.length > 0) {
            mostrarSugerencias(data);  
              
              
          } else {
            limpiarSugerencias(); // Limpiar si no hay resultados
            console.warn('No se encontraron pacientes.');
          }
      })
      .catch(error => console.error('Error al buscar pacientes:', error));
});
// Función para mostrar sugerencias de pacientes
function mostrarSugerencias(pacientes) {
    const listaResultados = document.getElementById('listaResultados');
    listaResultados.innerHTML = ''; // Limpia las sugerencias anteriores

    pacientes.forEach(paciente => {
        const li = document.createElement('li');
        li.textContent = `${paciente.nombre} - DNI: ${paciente.dni}`;
        li.dataset.idPaciente = paciente.idPaciente; // Guardar ID del paciente

        li.addEventListener('click', () => {
            document.getElementById('buscarPaciente').value = paciente.nombre;
            document.getElementById('idPaciente').value = paciente.idPaciente; // Asignar ID al campo oculto
            limpiarSugerencias(); // Eliminar la lista de sugerencias
        });

        listaResultados.appendChild(li);
    });
    listaResultados.style.display = 'block';
}

// Función para limpiar las sugerencias
function limpiarSugerencias() {
    const listaResultados = document.getElementById('listaResultados');
    listaResultados.innerHTML = '';
    listaResultados.style.display = 'none';
}