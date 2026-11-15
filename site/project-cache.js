const cacheKey = "portfolio.projects.v1";
const maxCacheAge = 7 * 24 * 60 * 60 * 1000;

/**
 * Read a saved catalog when the live request fails, using the same validation as a live response.
 * @param {Function} validate - Validates and returns the project records.
 * @returns {object[]|null} A valid saved catalog within the cache lifetime.
 */
export const readProjectCache = (validate) => {
    try {
        const cached = JSON.parse(localStorage.getItem(cacheKey));
        if (!cached) {
            return null;
        }
        const age = Date.now() - cached.savedAt;
        if (!Number.isFinite(cached.savedAt) || age < 0 || age > maxCacheAge) {
            return null;
        }
        const projects = validate(cached.projects);
        console.info("Loaded the saved project catalog.");
        return projects;
    } catch (error) {
        console.warn("The saved project catalog could not be read.", error);
        return null;
    }
};

/**
 * Save public project records after successful validation and rendering.
 * @param {object[]} projects - Validated project records.
 */
export const writeProjectCache = (projects) => {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), projects }));
    } catch (error) {
        console.warn("Could not save projects for offline use.", error);
    }
};
