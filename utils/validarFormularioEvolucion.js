document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const idPaciente = document.querySelector('input[name="idPaciente"]').value;
    const detallesEvolucion = document.querySelector('#detallesEvolucion');

    form.addEventListener('submit', function(e) {
        if (!idPaciente || detallesEvolucion.value.trim() === '') {
            e.preventDefault();
            alert('Por favor, complete todos los campos antes de guardar la evolución.');
        }
    });
});
