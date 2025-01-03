Gestión de Citas Médicas
Este proyecto es una aplicación web para gestionar citas médicas de manera eficiente. Permite a los usuarios registrar citas, validar datos de los pacientes, seleccionar especialidades médicas y consultar horarios disponibles, todo desde una interfaz web moderna y funcional.

Características
Registro de citas: Los usuarios pueden registrar citas seleccionando una fecha, hora, especialidad y médico disponible.
Validación de pacientes: Se valida la información de los pacientes mediante su cédula, verificando su existencia en la base de datos.
Consulta de citas registradas: Visualización de las citas registradas en una tabla organizada.
Gestión de horarios: Muestra horarios disponibles según la fecha y el médico seleccionado.
Interfaz interactiva: Diseño moderno con botones y funcionalidades mejoradas utilizando Bootstrap y efectos visuales.
Soporte para múltiples especialidades: Medicina General, Dermatología y Odontología.
Tecnologías Utilizadas
Frontend
HTML5
CSS3 (con soporte de diseño responsivo y animaciones)
JavaScript (uso de Fetch API para consumir la API)
Bootstrap para estilizar botones y mejorar la interfaz de usuario.
Backend
Python con Flask
Flask-CORS: Soporte para solicitudes CORS desde el frontend.
Flask-SQLAlchemy: Gestión de la base de datos.
Gunicorn: Servidor de producción.
Base de Datos
MySQL: Base de datos relacional para almacenar pacientes, médicos y citas.
Despliegue
Railway: Hosting del backend y base de datos.
GitHub Pages: Hosting del frontend estático.
Requisitos Previos
Python >= 3.10
Node.js y npm (opcional, si deseas usar herramientas adicionales para frontend).
Base de datos MySQL (local o remota, configurada en Railway o similar).
Instalación
1. Clonar el repositorio
bash
Copiar código
git clone https://github.com/DaniPoo19/citas-medicas-backend.git
cd citas-medicas-backend
2. Crear un entorno virtual e instalar dependencias
bash
Copiar código
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
3. Configurar la base de datos
Configura las credenciales de tu base de datos MySQL en el archivo app.py. Ejemplo:

python
Copiar código
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://usuario:contraseña@host:puerto/nombre_base_datos'
4. Iniciar la base de datos
bash
Copiar código
flask db init
flask db migrate -m "Creación de tablas"
flask db upgrade
5. Ejecutar el servidor
bash
Copiar código
flask run
Frontend
El frontend está alojado en GitHub Pages y puede ser actualizado con los siguientes pasos:

Clonar el repositorio del frontend

bash
Copiar código
git clone https://github.com/DaniPoo19/citas-medicas-frontend.git
cd citas-medicas-frontend
Actualizar los archivos si es necesario (HTML, CSS, JS).

Asegúrate de que el archivo script.js apunta a la URL correcta del backend.

Publicar en GitHub Pages

bash
Copiar código
git add .
git commit -m "Actualización del frontend"
git push origin main
Uso
Ingresa a la página principal.
Valida la cédula del paciente.
Selecciona una fecha, especialidad y médico.
Confirma la cita médica.
Consulta citas registradas haciendo clic en el botón correspondiente.
Estructura del Proyecto
php
Copiar código
citas-medicas-backend/
├── app.py                  # Archivo principal del backend
├── models.py               # Modelos de la base de datos
├── templates/              # Archivos HTML (si usas Flask Templates)
├── static/
│   ├── css/
│   │   └── style.css        # Estilos del frontend
│   └── js/
│       └── script.js        # Lógica del frontend
├── requirements.txt         # Dependencias del proyecto
├── README.md                # Este archivo
└── migrations/              # Migraciones de la base de datos# citas-medicas-frontend
