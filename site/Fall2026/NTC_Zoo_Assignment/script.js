/*
Author Name: Chris Mathis
Project: NTC Zoo - Sprint B1 Zoo Assignment
*/

// Part 1: Error-safe zoo data structure and validation.
// The original CSWD1A animal profiles are preserved and augmented with species and health status.

/**
 * Approved health status values for all animal records.
 */
const HEALTH_STATUSES = [
    "Healthy",
    "Under observation",
    "Needs veterinary care",
    "Critical"
];

/**
 * The original CSWD1A zoo animal data, extended with management properties.
 */
const animals = [
    {
        id: "red-panda",
        name: "Red Panda",
        species: "Red Panda",
        scientificName: "Ailurus fulgens",
        healthStatus: "Healthy",
        image: "https://live.staticflickr.com/1770/41196511590_13379b3029_o.jpg",
        description: "Red pandas are small mammals native to the high forests of Asia. They are excellent climbers and spend much of their time in trees.",
        facts: [
            "About 95% of a red panda's diet is bamboo.",
            "Their bushy tails help them balance while climbing.",
            "Red pandas are the only living members of the Ailuridae family."
        ],
        imageSource: "Wikimedia Commons — Mathias Appel, CC0"
    },
    {
        id: "tiger",
        name: "Tiger",
        species: "Tiger",
        scientificName: "Panthera tigris",
        healthStatus: "Under observation",
        image: "https://nationalzoo.si.edu/sites/default/files/paragraphs/single_image/20190226-bridgetisrael02.jpg",
        description: "Tigers are large cats known for their striped coats. Their stripes help provide camouflage in vegetation and each tiger has a unique stripe pattern.",
        facts: [
            "Every tiger has a unique stripe pattern.",
            "Tigers are the largest members of the cat family.",
            "They are strong swimmers and often enjoy the water."
        ],
        imageSource: "Smithsonian's National Zoo"
    },
    {
        id: "penguin",
        name: "African Penguin",
        species: "African Penguin",
        scientificName: "Spheniscus demersus",
        healthStatus: "Healthy",
        image: "https://nationalzoo.si.edu/sites/default/files/styles/max_650x650/public/paragraphs/single_image/penguins_and_chick.jpg?itok=Z3HXX9_e",
        description: "African penguins are coastal birds that cannot fly but are excellent swimmers. They use their wings as flippers to move through the water.",
        facts: [
            "African penguins are excellent swimmers.",
            "They have specialized feathers that help keep them warm and dry.",
            "They communicate with a variety of calls and behaviors."
        ],
        imageSource: "Smithsonian's National Zoo"
    },
    {
        id: "giraffe",
        name: "Giraffe",
        species: "Giraffe",
        scientificName: "Giraffa camelopardalis",
        healthStatus: "Healthy",
        image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Giraffe%20(10417517974).jpg",
        description: "Giraffes are tall African mammals recognized by their long necks and patterned coats. Their height allows them to browse vegetation high above many other herbivores.",
        facts: [
            "Giraffes use their long tongues to help gather leaves.",
            "Their long necks contain seven vertebrae, the same number found in most mammals.",
            "Their patterned coats are unique to each individual."
        ],
        imageSource: "Wikimedia Commons — Bernard Spragg. NZ, CC BY 2.0"
    },
    {
        id: "elephant",
        name: "Elephant",
        species: "African Elephant",
        scientificName: "Loxodonta africana",
        healthStatus: "Healthy",
        image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Elephant%20(1).jpg",
        description: "African elephants are the largest living land animals. They use their trunks for breathing, smelling, drinking, feeding, and handling objects.",
        facts: [
            "An elephant's trunk contains tens of thousands of muscles.",
            "Elephants use their large ears to help release body heat.",
            "They live in complex social groups and communicate in many ways."
        ],
        imageSource: "Wikimedia Commons — Caitlin from Hertfordshire, CC BY 2.0"
    }
];

let zooIsOpen = true;
let visitorCount = 0;
let selectedAnimalId = animals[0].id;

// Part 2: DOM manipulation with error handling.

/**
 * Finds a required element and throws a useful error when it is absent.
 * @param {string} elementId - The expected DOM element ID.
 * @returns {HTMLElement} The element found in the document.
 */
