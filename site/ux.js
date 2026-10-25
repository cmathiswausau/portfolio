// Sprint B2: progressively enhanced portfolio interactions.
const viewport = document.defaultView;

/** Set up the scroll-dependent back-to-top control. */
function setupBackToTop() {
    const button = document.getElementById("backToTop");
    const update = () => {
        button.hidden = viewport.scrollY < 350;
    };
    viewport.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => {
        viewport.scrollTo({ top: 0, behavior: viewport.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        document.querySelector("header").setAttribute("tabindex", "-1");
        document.querySelector("header").focus({ preventScroll: true });
    });
    update();
}

/** Set up the local mock chat and keyboard controls. */
function setupMockChat() {
    const toggle = document.getElementById("chatToggle");
    const panel = document.getElementById("chatPanel");
    const input = document.getElementById("chatInput");
    const messages = document.getElementById("chatMessages");
    const close = () => {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
    };
    toggle.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        toggle.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) {
            input.focus();
        }
    });
    document.getElementById("chatClose").addEventListener("click", close);
    panel.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            close();
        }
    });
    document.getElementById("chatForm").addEventListener("submit", (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) {
            input.value = "";
            input.reportValidity();
            return;
        }
        let reply = "Try asking about skills, projects, or contact information. This is an automated portfolio demo.";
        if (/skill|network|program|language/iu.test(question)) {
            reply = "Chris combines networking, security, and infrastructure experience with software-development coursework. Explore the skills chart and resumes for details.";
        } else if (/project|github|work/iu.test(question)) {
            reply = "Visit the Projects page for automation, network modernization, and collaborative development highlights. GitHub: github.com/cmathiswausau.";
        } else if (/contact|email|hire/iu.test(question)) {
            reply = "You can email Chris at chris@ccmathis.com. The Contact page also includes a demonstration form.";
        } else if (/hello|hi|hey/iu.test(question)) {
            reply = "Hello! What would you like to know about Chris's skills or projects?";
        }
        ["You: " + question, "Assistant (demo): " + reply].forEach((text) => {
            const message = document.createElement("p");
            message.textContent = text;
            messages.appendChild(message);
        });
        // Keep a long demo conversation from growing indefinitely.
        while (messages.children.length > 41) {
            messages.firstElementChild.remove();
        }
        input.value = "";
        messages.scrollTop = messages.scrollHeight;
        input.focus();
    });
}

/** Load a finite set of portfolio highlights as the visitor scrolls. */
function setupScrollContent() {
    const trigger = document.getElementById("highlightStatus");
    if (!trigger) {
        return;
    }
    const cards = document.getElementById("highlightCards");
    const button = document.getElementById("loadHighlights");
    const highlights = [
        ["Automation", "Explore tools that reduce repetitive administration tasks.", "projects.html"],
        ["Software Development", "See how current coursework builds on an infrastructure background.", "resume-software.html"],
        ["Network Engineering", "Explore enterprise networking, security, and server experience.", "resume-network.html"]
    ];
    let count = 0;
    let observer;
    const load = () => {
        if (count >= highlights.length) {
            return;
        }
        const [title, description, url] = highlights[count];
        const card = document.createElement("div");
        card.className = "highlight-card";
        const heading = document.createElement("h3");
        const text = document.createElement("p");
        const link = document.createElement("a");
        heading.textContent = title;
        text.textContent = description;
        link.textContent = "Explore " + title;
        link.href = url;
        card.append(heading, text, link);
        cards.appendChild(card);
        count++;
        trigger.textContent = count === highlights.length ? "All highlights loaded." : count + " of 3 highlights loaded. Scroll for more.";
        button.hidden = count === highlights.length;
        if (observer) {
            observer.unobserve(trigger);
            if (count < highlights.length) {
                viewport.requestAnimationFrame(() => observer.observe(trigger));
            }
        }
    };
    button.addEventListener("click", load);
    if ("IntersectionObserver" in viewport) {
        observer = new viewport.IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                load();
            }
        }, { threshold: 0.5 });
        observer.observe(trigger);
    }
}

/** Animate the skills chart on entry and expose selectable skill details. */
function setupInteractiveSkills() {
    const chart = document.querySelector(".skills-chart");
    if (!chart) {
        return;
    }
    const details = document.createElement("p");
    details.className = "skill-details";
    details.setAttribute("role", "status");
    details.textContent = "Select a skill area to inspect its competency count.";
    chart.after(details);
    chart.querySelectorAll(".skill-row").forEach((row) => {
        const label = row.querySelector(".skill-label");
        const name = label.firstElementChild.textContent;
        const count = label.lastElementChild.textContent;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "skill-select";
        button.textContent = name + " — " + count + " competencies";
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
            chart.querySelectorAll("button").forEach((item) => item.setAttribute("aria-pressed", "false"));
            button.setAttribute("aria-pressed", "true");
            details.textContent = name + ": " + count + " documented competencies out of the largest category count of 6. These counts are not proficiency ratings.";
        });
        label.replaceWith(button);
    });
    if ("IntersectionObserver" in viewport) {
        chart.classList.add("skills-pending");
        const observer = new viewport.IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                chart.classList.remove("skills-pending");
                chart.classList.add("skills-visible");
                observer.disconnect();
            }
        }, { threshold: 0.15 });
        observer.observe(chart);
    }
}

setupBackToTop();
setupMockChat();
setupScrollContent();
setupInteractiveSkills();
