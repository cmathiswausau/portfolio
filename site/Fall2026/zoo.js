// Part 1: Expanding Zoo Data Structure

// Create an empty array to store animal objects.
let animals = [];

// Create an Elephant object and add it to the animals array.
let elephant = {
    id: 1,
    name: "Elephant",
    species: "African Elephant",
    count: 3,
    gender: "female",
    status: "open"
};
animals.push(elephant);

// Create a Tiger object and add it to the animals array.
let tiger = {
    id: 2,
    name: "Tiger",
    species: "Bengal Tiger",
    count: 2,
    gender: "male",
    status: "open"
};
animals.push(tiger);

// Create a Panda object and add it to the animals array.
let panda = {
    id: 3,
    name: "Panda",
    species: "Giant Panda",
    count: 4,
    gender: "female",
    status: "closed"
};
animals.push(panda);

// Output the entire array to verify the object structure.
console.table(animals);


// Part 1: Array and Object Manipulations

// push() adds a new animal object to the end of the array.
let lion = {
    id: 4,
    name: "Lion",
    species: "African Lion",
    count: 2,
    gender: "male",
    status: "open"
};
animals.push(lion);

console.log("After adding Lion:");
console.table(animals);

// slice() creates a new array containing a portion of the original array.
// This removes the animal from the displayed result without changing the original array.
let animalsWithoutPanda = animals.slice(0, 2).concat(animals.slice(3));

console.log("Array after removing Panda with slice():");
console.table(animalsWithoutPanda);

// filter() creates a new array containing only animals that match the specified status.
let openAnimals = animals.filter((animal) => animal.status === "open");

console.log("Open animals:");
console.table(openAnimals);

// Modify an object's property using dot notation.
animals[0].count = 4;

// Modify an object's property using bracket notation.
animals[2]["status"] = "open";

console.log("After modifying animal properties:");
console.table(animals);


// Part 2: Zoo Statistics

// Calculate the total number of animal species.
let totalSpecies = animals.length;

// Count the number of open species.
let openSpecies = animals.filter((animal) => animal.status === "open").length;

// Count the number of closed species.
let closedSpecies = animals.filter((animal) => animal.status === "closed").length;

console.log(`Total number of animals: ${totalSpecies}`);
console.log(`Open species: ${openSpecies}`);
console.log(`Closed species: ${closedSpecies}`);


// Part 2: Search and Filter Functionality

// find() searches for an animal by name and returns the first matching object.
let searchedAnimal = animals.find((animal) => animal.name === "Tiger");

console.log("Animal found by name:");
console.log(searchedAnimal);

// filter() creates a new array containing animals with the requested status.
let closedAnimals = animals.filter((animal) => animal.status === "closed");

console.log("Closed animals:");
console.table(closedAnimals);


// Part 3: Logging and Debugging

// console.table() displays the array of objects in an easy-to-read table.
console.table(animals);
