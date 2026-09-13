// Part 1: Creating an Array of Objects

// Create an array containing objects that represent different animals.
let animals = [
    {
        id: 1,
        name: "Max",
        age: 5,
        breed: "Golden Retriever"
    },
    {
        id: 2,
        name: "Luna",
        age: 3,
        breed: "Siamese"
    },
    {
        id: 3,
        name: "Charlie",
        age: 7,
        breed: "German Shepherd"
    },
    {
        id: 4,
        name: "Bella",
        age: 2,
        breed: "Beagle"
    }
];


// Part 2: Accessing Data within Array Objects

// Log the name of each animal in the array.
console.log("Animal names:");

animals.forEach((animal) => {
    console.log(animal.name);
});


// Part 3: Modifying Objects in an Array

// Update the age of the animal with an ID of 2.
animals[1].age = 4;

// Log the updated array.
console.log("Updated animals:", animals);

// Add a gender property to each animal.
animals[0].gender = "male";
animals[1].gender = "female";
animals[2].gender = "male";
animals[3].gender = "female";

// Log the animals with their new gender properties.
console.log("Animals with gender:", animals);


// Part 4: Filtering and Searching in Array of Objects

// filter() creates a new array containing only animals whose gender is male.
let maleAnimals = animals.filter((animal) => animal.gender === "male");

// Log the filtered array.
console.log("Male animals:", maleAnimals);

// find() searches for the first animal whose name matches the specified name.
let searchedAnimal = animals.find((animal) => animal.name === "Luna");

// Log the animal that was found.
console.log("Animal found:", searchedAnimal);
