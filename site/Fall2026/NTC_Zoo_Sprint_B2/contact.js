/*
Author Name: Chris Mathis
Project: NTC Zoo - Buffer Overflow and SQL Injection Prevention
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
// Buffer and SQL Prevention — Part 1: Field types and maximum lengths.
const CONTACT_LIMITS = Object.freeze({ name: 100, email: 254, message: 2000 });

// Buffer and SQL Prevention — Part 2: Fixed-capacity storage.
// Sealing the array prevents adding/removing slots. New entries replace old ones.
const HISTORY_CAPACITY = 5;
const contactHistory = Object.seal(new Array(HISTORY_CAPACITY).fill(null));
let nextHistorySlot = 0;

/**
 * Checks the data type and truncates oversized text without splitting a pair.
 * Limits use UTF-16 code units, matching HTML maxlength.
 * @param {string} value - Candidate field value.
 * @param {number} maximum - Maximum code units allowed.
 * @returns {object} Bounded text and whether truncation occurred.
 */
function limitText(value, maximum) {
    if (typeof value !== "string") {
        throw new TypeError("Contact fields must contain text.");
    }
    let text = value.slice(0, maximum);
    // Avoid leaving a high surrogate when truncation splits an emoji.
    if (value.length > maximum && /[\uD800-\uDBFF]$/.test(text)) {
        text = text.slice(0, -1);
    }
    return { text, truncated: value.length > maximum };
}

// Buffer and SQL Prevention — Part 3: Flag patterns without deleting valid prose.
// Pattern detection is a logging aid; it is not a complete SQL injection defense.
/**
 * Identifies SQL keywords, comments, and common injection expressions.
 * @param {string} value - Bounded text to inspect.
 * @returns {boolean} Whether a suspicious pattern was found.
 */
function hasSqlPattern(value) {
    return /\b(select|insert|update|delete|drop|alter|create|union|exec|execute|truncate)\b|--|\/\*|\b(?:or|and)\s+['"]?\w+['"]?\s*=\s*['"]?\w+/i.test(value);
}

/**
 * Builds a parameterized SQL command example, without executing SQL.
 * Raw validated values stay separate from the constant statement.
 * A real server must bind these parameters using its database driver.
 * HTML encoding is for the preview and is not used as a SQL defense.
 * @param {object} data - Validated and length-limited raw field values.
 * @returns {object} Fixed SQL text and separate immutable parameters.
 */
function createParameterizedCommand(data) {
    const parameters = {};
    for (const [key, maximum] of Object.entries(CONTACT_LIMITS)) {
        const bounded = limitText(data[key], maximum);
        if (!bounded.text.trim() || bounded.truncated) {
            throw new Error("Parameters must be nonempty text within field limits.");
        }
        parameters[key] = bounded.text;
    }
    return Object.freeze({
        statement: "INSERT INTO ContactMessages (Name, Email, Message) VALUES (@name, @email, @message);",
        parameters: Object.freeze(parameters)
    });
}

/**
 * Stores an immutable command in a fixed-capacity ring buffer.
 * No contact information is persisted to browser storage.
 * @param {object} command - Parameterized command demonstration.
 * @returns {void} No return value.
 */
function rememberContact(command) {
    contactHistory[nextHistorySlot] = command;
    nextHistorySlot = (nextHistorySlot + 1) % HISTORY_CAPACITY;
}

/**
 * Validates text, enforces lengths, flags SQL patterns, and encodes the preview.
 * @returns {object} Raw data, preview data, and truncation feedback.
 */
