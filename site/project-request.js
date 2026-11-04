import { createRateLimiter } from "./portfolio-security.js";

const allowRequest = createRateLimiter(4);

/** Read the public catalog from this origin over HTTPS with a bounded wait.
 * @returns {Promise<object[]>} The project records returned by the server.
 */
export const fetchProjects = async () => {
    const url = new URL("./projects.json", import.meta.url);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.origin !== location.origin || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) {
        throw new Error("The catalog requires a secure same-origin connection.");
    }
    if (!allowRequest()) {
        throw new Error("Project request limit reached.");
    }
    const response = await fetch(url, {
        mode: "same-origin",
        credentials: "omit",
        redirect: "error",
        signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) {
        throw new Error(`Project catalog returned HTTP ${response.status}.`);
    }
    const type = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
    if (type !== "application/json") {
        throw new Error("The project catalog returned an unexpected content type.");
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length > 100) {
        throw new Error("The project catalog has an invalid structure.");
    }
    return data;
};
