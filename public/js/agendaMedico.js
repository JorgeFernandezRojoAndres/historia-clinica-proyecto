function cambiarFecha() {
    const fechaInput = document.getElementById('fecha');
    if (!fechaInput) {
      console.error("El elemento con id 'fecha' no existe.");
      return;
    }
  
    const fecha = fechaInput.value; // Obtener la fecha seleccionada
    if (fecha) {
      const medicoId = fechaInput.dataset.medicoId || ''; // ID del médico desde atributo de datos
      if (medicoId) {
        console.log(`Cambiando la fecha a: ${fecha}, médico ID: ${medicoId}`);
        window.location.href = `/medicos/${medicoId}/agenda?fecha=${fecha}`;
      } else {
        console.error("El atributo 'data-medico-id' no está definido en el campo de fecha.");
      }
    } else {
      console.warn("No se ha seleccionado ninguna fecha.");
    }
  }
  
  function seleccionarHorario(fecha, hora) {
    if (!fecha || !hora) {
      console.error("La fecha o la hora no se proporcionaron correctamente.");
      return;
    }
  
    const fechaHora = `${fecha}T${hora}:00`; // Formatear fecha y hora
  
    if (window.opener && !window.opener.closed) {
      try {
        console.log(`Enviando mensaje: { tipo: 'seleccionarHorario', fechaHora: '${fechaHora}' }`);
        // Envía el mensaje a la ventana principal
        window.opener.postMessage({ tipo: 'seleccionarHorario', fechaHora }, window.location.origin);
        console.log(`Mensaje enviado a la ventana principal: ${fechaHora}`);
        window.close(); // Cierra la ventana emergente
      } catch (error) {
        console.error("Error al enviar el mensaje a la ventana principal:", error);
      }
    } else {
      alert("La ventana principal no está disponible o ha sido cerrada.");
    }
  }
  
  
  