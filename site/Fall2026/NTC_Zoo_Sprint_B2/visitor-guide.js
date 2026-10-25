/*
Author Name: Chris Mathis
Project: NTC Zoo - Sprint B2 Visitor Guide
*/

// Part 1: Interactive timeline. Exhibit history is fictional coursework data.
const exhibitHistory = [
    { year: 1995, name: "Red Panda", detail: "The woodland exhibit opened with climbing platforms and shaded resting areas." },
    { year: 2001, name: "Tiger", detail: "The tiger habitat introduced larger outdoor spaces and visitor viewing windows." },
    { year: 2008, name: "African Penguin", detail: "A coastal habitat opened with a pool and underwater viewing area." },
    { year: 2015, name: "Giraffe", detail: "The savanna exhibit added elevated viewing and keeper education sessions." },
    { year: 2022, name: "African Elephant", detail: "The elephant habitat expanded with enrichment stations and additional walking space." }
];

// Part 2: Example walking network. Distances are trail segments in meters.
const guideExhibits = ["Red Panda", "Tiger", "African Penguin", "Giraffe", "African Elephant"];
const trailSegments = [
    [0, 1, 180], [0, 2, 240], [1, 2, 150],
    [1, 3, 300], [2, 3, 220], [3, 4, 170], [2, 4, 420]
];
const FEEDBACK_KEY = "ntcZooB2Feedback";
const MAX_REVIEWS = 50;
let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDonation = 25;
let reviews = [];

/**
 * Finds the shortest walk using Dijkstra's algorithm on the sample trail graph.
 * @param {number} start - Starting exhibit index.
 * @param {number} end - Destination exhibit index.
 * @returns {object} Shortest distance and exhibit route.
 */
function shortestWalk(start, end) {
    if (!Number.isInteger(start) || !Number.isInteger(end)
        || start < 0 || end < 0 || start >= guideExhibits.length || end >= guideExhibits.length) {
        throw new Error("Choose valid starting and destination exhibits.");
    }
    const distances = guideExhibits.map(() => Infinity);
    const previous = guideExhibits.map(() => null);
    const remaining = new Set(guideExhibits.map((name, index) => index));
    distances[start] = 0;
    while (remaining.size) {
        const current = [...remaining].reduce((best, next) => distances[next] < distances[best] ? next : best);
        remaining.delete(current);
        if (current === end) {
            break;
        }
        for (const [a, b, meters] of trailSegments) {
            const neighbor = a === current ? b : b === current ? a : null;
            if (neighbor !== null && remaining.has(neighbor) && distances[current] + meters < distances[neighbor]) {
                distances[neighbor] = distances[current] + meters;
                previous[neighbor] = current;
            }
        }
    }
    const route = [];
    for (let step = end; step !== null; step = previous[step]) {
        route.unshift(guideExhibits[step]);
    }
    return { meters: distances[end], route };
}

/**
 * Shows the selected timeline milestone and updates button states.
 * @param {number} index - Milestone index.
 * @returns {void} No return value.
 */
function showMilestone(index) {
    const item = exhibitHistory[index];
    document.getElementById("timelineTitle").textContent = `${item.year} — ${item.name}`;
    document.getElementById("timelineDetail").textContent = item.detail;
    document.querySelectorAll("#timelineButtons button").forEach((button, position) => {
        button.setAttribute("aria-pressed", String(position === index));
    });
}

// Part 3: Recurring demonstration activities are generated for any selected month.
/**
 * Generates an activity list for a particular local calendar date.
 * @param {Date} date - Local calendar date.
 * @returns {Array} Scheduled sample activities.
 */
function eventsForDate(date) {
    const activities = [{ time: "10:00 AM", name: "Keeper Talk", exhibit: "Red Panda" }];
    if ([0, 6].includes(date.getDay())) {
        activities.push({ time: "1:00 PM", name: "Penguin Discovery", exhibit: "African Penguin" });
    }
    if (date.getDay() === 3) {
        activities.push({ time: "2:00 PM", name: "Savanna Enrichment", exhibit: "African Elephant" });
    }
    return activities;
}

