// Part 2: Array data, error-safe array operations, and DOM manipulation.

// Animal objects follow the simple data structure used in the zoo assignment.
const zooAnimals = [
    { id: "elephant1", name: "Dumbo", species: "Elephant" },
    { id: "tiger1", name: "Raja", species: "Tiger" }
];

const animalGrid = document.querySelector("#animalGrid");
const errorSection = document.querySelector("#errorSection");
const statusMessage = document.querySelector("#statusMessage");

/**
 * Display a handled error on the page and in the browser Console.
 * @param {string} message - The error message to display.
 */
const displayError = (message) => {
    if (errorSection) {
        errorSection.textContent = message;
        errorSection.hidden = false;
    }

    if (statusMessage) {
        statusMessage.textContent = "The operation could not be completed. See the error message below.";
    }

    // Part 2: Demonstrate error display functionality in the page and Developer Tools.
    console.error("Array operation error:", message);
};

/**
 * Clear a previously displayed error message.
 */
const clearError = () => {
    if (errorSection) {
        errorSection.textContent = "";
        errorSection.hidden = true;
    }
};

/**
 * Update the page status and write the message to the browser Console.
 * @param {string} message - The status message to display.
 */
const updateStatus = (message) => {
    if (statusMessage) {
        statusMessage.textContent = message;
    }

    console.info(message);
};

/**
 * Create an animal card using text-safe DOM APIs.
 * @param {{id: string, name: string, species: string}} animalData - The animal record to display.
 */
const displayAnimal = (animalData) => {
    try {
        if (
            !animalData ||
            typeof animalData.id !== "string" ||
            typeof animalData.name !== "string" ||
            typeof animalData.species !== "string"
        ) {
            throw new Error("Animal data must include an ID, name, and species.");
        }

        if (!animalGrid) {
            throw new Error("Animal display area not found in the DOM.");
        }

        const animalCard = document.createElement("article");
        animalCard.className = "animal-card";
        animalCard.id = `${animalData.id}-card`;

        const animalName = document.createElement("h3");
        animalName.textContent = animalData.name;

        const animalSpecies = document.createElement("p");
        animalSpecies.textContent = `Species: ${animalData.species}`;

        animalCard.appendChild(animalName);
        animalCard.appendChild(animalSpecies);
        animalGrid.appendChild(animalCard);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Render an array of animal records in the DOM using forEach.
 * @param {Array<{id: string, name: string, species: string}>} animalsToDisplay - The records to render.
 */
const renderAnimals = (animalsToDisplay) => {
    try {
        if (!Array.isArray(animalsToDisplay)) {
            throw new Error("Animal records must be provided as an array.");
        }

        if (!animalGrid) {
            throw new Error("Animal display area not found in the DOM.");
        }

        clearError();
        animalGrid.replaceChildren();

        if (animalsToDisplay.length === 0) {
            updateStatus("No animals matched this array operation.");
            return;
        }

        animalsToDisplay.forEach((animal) => {
            displayAnimal(animal);
        });

        updateStatus(`Displayed ${animalsToDisplay.length} animal record(s) using forEach().`);
        console.log("Array method .forEach() displayed these records:", animalsToDisplay);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Show every animal record in the zooAnimals array.
 */
const showAllAnimals = () => {
    // Part 2: Use forEach through renderAnimals to display every object in the array.
    renderAnimals(zooAnimals);
};

/**
 * Find and display Raja using the array find method.
 */
const findAnimal = () => {
    try {
        const foundAnimal = zooAnimals.find((animal) => {
            return animal.name === "Raja";
        });

        console.log("Array method .find() result:", foundAnimal);

        if (!foundAnimal) {
            throw new Error('Animal named "Raja" was not found.');
        }

        renderAnimals([foundAnimal]);
        updateStatus(`Found ${foundAnimal.name} using find().`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Filter the zooAnimals array to show elephants only.
 */
const filterElephants = () => {
    try {
        const elephants = zooAnimals.filter((animal) => {
            return animal.species === "Elephant";
        });

        console.log("Array method .filter() result:", elephants);
        renderAnimals(elephants);
        updateStatus(`Filtered ${elephants.length} elephant record(s) using filter().`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Return and display the animal names using the array map method.
 */
const listAnimalNames = () => {
    try {
        const animalNames = zooAnimals.map((animal) => {
            return animal.name;
        });

        console.log("Array method .map() result:", animalNames);
        clearError();
        updateStatus(`Animal names: ${animalNames.join(", ")}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Add a new animal safely using push and reject duplicate IDs.
 * @param {{id: string, name: string, species: string}} animalData - The animal record to add.
 */
const addAnimal = (animalData) => {
    try {
        if (!Array.isArray(zooAnimals)) {
            throw new Error("The zoo animal collection is not a valid array.");
        }

        if (
            !animalData ||
            typeof animalData.id !== "string" ||
            typeof animalData.name !== "string" ||
            typeof animalData.species !== "string"
        ) {
            throw new Error("New animal data must include an ID, name, and species.");
        }

        const duplicateAnimal = zooAnimals.find((animal) => {
            return animal.id === animalData.id;
        });

        if (duplicateAnimal) {
            throw new Error(`An animal with ID "${animalData.id}" already exists.`);
        }

        zooAnimals.push(animalData);
        console.log("Array method .push() added this record:", animalData);
        renderAnimals(zooAnimals);
        updateStatus(`Added ${animalData.name} using push().`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

/**
 * Trigger an expected lookup failure to demonstrate caught array-operation errors.
 */
const testHandledArrayError = () => {
    try {
        const requestedId = "unicorn1";
        const foundAnimal = zooAnimals.find((animal) => {
            return animal.id === requestedId;
        });

        console.log("Array method .find() test result:", foundAnimal);

        if (!foundAnimal) {
            throw new Error(`No animal found with ID "${requestedId}".`);
        }

        renderAnimals([foundAnimal]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayError(errorMessage);
    }
};

// Part 3: Connect each array operation to its corresponding page button.
const showAllButton = document.querySelector("#showAllButton");
const findAnimalButton = document.querySelector("#findAnimalButton");
const filterAnimalsButton = document.querySelector("#filterAnimalsButton");
const mapAnimalsButton = document.querySelector("#mapAnimalsButton");
const addAnimalButton = document.querySelector("#addAnimalButton");
const testArrayErrorButton = document.querySelector("#testArrayErrorButton");

if (showAllButton) {
    showAllButton.addEventListener("click", showAllAnimals);
}

if (findAnimalButton) {
    findAnimalButton.addEventListener("click", findAnimal);
}

if (filterAnimalsButton) {
    filterAnimalsButton.addEventListener("click", filterElephants);
}

if (mapAnimalsButton) {
    mapAnimalsButton.addEventListener("click", listAnimalNames);
}

if (addAnimalButton) {
    addAnimalButton.addEventListener("click", () => {
        addAnimal({ id: "giraffe1", name: "Grace", species: "Giraffe" });
    });
}

if (testArrayErrorButton) {
    testArrayErrorButton.addEventListener("click", testHandledArrayError);
}

// Part 2: Log initial data and render the starting animal objects.
console.info("Zoo animal array initialized.");
console.log("Initial zooAnimals array:", zooAnimals);
showAllAnimals();
