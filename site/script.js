import { createProjectGallery } from "./project-gallery.js";
import { setupContactForm } from "./contact-form.js";

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
async function initializePortfolio() {
    console.info("Portfolio initialization started.");

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

    try {
        await createProjectGallery();
    } catch (error) {
        console.error("Project gallery initialization failed.", error);
    }

    console.info("Portfolio initialization completed.");
}

// This readiness check supports both deferred scripts and the script at the bottom of index.html.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio);
} else {
    initializePortfolio();
}