/**
 * Renders a month and updates the activity list when a date is chosen.
 * @returns {void} No return value.
 */
function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    document.getElementById("calendarMonth").textContent = calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const grid = document.getElementById("calendarDays");
    grid.replaceChildren();
    for (let blank = 0; blank < calendarMonth.getDay(); blank++) {
        const spacer = document.createElement("span");
        spacer.setAttribute("aria-hidden", "true");
        grid.append(spacer);
    }
    const count = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    for (let day = 1; day <= count; day++) {
        const date = new Date(year, month, day);
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(day);
        button.setAttribute("aria-label", date.toLocaleDateString("en-US", { dateStyle: "full" }));
        button.setAttribute("aria-pressed", "false");
        if (date.toDateString() === today.toDateString()) {
            button.setAttribute("aria-current", "date");
        }
        button.addEventListener("click", () => {
            showEvents(date);
            grid.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        });
        grid.append(button);
    }
    const chosenDay = year === today.getFullYear() && month === today.getMonth() ? today.getDate() : 1;
    grid.querySelectorAll("button")[chosenDay - 1].click();
}

/**
 * Displays activities for the selected date using safe text nodes.
 * @param {Date} date - Selected local date.
 * @returns {void} No return value.
 */
function showEvents(date) {
    document.getElementById("eventDate").textContent = date.toLocaleDateString("en-US", { dateStyle: "full" });
    const list = document.getElementById("eventList");
    list.replaceChildren();
    for (const event of eventsForDate(date)) {
        const item = document.createElement("li");
        item.textContent = `${event.time} · ${event.name} — ${event.exhibit}`;
        list.append(item);
    }
}

// Part 4: Suggested and custom donations. No payment is collected.
/**
 * Validates a dollar amount with at most two decimal places.
 * @param {string} value - Dollar input.
 * @returns {number} Integer cents.
 */
function donationCents(value) {
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        throw new Error("Enter a dollar amount with up to two decimal places.");
    }
    const cents = Math.round(Number(value) * 100);
    if (!Number.isSafeInteger(cents) || cents < 100 || cents > 1000000) {
        throw new Error("Choose an amount between $1 and $10,000.");
    }
    return cents;
}

// Part 5: Bounded feedback saved only in this browser; it is not shared publicly.
/**
 * Checks saved feedback before displaying it.
 * @param {object} review - Candidate review.
 * @returns {boolean} Whether the review is valid.
 */
function isValidReview(review) {
    return Boolean(review && guideExhibits.includes(review.exhibit)
        && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5
        && typeof review.comment === "string" && review.comment.trim().length > 0
        && review.comment.length <= 500 && typeof review.date === "string"
        && Number.isFinite(Date.parse(review.date)));
}

/**
 * Displays reviews and an average for the selected exhibit.
 * @returns {void} No return value.
 */
function renderReviews() {
    const exhibit = document.getElementById("reviewExhibit").value;
    const matching = reviews.filter((review) => review.exhibit === exhibit);
    const average = matching.length ? (matching.reduce((sum, review) => sum + review.rating, 0) / matching.length).toFixed(1) : null;
    document.getElementById("ratingSummary").textContent = average ? `${average}/5 from ${matching.length} review(s)` : "No ratings yet. Be the first!";
    const list = document.getElementById("reviewList");
    list.replaceChildren();
    for (const review of matching.slice().reverse()) {
        const item = document.createElement("li");
        const heading = document.createElement("strong");
        heading.textContent = `${review.rating}/5 · ${new Date(review.date).toLocaleDateString("en-US")}`;
        const comment = document.createElement("p");
        comment.textContent = review.comment;
        item.append(heading, comment);
        list.append(item);
    }
}

/**
 * Connects all five visitor features and handles unavailable browser storage.
 * @returns {void} No return value.
 */
