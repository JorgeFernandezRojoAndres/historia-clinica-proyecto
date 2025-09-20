Sistema de Historia Clínica Electrónica
Descripción del Proyecto
Este proyecto es un sistema de gestión de historias clínicas electrónicas desarrollado en Node.js con Express y MySQL. Permite gestionar la información de pacientes, citas médicas y sus historiales clínicos. Las vistas utilizan Pug como motor de plantillas.

Estructura del Proyecto
app/: Controladores y vistas del proyecto.
controllers/:
authController.js: Gestión de autenticación.
citasController.js: Controlador para gestionar citas.
historiasController.js: Gestión de historias clínicas.
pacientesController.js: Operaciones relacionadas con pacientes.
views/:
Formularios para pacientes, citas e historias.
login.pug, escritorioMedico.pug: Vistas para usuarios.
routes/: Rutas definidas para las operaciones CRUD de citas, pacientes y médicos.
public/: Archivos JS y CSS para frontend.
config/: Configuración de la base de datos con MySQL.
Base de Datos
Incluye tablas como:

pacientes: Información básica de pacientes.
citas: Registro de citas médicas con médicos y pacientes.
historias_clinicas: Historial médico detallado de cada paciente.
Funcionalidades Implementadas
Gestión de Pacientes: Listado, búsqueda y edición.
Gestión de Citas: Creación y asignación de citas con médicos.
Historias Clínicas: Registro y consulta de historial médico.
Autocompletado: Búsqueda dinámica de pacientes al ingresar su nombre o DNI.
Próximos Pasos
Implementación de autenticación más robusta.
Mejoras de diseño en la interfaz.
Validaciones adicionales en los formularios.
Comandos para Git
