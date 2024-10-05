## Proyecto: Sistema de Historia Clínica Electrónica

### Descripción del Proyecto
El proyecto es un **sistema de historia clínica electrónica** que permite gestionar y almacenar la información de pacientes, incluyendo sus datos personales, historial clínico, y detalles médicos relevantes. La aplicación está desarrollada con Node.js, Express y una base de datos MySQL, con Pug como motor de plantillas para las vistas.

### Estructura del Proyecto
- **app/**: Contiene los controladores de las diferentes funcionalidades del proyecto.
  - **controllers/**: Contiene la lógica de cada controlador.
    - `patientsController.js`: Controlador para manejar todas las operaciones relacionadas con los pacientes.
    - `historiasController.js`: Controlador para manejar todas las operaciones relacionadas con las historias clínicas.
  - **views/**: Contiene las plantillas Pug para las vistas del proyecto.
    - `newHistoria.pug`: Formulario para crear una nueva historia clínica.
    - `patients.pug`: Vista para listar pacientes.
    - `layout.pug`: Plantilla base del sitio web.
- **config/**: Contiene los archivos de configuración de la base de datos.
  - `database.js`: Archivo para configurar la conexión a la base de datos MySQL.
- **routes/**: Define las rutas del proyecto.
  - `patients.js`: Rutas para manejar las operaciones de los pacientes.
  - `historias.js`: Rutas para manejar las operaciones de las historias clínicas.
  - `citas.js`, `medicos.js`: Manejan las operaciones de citas y médicos, respectivamente.

### Base de Datos
La base de datos **medicappdb** tiene dos tablas principales:

1. **pacientes**
   - idPaciente (int, PK)
   - nombre (varchar)
   - dni (varchar)
   - fechaNacimiento (date)
   - direccion (varchar)
   - telefono (varchar)

2. **historias_clinicas**
   - idHistoria (int, PK)
   - idPaciente (int, FK)
   - detalles (text)
   - fechaDiagnostico (date)
   - medicamentos (text)
   - alergias (text)
   - condicionActual (text)
   - pruebasDiagnosticas (text)
   - fechaProximaCita (date)
   - urlDocumento (varchar)
   - notasMedicas (text)
   - especialistaReferido (text)

### Funcionalidades Implementadas

1. **Gestión de Pacientes**
   - Listar todos los pacientes.
   - Crear un nuevo paciente con su nombre, fecha de nacimiento, DNI, dirección y teléfono.
   - Editar y actualizar los datos de un paciente.
   - Eliminar un paciente.
   - Buscar un paciente por su DNI y obtener su historial clínico.

2. **Gestión de Historias Clínicas**
   - Crear una nueva historia clínica asociada a un paciente.
   - Listar todas las historias clínicas registradas.
   - Editar, actualizar o eliminar una historia clínica.
   - Autocompletar el nombre del paciente y el historial clínico al ingresar el DNI en el formulario de creación de una nueva historia clínica.

3. **Formulario para Crear Historia Clínica**
   - Se ha implementado un formulario donde el usuario puede ingresar el **DNI del paciente** y el sistema autocompleta el **nombre del paciente** si existe en la base de datos.
   - Si el paciente tiene historial clínico previo, se muestra en el campo **Detalles** para que pueda ser editado.

### Avances hasta el Momento

1. **Conexión a la Base de Datos**
   La conexión a la base de datos se configuró en el archivo `database.js`, utilizando el paquete `mysql2` para conectarse a MySQL.

2. **Rutas y Controladores**
   - Las rutas para manejar las operaciones de pacientes y de historias clínicas están definidas y enlazadas a sus respectivos controladores.
   - La ruta `/buscarPaciente/:dni` permite buscar un paciente por su DNI y autocompletar su nombre en el formulario de creación de historia clínica.

3. **Formulario de Historia Clínica**
   El formulario en `newHistoria.pug` permite buscar un paciente por su DNI y, si el paciente tiene una historia clínica previa, se carga automáticamente en el campo de **Detalles**. Este formulario incluye:
   - Un campo de texto para el **DNI del paciente**.
   - Un campo de texto de solo lectura para el **Nombre del paciente**.
   - Un campo de texto para ingresar o editar los **detalles** médicos del paciente.

4. **Integración con GitHub**
   Se ha creado un repositorio en GitHub para gestionar las versiones del proyecto. La rama predeterminada es `master`, y los cambios se han hecho `push` a dicha rama utilizando Git.

### Próximos Pasos

1. **Mejoras en la Historia Clínica**
   - Añadir campos adicionales como **medicamentos**, **fecha del diagnóstico**, **próximas citas**, etc., en el formulario y en la lógica del controlador.
   - Implementar validaciones más robustas tanto en el frontend como en el backend para asegurar que los datos ingresados son correctos.

2. **Seguridad**
   - Implementar autenticación y autorización para que solo usuarios autorizados puedan acceder a ciertas funcionalidades del sistema (como editar o eliminar registros).

3. **Mejoras de UI**
   - Mejorar el diseño de las vistas para que sean más amigables para el usuario, utilizando algún framework de CSS como Bootstrap o Tailwind (dependiendo de tus preferencias).

### Comandos Útiles para Git

- **Iniciar Git y subir a un repositorio nuevo**:
  ```bash
  git init
  git remote add origin <URL_DEL_REPOSITORIO>
  git add .
  git commit -m "Primera versión del proyecto"
  git push -u origin master
  ```

- **Agregar nuevos cambios**:
  ```bash
  git add .
  git commit -m "Descripción de los cambios"
  git push origin master
  ```

### Repositorio GitHub