const getRequiredElement = (elementId) => {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(`Required page element '#${elementId}' was not found.`);
    }

    return element;
};

/**
 * Shows an error message safely without injecting HTML from a message string.
 * @param {string} message - The error message to show.
 * @returns {void} This function does not return a value.
 */
const displayError = (message) => {
    const errorSection = document.getElementById("errorSection");

    if (!errorSection) {
        console.error("Unable to show the error on the page because #errorSection is missing.", message);
        return;
    }

    const errorMessage = document.createElement("p");
    errorMessage.className = "error-message";
    errorMessage.textContent = message;
    errorSection.replaceChildren(errorMessage);
};

/**
 * Logs an error for debugging and displays a safe user-facing message.
 * @param {unknown} error - The exception or error value caught.
 * @param {string} context - A short description of the failed operation.
 * @returns {void} This function does not return a value.
 */
const reportError = (error, context) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${context}: ${errorMessage}`, error);
    displayError(`${context}: ${errorMessage}`);
};

/**
 * Clears any previously displayed error message.
 * @returns {void} This function does not return a value.
 */
const clearError = () => {
    const errorSection = document.getElementById("errorSection");

    if (errorSection) {
        errorSection.replaceChildren();
    }
};

/**
 * Updates the polite feedback area when it exists.
 * @param {string} message - The status message to display.
 * @returns {void} This function does not return a value.
 */
const displayFeedback = (message) => {
    const feedbackSection = document.getElementById("feedbackSection");

    if (!feedbackSection) {
        console.info(message);
        return;
    }

    feedbackSection.textContent = message;
};

/**
 * Validates and normalizes animal data before changing the zoo array.
 * @param {object} animalData - Candidate animal data received from the form or a test.
 * @returns {object} A validated animal record with all properties needed by the guide.
 */
const validateAnimalData = (animalData) => {
    if (!animalData || typeof animalData !== "object") {
        throw new Error("Animal data must be provided as an object.");
    }

    if (typeof animalData.id !== "string" || !animalData.id.trim()) {
        throw new Error("Animal ID is required.");
    }

    const id = animalData.id.trim().toLowerCase();

    if (!/^[a-z0-9][a-z0-9-]{1,29}$/u.test(id)) {
        throw new Error("Animal ID must be 2–30 characters and use only letters, numbers, or hyphens.");
    }

    if (typeof animalData.name !== "string" || !animalData.name.trim()) {
        throw new Error("Animal name is required.");
    }

    if (typeof animalData.species !== "string" || !animalData.species.trim()) {
        throw new Error("Animal species is required.");
    }

    if (typeof animalData.healthStatus !== "string" || !HEALTH_STATUSES.includes(animalData.healthStatus.trim())) {
        throw new Error("Choose a valid health status for the animal.");
    }

    const duplicateAnimal = animals.some((animal) => animal.id === id);

    if (duplicateAnimal) {
        throw new Error(`An animal with ID '${id}' already exists. Choose a unique ID.`);
    }

    const name = animalData.name.trim();
    const species = animalData.species.trim();

    if (name.length > 60 || species.length > 60) {
        throw new Error("Animal name and species must each be 60 characters or fewer.");
    }

    return {
        id,
        name,
        species,
        scientificName: typeof animalData.scientificName === "string" && animalData.scientificName.trim()
            ? animalData.scientificName.trim()
            : species,
        healthStatus: animalData.healthStatus.trim(),
        image: typeof animalData.image === "string" ? animalData.image : "",
        description: typeof animalData.description === "string" && animalData.description.trim()
            ? animalData.description.trim()
            : `${name} is part of the NTC Zoo animal collection. More animal information can be added to this record later.`,
        facts: Array.isArray(animalData.facts) ? animalData.facts : [],
        imageSource: typeof animalData.imageSource === "string" ? animalData.imageSource : "Zoo staff record"
    };
};

/**
 * Creates the original animal-selection buttons, including any newly added animals.
 * @returns {void} This function does not return a value.
 */
const createAnimalButtons = () => {
    try {
        const animalButtons = getRequiredElement("animalButtons");
        animalButtons.replaceChildren();

        animals.forEach((animal) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "animal-button";
            button.textContent = animal.name;
            button.setAttribute("aria-selected", String(animal.id === selectedAnimalId));
            button.setAttribute("aria-controls", "animalDetails");

            button.addEventListener("click", () => {
                selectAnimal(animal.id);
            });

            animalButtons.appendChild(button);
        });
    } catch (error) {
        reportError(error, "Unable to create animal selection buttons");
    }
};

/**
 * Creates the selected animal's details using safe DOM methods.
 * @param {object} animal - The animal record to display.
 * @returns {void} This function does not return a value.
 */
const renderAnimalDetails = (animal) => {
    const animalDetails = getRequiredElement("animalDetails");
    animalDetails.replaceChildren();

    if (animal.image) {
        const image = document.createElement("img");
        image.className = "animal-image";
        image.src = animal.image;
        image.alt = `Photo of a ${animal.name}`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
            image.hidden = true;
            console.warn(`The image for ${animal.name} could not be loaded.`, animal.image);
        });
        animalDetails.appendChild(image);
    } else {
        const noImageMessage = document.createElement("p");
        noImageMessage.className = "no-animal-image";
        noImageMessage.textContent = "No photo is attached to this animal record yet.";
        animalDetails.appendChild(noImageMessage);
    }

    const content = document.createElement("div");
    content.className = "animal-content";

    const heading = document.createElement("h2");
    heading.textContent = animal.name;

    const scientificName = document.createElement("p");
    scientificName.className = "scientific-name";
    scientificName.textContent = animal.scientificName;

    const description = document.createElement("p");
    description.textContent = animal.description;

    const healthBox = document.createElement("div");
    healthBox.className = "animal-health-box";

    const healthLabel = document.createElement("label");
    healthLabel.htmlFor = "selectedAnimalHealth";
    healthLabel.textContent = "Health status";

    const healthSelect = document.createElement("select");
    healthSelect.id = "selectedAnimalHealth";
    healthSelect.name = "selectedAnimalHealth";
    healthSelect.setAttribute("aria-label", `Health status for ${animal.name}`);

    HEALTH_STATUSES.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        healthSelect.appendChild(option);
    });

    healthSelect.value = animal.healthStatus;
    healthSelect.addEventListener("change", () => {
        updateAnimalHealth(animal.id, healthSelect.value);
    });

    healthBox.append(healthLabel, healthSelect);

    content.append(heading, scientificName, description, healthBox);

    if (animal.facts.length > 0) {
        const factBox = document.createElement("div");
        factBox.className = "fact-box";

        const factHeading = document.createElement("h3");
        factHeading.textContent = "Interesting Facts";

        const factList = document.createElement("ul");
        animal.facts.forEach((fact) => {
            const factItem = document.createElement("li");
            factItem.textContent = fact;
            factList.appendChild(factItem);
        });

        factBox.append(factHeading, factList);
        content.appendChild(factBox);
    }

    if (animal.imageSource) {
        const source = document.createElement("p");
        source.className = "source";
        source.appendChild(document.createTextNode("Image source: "));

        if (animal.image) {
            const sourceLink = document.createElement("a");
            sourceLink.href = animal.image;
            sourceLink.target = "_blank";
            sourceLink.rel = "noopener noreferrer";
            sourceLink.textContent = animal.imageSource;
            source.appendChild(sourceLink);
        } else {
            source.appendChild(document.createTextNode(animal.imageSource));
        }

        content.appendChild(source);
    }

    animalDetails.appendChild(content);
};

/**
 * Displays an animal record and updates the selection state safely.
 * @param {string} animalId - The unique ID of the animal to display.
 * @returns {void} This function does not return a value.
 */
const selectAnimal = (animalId) => {
    try {
        const animal = animals.find((record) => record.id === animalId);

        if (!animal) {
            throw new Error(`No animal was found with ID '${animalId}'.`);
        }

        selectedAnimalId = animal.id;
        document.querySelectorAll(".animal-button").forEach((button) => {
            button.setAttribute("aria-selected", String(button.textContent === animal.name));
        });

        renderAnimalDetails(animal);
        clearError();
        displayFeedback(`${animal.name} selected. Health status: ${animal.healthStatus}.`);
    } catch (error) {
        reportError(error, "Unable to display animal");
    }
};

/**
 * Validates and adds an animal without modifying the array when validation fails.
 * @param {object} animalData - The candidate animal record.
 * @returns {boolean} True when the animal was added; otherwise false.
 */
const addAnimal = (animalData) => {
    try {
        const validatedAnimal = validateAnimalData(animalData);
        animals.push(validatedAnimal);
        createAnimalButtons();
        selectAnimal(validatedAnimal.id);
        clearError();
        displayFeedback(`${validatedAnimal.name} was added to the zoo.`);
        console.info("Animal added successfully:", validatedAnimal);
        logZooData();
        return true;
    } catch (error) {
        reportError(error, "Unable to add animal");
        return false;
    }
};

/**
 * Updates an animal's health after validating its ID and requested status.
 * @param {string} animalId - The unique animal ID.
 * @param {string} healthStatus - The requested health status.
 * @returns {void} This function does not return a value.
 */
const updateAnimalHealth = (animalId, healthStatus) => {
    try {
        const animal = animals.find((record) => record.id === animalId);

        if (!animal) {
            throw new Error(`Cannot update health: animal '${animalId}' was not found.`);
        }

        if (!HEALTH_STATUSES.includes(healthStatus)) {
            throw new Error("Choose a valid health status.");
        }

        const previousStatus = animal.healthStatus;
        animal.healthStatus = healthStatus;
        clearError();
        displayFeedback(`${animal.name}'s health changed from ${previousStatus} to ${healthStatus}.`);
        console.info("Animal health updated:", {
            id: animal.id,
            name: animal.name,
            previousStatus,
            healthStatus
        });
        logZooData();
    } catch (error) {
        reportError(error, "Unable to update animal health");
    }
};

