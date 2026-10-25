/*
Author Name: Chris Mathis
Project: NTC Zoo - XSS, CSRF, and DoS Prevention
*/

// CSRF and DoS Prevention — Part 1: Settings and session storage.
const STORAGE_KEY = "ntcZooContactSecurity";
const WINDOW_MS = 60000;
const COOLDOWN_MS = 3000;
const MAX_ATTEMPTS = 4;

// XSS Prevention — Part 2: Remove tags and encode special characters.
/**
 * Removes tag-shaped markup and encodes special characters.
 * Safe display still requires textContent.
 * @param {string} input - Original input.
 * @returns {string} Sanitized input.
 */
function sanitizeInput(input) {
    const result = input.replace(/<[^>]*>/g, "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    console.log("Before sanitization:", input);
    console.log("After sanitization:", result);
    return result;
}

// CSRF and DoS Prevention — Part 2: Crypto API tokens.
/**
 * Generates a cryptographically random token.
 * @returns {string} A 64-character hexadecimal token.
 */
function createToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Checks a submitted token against the expected token.
 * @param {string} submitted - Submitted token.
 * @param {string} expected - Stored token.
 * @returns {boolean} Whether the token matches.
 */
function validToken(submitted, expected) {
    return typeof expected === "string" && /^[a-f0-9]{64}$/.test(expected)
        && submitted === expected;
}

/**
 * Loads and validates stored security information.
 * @returns {object} Security state.
 */
function loadState() {
    const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!state || !validToken(state.token, state.token)
        || !Array.isArray(state.attempts)
        || !state.attempts.every((time) => Number.isFinite(time) && time >= 0)
        || !(state.lastAccepted === null || (Number.isFinite(state.lastAccepted) && state.lastAccepted >= 0))) {
        throw new Error("Security information is missing or invalid. Reload the page.");
    }
    return state;
}

/**
 * Persists security information for this browser tab.
 * @param {object} state - Security state.
 * @returns {void} No return value.
 */
function saveState(state) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// CSRF and DoS Prevention — Part 3: Track all attempts and enforce cooldowns.
/**
 * Records an attempt and checks the rolling limit and cooldown.
 * Blocked attempts count too; repeated retries extend the waiting period.
 * @param {object} state - Mutable security state.
 * @param {number} now - Attempt timestamp in milliseconds.
 * @returns {object} Decision and user feedback.
 */
function checkRateLimit(state, now) {
    state.attempts = state.attempts.filter((time) => time > now - WINDOW_MS);
    state.attempts.push(now);
    state.attempts = state.attempts.slice(-(MAX_ATTEMPTS + 1));
    if (state.attempts.length > MAX_ATTEMPTS) {
        const seconds = Math.ceil((state.attempts[0] + WINDOW_MS - now) / 1000);
        return { allowed: false, message: `Too many attempts. Wait at least ${seconds} seconds before trying again.` };
    }
    if (state.lastAccepted !== null && now - state.lastAccepted < COOLDOWN_MS) {
        const seconds = Math.ceil((COOLDOWN_MS - (now - state.lastAccepted)) / 1000);
        return { allowed: false, message: `Please wait ${seconds} seconds before submitting again.` };
    }
    return { allowed: true, message: "Submission allowed." };
}

// XSS Prevention — Part 2: Validate fields and use safe DOM methods.
/**
 * Checks required fields, length limits, and email validity.
 * @returns {object} Sanitized field values.
 */
function getContactData() {
    const data = {};
    for (const [key, id] of [["name", "contactName"], ["email", "contactEmail"], ["message", "contactMessage"]]) {
        const field = document.getElementById(id);
        if (!field) {
            throw new Error("A contact field is missing.");
        }
        if (!field.value.trim() || field.value.length > field.maxLength || !field.checkValidity()) {
            field.focus();
            throw new Error(!field.value.trim() ? "Please complete all fields." : field.validationMessage || "Please shorten your entry.");
        }
        data[key] = sanitizeInput(field.value.trim());
        if (!data[key].trim()) {
            field.focus();
            throw new Error("Please enter text, rather than only HTML tags.");
        }
    }
    return data;
}

/**
 * Builds a preview using textContent rather than HTML insertion.
 * Encoded entities are intentionally shown literally.
 * @param {object} data - Sanitized contact data.
 * @returns {void} No return value.
 */
function displayContactSubmission(data) {
    const results = document.getElementById("contactResults");
    if (!results) {
        throw new Error("The contact results section is missing.");
    }
    const heading = document.createElement("h3");
    heading.textContent = "Message Preview";
    results.replaceChildren(heading);
    for (const [label, value] of Object.entries(data)) {
        const paragraph = document.createElement("p");
        paragraph.textContent = `${label[0].toUpperCase() + label.slice(1)}: ${value}`;
        results.append(paragraph);
    }
    results.hidden = false;
}

// CSRF and DoS Prevention — Parts 2 and 3: Enforce checks before processing.
/**
 * Validates rate limits and tokens before displaying contact data.
 * @param {SubmitEvent} event - Form submission event.
 * @returns {void} No return value.
 */
