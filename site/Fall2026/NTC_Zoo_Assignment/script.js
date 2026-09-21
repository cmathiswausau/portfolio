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

const animalButtons = document.getElementById("animalButtons");
const animalDetails = document.getElementById("animalDetails");

function createAnimalButtons() {
    animals.forEach((animal, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "animal-button";
        button.textContent = animal.name;
        button.setAttribute("aria-selected", index === 0 ? "true" : "false");
        button.setAttribute("aria-controls", "animalDetails");

        button.addEventListener("click", () => {
            selectAnimal(animal.id);
        });

        animalButtons.appendChild(button);
    });
}

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

    animalDetails.innerHTML = `
        <img
            class="animal-image"
            src="${animal.image}"
            alt="Photo of a ${animal.name}"
        >

        <div class="animal-content">
            <h2>${animal.name}</h2>
            <p class="scientific-name">${animal.scientificName}</p>

            <p>${animal.description}</p>

            <div class="fact-box">
                <h3>Interesting Facts</h3>
                <ul>
                    ${animal.facts.map((fact) => `<li>${fact}</li>`).join("")}
                </ul>
            </div>

            <p class="source">
                Image source:
                <a href="${animal.image}" target="_blank" rel="noopener">
                    ${animal.imageSource}
                </a>
            </p>
        </div>
    `;
}

createAnimalButtons();
selectAnimal(animals[0].id);
