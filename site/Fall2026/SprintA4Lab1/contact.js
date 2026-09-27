const contactForm = document.getElementById("contactForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");

const successMessage = document.getElementById("successMessage");

/**
 * Validates the name field.
 * Returns: Whether the name field contains a value.
 */
function validateName() {
    if (nameInput.value.trim() === "") {
        nameError.textContent = "Name is required.";
        return false;
    }

    nameError.textContent = "";
    return true;
}

/**
 * Validates the email field.
 * Returns: Whether the email address is valid.
 */
function validateEmail() {
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        emailError.textContent = "Email is required.";
        return false;
    }

    if (!emailPattern.test(email)) {
        emailError.textContent = "Please enter a valid email address.";
        return false;
    }

    emailError.textContent = "";
    return true;
}

/**
 * Validates the message field.
 * Returns: Whether the message field contains a value.
 */
function validateMessage() {
    if (messageInput.value.trim() === "") {
        messageError.textContent = "Message is required.";
        return false;
    }

    messageError.textContent = "";
    return true;
}

// Provide immediate validation feedback.
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
messageInput.addEventListener("input", validateMessage);

/**
 * Handles contact form submission.
 * Parameters:
 * - event: The form submission event.
 */
function handleSubmit(event) {
    event.preventDefault();

    const validName = validateName();
    const validEmail = validateEmail();
    const validMessage = validateMessage();

    if (!validName || !validEmail || !validMessage) {
        successMessage.textContent = "";
        return;
    }

    successMessage.textContent =
        "Your message has been submitted successfully.";

    contactForm.reset();
}

contactForm.addEventListener("submit", handleSubmit);