function handleContactSubmit(event) {
    event.preventDefault();
    const feedback = document.getElementById("contactFeedback");
    const results = document.getElementById("contactResults");
    try {
        const tokenField = document.getElementById("csrfToken");
        if (!feedback || !results || !tokenField) {
            throw new Error("A required form element is missing.");
        }
        results.hidden = true;
        results.replaceChildren();
        feedback.textContent = "";
        const state = loadState();
        const now = Date.now();
        const decision = checkRateLimit(state, now);
        saveState(state);
        if (!decision.allowed) {
            console.warn("Suspicious submission pattern:", new Date(now).toISOString(), decision.message);
            throw new Error(decision.message);
        }
        if (!validToken(tokenField.value, state.token)) {
            console.warn("Invalid or missing CSRF token:", new Date(now).toISOString());
            throw new Error("Invalid security token. Reload the page and try again.");
        }
        const data = getContactData();
        // Consume the accepted token and save the replacement before processing.
        state.token = createToken();
        state.lastAccepted = now;
        saveState(state);
        tokenField.value = state.token;
        displayContactSubmission(data);
        feedback.textContent = "Your message preview is ready. No email has been sent.";
        console.table([{ description: "Accepted contact submission", timestamp: new Date(now).toISOString(), tokenValid: true, tokenReplaced: true, allowed: true }]);
    } catch (error) {
        console.error("Contact submission rejected:", error);
        if (results) {
            results.hidden = true;
        }
        if (feedback) {
            feedback.textContent = error instanceof Error ? error.message : "Unable to process the form. Please reload.";
        }
    }
}

// CSRF and DoS Prevention — Part 4: Isolated tests use the production helpers.
// Simulated timestamps avoid waiting and do not affect live session limits.
/**
 * Runs token, rate limit, cooldown, and sanitization tests.
 * @returns {void} No return value. Results appear in console.table.
 */
function runSecurityTests() {
    const original = createToken();
    const replacement = createToken();
    const tokenCases = [
        ["Valid data and token", original, original, true],
        ["Missing token", "", replacement, false],
        ["Reuse consumed token", original, replacement, false],
        ["Replacement token", replacement, replacement, true]
    ];
    console.log("CSRF tests: tokens are masked; contact data is Chris, chris@example.com, Hello Zoo.");
    console.table(tokenCases.map(([description, submitted, expectedToken, expected]) => {
        const actual = validToken(submitted, expectedToken);
        return { description, input: submitted ? "Token present (masked)" : "Empty token", expected, actual, passed: actual === expected };
    }));
    const start = Date.now();
    const state = { attempts: [], lastAccepted: null };
    const cases = [["Normal submission", 0, true], ["Cooldown", 1000, false], ["Third attempt", 3000, true], ["Fourth attempt", 6000, true], ["Fifth within sixty seconds", 9000, false], ["After limit expires", 70000, true]];
    console.log("Rate limit tests: simulated timestamps, valid data and current token.");
    console.table(cases.map(([description, offset, expected]) => {
        const now = start + offset;
        const decision = checkRateLimit(state, now);
        if (decision.allowed) {
            state.lastAccepted = now;
        }
        return { description, input: "Valid data and token", timestamp: new Date(now).toISOString(), expected, actual: decision.allowed, passed: decision.allowed === expected, feedback: decision.message };
    }));
    const xssCases = [
        ["Normal text", "Hello Zoo!", "Hello Zoo!"],
        ["HTML tags", "<b>Hello</b>", "Hello"],
        ["Script tags", "<script>alert(\"XSS\");</script>", "alert(&quot;XSS&quot;);"],
        ["Special characters", "Tom & Sue's \"Zoo\"", "Tom &amp; Sue&#39;s &quot;Zoo&quot;"]
    ];
    console.log("XSS sanitization tests:");
    console.table(xssCases.map(([description, input, expected]) => {
        const actual = sanitizeInput(input);
        return { description, input, expected, actual, passed: actual === expected };
    }));
}

// CSRF and DoS Prevention — Part 1: Initialize after deferred HTML parsing.
/**
 * Sets up the form without resetting existing rate limits on reload.
 * @returns {void} No return value.
 */
function initializeContactSecurity() {
    try {
        const form = document.getElementById("contactForm");
        const tokenField = document.getElementById("csrfToken");
        if (!form || !tokenField) {
            throw new Error("The contact form or hidden token field is missing.");
        }
        const state = sessionStorage.getItem(STORAGE_KEY) ? loadState() : { token: "", attempts: [], lastAccepted: null };
        state.token = createToken();
        saveState(state);
        tokenField.value = state.token;
        form.addEventListener("submit", handleContactSubmit);
        console.log("Contact security initialized; token generated and stored.");
        runSecurityTests();
    } catch (error) {
        console.error("Security initialization failed:", error);
        const feedback = document.getElementById("contactFeedback");
        const button = document.querySelector("#contactForm button[type=\"submit\"]");
        if (feedback) {
            feedback.textContent = "Unable to initialize form security. Check browser storage and reload.";
        }
        if (button) {
            button.disabled = true;
        }
    }
}

initializeContactSecurity();
