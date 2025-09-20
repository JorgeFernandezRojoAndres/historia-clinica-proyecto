document.addEventListener('DOMContentLoaded', function () {
    const inputFiltroMedico = document.getElementById('filtroMedico');
    const selectFiltroEstado = document.getElementById('filtroEstado');
    const tabla = document.getElementById('tablaCitas').getElementsByTagName('tbody')[0];
  
    function filtrarCitas() {
      const filtroMedico = inputFiltroMedico ? inputFiltroMedico.value.toLowerCase() : '';
      const filtroEstado = selectFiltroEstado ? selectFiltroEstado.value : '';
      const filas = tabla.getElementsByTagName('tr');
  
      for (let i = 0; i < filas.length; i++) {
        const celdaMedico = filas[i].getElementsByTagName('td')[0];
        const celdaEstado = filas[i].getElementsByTagName('td')[4];
  
        if (celdaMedico && celdaEstado) {
          const nombreMedico = celdaMedico.textContent.toLowerCase();
          const estado = celdaEstado.textContent;
  
          const mostrarFila = (
            (!filtroMedico || nombreMedico.includes(filtroMedico)) &&
            (!filtroEstado || estado === filtroEstado)
          );
  
          filas[i].style.display = mostrarFila ? '' : 'none';
        }
      }
    }
  
    if (inputFiltroMedico) {
      inputFiltroMedico.addEventListener('keyup', filtrarCitas);
    }
  
    if (selectFiltroEstado) {
      selectFiltroEstado.addEventListener('change', filtrarCitas);
    }
  });
  