"use strict";

/**
 * Converts an object into JSON text.
 * @param {object} data - Object to convert.
 * @returns {string} JSON text.
 */
function convertToJson(data) {
    return JSON.stringify(data);
}

/**
 * Converts JSON text into a JavaScript object.
 * @param {string} text - JSON text to parse.
 * @returns {object} Parsed data.
 */
function parseJson(text) {
    return JSON.parse(text);
}

/**
 * Checks the required properties of one animal.
 * @param {object} animal - Animal to check.
 * @returns {string} Error message, or an empty string when valid.
 */
function validateAnimal(animal) {
    if (animal === null || typeof animal !== "object" || Array.isArray(animal)) {
        return "Animal must be an object.";
    }

    if (animal.id === undefined || animal.species === undefined ||
        animal.name === undefined || animal.age === undefined) {
        return "Animal is missing a required field.";
    }

    if (!Number.isInteger(animal.id) || animal.id <= 0) {
        return "Animal id must be a positive whole number.";
    }

    if (typeof animal.species !== "string" || animal.species.trim() === "") {
        return "Animal species must be text and cannot be empty.";
    }

    if (typeof animal.name !== "string" || animal.name.trim() === "") {
        return "Animal name must be text and cannot be empty.";
    }

    if (!Number.isInteger(animal.age) || animal.age < 0) {
        return "Animal age must be a non-negative whole number.";
    }

    return "";
}

/**
 * Checks the zoo data and each animal.
 * @param {object} data - Zoo data to check.
 * @returns {string} Error message, or an empty string when valid.
 */
function validateZooData(data) {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
        return "Zoo data must be an object.";
    }

    if (!Array.isArray(data.animals) || data.animals.length === 0) {
        return "Zoo data must contain a non-empty animals array.";
    }

    for (const animal of data.animals) {
        const error = validateAnimal(animal);
        if (error !== "") {
            return error;
        }
    }

    return "";
}

/**
 * Tests JSON text and prints the result to the page and console.
 * @param {string} name - Test name.
 * @param {string} jsonText - JSON text to test.
 * @param {boolean} shouldPass - Whether the data should be valid.
 * @returns {boolean} True if the test behaves as expected.
 */
function testJson(name, jsonText, shouldPass) {
    let errorMessage;

    try {
        const data = parseJson(jsonText);
        errorMessage = validateZooData(data);
    } catch (error) {
        errorMessage = "Invalid JSON format: " + error.message;
    }

    const isValid = errorMessage === "";
    const passed = isValid === shouldPass;
    const message = (passed ? "PASS" : "FAIL") + " - " + name +
        (errorMessage === "" ? "" : ": " + errorMessage);

    console.log(message);
    document.getElementById("test-results").textContent += message + "\n";
    return passed;
}

/**
 * Runs all required JSON validation tests.
 * @param {object} data - Valid data loaded from the JSON file.
 * @returns {void}
 */
function runTests(data) {
    const jsonText = convertToJson(data);
    console.log("JSON.stringify result:", jsonText);
    console.log("JSON.parse result:", parseJson(jsonText));

    document.getElementById("test-results").textContent = "";
    let passed = 0;

    if (testJson("Valid JSON", jsonText, true)) { passed++; }
    if (testJson("Invalid JSON format", "{\"animals\": [}", false)) { passed++; }
    if (testJson("Missing required field", "{\"animals\":[{\"id\":1,\"species\":\"Lion\",\"age\":5}]}", false)) { passed++; }
    if (testJson("Incorrect data type", "{\"animals\":[{\"id\":1,\"species\":\"Lion\",\"name\":\"Leo\",\"age\":\"five\"}]}", false)) { passed++; }
    if (testJson("Empty object", "{}", false)) { passed++; }
    if (testJson("Null data", "null", false)) { passed++; }
    if (testJson("Null animal field", "{\"animals\":[{\"id\":1,\"species\":null,\"name\":\"Leo\",\"age\":5}]}", false)) { passed++; }
    if (testJson("Empty animals array", "{\"animals\":[]}", false)) { passed++; }

    const summary = "Tests passed: " + passed + "/8";
    console.log(summary);
    document.getElementById("test-results").textContent += summary;
}

/**
 * Loads the JSON file, validates it, and displays the animals.
 * @returns {Promise<void>} Completion of the loading process.
 */
async function loadZooData() {
    try {
        const response = await fetch("data.json");
        if (!response.ok) {
            throw new Error("Could not load data.json. HTTP " + response.status);
        }

        const jsonText = await response.text();
        const data = parseJson(jsonText);
        const errorMessage = validateZooData(data);
        if (errorMessage !== "") {
            throw new Error(errorMessage);
        }

        const list = document.getElementById("animal-list");
        for (const animal of data.animals) {
            const item = document.createElement("li");
            item.textContent = animal.name + " - " + animal.species +
                ", age " + animal.age + " (ID " + animal.id + ")";
            list.appendChild(item);
        }

        console.log("Successfully loaded and validated zoo animals.");
        runTests(data);
    } catch (error) {
        console.error("Zoo data loading error:", error.message);
        document.getElementById("test-results").textContent = "ERROR: " + error.message;
    }
}

loadZooData();
