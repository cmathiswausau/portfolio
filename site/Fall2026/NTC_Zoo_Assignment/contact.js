/*
Author Name: Chris Mathis
Project: NTC Zoo - XSS Prevention
*/

// XSS Prevention — Part 2: Remove HTML tags and encode special characters.

/**
 * Removes HTML tags and encodes special characters.
 * Results must be displayed with textContent for safe output.
 *
 * Parameters:
 * input - The original user input.
 *
 * Returns:
 * The sanitized input.
 */
function sanitizeInput(input) {
    // Remove tags while keeping the text between them.
    const withoutTags = input.replace(/<[^>]*>/g, "");

    // Encode ampersands before adding other character entities.
    const sanitizedInput = withoutTags
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    // XSS Prevention — Part 2: Log input before and after sanitization.
    console.log("Before sanitization:", input);
    console.log("After sanitization:", sanitizedInput);

    return sanitizedInput;
}

// XSS Prevention — Part 2: Display submitted data using safe DOM methods.

/**
 * Displays sanitized contact information as text.
 *
 * Parameters:
 * name - The sanitized name.
 * email - The sanitized email.
 * message - The sanitized message.
 *
 * Returns:
 * Nothing. Updates the contact results on the page.
 */
function displayContactSubmission(name, email, message) {
    const results = document.getElementById("contactResults");

    if (!results) {
        throw new Error("The contact results section could not be found.");
    }

    // User input is assigned as text so it cannot become executable HTML.
    const heading = document.createElement("h3");
    heading.textContent = "Message Preview";

    const nameParagraph = document.createElement("p");
    nameParagraph.textContent = `Name: ${name}`;

    const emailParagraph = document.createElement("p");
    emailParagraph.textContent = `Email: ${email}`;

    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = `Message: ${message}`;

    // Replace any previous preview using DOM elements.
    results.replaceChildren(
        heading,
        nameParagraph,
        emailParagraph,
        messageParagraph
    );

    results.hidden = false;
}

// XSS Prevention — Part 2: Validate and handle contact form submissions.

/**
 * Validates contact fields and displays sanitized input.
 *
 * Parameters:
 * event - The form submission event.
 *
 * Returns:
 * Nothing. Displays a preview or validation feedback.
 */
function handleContactSubmit(event) {
    // Keep the browser from submitting the form and reloading the page.
    event.preventDefault();

    const feedback = document.getElementById("contactFeedback");
    const results = document.getElementById("contactResults");

    try {
        const nameInput = document.getElementById("contactName");
        const emailInput = document.getElementById("contactEmail");
        const messageInput = document.getElementById("contactMessage");

        if (!feedback || !results || !nameInput || !emailInput || !messageInput) {
            throw new Error("A required contact form element is missing.");
        }

        // Clear the previous preview and feedback.
        results.hidden = true;
        results.replaceChildren();
        feedback.textContent = "";

        const fields = [nameInput, emailInput, messageInput];

        // Check required values, length limits, and the email format.
        for (const field of fields) {
            if (!field.value.trim()) {
                feedback.textContent = "Please complete all fields.";
                field.focus();
                return;
            }

            if (field.value.length > field.maxLength) {
                feedback.textContent = "Please shorten your entry to the allowed length.";
                field.focus();
                return;
            }

            if (!field.checkValidity()) {
                feedback.textContent = field.validationMessage;
                field.focus();
                return;
            }
        }

        const name = sanitizeInput(nameInput.value.trim());
        const email = sanitizeInput(emailInput.value.trim());
        const message = sanitizeInput(messageInput.value.trim());

        // Removing tags must not leave a required field empty.
        if (!name.trim() || !email.trim() || !message.trim()) {
            feedback.textContent = "Please enter text, rather than only HTML tags.";
            return;
        }

        displayContactSubmission(name, email, message);
        feedback.textContent = "Your message preview is ready. No email has been sent.";
    } catch (error) {
        // Log technical details and show a simple message on the page.
        console.error("Unable to process the contact form:", error);

        if (results) {
            results.hidden = true;
        }

        if (feedback) {
            feedback.textContent = "Unable to preview your message. Please try again.";
        }
    }
}

// XSS Prevention — Part 1: Connect the deferred script to the contact form.
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
} else {
    console.error("The contact form could not be found.");
}

// XSS Prevention — Part 3: Test the sanitizer with different types of input.

/**
 * Runs sanitization tests and displays actual and expected results.
 *
 * Returns:
 * Nothing. Test results are displayed in the browser Console.
 */
function runSanitizationTests() {
    const testCases = [
        {
            category: "Normal text",
            input: "I enjoyed visiting NTC Zoo!",
            expected: "I enjoyed visiting NTC Zoo!"
        },
        {
            category: "HTML tags",
            input: "<b>Hello</b> <em>Zoo</em>",
            expected: "Hello Zoo"
        },
        {
            category: "Script tags",
            input: "<script>alert(\"XSS\");</script>",
            expected: "alert(&quot;XSS&quot;);"
        },
        {
            category: "Special characters",
            input: "Tom & Sue's \"Zoo\"",
            expected: "Tom &amp; Sue&#39;s &quot;Zoo&quot;"
        }
    ];

    const results = testCases.map((testCase) => {
        const actual = sanitizeInput(testCase.input);

        return {
            category: testCase.category,
            input: testCase.input,
            expected: testCase.expected,
            actual: actual,
            passed: actual === testCase.expected
        };
    });

    console.table(results);
}

runSanitizationTests();
