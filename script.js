document.addEventListener("DOMContentLoaded", () => {
    const cedulaInput = document.getElementById("cedula");
    const cedulaStatus = document.getElementById("cedula-status");
    const nameInput = document.getElementById("name");
    const apellidoInput = document.getElementById("apellido");
    const submitBtn = document.getElementById("submit-btn");
    const dateInput = document.getElementById("date");
    const validateCedulaBtn = document.getElementById("validate-cedula-btn");

    const API_BASE_URL = "https://citasmedicaschatbot-production.up.railway.app";

    // Configurar la fecha mínima para el campo de fecha
    setMinDate();

    // Listeners
    validateCedulaBtn.addEventListener("click", validateCedula);
    document.getElementById("type").addEventListener("change", updateDoctors);
    document.getElementById("doctor").addEventListener("change", updateTimeOptions);
    document.getElementById("date").addEventListener("change", updateTimeOptions);
    document.getElementById("appointment-form").addEventListener("submit", handleFormSubmit);

    loadAppointments();

    // Función para configurar la fecha mínima (un día después de la actual)
    function setMinDate() {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        const minDate = today.toISOString().split("T")[0];
        dateInput.setAttribute("min", minDate);
    }

    // Validar la cédula
    async function validateCedula() {
        const cedula = cedulaInput.value.trim();

        if (!/^\d+$/.test(cedula)) {
            cedulaStatus.textContent = "Solo se permiten números.";
            cedulaStatus.style.color = "red";
            submitBtn.disabled = true;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/validate_cedula/${cedula}`);
            const result = await response.json();

            if (result.valid) {
                cedulaStatus.textContent = "Cédula válida.";
                cedulaStatus.style.color = "green";
                nameInput.value = result.nombre;
                apellidoInput.value = result.apellido;
                submitBtn.disabled = false;
            } else {
                cedulaStatus.textContent = result.message || "Cédula no encontrada.";
                cedulaStatus.style.color = "red";
                nameInput.value = "";
                apellidoInput.value = "";
                submitBtn.disabled = true;
            }
        } catch (error) {
            cedulaStatus.textContent = "Error al validar la cédula.";
            cedulaStatus.style.color = "red";
        }
    }

    // Actualizar los doctores según la especialidad seleccionada
    async function updateDoctors() {
        const type = document.getElementById("type").value;
        try {
            const response = await fetch(`${API_BASE_URL}/doctors/${type}`);
            const doctors = await response.json();
            const doctorSelect = document.getElementById("doctor");
            doctorSelect.innerHTML = `<option value="" disabled selected>Seleccione un Doctor</option>`;
            doctors.forEach((doctor) => {
                const option = document.createElement("option");
                option.value = doctor.nombre;
                option.textContent = doctor.nombre;
                doctorSelect.appendChild(option);
            });
        } catch (error) {
            alert("Error al cargar los doctores.");
        }
    }

    // Actualizar los horarios disponibles según el doctor y la fecha seleccionada
    async function updateTimeOptions() {
        const date = document.getElementById("date").value;
        const doctor = document.getElementById("doctor").value;
        if (!date || !doctor) return;

        try {
            const response = await fetch(`${API_BASE_URL}/available_times/${doctor}/${date}`);
            const availableTimes = await response.json();
            const timeOptions = document.getElementById("time-options");
            timeOptions.innerHTML = "";

            availableTimes.forEach((time) => {
                const timeBlock = document.createElement("div");
                timeBlock.className = "time-block";
                timeBlock.textContent = time;
                timeBlock.dataset.time = time;
                timeBlock.addEventListener("click", () => {
                    document.querySelectorAll(".time-block").forEach((block) => block.classList.remove("selected"));
                    timeBlock.classList.add("selected");
                });
                timeOptions.appendChild(timeBlock);
            });
        } catch (error) {
            alert("Error al cargar los horarios disponibles.");
        }
    }
    document.addEventListener("DOMContentLoaded", () => {
        const showRegisterBtn = document.getElementById("show-register");
        const showAppointmentsBtn = document.getElementById("show-appointments");
        const formContainer = document.getElementById("form-container");
        const appointmentsContainer = document.getElementById("appointments-container");
    
        // Mostrar formulario de registrar cita
        showRegisterBtn.addEventListener("click", () => {
            formContainer.style.display = "block";
            appointmentsContainer.style.display = "none";
        });
    
        // Mostrar tabla de citas registradas
        showAppointmentsBtn.addEventListener("click", () => {
            appointmentsContainer.style.display = "block";
            formContainer.style.display = "none";
        });
    });
    

    // Manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        const cedula = document.getElementById("cedula").value;
        const nombre = document.getElementById("name").value;
        const apellido = document.getElementById("apellido").value;
        const fecha = document.getElementById("date").value;
        const especialidad = document.getElementById("type").value;
        const doctor = document.getElementById("doctor").value;
        const hora = document.querySelector(".time-block.selected")?.dataset.time;

        if (!cedula || !nombre || !apellido || !fecha || !especialidad || !doctor || !hora) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/add_appointment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cedula, nombre, apellido, fecha, hora, especialidad, doctor }),
            });

            if (response.ok) {
                alert("Cita registrada con éxito.");
                document.getElementById("appointment-form").reset();
                document.getElementById("time-options").innerHTML = "";
                loadAppointments();
            } else {
                const error = await response.json();
                alert(error.error || "Error al registrar la cita.");
            }
        } catch (error) {
            alert("Error al registrar la cita.");
        }
    }

    // Cargar las citas registradas
    async function loadAppointments() {
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`);
            const appointments = await response.json();
            const tableBody = document.getElementById("appointments-table");
            tableBody.innerHTML = "";

            appointments.forEach((appointment) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${appointment.id}</td>
                    <td>${appointment.cedula}</td>
                    <td>${appointment.nombre}</td>
                    <td>${appointment.apellido}</td>
                    <td>${appointment.fecha}</td>
                    <td>${appointment.hora}</td>
                    <td>${appointment.especialidad}</td>
                    <td>${appointment.doctor}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            alert("Error al cargar las citas.");
        }
    }
});
