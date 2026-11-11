"use strict";

// Zoo Web APIs Lab: Geolocation, Local Storage, and Session Storage.
// Do not store precise location data or sensitive information in browser storage.
const animalKey = "zooAnimals";
const requestKey = "zooSessionRequests";
const requestLimit = 3;

/**
 * Displays a message on the page and in the browser console.
 * @param {string} elementId - ID of the page element.
 * @param {string} message - Message to display.
 * @returns {void}
 */
function showMessage(elementId, message) {
    document.getElementById(elementId).textContent = message;
    console.log(message);
}

/**
 * Reports a browser storage error without exposing sensitive details.
 * @param {string} operation - Storage operation being attempted.
 * @param {Error} error - Error raised by the browser.
 * @returns {void}
 */
function reportStorageError(operation, error) {
    if (error.name === "QuotaExceededError") {
        showMessage("animalResult", operation + " failed: browser storage quota exceeded.");
    } else {
        showMessage("animalResult", operation + " failed: " + error.message);
    }
    console.error(operation + " error:", error);
}

/**
 * Requests the user's current location after a button click.
 * @returns {void}
 */
function getLocation() {
    if (!window.isSecureContext) {
        showMessage("locationResult", "Location requires HTTPS or localhost.");
        return;
    }

    if (!navigator.geolocation) {
        showMessage("locationResult", "Geolocation is not supported by this browser.");
        return;
    }

    showMessage("locationResult", "Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude.toFixed(4);
            const longitude = position.coords.longitude.toFixed(4);
            showMessage("locationResult", "Location received: latitude " + latitude + ", longitude " + longitude);
            // Coordinates are displayed only; they are never saved or transmitted by this lab.
        },
        function (error) {
            let message = "Location request failed.";
            if (error.code === 1) {
                message = "Location permission was denied.";
            } else if (error.code === 2) {
                message = "Location is currently unavailable.";
            } else if (error.code === 3) {
                message = "Location request timed out.";
            }
            showMessage("locationResult", message);
            console.warn("Geolocation error code:", error.code);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
}

/**
 * Creates sample animals for the zoo storage demonstration.
 * @returns {Array} Zoo animal records.
 */
function createAnimals() {
    return [
        { id: 1, species: "Lion", name: "Leo", age: 5 },
        { id: 2, species: "Elephant", name: "Ellie", age: 12 },
        { id: 3, species: "Penguin", name: "Piper", age: 3 }
    ];
}

/**
 * Checks whether a value contains valid zoo animal records.
 * @param {unknown} animals - Value to validate.
 * @returns {boolean} True if all animals are valid.
 */
function validAnimals(animals) {
    if (!Array.isArray(animals) || animals.length === 0) {
        return false;
    }

    for (const animal of animals) {
        if (animal === null || typeof animal !== "object") {
            return false;
        }
        if (!Number.isInteger(animal.id) || animal.id <= 0 ||
            typeof animal.species !== "string" || animal.species.trim() === "" ||
            typeof animal.name !== "string" || animal.name.trim() === "" ||
            !Number.isInteger(animal.age) || animal.age < 0) {
            return false;
        }
    }
    return true;
}

/**
 * Saves valid animal records to persistent browser storage.
 * @param {Array} animals - Zoo animals to store.
 * @returns {boolean} True when storage succeeds.
 */
function saveAnimals(animals) {
    if (!validAnimals(animals)) {
        showMessage("animalResult", "Save failed: invalid zoo animal data.");
        return false;
    }
    try {
        localStorage.setItem(animalKey, JSON.stringify(animals));
        showMessage("animalResult", "Saved " + animals.length + " animals to Local Storage.");
        return true;
    } catch (error) {
        reportStorageError("Save", error);
        return false;
    }
}

/**
 * Reads and validates saved animals from Local Storage.
 * @returns {Array|null} Animal records, or null on failure.
 */
function loadAnimals() {
    try {
        const stored = localStorage.getItem(animalKey);
        if (stored === null) {
            showMessage("animalResult", "No saved animals found. Select Save Animals first.");
            return null;
        }
        const animals = JSON.parse(stored);
        if (!validAnimals(animals)) {
            throw new Error("Stored animal records failed validation.");
        }
        showMessage("animalResult", "Loaded " + animals.length + " animals from Local Storage.");
        return animals;
    } catch (error) {
        reportStorageError("Load", error);
        return null;
    }
}

/**
 * Displays animal records in a list on the page.
 * @param {Array} animals - Records to display.
 * @returns {void}
 */
function displayAnimals(animals) {
    const list = document.getElementById("animalList");
    list.replaceChildren();
    if (animals === null) {
        return;
    }
    for (const animal of animals) {
        const item = document.createElement("li");
        item.textContent = animal.name + " - " + animal.species + ", age " + animal.age;
        list.appendChild(item);
    }
}

/**
 * Updates Leo's age and saves the updated records.
 * @returns {void}
 */
function updateAnimal() {
    const animals = loadAnimals();
    if (animals === null) {
        return;
    }
    for (const animal of animals) {
        if (animal.id === 1) {
            animal.age += 1;
        }
    }
    if (saveAnimals(animals)) {
        displayAnimals(animals);
        showMessage("animalResult", "Updated Leo's age to " + animals[0].age + ".");
    }
}

/**
 * Demonstrates handling of malformed JSON in Local Storage.
 * @returns {void}
 */
function testInvalidJson() {
    try {
        const original = localStorage.getItem(animalKey);
        try {
            localStorage.setItem(animalKey, "{invalid json}");
            const result = loadAnimals();
            showMessage("testResult", result === null ? "PASS - Invalid stored JSON was handled." : "FAIL - Invalid JSON was accepted.");
        } finally {
            if (original === null) {
                localStorage.removeItem(animalKey);
            } else {
                localStorage.setItem(animalKey, original);
            }
        }
    } catch (error) {
        reportStorageError("Invalid JSON test", error);
    }
}

/**
 * Tracks requests in Session Storage, limiting them to three per tab session.
 * @returns {void}
 */
function makeSessionRequest() {
    try {
        const savedCount = sessionStorage.getItem(requestKey);
        let count = savedCount === null ? 0 : Number(savedCount);
        if (!Number.isInteger(count) || count < 0) {
            throw new Error("Session request counter is invalid.");
        }
        if (count >= requestLimit) {
            showMessage("sessionResult", "Rate limit reached: " + requestLimit + " requests per session.");
            return;
        }
        count += 1;
        sessionStorage.setItem(requestKey, String(count));
        showMessage("sessionResult", "Session request " + count + " of " + requestLimit + " allowed.");
    } catch (error) {
        showMessage("sessionResult", error.name === "QuotaExceededError" ?
            "Session Storage quota exceeded." : "Session request failed: " + error.message);
        console.error("Session Storage error:", error);
    }
}

/**
 * Resets the temporary session request counter.
 * @returns {void}
 */
function resetSessionRequests() {
    try {
        sessionStorage.removeItem(requestKey);
        showMessage("sessionResult", "Session request counter reset.");
    } catch (error) {
        showMessage("sessionResult", "Could not reset session counter: " + error.message);
        console.error("Session reset error:", error);
    }
}

/**
 * Tests saving, loading, updating, malformed data, and storage availability.
 * @returns {void}
 */
function runStorageTests() {
    console.log("Starting storage tests...");
    const original = localStorage.getItem(animalKey);
    try {
        const sample = createAnimals();
        const saved = saveAnimals(sample);
        console.log(saved ? "PASS - Local Storage save" : "FAIL - Local Storage save");
        const loaded = loadAnimals();
        console.log(loaded !== null && loaded.length === 3 ? "PASS - Local Storage load" : "FAIL - Local Storage load");
        if (loaded !== null) {
            loaded[0].age += 1;
            saveAnimals(loaded);
            const updated = loadAnimals();
            console.log(updated !== null && updated[0].age === 6 ? "PASS - Local Storage update" : "FAIL - Local Storage update");
        }
        console.log(validAnimals([]) === false ? "PASS - Empty animal list rejected" : "FAIL - Empty animal list accepted");
        console.log(validAnimals([{ id: 1, species: "Lion", name: "Leo", age: "five" }]) === false ?
            "PASS - Incorrect data type rejected" : "FAIL - Incorrect data type accepted");
        showMessage("testResult", "Storage tests completed. Review the Console for PASS/FAIL results.");
    } catch (error) {
        showMessage("testResult", "Storage test failed: " + error.message);
        console.error("Storage test error:", error);
    } finally {
        try {
            if (original === null) {
                localStorage.removeItem(animalKey);
            } else {
                localStorage.setItem(animalKey, original);
            }
        } catch (error) {
            console.error("Could not restore original storage:", error);
        }
    }
}

/**
 * Reports network status for online and offline testing.
 * @returns {void}
 */
function showNetworkStatus() {
    const message = navigator.onLine ? "Browser reports online." : "Browser reports offline.";
    showMessage("networkResult", message + " Storage works without network access.");
}

// Attach button handlers after the deferred script loads.
document.getElementById("locationButton").addEventListener("click", getLocation);
document.getElementById("saveButton").addEventListener("click", function () {
    saveAnimals(createAnimals());
});
document.getElementById("loadButton").addEventListener("click", function () {
    displayAnimals(loadAnimals());
});
document.getElementById("updateButton").addEventListener("click", updateAnimal);
document.getElementById("invalidButton").addEventListener("click", testInvalidJson);
document.getElementById("sessionButton").addEventListener("click", makeSessionRequest);
document.getElementById("resetButton").addEventListener("click", resetSessionRequests);
document.getElementById("testButton").addEventListener("click", runStorageTests);
window.addEventListener("online", showNetworkStatus);
window.addEventListener("offline", showNetworkStatus);
showNetworkStatus();
