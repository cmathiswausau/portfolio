/*
Author Name: Chris Mathis
Date: 9/27/2026
*/

/* Constants */

/**
 * Container for the animal selection buttons.
 */
const animalButtons = document.getElementById("animalButtons");

/**
 * Container used to display the selected animal's information.
 */
const animalDetails = document.getElementById("animalDetails");

/**
 * Buttons used to display additional endangered species information.
 */
const accordionButtons = document.querySelectorAll(".accordion-button");

/**
 * Contains information about the animals displayed on the zoo page.
 */
const animals = [
    {
        id: "red-panda",
        name: "Red Panda",
        scientificName: "Ailurus fulgens",
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
        scientificName: "Panthera tigris",
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
        scientificName: "Spheniscus demersus",
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
        scientificName: "Giraffa camelopardalis",
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
        scientificName: "Loxodonta africana",
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

/* Event Listeners */

/**
 * Adds accessible accordion behavior to the endangered species cards.
 */
accordionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const panel = document.getElementById(
            button.getAttribute("aria-controls")
        );
        const expanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!expanded));
        panel.hidden = expanded;
        button.lastElementChild.textContent = expanded ? "+" : "−";
    });
});

/* Functions */

/**
 * Creates a button for each animal in the animal list.
 * Returns: Nothing.
 */
function createAnimalButtons() {
    animals.forEach((animal, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "animal-button";
        button.textContent = animal.name;
        button.setAttribute(
            "aria-selected",
            index === 0 ? "true" : "false"
        );
        button.setAttribute("aria-controls", "animalDetails");

        button.addEventListener("click", () => {
            selectAnimal(animal.id);
        });

        animalButtons.appendChild(button);
    });
}

/**
 * Displays the selected animal's information.
 * Parameters:
 * - animalId: The ID of the animal to display.
 * Returns: Nothing.
 */
function selectAnimal(animalId) {
    const animal = animals.find((item) => item.id === animalId);

    if (!animal) {
        return;
    }

    document.querySelectorAll(".animal-button").forEach((button) => {
        button.setAttribute(
            "aria-selected",
            button.textContent === animal.name ? "true" : "false"
        );
    });

    animalDetails.replaceChildren();

    const image = document.createElement("img");
    image.className = "animal-image";
    image.src = animal.image;
    image.alt = `Photo of a ${animal.name}`;

    const content = document.createElement("div");
    content.className = "animal-content";

    const heading = document.createElement("h2");
    heading.textContent = animal.name;

    const scientificName = document.createElement("p");
    scientificName.className = "scientific-name";
    scientificName.textContent = animal.scientificName;

    const description = document.createElement("p");
    description.textContent = animal.description;

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

    factBox.appendChild(factHeading);
    factBox.appendChild(factList);

    const source = document.createElement("p");
    source.className = "source";
    source.appendChild(document.createTextNode("Image source: "));

    const sourceLink = document.createElement("a");
    sourceLink.href = animal.image;
    sourceLink.target = "_blank";
    sourceLink.rel = "noopener";
    sourceLink.textContent = animal.imageSource;

    source.appendChild(sourceLink);

    content.appendChild(heading);
    content.appendChild(scientificName);
    content.appendChild(description);
    content.appendChild(factBox);
    content.appendChild(source);

    animalDetails.appendChild(image);
    animalDetails.appendChild(content);
}

/* Initialize Page */

createAnimalButtons();
selectAnimal(animals[0].id);