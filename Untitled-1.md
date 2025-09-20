# File Tree: historia-clinica-proyecto-master

Generated on: 9/20/2025, 2:24:07 PM
Root path: `f:\Proyectos\historia-clinica-proyecto-master`

```
├── 📁 app/
│   ├── 📁 controllers/
│   │   ├── 📄 adminController.js
│   │   ├── 📄 authController.js
│   │   ├── 📄 citasController.js
│   │   ├── 📄 especialidadesController.js
│   │   ├── 📄 historiasController.js
│   │   ├── 📄 homeController.js
│   │   ├── 📄 medicalRecordController.js
│   │   ├── 📄 medicosController.js
│   │   └── 📄 pacientesController.js
│   ├── 📁 models/
│   │   ├── 📄 MOCita.js
│   │   ├── 📄 MOHistoriaClinica.js
│   │   ├── 📄 MOMedico.js
│   │   ├── 📄 MOPaciente.js
│   │   └── 📄 medicalRecord.js
│   └── 📁 views/
│       ├── 📁 partials/
│       │   └── 📄 resultadosMedicos.pug
│       ├── 📄 CDC.pug
│       ├── 📄 adminPacientesPendientes.pug
│       ├── 📄 agenda_medico.pug
│       ├── 📄 agregarAlergias.pug
│       ├── 📄 agregarDiagnostico.pug
│       ├── 📄 agregarMedicamento.pug
│       ├── 📄 citas.pug
│       ├── 📄 consulta.pug
│       ├── 📄 editCita.pug
│       ├── 📄 editHistoria.pug
│       ├── 📄 editMedico.pug
│       ├── 📄 editPaciente.pug
│       ├── 📄 escritorioAdministrador.pug
│       ├── 📄 escritorioMedico.pug
│       ├── 📄 escritorioSecretaria.pug
│       ├── 📄 filtrar_turnos.pug
│       ├── 📄 formularioAsignarClinica.pug
│       ├── 📄 formularioRegistrarUsuario.pug
│       ├── 📄 historialPaciente.pug
│       ├── 📄 historias.pug
│       ├── 📄 layout.pug
│       ├── 📄 listadoMedicos.pug
│       ├── 📄 login.pug
│       ├── 📄 loginmedicos.pug
│       ├── 📄 loginpacientes.pug
│       ├── 📄 loginsecretarias.pug
│       ├── 📄 manejarHorariosLibres.pug
│       ├── 📄 misTurnos.pug
│       ├── 📄 newCita.pug
│       ├── 📄 newHistoria.pug
│       ├── 📄 newMedico.pug
│       ├── 📄 new_pacientes.pug
│       ├── 📄 pacientes.pug
│       ├── 📄 perfilPaciente.pug
│       ├── 📄 registrarAntecedentes.pug
│       ├── 📄 registrarEvolucion.pug
│       ├── 📄 registrarHabitos.pug
│       ├── 📄 registroPendiente.pug
│       ├── 📄 selectClinica.pug
│       ├── 📄 templateNota.pug
│       └── 📄 verHorarios.pug
├── 📁 config/
│   ├── 📄 config.js
│   └── 📄 database.js
├── 📁 middleware/
│   └── 📄 roleMiddleware.js
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 public/
│   ├── 📁 css/
│   │   └── 🎨 style.css
│   ├── 📁 images/
│   │   ├── 🖼️ Captura.JPG
│   │   ├── 🖼️ Captura1.JPG
│   │   ├── 🖼️ Captura10.JPG
│   │   ├── 🖼️ Captura11.JPG
│   │   ├── 🖼️ Captura12.JPG
│   │   ├── 🖼️ Captura13.JPG
│   │   ├── 🖼️ Captura14.JPG
│   │   ├── 🖼️ Captura15.JPG
│   │   ├── 🖼️ Captura16.JPG
│   │   ├── 🖼️ Captura3.JPG
│   │   ├── 🖼️ Captura4.JPG
│   │   ├── 🖼️ Captura5.JPG
│   │   ├── 🖼️ Captura6.JPG
│   │   ├── 🖼️ Captura7.JPG
│   │   ├── 🖼️ Captura8.JPG
│   │   ├── 🖼️ Captura9.JPG
│   │   ├── 🖼️ ImgLogDoc.jpg
│   │   ├── 🖼️ ImgLogSecr.jpg
│   │   ├── 📄 Sin título-1.psd
│   │   ├── 🖼️ btnAGALE.png
│   │   ├── 🖼️ btnAgDiag.png
│   │   ├── 🖼️ btnAtenderSobreturno.png
│   │   ├── 🖼️ btnConADD.png
│   │   ├── 🖼️ btnHDA.png
│   │   ├── 🖼️ btnIniCon.png
│   │   ├── 🖼️ btnMEENus.png
│   │   ├── 🖼️ btnREGant.png
│   │   ├── 🖼️ btnREHABB.png
│   │   ├── 🖼️ btnREvo.png
│   │   ├── 🖼️ btnfiltrPF.png
│   │   ├── 🖼️ clinica.jpg
│   │   ├── 🖼️ saludplus.png
│   │   ├── 🖼️ soyAdminBTN.png
│   │   ├── 🖼️ soyDoctorBTN.png
│   │   ├── 🖼️ soypacienteBTN.png
│   │   ├── 📄 soypacienteBTN.psd
│   │   ├── 🖼️ templatebtn.png
│   │   └── 🖼️ vidatotal.png
│   ├── 📁 js/
│   │   ├── 📄 agendaMedico.js
│   │   ├── 📄 chatbot.js
│   │   ├── 📄 escritorioMedico.js
│   │   ├── 📄 filtrarCitas.js
│   │   ├── 📄 gestionCitasCombinado.js
│   │   ├── 📄 secretaria.js
│   │   └── 📄 seleccionarClinica.js
│   ├── 📄 agenda.js
│   ├── 📄 botonAgenda.js
│   ├── 📄 botondinamicoAgendaEnCita.js
│   ├── 📄 gestionHorarios.js
│   ├── 📄 medico-selection.js
│   ├── 📄 searchMedico.js
│   └── 📄 searchPaciente.js
├── 📁 routes/
│   ├── 📄 admin.js
│   ├── 📄 auth.js
│   ├── 📄 citas.js
│   ├── 📄 especialidades.js
│   ├── 📄 historias.js
│   ├── 📄 medicalRecordController.js
│   ├── 📄 medicos.js
│   ├── 📄 pacientes.js
│   └── 📄 secretaria.js
├── 📁 utils/
│   ├── 📄 autocompletePacientes.js
│   ├── 📄 horariosLibres.js
│   ├── 📄 notificaciones.js
│   ├── 📄 repetirHorarios.js
│   └── 📄 validarFormularioEvolucion.js
├── 🔒 .env 🚫 (auto-hidden)
├── 📄 Documentacion.doc
├── 📖 README.md
├── 🖼️ diagrama_flujo.png
├── 🖼️ diagrama_flujo.svg
├── 📄 estructura_proyecto.txt
├── 📄 generateFlowchart.js
├── 📄 hashPassword.js
├── 📄 index.js
├── 📄 limpiar_chatgpt.js
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 structure.json
├── 📄 test.js
├── 📄 testOpenAI.js
└── 📄 webpack.config.js
```

---
*Generated by FileTree Pro Extension*