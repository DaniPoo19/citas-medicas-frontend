document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://citasmedicaschatbot-production.up.railway.app";

    // Botones de navegación
    const registerBtn = document.getElementById("view-register-btn");
    const appointmentsBtn = document.getElementById("view-appointments-btn");

    // Secciones del contenido
    const formContainer = document.getElementById("form-container");
    const appointmentsContainer = document.getElementById("appointments-container");

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
    registerBtn.addEventListener("click", () => toggleView(registerBtn, formContainer, appointmentsContainer));
    appointmentsBtn.addEventListener("click", () => toggleView(appointmentsBtn, appointmentsContainer, formContainer));

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

    // Función para establecer la fecha mínima en el formulario
    function setMinDate() {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const minDate = today.toISOString().split("T")[0];
        dateInput.setAttribute("min", minDate);
    }

    // Función para alternar vistas
    function toggleView(selectedButton, sectionToShow, sectionToHide) {
        registerBtn.classList.remove("active-btn");
        appointmentsBtn.classList.remove("active-btn");
        selectedButton.classList.add("active-btn");

        sectionToShow.style.display = "block";
        sectionToHide.style.display = "none";
    }

    // Función para validar la cédula
    async function validateCedula() {
        const tipoDocumento = tipoDocumentoSelect.value;
        const cedula = cedulaInput.value.trim();

        if (!tipoDocumento || !cedula || !/^\d+$/.test(cedula)) {
            cedulaStatus.textContent = "Seleccione un tipo de documento y un número válido.";
            cedulaStatus.style.color = "red";
            submitBtn.disabled = true;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/validate_cedula`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo_documento: tipoDocumento, cedula }),
            });
            const result = await response.json();

            if (response.ok) {
                cedulaStatus.textContent = "Documento válido.";
                cedulaStatus.style.color = "green";
                nameInput.value = result.nombre;
                apellidoInput.value = result.apellido;
                submitBtn.disabled = false;
            } else {
                cedulaStatus.textContent = result.message || "Documento no encontrado.";
                cedulaStatus.style.color = "red";
                nameInput.value = "";
                apellidoInput.value = "";
                submitBtn.disabled = true;
            }
        } catch (error) {
            cedulaStatus.textContent = "Error al validar el documento.";
            cedulaStatus.style.color = "red";
        }
    }

    // Función para manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        const tipoDocumento = tipoDocumentoSelect.value;
        const cedula = cedulaInput.value.trim();
        const nombre = nameInput.value.trim();
        const apellido = apellidoInput.value.trim();
        const fecha = dateInput.value;
        const especialidad = typeSelect.value;
        const doctor = doctorSelect.value;
        const hora = document.querySelector("#time-options button.active")?.dataset.time;

        if (!tipoDocumento || !cedula || !nombre || !apellido || !fecha || !especialidad || !doctor || !hora) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/add_appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo_documento: tipoDocumento, cedula, nombre, apellido, fecha, hora, especialidad, doctor }),
            });

            if (response.ok) {
                alert("Cita registrada con éxito.");
                document.getElementById("appointment-form").reset();
                timeOptions.innerHTML = "";
                loadAppointments();
                toggleView(appointmentsBtn, appointmentsContainer, formContainer);
            } else {
                const error = await response.json();
                alert(error.error || "Error al registrar la cita.");
            }
        } catch (error) {
            alert("Error al registrar la cita.");
        }
    }

    // Función para cargar las citas registradas
    async function loadAppointments() {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            const appointments = await response.json();
            appointmentsTable.innerHTML = "";

            appointments.forEach((appointment) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${appointment.id}</td>
                    <td>${appointment.tipo_documento}</td>
                    <td>${appointment.cedula}</td>
                    <td>${appointment.nombre}</td>
                    <td>${appointment.apellido}</td>
                    <td>${appointment.fecha}</td>
                    <td>${appointment.hora}</td>
                    <td>${appointment.especialidad}</td>
                    <td>${appointment.doctor}</td>
                `;
                appointmentsTable.appendChild(row);
            });
        } catch (error) {
            alert("Error al cargar las citas registradas.");
        }
    }
});
