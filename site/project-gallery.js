import { fetchProjects } from "./project-request.js";

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
 * Parameters: value â€” the value being checked.
 * @returns {boolean} True when the value is a non-empty string.
 * Returns: whether the value is usable text.
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Check whether a project record contains correctly typed required data.
 * @param {unknown} project Project record to validate.
 * Parameters: project â€” the record being checked.
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
        /^(?:[a-z0-9_-]+\.(?:png|jpe?g|webp))?$/iu.test(project.image) &&
        typeof project.alt === "string";

    // Optional links are limited to HTTPS URLs; other schemes are not rendered as links.
    const hasSafeOptionalLink =
        project.link === undefined ||
        (typeof project.link === "string" && /^https:\/\//u.test(project.link));

    return hasValidRequiredFields && hasSafeOptionalLink;
}

/**
 * Return valid project records or a safe fallback when the data is unusable.
 * @param {unknown} data Project data supplied to the gallery.
 * Parameters: data â€” the raw project data to inspect.
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
 * Parameters: message â€” the safe text to show; className â€” the message styling class.
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
 * Parameters: project â€” the project data to render.
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

    // Open only links already checked for HTTPS, and isolate the new tab from its opener.
    if (typeof project.link === "string" && /^https:\/\//u.test(project.link)) {
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
async function createProjectGallery() {
    const gallery = document.getElementById("projectGallery");

    // The gallery only exists on the Projects page; absence on other pages is expected.
    if (!gallery) {
        return;
    }

    try {
        // Collect the complete gallery off-DOM, then replace the visible content in one operation.
        const projectResult = loadProjects(await fetchProjects());
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
        const retry = document.createElement("button");
        retry.type = "button";
        retry.textContent = "Retry loading projects";
        retry.addEventListener("click", () => {
            gallery.replaceChildren(createStatusMessage("Loading projects...", "project-gallery-message"));
            createProjectGallery();
        });
        gallery.replaceChildren(fallbackMessage, retry, ...fallbackCards);
    }
}

export { createProjectGallery };
