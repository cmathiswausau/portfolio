// Keep location optional and show only the estimated distance to the contact city.
const wausau = { latitude: 44.96, longitude: -89.63 };
const radians = (degrees) => degrees * Math.PI / 180;

/** Attach the browser geolocation request on the Contact page. */
export const setupContactLocation = () => {
    const button = document.getElementById("locateVisitor");
    const status = document.getElementById("locationStatus");
    if (!button || !status) {
        return;
    }

    const failures = {
        1: "Location access was denied. You can allow it in your browser settings and try again.",
        2: "Your location is currently unavailable. Please try again.",
        3: "The location request timed out. Please try again."
    };

    button.addEventListener("click", () => {
        if (!navigator.geolocation) {
            status.textContent = "Location lookup requires a supported browser and a secure connection.";
            return;
        }

        button.disabled = true;
        status.textContent = "Finding your location…";
        navigator.geolocation.getCurrentPosition(({ coords }) => {
            // Haversine formula for straight-line distance using Earth's mean radius in miles.
            const latitudeGap = radians(wausau.latitude - coords.latitude);
            const longitudeGap = radians(wausau.longitude - coords.longitude);
            const a = Math.sin(latitudeGap / 2) ** 2 +
                Math.cos(radians(coords.latitude)) * Math.cos(radians(wausau.latitude)) *
                Math.sin(longitudeGap / 2) ** 2;
            const miles = 3959 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
            status.textContent = miles < 1 ? "You are less than a mile from Wausau, WI." :
                `You are about ${Math.round(miles).toLocaleString("en-US")} miles from Wausau, WI.`;
            button.disabled = false;
            console.info("Contact location lookup succeeded.");
        }, ({ code }) => {
            status.textContent = failures[code] ?? "Location lookup failed. Please try again.";
            button.disabled = false;
            console.warn("Contact location lookup failed with code", code);
        }, { timeout: 10000, maximumAge: 60000 });
    });
};
