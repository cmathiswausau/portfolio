// Create an array containing five different animal names.
let animals = ["Lion", "Tiger", "Elephant", "Giraffe", "Zebra"];

// Display the original array in the console.
console.log("Original array:", animals);

// push() adds a new element to the end of the array.
animals.push("Monkey");
console.log("After push():", animals);

// pop() removes the last element from the array.
animals.pop();
console.log("After pop():", animals);

// shift() removes the first element from the array.
animals.shift();
console.log("After shift():", animals);

// unshift() adds a new element to the beginning of the array.
animals.unshift("Bear");
console.log("After unshift():", animals);

// slice() creates a new array containing a portion of the original array.
let selectedAnimals = animals.slice(1, 4);
console.log("After slice():", selectedAnimals);
