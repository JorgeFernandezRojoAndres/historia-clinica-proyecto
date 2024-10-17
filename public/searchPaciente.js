document.getElementById('buscarPaciente').addEventListener('input', function (e) { 
  const query = e.target.value.trim(); 
  console.log('Valor de búsqueda:', query);
  if (query.length === 0)  {
    limpiarSugerencias(); // Limpiar si el input está vacío
    return;
}
fetch(`/secretaria/pacientes/search?query=${encodeURIComponent(query)}`)
.then(response => {
    console.log('Respuesta del servidor:', response);
    if (!response.ok) {
        throw new Error('Error al realizar la búsqueda');
    }
    return response.json(); // Aquí debes mover esta línea fuera del bloque if
})
.then(data => {
    console.log('Datos de pacientes:', data);
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
            console.log('ID del paciente seleccionado:', paciente.idPaciente); //// Verifica el ID
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