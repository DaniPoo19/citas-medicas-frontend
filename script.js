document.addEventListener("DOMContentLoaded", () => {
    const cedulaInput = document.getElementById("cedula");
    const cedulaStatus = document.getElementById("cedula-status");
    const nameInput = document.getElementById("name");
    const apellidoInput = document.getElementById("apellido");
    const submitBtn = document.getElementById("submit-btn");
    const dateInput = document.getElementById("date");
    const validateCedulaBtn = document.getElementById("validate-cedula-btn");

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

        const response = await fetch(`/validate_cedula/${cedula}`);
        const result = await response.json();

        if (result.valid) {
            cedulaStatus.textContent = "Cédula válida.";
            cedulaStatus.style.color = "green";
            nameInput.value = result.nombre;
            apellidoInput.value = result.apellido;
            submitBtn.disabled = false;
        } else {
            cedulaStatus.textContent = result.message;
            cedulaStatus.style.color = "red";
            nameInput.value = "";
            apellidoInput.value = "";
            submitBtn.disabled = true;
        }
    }

    // Actualizar los doctores según la especialidad seleccionada
    async function updateDoctors() {
        const type = document.getElementById("type").value;
        const response = await fetch(`/doctors/${type}`);
        const doctors = await response.json();
        const doctorSelect = document.getElementById("doctor");
        doctorSelect.innerHTML = `<option value="" disabled selected>Seleccione un Doctor</option>`;
        doctors.forEach((doctor) => {
            const option = document.createElement("option");
            option.value = doctor.id;
            option.textContent = doctor.name;
            doctorSelect.appendChild(option);
        });
    }

    // Actualizar los horarios disponibles según el doctor y la fecha seleccionada
    async function updateTimeOptions() {
        const date = document.getElementById("date").value;
        const doctor = document.getElementById("doctor").value;
        if (!date || !doctor) return;

        const response = await fetch(`/available_times/${doctor}/${date}`);
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
    }

    // Manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        const cedula = document.getElementById("cedula").value;
        const name = document.getElementById("name").value;
        const apellido = document.getElementById("apellido").value;
        const date = document.getElementById("date").value;
        const type = document.getElementById("type").value;
        const doctorId = document.getElementById("doctor").value;
        const time = document.querySelector(".time-block.selected")?.dataset.time;

        if (!cedula || !name || !apellido || !date || !type || !doctorId || !time) {
            alert("Por favor, complete todos los campos.");
            return;
        }

        const response = await fetch("/add_appointment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cedula, name, apellido, date, time, type, doctor_id: doctorId }),
        });

        if (response.ok) {
            alert("Cita registrada con éxito.");
            document.getElementById("appointment-form").reset();
            document.getElementById("time-options").innerHTML = "";
            loadAppointments();
        } else {
            const error = await response.json();
            alert(error.error);
        }
    }

    // Cargar las citas registradas
    async function loadAppointments() {
        const response = await fetch("/appointments");
        const appointments = await response.json();
        const tableBody = document.getElementById("appointments-table");
        tableBody.innerHTML = "";

        appointments.forEach((appointment) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${appointment.id}</td>
                <td>${appointment.cedula}</td>
                <td>${appointment.name}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td>${appointment.type}</td>
                <td>${appointment.doctor}</td>
            `;
            tableBody.appendChild(row);
        });
    }
});
