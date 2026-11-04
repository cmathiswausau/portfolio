const requestWindow = 60000;

/**
 * Allow a bounded number of attempts per rolling window in this page.
 * @param {number} maximum - Maximum attempts per minute.
 * @returns {Function} A function that records and checks each attempt.
 */
export const createRateLimiter = (maximum) => {
    let attempts = [];
    return () => {
        const now = Date.now();
        attempts = attempts.filter((attempt) => now - attempt < requestWindow);
        if (attempts.length >= maximum) {
            return false;
        }
        attempts.push(now);
        return true;
    };
};

/**
 * Validate the token for the local-only contact demo before processing inputs.
 * @param {HTMLFormElement} form - The local contact form.
 * @returns {Function} A function that returns a rejection message or an empty string.
 */
export const createSubmissionGuard = (form) => {
    const token = crypto.randomUUID();
    const field = document.createElement("input");
    field.type = "hidden";
    field.name = "contactToken";
    field.value = token;
    form.append(field);
    const allow = createRateLimiter(4);
    return () => {
        if (!allow()) {
            return "Too many attempts. Please wait a minute and try again.";
        }
        if (field.form !== form || field.value !== token) {
            return "The form could not be verified. Reload this page and try again.";
        }
        return "";
    };
};