/**
 * Writes a compact view of animal records to the browser Console.
 * @returns {void} This function does not return a value.
 */
const logZooData = () => {
    console.table(animals.map((animal) => ({
        id: animal.id,
        name: animal.name,
        species: animal.species,
        healthStatus: animal.healthStatus
    })));
    console.info("Zoo status:", zooIsOpen ? "Open" : "Closed", "| Current visitors:", visitorCount);
};

// Part 3: Interactive zoo status, health updates, and visitor management.

/**
 * Updates the visible zoo status and the status-toggle button.
 * @returns {void} This function does not return a value.
 */
const updateZooStatusDisplay = () => {
    const statusElement = getRequiredElement("zooStatus");
    const toggleButton = getRequiredElement("toggleZooStatus");

    statusElement.textContent = zooIsOpen ? "Zoo is OPEN" : "Zoo is CLOSED";
    statusElement.classList.toggle("status-open", zooIsOpen);
    statusElement.classList.toggle("status-closed", !zooIsOpen);
    toggleButton.textContent = zooIsOpen ? "Close Zoo" : "Open Zoo";
};

/**
 * Displays the visitor count as a string in the page.
 * @returns {void} This function does not return a value.
 */
const updateVisitorCountDisplay = () => {
    getRequiredElement("visitorCount").textContent = String(visitorCount);
};

