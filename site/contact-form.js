import { createSubmissionGuard } from "./portfolio-security.js";

// Part 3: Contact form validation and safe interactive features.
// The contact form validates locally for this assignment; it deliberately sends no network request.

/**
 * Validate a required text field and update its accessible error feedback.
 * @param {HTMLInputElement|HTMLTextAreaElement} input Field to validate.
 * @param {HTMLElement} feedback Element where the validation message is shown.
 * @param {string} message Error message displayed when the field is empty.
 * Parameters: input â€” field value; feedback â€” message element; message â€” validation text.
 * @returns {boolean} True if the field contains non-whitespace text.
 * Returns: the field validation result.
 */
function validateField(input, feedback, message) {
    if (!input || !feedback || typeof input.value !== "string") {
        console.error("Contact form field or feedback markup is missing or invalid.");
        return false;
    }

    if (input.value.trim() === "") {
        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
        feedback.textContent = message;
        return false;
    }

    input.classList.remove("input-error");
    input.setAttribute("aria-invalid", "false");
    feedback.textContent = "";
    return true;
}

/**
 * Validate an email field and display a user-friendly message when invalid.
 * @param {HTMLInputElement} input Email field to validate.
 * @param {HTMLElement} feedback Element where validation feedback is shown.
 * Parameters: input â€” email value; feedback â€” message element.
 * @returns {boolean} True when the email matches the expected basic format.
 * Returns: the email validation result.
 */
function validateEmail(input, feedback) {
    if (!input || !feedback || typeof input.value !== "string") {
        console.error("Email field or feedback markup is missing or invalid.");
        return false;
    }

    // Trim whitespace before applying a basic email-format check.
    const email = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

    if (email === "") {
        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
        feedback.textContent = "Email is required.";
        return false;
    }

    if (!emailPattern.test(email)) {
        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
        feedback.textContent = "Please enter a valid email address.";
        return false;
    }

    input.classList.remove("input-error");
    input.setAttribute("aria-invalid", "false");
    feedback.textContent = "";
    return true;
}

/**
 * Clear a field's visual and accessible validation state after a successful submission.
 * @param {HTMLInputElement|HTMLTextAreaElement} input Field to reset.
 * @param {HTMLElement} feedback Related feedback element.
 * Parameters: input â€” field element; feedback â€” feedback element.
 * Returns: nothing; the field is reset in place.
 */
function clearFieldValidation(input, feedback) {
    input.classList.remove("input-error");
    input.setAttribute("aria-invalid", "false");
    feedback.textContent = "";
}

/**
 * Attach validation listeners to the portfolio contact form when it is present.
 * Parameters: none.
 * Returns: nothing; event handlers are attached to the form controls.
 */
function setupContactForm() {
    const form = document.getElementById("contactForm");

    // The contact form is only on the Contact page; absence on other pages is expected.
    if (!form) {
        return;
    }

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const subject = document.getElementById("subject");
    const message = document.getElementById("message");
    const nameFeedback = document.getElementById("nameFeedback");
    const emailFeedback = document.getElementById("emailFeedback");
    const subjectFeedback = document.getElementById("subjectFeedback");
    const messageFeedback = document.getElementById("messageFeedback");
    const formStatus = document.getElementById("formStatus");

    const requiredElements = [
        name,
        email,
        subject,
        message,
        nameFeedback,
        emailFeedback,
        subjectFeedback,
        messageFeedback,
        formStatus
    ];

    if (requiredElements.some((element) => element === null)) {
        console.error("Contact form setup failed because required form markup is missing.");
        if (formStatus) {
            formStatus.textContent = "The contact form is temporarily unavailable. Please use the contact links instead.";
            formStatus.className = "form-status form-status-error";
        }
        return;
    }

    // Revalidate fields as the visitor types so feedback clears as the input is corrected.
    name.addEventListener("input", () => {
        validateField(name, nameFeedback, "Name is required.");
    });

    email.addEventListener("input", () => {
        validateEmail(email, emailFeedback);
    });

    subject.addEventListener("input", () => {
        validateField(subject, subjectFeedback, "Subject is required.");
    });

    message.addEventListener("input", () => {
        validateField(message, messageFeedback, "Message is required.");
    });

    // Bind a per-page token to the local contact form and limit submission attempts.
    const authorize = createSubmissionGuard(form);

    // Validate all required fields on submit; this demo does not transmit data to a server.
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        try {
            const rejection = authorize();
            if (rejection) {
                formStatus.textContent = rejection;
                formStatus.className = "form-status form-status-error";
                console.warn("[Portfolio security] Contact submission rejected.");
                return;
            }
            const nameValid = validateField(name, nameFeedback, "Name is required.");
            const emailValid = validateEmail(email, emailFeedback);
            const subjectValid = validateField(subject, subjectFeedback, "Subject is required.");
            const messageValid = validateField(message, messageFeedback, "Message is required.");

            if (!nameValid || !emailValid || !subjectValid || !messageValid) {
                formStatus.textContent = "Please correct the highlighted fields before submitting.";
                formStatus.className = "form-status form-status-error";

                // Move focus to the first invalid field so the visitor can correct it immediately.
                const firstInvalidField = [
                    [name, nameValid],
                    [email, emailValid],
                    [subject, subjectValid],
                    [message, messageValid]
                ].find((fieldState) => !fieldState[1]);

                if (firstInvalidField) {
                    firstInvalidField[0].focus();
                }

                console.warn("Contact form validation failed. No form values were logged.");
                return;
            }

            formStatus.textContent = "Validation succeeded. This demonstration does not send messages to a server.";
            formStatus.className = "form-status form-status-success";
            form.classList.add("form-success");
            console.info("Contact form validation succeeded. Message contents were not logged.");

            form.reset();
            clearFieldValidation(name, nameFeedback);
            clearFieldValidation(email, emailFeedback);
            clearFieldValidation(subject, subjectFeedback);
            clearFieldValidation(message, messageFeedback);
        } catch (error) {
            console.error("An unexpected error occurred while validating the contact form.", error);
            formStatus.textContent = "The form could not be validated right now. Please try again later.";
            formStatus.className = "form-status form-status-error";
        }
    });
}

// Navigation setup is guarded because the responsive menu may not exist on every page.
export { setupContactForm };
