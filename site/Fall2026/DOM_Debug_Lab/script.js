// Part 2: DOM manipulation practice and error handling.
// This section defines the sample records, safe DOM updates, and visible error reporting.

// Test data matching the zoo assignment's simple animal-object structure.
const animals = [
    { id: "animal1", name: "Elephant" },
    { id: "animal2", name: "Tiger" }
];

// Keep error reporting in one helper so expected failures are shown consistently.
/**
 * Display a handled DOM error on the page and in the browser Console.
 * @param {string} message - The error message to display.
 */
const displayError = (message) => {
    const errorOutput = document.querySelector("#errorOutput");

    if (errorOutput) {
        errorOutput.textContent = message;
        errorOutput.classList.remove("success-message");
        errorOutput.classList.add("error-message");
    }

    // Part 2: Demonstrate error display functionality in Developer Tools.
    console.error("DOM Update Error:", message);
};

/**
 * Find an animal element and replace its text with the animal's name.
 * @param {string} animalId - The ID of the animal element to update.
 * @param {{id: string, name: string}} animalData - The animal data to display.
 */
const updateAnimalContent = (animalId, animalData) => {
    try {
        // Part 2: Target a specific element in the Document Object Model (DOM).
        const animalElement = document.querySelector(`#${animalId}`);

        if (!animalElement) {
            throw new Error(`Animal element ${animalId} not found`);
        }

        // Use textContent to insert text safely rather than interpreting it as HTML.
        animalElement.textContent = `Animal: ${animalData.name}`;
        animalElement.classList.add("animal-populated");

        const errorOutput = document.querySelector("#errorOutput");
        if (errorOutput) {
            errorOutput.textContent = `Successfully updated ${animalData.name}.`;
            errorOutput.classList.remove("error-message");
            errorOutput.classList.add("success-message");
        }
    } catch (error) {
        // Part 2: Catch the missing-element error so it does not stop the page.
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

// Part 3: Connect the DOM-manipulation function to page controls.
// Cache the controls, then attach handlers only when the corresponding HTML exists.
const populateAnimalsButton = document.querySelector("#populateAnimalsButton");
const triggerErrorButton = document.querySelector("#triggerErrorButton");

/**
 * Populate each animal card from the test data.
 */
const populateAnimals = () => {
    // Reuse the same safe update function for each record instead of duplicating DOM logic.
    animals.forEach((animal) => {
        updateAnimalContent(animal.id, animal);
    });

    console.info("DOM updated: animal cards populated.");
};

if (populateAnimalsButton) {
    populateAnimalsButton.addEventListener("click", populateAnimals);
}

if (triggerErrorButton) {
    triggerErrorButton.addEventListener("click", () => {
        // This intentionally uses an ID that does not exist to test try-catch.
        updateAnimalContent("missingAnimal", { id: "missingAnimal", name: "Test Animal" });
    });
}

// Populate the animal elements on initial page load so the page is useful before a click.
populateAnimals();
