// Part 1: Review and Refactor Existing Code
// Use let for variables that represent values used by the website project.
let projectName = "JavaScript Basics";
let lessonNumber = 2;
let assignmentComplete = true;

// Use the typeof operator to check the data types of the variables.
console.log(typeof projectName);
console.log(typeof lessonNumber);
console.log(typeof assignmentComplete);

// Use an arithmetic operator to calculate a value from the variables.
let nextLesson = lessonNumber + 1;
console.log(`Next lesson: ${nextLesson}`);

// Use a logical operator to evaluate whether the assignment is ready.
let readyForSubmission = assignmentComplete && nextLesson > lessonNumber;
console.log(`Ready for submission: ${readyForSubmission}`);

// Use the conditional (ternary) operator to set a value based on a condition.
let status = assignmentComplete ? "Complete" : "In Progress";
console.log(`Assignment status: ${status}`);

// Demonstrate implicit type conversion by adding a number and a string.
let lessonLabel = lessonNumber + "A";
console.log(`Implicit conversion: ${lessonLabel}`);

// Explicitly convert values using String(), Number(), and Boolean().
let convertedNumber = Number("10");
let convertedString = String(10);
let convertedBoolean = Boolean(1);

console.log(`Number conversion: ${convertedNumber}`);
console.log(`String conversion: ${convertedString}`);
console.log(`Boolean conversion: ${convertedBoolean}`);


// Part 2: Integrate Arrays and Objects

// Create an array containing project objects.
let projects = [];

// Add a project demonstrating automation and scripting skills.
projects.push({
    id: 1,
    title: "Infrastructure Automation Toolkit",
    description: "Automation tools for streamlining system administration tasks.",
    technologiesUsed: ["PowerShell", "Windows Server"]
});

// Add a project demonstrating enterprise networking and infrastructure skills.
projects.push({
    id: 2,
    title: "Enterprise Network Modernization",
    description: "Infrastructure upgrades and network redesign work for enterprise environments.",
    technologiesUsed: ["Cisco", "Fortinet", "Windows Server"]
});

// Add a project demonstrating software development and collaboration skills.
projects.push({
    id: 3,
    title: "GitHub & Collaborative Development",
    description: "Collaborative software development using source control and GitHub workflows.",
    technologiesUsed: ["Git", "GitHub", "C#"]
});

// Log the projects array to verify that the objects are structured correctly.
console.log("Projects:", projects);
console.table(projects);


// Existing site navigation behavior.
let navToggle = document.querySelector(".nav-toggle");
if (navToggle) {
    navToggle.addEventListener("click", function () {
        document.querySelector("nav ul").classList.toggle("show");
    });
}