function getContactData() {
    const raw = {};
    const display = {};
    const shortened = [];
    for (const [key, maximum] of Object.entries(CONTACT_LIMITS)) {
        const field = document.getElementById(`contact${key[0].toUpperCase() + key.slice(1)}`);
        if (!field) {
            throw new Error("A contact field is missing.");
        }
        const bounded = limitText(field.value, maximum);
        if (bounded.truncated) {
            field.value = bounded.text;
            shortened.push(`${key} shortened to ${maximum} characters`);
        }
        if (!bounded.text.trim() || !field.checkValidity()) {
            field.focus();
            throw new Error(!bounded.text.trim() ? "Please complete all fields." : field.validationMessage);
        }
        raw[key] = bounded.text.trim();
        if (hasSqlPattern(raw[key])) {
            // Log metadata rather than copying potentially private input into logs.
            console.warn("Suspicious SQL pattern detected:", { field: key, length: raw[key].length, timestamp: new Date().toISOString() });
        }
        display[key] = sanitizeInput(raw[key]);
        if (!display[key].trim()) {
            field.focus();
            throw new Error("Please enter text, rather than only HTML tags.");
        }
    }
    return { raw, display, shortened };
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
        // Buffer and SQL Prevention — Parts 2 and 3: Bound stored records and
        // keep SQL syntax separate from values. This never sends a database query.
        const command = createParameterizedCommand(data.raw);
        rememberContact(command);
        displayContactSubmission(data.display);
        const lengthFeedback = data.shortened.length ? `${data.shortened.join("; ")}. ` : "";
        feedback.textContent = `${lengthFeedback}Your message preview is ready. No email has been sent.`;
        console.log("Parameterized SQL demonstration (not executed):", command.statement);
        console.table(Object.entries(command.parameters).map(([parameter, value]) => {
            return { parameter, type: typeof value, length: value.length };
        }));
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

// Buffer and SQL Prevention — Part 2: Immediate length feedback.
/**
 * Connects field counters and defensive truncation to input events.
 * @returns {void} No return value.
 */
function connectLengthFeedback() {
    for (const [key, maximum] of Object.entries(CONTACT_LIMITS)) {
        const field = document.getElementById(`contact${key[0].toUpperCase() + key.slice(1)}`);
        const counter = document.getElementById(`${key}Length`);
        if (!field || !counter) {
            throw new Error("A field or length counter is missing.");
        }
        field.addEventListener("input", () => {
            const bounded = limitText(field.value, maximum);
            field.value = bounded.text;
            counter.textContent = `${bounded.text.length}/${maximum} characters`;
            if (bounded.truncated || bounded.text.length === maximum) {
                counter.textContent += " — Maximum length reached; extra text is not retained.";
            }
        });
    }
}

// Buffer and SQL Prevention — Part 4: Document boundary and SQL tests.
/**
 * Tests length boundaries, types, SQL patterns, parameter separation, and storage.
 * Tests use isolated records and never populate the live contact history.
 * @returns {void} No return value. Results appear in console.table.
 */
function runInputSecurityTests() {
    const rows = [];
    const lengthCases = [
        ["Normal text", "Hello Zoo!", 2000, 10, false],
        ["Name at limit", "N".repeat(100), 100, 100, false],
        ["Oversized name", "N".repeat(101), 100, 100, true],
        ["Oversized email", "E".repeat(255), 254, 254, true],
        ["Oversized message", "M".repeat(2500), 2000, 2000, true],
        ["Emoji boundary", "N".repeat(99) + "🐯", 100, 99, true]
    ];
    for (const [description, input, maximum, expectedLength, expectedTruncated] of lengthCases) {
        const actual = limitText(input, maximum);
        rows.push({ description, input: `${input.length} code units`, expected: `length ${expectedLength}, truncated ${expectedTruncated}`, actual: `length ${actual.text.length}, truncated ${actual.truncated}`, passed: actual.text.length === expectedLength && actual.truncated === expectedTruncated });
    }
    let typeRejected = false;
    try {
        limitText(42, 100);
    } catch (error) {
        typeRejected = error instanceof TypeError;
    }
    rows.push({ description: "Reject non-string", input: 42, expected: true, actual: typeRejected, passed: typeRejected });
    const sqlCases = [
        ["Normal message", "I enjoyed the zoo!", false],
        ["SQL commands", "Robert'); DROP TABLE ContactMessages;--", true],
        ["Boolean injection", "' OR '1'='1", true],
        ["UNION query", "UNION SELECT Name FROM Guests", true],
        ["Legitimate apostrophe", "O'Brien", false]
    ];
    for (const [description, input, expected] of sqlCases) {
        const actual = hasSqlPattern(input);
        rows.push({ description, input, expected, actual, passed: actual === expected });
    }
    const raw = { name: "O'Brien", email: "chris@example.com", message: "'); DROP TABLE Guests;--" };
    const command = createParameterizedCommand(raw);
    const separated = !command.statement.includes(raw.message) && command.parameters.message === raw.message;
    rows.push({ description: "Parameter separation", input: raw.message, expected: true, actual: separated, passed: separated });
    const encoded = sanitizeInput("Tom & Sue's \"Zoo\"");
    rows.push({ description: "Special character encoding", input: "Tom & Sue's \"Zoo\"", expected: "Tom &amp; Sue&#39;s &quot;Zoo&quot;", actual: encoded, passed: encoded === "Tom &amp; Sue&#39;s &quot;Zoo&quot;" });
    const isolated = Object.seal(new Array(HISTORY_CAPACITY).fill(null));
    for (let index = 0; index < 12; index++) {
        isolated[index % HISTORY_CAPACITY] = command;
    }
    rows.push({ description: "Bounded record storage", input: "12 records into 5 slots", expected: 5, actual: isolated.length, passed: isolated.length === HISTORY_CAPACITY && Object.isSealed(isolated) });
    console.log("Buffer and SQL prevention tests; SQL commands are never executed:");
    console.table(rows);
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
        runInputSecurityTests();
        connectLengthFeedback();
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
