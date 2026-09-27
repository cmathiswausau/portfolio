// Portfolio project data used to build the project gallery dynamically.
const projects = [
    {
        id: 1,
        title: "Infrastructure Automation Toolkit",
        description:
            "Automation tools for streamlining system administration tasks and reducing repetitive manual work.",
        technologiesUsed: ["PowerShell", "Windows Server"],
        image: "project1.png",
        alt: "PowerShell automation script screenshot"
    },
    {
        id: 2,
        title: "Enterprise Network Modernization",
        description:
            "Infrastructure upgrades and network redesign work focused on reliability, scalability, and communication.",
        technologiesUsed: ["Cisco", "Fortinet", "Windows Server"],
        image: "project2.png",
        alt: "Enterprise network infrastructure"
    },
    {
        id: 3,
        title: "GitHub & Collaborative Development",
        description:
            "Collaborative software development using Git and GitHub workflows for source control and organized development.",
        technologiesUsed: ["Git", "GitHub", "C#"],
        image: "project3.png",
        alt: "GitHub project overview screenshot",
        link: "https://github.com/cmathiswausau"
    }
];

/**
 * Build the project gallery using DOM manipulation.
 */
function createProjectGallery() {
    const gallery = document.getElementById("projectGallery");

    if (!gallery) {
        return;
    }

    gallery.replaceChildren();

    projects.forEach((project) => {
        const card = document.createElement("article");
        card.className = "project-card";

        const image = document.createElement("img");
        image.src = project.image;
        image.alt = project.alt;
        image.className = "project-card-image";

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

        if (project.link) {
            const link = document.createElement("a");
            link.href = project.link;
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "View GitHub Repository";
            link.className = "project-link";
            content.appendChild(link);
        }

        card.appendChild(image);
        card.appendChild(content);
        gallery.appendChild(card);
    });
}

/**
 * Validate a single contact form field and display immediate feedback.
 *
 * @param {HTMLInputElement} input The form input field.
 * @param {HTMLElement} feedback The element used to display feedback.
 * @param {string} message The validation message to display.
 * @returns {boolean} Whether the field contains a value.
 */
function validateField(input, feedback, message) {
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
 * Validate an email form field and display immediate feedback.
 *
 * @param {HTMLInputElement} input The email input field.
 * @param {HTMLElement} feedback The element used to display feedback.
 * @returns {boolean} Whether the email address is valid.
 */
function validateEmail(input, feedback) {
    const email = input.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 * Add contact form validation and interaction behavior.
 */
function setupContactForm() {
    const form = document.getElementById("contactForm");

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

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameValid = validateField(
            name,
            nameFeedback,
            "Name is required."
        );

        const emailValid = validateEmail(email, emailFeedback);

        const subjectValid = validateField(
            subject,
            subjectFeedback,
            "Subject is required."
        );

        const messageValid = validateField(
            message,
            messageFeedback,
            "Message is required."
        );

        if (!nameValid || !emailValid || !subjectValid || !messageValid) {
            formStatus.textContent =
                "Please correct the highlighted fields before submitting.";
            formStatus.className = "form-status form-status-error";
            return;
        }

        // This is a portfolio demonstration, so no backend is required.
        formStatus.textContent =
            "Thank you! Your message has been validated successfully.";
        formStatus.className = "form-status form-status-success";
        form.classList.add("form-success");

        form.reset();

        name.setAttribute("aria-invalid", "false");
        email.setAttribute("aria-invalid", "false");
        subject.setAttribute("aria-invalid", "false");
        message.setAttribute("aria-invalid", "false");
    });
}

/**
 * Set up responsive navigation and accessibility state.
 */
function setupNavigation() {
    const navToggle = document.querySelector(".nav-toggle");
    const navList = document.querySelector("#site-navigation");

    if (!navToggle || !navList) {
        return;
    }

    navToggle.addEventListener("click", () => {
        const isOpen = navList.classList.toggle("show");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });
}

// Run page-specific DOM setup after the document has loaded.
document.addEventListener("DOMContentLoaded", () => {
    createProjectGallery();
    setupContactForm();
    setupNavigation();
});