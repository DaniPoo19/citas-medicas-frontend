document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "http://127.0.0.1:5000"; // URL local para el backend

    // Botones de navegación
    const registerBtn = document.getElementById("view-register-btn");
    const appointmentsBtn = document.getElementById("view-appointments-btn");

    // Secciones del contenido
    const validationSection = document.getElementById("validation-section");
    const fullFormSection = document.getElementById("full-form-section");
    const appointmentsContainer = document.getElementById("appointments-container");
    
    // Almacenar el paciente_id después de la validación
    let pacienteId = null; 

    // Elementos del formulario
    const tipoDocumentoSelect = document.getElementById("tipo-documento");
    const cedulaInput = document.getElementById("cedula");
    const cedulaStatus = document.getElementById("cedula-status");
    const nameInput = document.getElementById("name");
    const apellidoInput = document.getElementById("apellido");
    const dateInput = document.getElementById("date");
    const typeSelect = document.getElementById("type");
    const doctorSelect = document.getElementById("doctor");
    const timeOptions = document.getElementById("time-options");
    const submitBtn = document.getElementById("submit-btn");
    const validateCedulaBtn = document.getElementById("validate-cedula-btn");

    // Tabla de citas
    const appointmentsTable = document.getElementById("appointments-table");

    // Configuración de la fecha mínima
    setMinDate();

    // Listeners para cambiar entre vistas
    registerBtn.addEventListener("click", () => toggleView(registerBtn, validationSection, appointmentsContainer));
    appointmentsBtn.addEventListener("click", () => toggleView(appointmentsBtn, appointmentsContainer, validationSection, fullFormSection));

    // Listener para validar la cédula
    validateCedulaBtn.addEventListener("click", validateCedula);

    // Listener para actualizar doctores y horarios
    typeSelect.addEventListener("change", updateDoctors);
    doctorSelect.addEventListener("change", updateTimeOptions);
    dateInput.addEventListener("change", updateTimeOptions);

    // Listener para manejar el envío del formulario
    document.getElementById("appointment-form").addEventListener("submit", handleFormSubmit);

    // Cargar citas al inicio
    loadAppointments();

    // Cargar especialidades dinámicamente al cargar la página
    loadSpecialties();

    // Función para establecer la fecha mínima en el formulario
    function setMinDate() {
        const today = new Date();
        today.setDate(today.getDate() + 1); // Establecer la fecha mínima como mañana
        const minDate = today.toISOString().split("T")[0];
        dateInput.setAttribute("min", minDate);
    }

    // Función para alternar vistas
    function toggleView(selectedButton, sectionToShow, ...sectionsToHide) {
        registerBtn.classList.remove("active-btn");
        appointmentsBtn.classList.remove("active-btn");
        selectedButton.classList.add("active-btn");

        sectionToShow.style.display = "block";
        sectionsToHide.forEach(section => {
            section.style.display = "none";
        });
    }

    // Función para cargar las especialidades desde el backend
    async function loadSpecialties() {
        try {
            const response = await fetch(`${API_BASE_URL}/especialidades`);
            const specialties = await response.json();

            // Limpiar el select de especialidades
            typeSelect.innerHTML = '<option value="" disabled selected>Seleccione Especialidad</option>';

            // Añadir las especialidades al select
            specialties.forEach((especialidad) => {
                const option = document.createElement("option");
                option.value = especialidad.id;  // Asignar el id de la especialidad
                option.textContent = especialidad.nombre;  // Nombre de la especialidad
                typeSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar las especialidades:", error);
        }
    }

    // Función para validar la cédula
    // Función para validar la cédula
async function validateCedula() {
    const tipoDocumento = tipoDocumentoSelect.value;
    const cedula = cedulaInput.value.trim();

    if (!tipoDocumento) {
        cedulaStatus.textContent = "Seleccione un tipo de documento.";
        cedulaStatus.style.color = "red";
        submitBtn.disabled = true;
        return;
    }

    if (!/^\d+$/.test(cedula)) {
        cedulaStatus.textContent = "Solo se permiten números.";
        cedulaStatus.style.color = "red";
        submitBtn.disabled = true;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/validate_cedula`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipoDocumento, cedula }),
        });
        const result = await response.json();

        if (response.ok) {
            cedulaStatus.textContent = "Documento válido.";
            cedulaStatus.style.color = "green";
            nameInput.value = result.nombre;
            apellidoInput.value = result.apellido;
            submitBtn.disabled = false;

            // Guardar el paciente_id obtenido del backend
            pacienteId = result.paciente_id;

            // Mostrar la siguiente parte del formulario con animación más fluida
            fullFormSection.classList.remove("hidden");
            
            // Usar requestAnimationFrame para asegurar que el navegador procese los cambios antes de la animación
            requestAnimationFrame(() => {
                fullFormSection.classList.add("slide-down");
            });
        } else {
            cedulaStatus.textContent = result.message || "Documento no encontrado.";
            cedulaStatus.style.color = "red";
            nameInput.value = "";
            apellidoInput.value = "";
            submitBtn.disabled = true;
            pacienteId = null; // Limpiar el paciente_id si no se encuentra
        }
    } catch (error) {
        cedulaStatus.textContent = "Error al validar el documento.";
        cedulaStatus.style.color = "red";
        pacienteId = null; // Limpiar el paciente_id en caso de error
    }
}

    

    // Función para cargar las citas registradas
    async function loadAppointments() {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            const appointments = await response.json();

            appointmentsTable.innerHTML = "";
            appointments.forEach((cita) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${cita.id}</td>
                    <td>${cita.tipo_documento}</td>
                    <td>${cita.cedula}</td>
                    <td>${cita.nombre}</td>
                    <td>${cita.apellido}</td>
                    <td>${cita.fecha}</td>
                    <td>${cita.hora}</td>
                    <td>${cita.especialidad}</td>
                    <td>${cita.doctor}</td>
                `;
                appointmentsTable.appendChild(row);
            });
        } catch (error) {
            alert("Error al cargar las citas registradas.");
        }
    }

    // Función para actualizar los doctores según la especialidad
    async function updateDoctors() {
        const especialidadId = typeSelect.value;
        if (!especialidadId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${especialidadId}`);
            const doctors = await response.json();

            // Limpiar el select de doctores
            doctorSelect.innerHTML = '<option value="" disabled selected>Seleccione un Doctor</option>';

            // Añadir los doctores al select
            doctors.forEach((doctor) => {
                const option = document.createElement("option");
                option.value = doctor.id;  // Asignar el id del doctor
                option.textContent = doctor.nombre;  // Nombre del doctor
                doctorSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar doctores:", error);
        }
    }

    // Función para actualizar los horarios disponibles según la fecha y el doctor
    // Función para actualizar los horarios disponibles según la fecha y el doctor
// Función para actualizar los horarios disponibles según la fecha y el doctor
async function updateTimeOptions() {
    const doctorId = doctorSelect.value;
    const fecha = dateInput.value;
    if (!doctorId || !fecha) return;

    try {
        const response = await fetch(`${API_BASE_URL}/available_times/${doctorId}/${fecha}`);
        const availableTimes = await response.json();

        // Depurar si se están recibiendo correctamente los horarios
        console.log("Horarios disponibles recibidos:", availableTimes);

        // Verificar si no hay horarios disponibles
        if (!availableTimes || availableTimes.length === 0) {
            timeOptions.innerHTML = "<p>No hay horarios disponibles para la fecha seleccionada.</p>";
            return;
        }

        // Limpiar los horarios existentes
        timeOptions.innerHTML = '';

        // Añadir los horarios disponibles
        availableTimes.forEach((hora) => {
            if (hora) {  // Asegurarse de que la hora no sea un valor vacío o nulo
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn time-option-button";
                button.textContent = hora;  // Asegúrate de que `hora` sea el valor correcto que necesitas mostrar

                button.classList.add("btn-outline-primary");
                button.onclick = function () {
                    timeOptions.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    submitBtn.disabled = false; // Habilitar el botón de "Registrar"
                };

                timeOptions.appendChild(button);
            }
        });
    } catch (error) {
        console.error("Error al cargar horarios disponibles:", error);
    }
}



    // Función para manejar el envío del formulario
    async function handleFormSubmit(event) {
        event.preventDefault();
    
        if (!pacienteId) {
            alert("Debe validar la cédula del paciente antes de agendar la cita.");
            return;
        }
    
        const formData = {
            paciente_id: pacienteId,  // Usar el paciente_id validado
            tipoDocumento: tipoDocumentoSelect.value,
            cedula: cedulaInput.value.trim(),
            nombre: nameInput.value.trim(),
            apellido: apellidoInput.value.trim(),
            fecha_cita: dateInput.value,
            hora_cita: timeOptions.querySelector('.active') ? timeOptions.querySelector('.active').textContent : '',
            especialidad_id: typeSelect.value,
            medico_id: doctorSelect.value
        };
    
        if (!formData.hora_cita) {
            alert("Por favor, seleccione un horario.");
            return;
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/citas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                alert("Cita registrada con éxito");
                loadAppointments();
                document.getElementById("appointment-form").reset();
                submitBtn.disabled = true;
                pacienteId = null; // Limpiar el paciente_id después del registro
                fullFormSection.classList.add("hidden"); // Ocultar la sección del formulario completo después de enviar
            } else {
                const errorResponse = await response.json();
                alert(`Error al registrar la cita: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error("Error al enviar los datos del formulario:", error);
            alert("Hubo un error al registrar la cita.");
        }
    }
});
