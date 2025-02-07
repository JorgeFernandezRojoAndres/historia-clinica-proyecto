document.addEventListener("DOMContentLoaded", () => {
    const botonesClinica = document.querySelectorAll(".card-clinica");
  
    botonesClinica.forEach((boton) => {
      boton.addEventListener("click", async function () {
        const idClinica = this.querySelector("input[name='idClinica']").value;
  
        try {
          const response = await fetch("/seleccionar-clinica", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idClinica }),
          });
  
          const data = await response.json();
  
          if (data.success) {
            alert("Clínica seleccionada correctamente");
            document.getElementById("clinicModal").style.display = "none"; // Cierra el modal
            window.location.href = data.redirectUrl; // Redirige a la nueva URL
          } else {
            alert(data.message);
          }
        } catch (error) {
          console.error("Error en la selección de clínica:", error);
          alert("Error en la selección de clínica");
        }
      });
    });
  });
  