// Part 1: Error-safe project data management and validation.
// Validate project records before rendering; invalid or missing data gets a safe fallback.
// Project records are checked before they are rendered so incomplete or invalid
// data cannot break the project gallery.
const projects = [
    {
        id: 1,
        title: "Infrastructure Automation Toolkit",
        description: "Automation tools for streamlining system administration tasks and reducing repetitive manual work.",
        technologiesUsed: ["PowerShell", "Windows Server"],
        image: "project1.png",
        alt: "PowerShell automation script screenshot"
    },
    {
        id: 2,
        title: "Enterprise Network Modernization",
        description: "Infrastructure upgrades and network redesign work focused on reliability, scalability, and communication.",
        technologiesUsed: ["Cisco", "Fortinet", "Windows Server"],
        image: "project2.png",
        alt: "Enterprise network infrastructure"
    },
    {
        id: 3,
        title: "GitHub & Collaborative Development",
        description: "Collaborative software development using Git and GitHub workflows for source control and organized development.",
        technologiesUsed: ["Git", "GitHub", "C#"],
        image: "project3.png",
        alt: "GitHub project overview screenshot",
        link: "https://github.com/cmathiswausau"
    }
];

// Text-only fallback content keeps the project page useful if the main data is
// missing or invalid. It deliberately does not depend on image files.
const fallbackProjects = [
    {
        id: 101,
        title: "Portfolio Projects Temporarily Unavailable",
        description: "Project information could not be loaded. Please try again later or visit the GitHub profile for available work.",
        technologiesUsed: ["Software Development", "Portfolio"],
        image: "",
        alt: ""
    },
    {
        id: 102,
        title: "GitHub Profile",
        description: "Browse available source code and collaborative development projects on GitHub.",
        technologiesUsed: ["Git", "GitHub"],
        image: "",
        alt: "",
        link: "https://github.com/cmathiswausau"
    }
];

// Data validation helpers are shared by project checks and safe DOM rendering.
/**
 * Check whether a value is a non-empty string.
 * @param {unknown} value Value to check.
 * Parameters: value — the value being checked.
 * @returns {boolean} True when the value is a non-empty string.
 * Returns: whether the value is usable text.
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check whether a project record contains correctly typed required data.
 * @param {unknown} project Project record to validate.
 * Parameters: project — the record being checked.
 * @returns {boolean} True when the project record is safe to render.
 * Returns: whether all required project fields are valid.
 */
function isValidProject(project) {
    if (typeof project !== "object" || project === null) {
        return false;
    }

    // Required properties must have the expected types before any gallery elements are built.
    const hasValidRequiredFields =
        typeof project.id === "number" &&
        Number.isInteger(project.id) &&
        project.id > 0 &&
        isNonEmptyString(project.title) &&
        isNonEmptyString(project.description) &&
        Array.isArray(project.technologiesUsed) &&
        project.technologiesUsed.length > 0 &&
        project.technologiesUsed.every((technology) => isNonEmptyString(technology)) &&
        typeof project.image === "string" &&
        typeof project.alt === "string";

    // Optional links are limited to HTTP(S) URLs; other schemes are not rendered as links.
    const hasSafeOptionalLink =
        project.link === undefined ||
        (typeof project.link === "string" && /^https?:\/\//u.test(project.link));

    return hasValidRequiredFields && hasSafeOptionalLink;
}

/**
 * Return valid project records or a safe fallback when the data is unusable.
 * @param {unknown} data Project data supplied to the gallery.
 * Parameters: data — the raw project data to inspect.
 * @returns {{items: Array, message: string}} Renderable projects and a user-facing status message.
 * Returns: validated project records and a fallback message when needed.
 */
function loadProjects(data) {
    if (!Array.isArray(data)) {
        console.error("Project data was not an array. Using fallback project content.");
        return {
            items: fallbackProjects,
            message: "Project information is temporarily unavailable. Showing fallback information instead."
        };
    }

    const validProjects = data.filter((project) => isValidProject(project));

    if (validProjects.length !== data.length) {
        console.warn("Some project records were invalid and were not displayed.");
    }

    if (validProjects.length === 0) {
        console.error("No valid project records were available. Using fallback project content.");
        return {
            items: fallbackProjects,
            message: "Project information is temporarily unavailable. Showing fallback information instead."
        };
    }

    if (validProjects.length !== data.length) {
        return {
            items: validProjects,
            message: "Some project information could not be displayed. Showing the available projects."
        };
    }

    return {
        items: validProjects,
        message: ""
    };
}

// Part 2: Error-safe DOM manipulation and project gallery fallback display.
// Create text and card elements through DOM APIs so project data is not interpreted as HTML.

/**
 * Create an accessible status message without inserting HTML strings.
 * @param {string} message Message shown to the visitor.
 * @param {string} className CSS class for the message.
 * Parameters: message — the safe text to show; className — the message styling class.
 * @returns {HTMLParagraphElement} The configured status paragraph.
 * Returns: a paragraph element containing the message.
 */
function createStatusMessage(message, className) {
    const status = document.createElement("p");
    status.className = className;
    status.setAttribute("role", "status");
    status.textContent = message;
    return status;
}

/**
 * Build one project card using safe DOM APIs and validated data.
 * @param {object} project Validated project record.
 * Parameters: project — the project data to render.
 * @returns {HTMLElement} A populated project card.
 * Returns: the completed project card element.
 */
function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";

    // An image is optional; hide a broken image at runtime rather than leaving a broken icon.
    if (isNonEmptyString(project.image)) {
        const image = document.createElement("img");
        image.src = project.image;
        image.alt = project.alt;
        image.className = "project-card-image";
        image.addEventListener("error", () => {
            image.hidden = true;
            console.warn("A project image could not be loaded:", project.image);
        });
        card.appendChild(image);
    }

    const content = document.createElement("div");
    content.className = "project-card-content";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const technologyList = document.createElement("ul");
    technologyList.className = "technology-list";
    technologyList.setAttribute("aria-label", "Technologies used");

    project.technologiesUsed.forEach((technology) => {
        const item = document.createElement("li");
        item.textContent = technology;
        technologyList.appendChild(item);
    });

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(technologyList);

    // Open only links already checked for HTTP(S), and isolate the new tab from its opener.
    if (typeof project.link === "string" && /^https?:\/\//u.test(project.link)) {
        const link = document.createElement("a");
        link.href = project.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "View Project or GitHub Profile";
        link.className = "project-link";
        content.appendChild(link);
    }

    card.appendChild(content);
    return card;
}

