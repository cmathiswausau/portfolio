// Declare Zoo Variables
// Create variables for different animal species using appropriate data types.
const elephant = 3;
const tiger = 2;
const panda = 4;

// Use Operators and Type Conversion
// Calculate the total number of animals in the zoo using addition operators.
const totalAnimals = elephant + tiger + panda;

// Output the results to the console.
console.log(`Elephants: ${elephant}`);
console.log(`Tigers: ${tiger}`);
console.log(`Pandas: ${panda}`);
console.log(`Total animals: ${totalAnimals}`);

// Demonstrate type conversion.
console.log(Number(totalAnimals));
console.log(String(totalAnimals));

// Implement Interactive Features
// Create a variable to hold the status of the zoo (open/closed).
let zooOpen = true;

// Use a unary operator to modify the state of the zoo.
console.log(`Zoo open: ${zooOpen}`);
zooOpen = !zooOpen;
console.log(`Zoo open after changing status: ${zooOpen}`);

// Use an equality operator to check the state of the zoo.
console.log(zooOpen === true);

