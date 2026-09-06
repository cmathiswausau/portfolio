// Part 2: Variable Declarations and Data Types
// Declare variables that represent information about the website project.
const projectName = "JavaScript Basics";
const lessonNumber = 2;
const assignmentComplete = true;

// Use the typeof operator to check the data types of the variables.
console.log(typeof projectName);
console.log(typeof lessonNumber);
console.log(typeof assignmentComplete);

// Part 3: Operators
// Use an arithmetic operator to calculate a value from the variables.
const nextLesson = lessonNumber + 1;
console.log(`Next lesson: ${nextLesson}`);

// Use a logical operator to evaluate whether the assignment is ready.
const readyForSubmission = assignmentComplete && nextLesson > lessonNumber;
console.log(`Ready for submission: ${readyForSubmission}`);

// Use the conditional (ternary) operator to set a value based on a condition.
const status = assignmentComplete ? "Complete" : "In Progress";
console.log(`Assignment status: ${status}`);

// Part 4: Type Conversion
// Demonstrate implicit type conversion by adding a number and a string.
const lessonLabel = lessonNumber + "A";
console.log(`Implicit conversion: ${lessonLabel}`);

// Explicitly convert values using String(), Number(), and Boolean().
const convertedNumber = Number("10");
const convertedString = String(10);
const convertedBoolean = Boolean(1);

console.log(`Number conversion: ${convertedNumber}`);
console.log(`String conversion: ${convertedString}`);
console.log(`Boolean conversion: ${convertedBoolean}`);

// Existing site navigation behavior.
const navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
    navToggle.addEventListener("click", function () {
        document.querySelector("nav ul").classList.toggle("show");
    });
}