/**
 * Render the projects gallery and recover gracefully from rendering failures.
 * Parameters: none.
 * Returns: nothing; the page is updated through DOM manipulation.
 */
function createProjectGallery() {
    const gallery = document.getElementById("projectGallery");

    // The gallery only exists on the Projects page; absence on other pages is expected.
    if (!gallery) {
        return;
    }

    try {
        // Collect the complete gallery off-DOM, then replace the visible content in one operation.
        const projectResult = loadProjects(projects);
        const galleryContent = [];

        if (projectResult.message !== "") {
            galleryContent.push(
                createStatusMessage(projectResult.message, "project-gallery-message")
            );
        }

        projectResult.items.forEach((project) => {
            galleryContent.push(createProjectCard(project));
        });

        gallery.replaceChildren(...galleryContent);

        // Console table provides a concise, structured debugging view of the data.
        console.table(projectResult.items.map((project) => ({
            id: project.id,
            title: project.title,
            technologies: project.technologiesUsed.join(", ")
        })));
        console.info("Project gallery rendered successfully.");
    } catch (error) {
        console.error("Project gallery rendering failed. Displaying fallback content.", error);

        const fallbackMessage = createStatusMessage(
            "The full project gallery could not be displayed. Showing basic fallback information.",
            "project-gallery-message project-gallery-message-error"
        );
        fallbackMessage.setAttribute("role", "alert");

        const fallbackCards = fallbackProjects.map((project) => createProjectCard(project));
        gallery.replaceChildren(fallbackMessage, ...fallbackCards);
    }
}

// Part 3: Contact form validation and safe interactive features.
// The contact form validates locally for this assignment; it deliberately sends no network request.

/**
 * Validate a required text field and update its accessible error feedback.
 * @param {HTMLInputElement|HTMLTextAreaElement} input Field to validate.
 * @param {HTMLElement} feedback Element where the validation message is shown.
 * @param {string} message Error message displayed when the field is empty.
 * Parameters: input — field value; feedback — message element; message — validation text.
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
 * Parameters: input — email value; feedback — message element.
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
 * Parameters: input — field element; feedback — feedback element.
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

    // Validate all required fields on submit; this demo does not transmit data to a server.
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        try {
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
/**
 * Set up the responsive navigation button with guarded DOM access.
 * Parameters: none.
 * Returns: nothing; the navigation click handler is attached when markup exists.
 */
function setupNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navList = document.querySelector("#site-navigation");

    if (!navToggle || !navList) {
        console.warn("Responsive navigation could not be initialized because its markup is missing.");
        return;
    }

    navToggle.addEventListener("click", () => {
        try {
            const isOpen = navList.classList.toggle("show");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        } catch (error) {
            console.error("The navigation menu could not be updated.", error);
        }
    });
}

// Run the page features independently, allowing the gallery, form, or menu to fail separately.
/**
 * Initialize each portfolio feature independently so one failure does not stop the others.
 * Parameters: none.
 * Returns: nothing; page features are initialized when their markup is available.
 */
function initializePortfolio() {
    console.info("Portfolio initialization started.");

    try {
        createProjectGallery();
    } catch (error) {
        console.error("Project gallery initialization failed.", error);
    }

    try {
        setupContactForm();
    } catch (error) {
        console.error("Contact form initialization failed.", error);
    }

    try {
        setupNavigation();
    } catch (error) {
        console.error("Navigation initialization failed.", error);
    }

    console.info("Portfolio initialization completed.");
}

// This readiness check supports both deferred scripts and the script at the bottom of index.html.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio);
} else {
    initializePortfolio();
}