/**
 * Safely checks visitors in or out after validating the requested count.
 * @param {string} direction - Either "checkIn" or "checkOut".
 * @returns {void} This function does not return a value.
 */
const adjustVisitors = (direction) => {
    try {
        const amount = Number(getRequiredElement("visitorAmount").value);

        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error("Enter a whole number of visitors greater than zero.");
        }

        if (direction === "checkIn") {
            if (!zooIsOpen) {
                throw new Error("Visitors cannot check in while the zoo is closed.");
            }

            visitorCount += amount;
        } else if (direction === "checkOut") {
            if (amount > visitorCount) {
                throw new Error(`Cannot check out ${amount} visitors; only ${visitorCount} are currently inside.`);
            }

            visitorCount -= amount;
        } else {
            throw new Error("The requested visitor action is not recognized.");
        }

        updateVisitorCountDisplay();
        clearError();
        displayFeedback(`${amount} visitor${amount === 1 ? "" : "s"} checked ${direction === "checkIn" ? "in" : "out"}. Current count: ${visitorCount}.`);
        console.info("Visitor count updated:", visitorCount);
    } catch (error) {
        reportError(error, "Unable to update visitor count");
    }
};

/**
 * Handles the add-animal form and lets validation report any invalid input.
 * @param {SubmitEvent} event - The form submission event.
 * @returns {void} This function does not return a value.
 */
