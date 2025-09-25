document.addEventListener('DOMContentLoaded', function () {
  const inputFiltroMedico = document.getElementById('filtroMedico');
  const selectFiltroEstado = document.getElementById('filtroEstado');
  const selectFiltroClasificacion = document.getElementById('filtroClasificacion');
  const tabla = document.getElementById('tablaCitas').getElementsByTagName('tbody')[0];

  function filtrarCitas() {
    const filtroMedico = inputFiltroMedico ? inputFiltroMedico.value.toLowerCase().trim() : '';
    const filtroEstado = selectFiltroEstado ? selectFiltroEstado.value.toLowerCase().trim() : '';
    const filtroClasificacion = selectFiltroClasificacion ? selectFiltroClasificacion.value.toLowerCase().trim() : '';
    const filas = tabla.getElementsByTagName('tr');

    for (let i = 0; i < filas.length; i++) {
      const celdaMedico = filas[i].getElementsByTagName('td')[0];
      const celdaEstado = filas[i].getElementsByTagName('td')[4];
      const celdaClasificacion = filas[i].getElementsByTagName('td')[5];

      if (celdaMedico && celdaEstado && celdaClasificacion) {
        const nombreMedico = celdaMedico.textContent.toLowerCase().trim();
        const estado = celdaEstado.textContent.toLowerCase().trim();
        const clasificacion = celdaClasificacion.textContent.toLowerCase().trim();

        console.log({
          filtroMedico,
          filtroEstado,
          filtroClasificacion,
          nombreMedico,
          estado,
          clasificacion
        });

        const mostrarFila =
          (!filtroMedico || nombreMedico.includes(filtroMedico)) &&
          (!filtroEstado || estado.includes(filtroEstado)) &&
          (!filtroClasificacion || clasificacion.includes(filtroClasificacion));

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

  if (selectFiltroClasificacion) {
    selectFiltroClasificacion.addEventListener('change', filtrarCitas);
  }

  // ✅ Nueva lógica: botones individuales "Confirmar"
  const botonesConfirmar = document.querySelectorAll('.btn-confirmar');
  botonesConfirmar.forEach(boton => {
    boton.addEventListener('click', function () {
      const idCita = this.getAttribute('data-id');
      if (confirm('¿Confirmar esta cita pendiente?')) {
        fetch('/citas/confirmar-pendientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // 👈 agregado para que backend devuelva JSON
          },
          body: JSON.stringify({ idCita })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al confirmar la cita');
            }
            return response.json();
          })
          .then(data => {
            console.log('Respuesta:', data);

            // Cambiar el estado en la tabla sin recargar
            const fila = boton.closest('tr');
            fila.querySelector('td:nth-child(5)').textContent = 'Confirmado'; // columna Estado
            boton.remove(); // quitar el botón de confirmar
          })
          .catch(error => {
            console.error('Error en la confirmación:', error);
            alert('Hubo un problema al confirmar la cita.');
          });
      }
    });
  });
});
