document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("userForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const ageInput = document.getElementById("age");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const ageError = document.getElementById("ageError");

    function validateName() {
        if (nameInput.value.trim() === "") {
            nameError.textContent = "Name is required.";
            return false;
        }

        nameError.textContent = "";
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email === "") {
            emailError.textContent = "Email is required.";
            return false;
        }

        if (!emailPattern.test(email)) {
            emailError.textContent = "Please enter a valid email.";
            return false;
        }

        emailError.textContent = "";
        return true;
    }

    function validateAge() {
        const age = Number(ageInput.value);

        if (ageInput.value === "") {
            ageError.textContent = "Age is required.";
            return false;
        }

        if (age <= 0) {
            ageError.textContent = "Age must be a positive number.";
            return false;
        }

        ageError.textContent = "";
        return true;
    }

    // Immediate feedback when the user leaves each field.
    nameInput.addEventListener("blur", validateName);
    emailInput.addEventListener("blur", validateEmail);
    ageInput.addEventListener("blur", validateAge);

    // Also validate as the user types.
    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    ageInput.addEventListener("input", validateAge);

    // Prevent submission if any field is invalid.
    form.addEventListener("submit", function (event) {
        const nameValid = validateName();
        const emailValid = validateEmail();
        const ageValid = validateAge();

        if (!nameValid || !emailValid || !ageValid) {
            event.preventDefault();
        } else {
            event.preventDefault();
            alert("Form submitted successfully!");
        }
    });
});
