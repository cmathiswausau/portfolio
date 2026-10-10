// Part 2: JavaScript integration and debugging practice.

// Log a message to the browser console so it can be inspected in Developer Tools.
const logMessage = (message) => {
    console.log(`Debug Message: ${message}`);
};

// Divide two numbers and catch the expected divide-by-zero error.
const divideNumbers = (a, b) => {
    try {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }

        const result = a / b;
        console.info(`Division result: ${a} / ${b} = ${result}`);
        return result;
    } catch (error) {
        // This is an intentional, handled error used to demonstrate try-catch.
        console.error("An error occurred:", error.message);
        return null;
    }
};

// Find an element by ID and update its text; handle a missing element safely.
const updateContent = (elementId, newContent) => {
    try {
        const element = document.querySelector(`#${elementId}`);
        if (!element) {
            throw new Error(`Element with ID ${elementId} not found`);
        }

        element.textContent = newContent;
        console.info(`Updated element #${elementId}.`);
    } catch (error) {
        // Catch DOM lookup/manipulation errors instead of leaving them unhandled.
        console.error("DOM manipulation error:", error.message);
    }
};

// Part 3: Connect the practice functions to the HTML controls.
document.addEventListener("DOMContentLoaded", () => {
    const logButton = document.querySelector("#logButton");
    const divideButton = document.querySelector("#divideButton");
    const divideByZeroButton = document.querySelector("#divideByZeroButton");
    const updateButton = document.querySelector("#updateButton");
    const missingElementButton = document.querySelector("#missingElementButton");
    const breakpointButton = document.querySelector("#breakpointButton");
    const divisionOutput = document.querySelector("#divisionOutput");
    const debugOutput = document.querySelector("#debugOutput");

    // Demonstrate console.log() in the browser Console.
    if (logButton) {
        logButton.addEventListener("click", () => {
            logMessage("The Log a debug message button was clicked.");
        });
    }

    // Demonstrate a successful function result and update the page with it.
    if (divideButton && divisionOutput) {
        divideButton.addEventListener("click", () => {
            const result = divideNumbers(10, 2);
            divisionOutput.textContent = `10 / 2 = ${result}`;
        });
    }

    // Demonstrate an expected error caught by divideNumbers().
    if (divideByZeroButton && divisionOutput) {
        divideByZeroButton.addEventListener("click", () => {
            const result = divideNumbers(10, 0);
            divisionOutput.textContent = result === null
                ? "Division was stopped safely. See the Console for the handled error."
                : `10 / 0 = ${result}`;
        });
    }

    // Demonstrate changing an existing DOM element's text content.
    if (updateButton) {
        updateButton.addEventListener("click", () => {
            updateContent("contentMessage", "Success! JavaScript updated this paragraph in the DOM.");
        });
    }

    // Demonstrate the missing-element branch; the error is caught in updateContent().
    if (missingElementButton) {
        missingElementButton.addEventListener("click", () => {
            updateContent("elementThatDoesNotExist", "This element is intentionally missing.");
        });
    }

    // Demonstrate stepping through code and inspecting a local variable in DevTools.
    if (breakpointButton && debugOutput) {
        breakpointButton.addEventListener("click", () => {
            const debugValue = 42;
            // Part 3: Keep the breakpoint visible while satisfying eslint:recommended.
            // eslint-disable-next-line no-debugger -- The lab requires a debugger example.
            debugger;
            logMessage(`Breakpoint example continued; debugValue = ${debugValue}.`);
            debugOutput.textContent = `Debugging complete. The inspected value was ${debugValue}.`;
        });
    }

    console.info("External script.js initialized successfully.");
});
