document.addEventListener('DOMContentLoaded', function () {
    function selectClinic(id) {
        fetch('/seleccionar-clinica', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idClinica: id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Clínica seleccionada correctamente");
                document.getElementById('clinicModal').style.display = 'none'; // Cierra el modal
                window.location.href = data.redirectUrl; // Redirige a la nueva URL
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error("Error en la selección de clínica:", error);
            alert("Error en la selección de clínica");
        });
    }

    function closeModal() {
        document.getElementById('clinicModal').style.display = 'none';
    }

    const selectClinicBtn = document.getElementById('selectClinicBtn');
    if (selectClinicBtn) {
        selectClinicBtn.onclick = function () {
            document.getElementById('clinicModal').style.display = 'block';
        };
    }

    // Asignar eventos a los botones del modal
    document.querySelectorAll('.selectClinicBtn').forEach(button => {
        button.addEventListener('click', function () {
            selectClinic(this.getAttribute('data-id'));
        });
    });

    document.querySelector('.btn-dark').addEventListener('click', closeModal);
});