const handleAnimalFormSubmit = (event) => {
    event.preventDefault();

    try {
        const wasAdded = addAnimal({
            id: getRequiredElement("animalId").value,
            name: getRequiredElement("animalName").value,
            species: getRequiredElement("animalSpecies").value,
            healthStatus: getRequiredElement("animalHealthStatus").value
        });

        if (wasAdded) {
            getRequiredElement("animalForm").reset();
        }
    } catch (error) {
        reportError(error, "Unable to process the add-animal form");
    }
};

/**
 * Intentionally submits invalid data to demonstrate safe validation and error reporting.
 * @returns {void} This function does not return a value.
 */
const runInvalidAnimalTest = () => {
    addAnimal({
        id: "",
        name: "",
        species: "",
        healthStatus: "Unknown"
    });
};

/**
 * Intentionally requests an element that does not exist to test the error handler.
 * @returns {void} This function does not return a value.
 */
const runMissingElementTest = () => {
    try {
        getRequiredElement("missingDemoElement");
    } catch (error) {
        reportError(error, "Missing-element test caught the expected error");
    }
};

/**
 * Adds accessible behavior to the existing endangered-species accordions.
 * @returns {void} This function does not return a value.
 */
const bindAccordionButtons = () => {
    document.querySelectorAll(".accordion-button").forEach((button) => {
        button.addEventListener("click", () => {
            try {
                const panelId = button.getAttribute("aria-controls");

                if (!panelId) {
                    throw new Error("An accordion button is missing its aria-controls value.");
                }

                const panel = document.getElementById(panelId);

                if (!panel) {
                    throw new Error(`Accordion panel '${panelId}' could not be found.`);
                }

                const isExpanded = button.getAttribute("aria-expanded") === "true";
                button.setAttribute("aria-expanded", String(!isExpanded));
                panel.hidden = isExpanded;

                if (button.lastElementChild) {
                    button.lastElementChild.textContent = isExpanded ? "+" : "−";
                }
            } catch (error) {
                reportError(error, "Unable to update endangered-species information");
            }
        });
    });
};

/**
 * Connects application controls to their error-safe event handlers.
 * @returns {void} This function does not return a value.
 */
const bindEventListeners = () => {
    getRequiredElement("animalForm").addEventListener("submit", handleAnimalFormSubmit);

    getRequiredElement("toggleZooStatus").addEventListener("click", () => {
        try {
            zooIsOpen = !zooIsOpen;
            updateZooStatusDisplay();
            clearError();
            displayFeedback(`Zoo status changed to ${zooIsOpen ? "OPEN" : "CLOSED"}.`);
            console.info("Zoo status changed:", zooIsOpen ? "Open" : "Closed");
        } catch (error) {
            reportError(error, "Unable to change zoo status");
        }
    });

    getRequiredElement("checkInVisitors").addEventListener("click", () => {
        adjustVisitors("checkIn");
    });

    getRequiredElement("checkOutVisitors").addEventListener("click", () => {
        adjustVisitors("checkOut");
    });

    getRequiredElement("testInvalidAnimal").addEventListener("click", runInvalidAnimalTest);
    getRequiredElement("testMissingElement").addEventListener("click", runMissingElementTest);
    getRequiredElement("logAnimalData").addEventListener("click", logZooData);
    bindAccordionButtons();
};

/**
 * Initializes the animal guide and zoo management controls safely.
 * @returns {void} This function does not return a value.
 */
const initializeZoo = () => {
    try {
        bindEventListeners();
        createAnimalButtons();
        selectAnimal(selectedAnimalId);
        updateZooStatusDisplay();
        updateVisitorCountDisplay();
        logZooData();
        console.info("NTC Zoo initialized successfully.");
    } catch (error) {
        reportError(error, "Unable to initialize the NTC Zoo application");
    }
};

initializeZoo();