function initializeVisitorGuide() {
    const timeline = document.getElementById("timelineButtons");
    exhibitHistory.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(item.year);
        button.addEventListener("click", () => showMilestone(index));
        timeline.append(button);
    });
    showMilestone(0);
    for (const id of ["walkStart", "walkEnd", "reviewExhibit"]) {
        const select = document.getElementById(id);
        guideExhibits.forEach((name, index) => {
            const option = document.createElement("option");
            option.value = id === "reviewExhibit" ? name : String(index);
            option.textContent = name;
            select.append(option);
        });
    }
    document.getElementById("walkEnd").value = "4";
    document.getElementById("walkForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const output = document.getElementById("walkResult");
        try {
            const walk = shortestWalk(Number(document.getElementById("walkStart").value), Number(document.getElementById("walkEnd").value));
            const speed = Number(document.getElementById("walkSpeed").value);
            if (![50, 75, 100].includes(speed)) {
                throw new Error("Choose a listed walking pace.");
            }
            output.textContent = `${walk.meters} meters (${(walk.meters / 1609.344).toFixed(2)} miles) · about ${Math.ceil(walk.meters / speed)} minutes. Route: ${walk.route.join(" → ")}.`;
        } catch (error) {
            output.textContent = error.message;
        }
    });
    document.getElementById("previousMonth").addEventListener("click", () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        renderCalendar();
    });
    document.getElementById("nextMonth").addEventListener("click", () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        renderCalendar();
    });
    document.getElementById("currentMonth").addEventListener("click", () => {
        calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        renderCalendar();
    });
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            renderCalendar();
        }
    });
    renderCalendar();
    document.querySelectorAll("#donationAmounts button").forEach((button) => {
        button.addEventListener("click", () => {
            selectedDonation = Number(button.dataset.amount);
            document.getElementById("customDonation").value = "";
            document.querySelectorAll("#donationAmounts button").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
            document.getElementById("donationStatus").textContent = `$${selectedDonation} selected.`;
        });
    });
    document.getElementById("customDonation").addEventListener("input", () => {
        selectedDonation = null;
        document.querySelectorAll("#donationAmounts button").forEach((button) => button.setAttribute("aria-pressed", "false"));
    });
    document.getElementById("donationForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const output = document.getElementById("donationStatus");
        try {
            const value = document.getElementById("customDonation").value.trim() || (selectedDonation === null ? "" : String(selectedDonation));
            const cents = donationCents(value);
            output.textContent = `Thank you! Your $${(cents / 100).toFixed(2)} demonstration pledge supports animal care. No payment was taken.`;
        } catch (error) {
            output.textContent = error.message;
        }
    });
    try {
        const stored = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "[]");
        if (!Array.isArray(stored)) {
            throw new Error("Invalid feedback storage.");
        }
        reviews = stored.filter(isValidReview).slice(-MAX_REVIEWS);
    } catch (error) {
        document.getElementById("reviewStatus").textContent = "Saved feedback is unavailable. New reviews can still be shown for this visit.";
        console.warn("Feedback storage unavailable:", error.message);
    }
    document.getElementById("reviewExhibit").addEventListener("change", renderReviews);
    document.getElementById("reviewForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const comment = document.getElementById("reviewComment");
        const review = { exhibit: document.getElementById("reviewExhibit").value, rating: Number(document.getElementById("reviewRating").value), comment: comment.value.trim(), date: new Date().toISOString() };
        const status = document.getElementById("reviewStatus");
        if (!isValidReview(review)) {
            status.textContent = "Choose an exhibit, a rating from 1 to 5, and a comment of 1–500 characters.";
            return;
        }
        reviews = [...reviews, review].slice(-MAX_REVIEWS);
        try {
            localStorage.setItem(FEEDBACK_KEY, JSON.stringify(reviews));
            status.textContent = "Thank you! Your feedback was saved in this browser.";
        } catch (error) {
            status.textContent = "Thank you! Your feedback is shown for this visit, but browser storage is unavailable.";
            console.warn("Unable to save feedback:", error.message);
        }
        comment.value = "";
        renderReviews();
    });
    renderReviews();
}

initializeVisitorGuide();
