// Part 2: Math Object

// Calculate the circumference of a circle with a radius of 5.
// Math.PI provides the value of pi.
const radius = 5;
const circumference = 2 * Math.PI * radius;
console.log("Circumference:", circumference);

// Math.abs() returns the absolute value of a number.
console.log("Absolute value of -10:", Math.abs(-10));

// Math.floor() rounds a number down to the nearest whole number.
console.log("Floor of 3.9:", Math.floor(3.9));

// Math.ceil() rounds a number up to the nearest whole number.
console.log("Ceiling of 4.2:", Math.ceil(4.2));

// Math.random() generates a random number between 0 (inclusive) and 1 (exclusive).
console.log("Random number:", Math.random());


// Part 3: Date Object

// new Date() creates a Date object containing the current date and time.
const currentDate = new Date();
console.log("Current date:", currentDate);

// toLocaleDateString() displays the date in a friendly format.
console.log("Today's date:", currentDate.toLocaleDateString());


// Part 4: String Manipulations

// toUpperCase() converts all letters in a string to uppercase.
const message = "hello world";
console.log("Uppercase:", message.toUpperCase());

// slice() extracts characters from the specified starting index to the ending index.
// The ending index is not included.
console.log("Slice from index 0 to 5:", message.slice(0, 5));

// includes() checks whether a string contains the specified text.
console.log("Contains 'world':", message.includes("world"));


// Part 5: Number Formatting

// toFixed(2) formats a number to two decimal places.
const decimalNumber = 123.456;
console.log("Two decimal places:", decimalNumber.toFixed(2));

// parseInt() converts a string into an integer.
const numberString = "123.456";
console.log("Converted to integer:", parseInt(numberString));
