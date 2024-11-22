// Fetch event data from the JSON file
fetch('events.json')
    .then(response => response.json())
    .then(data => {
        // Combine both game's events into a single array
        const honkaiDates = data.honkaiStarRail.map(event => ({ ...event, game: "honkaiStarRail" }));
        const zenlessDates = data.zenlessZoneZero.map(event => ({ ...event, game: "zenlessZoneZero" }));
        const allDates = [...honkaiDates, ...zenlessDates];
        generateCalendar(2025, allDates);
    })
    .catch(error => console.error('Error loading event data:', error));

// Function to generate the calendar with tooltip and highlight patch length
function generateCalendar(year, eventDates) {
    const calendarContainer = document.getElementById("calendar");
    const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

    // Create the calendar
    for (let month = 0; month < 12; month++) {
        const monthDiv = document.createElement("div");
        monthDiv.className = "month";
        const monthHeader = document.createElement("div");
        monthHeader.className = "month-header";
        monthHeader.textContent = new Date(year, month).toLocaleString("default", { month: "long" });
        monthDiv.appendChild(monthHeader);

        // Weekdays header (MTWTFSS)
        const weekdaysRow = document.createElement("div");
        weekdaysRow.className = "weekdays";
        weekdays.forEach(day => {
            const dayDiv = document.createElement("div");
            dayDiv.className = "weekday";
            dayDiv.textContent = day;
            weekdaysRow.appendChild(dayDiv);
        });
        monthDiv.appendChild(weekdaysRow);

        const daysDiv = document.createElement("div");
        daysDiv.className = "days";
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        // Add empty placeholders for days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "day empty";
            daysDiv.appendChild(emptyDay);
        }

        // Add days for this month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement("div");
            dayDiv.className = "day";
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            // Find the events for this date
            const eventsOnDate = eventDates.filter(event => event.date === dateStr);

            // Tooltip and highlight patch duration on hover
            dayDiv.addEventListener("mouseover", function () {
                const event = eventsOnDate[0]; // Assuming only one event per day

                if (event) {
                    // Show the tooltip with game name
                    const tooltip = document.createElement("div");
                    tooltip.className = "tooltip";
                    tooltip.textContent = `${event.game} - ${event.version}`;
                    document.body.appendChild(tooltip);

                    // Position the tooltip near the hovered date
                    tooltip.style.left = `${dayDiv.getBoundingClientRect().left}px`;
                    tooltip.style.top = `${dayDiv.getBoundingClientRect().top - tooltip.offsetHeight - 5}px`;

                    // If it's a patch event, highlight the entire duration
                    if (event.type === "patch") {
                        const patchStartDate = new Date(event.date);
                        const patchEndDate = new Date(patchStartDate);
                        patchEndDate.setDate(patchStartDate.getDate() + 14); // Assuming a 14-day patch duration

                        // Highlight all dates within the patch range
                        highlightPatchDuration(patchStartDate, patchEndDate);
                    }
                }
            });

            dayDiv.addEventListener("mouseout", function () {
                // Remove the tooltip
                const tooltip = document.querySelector(".tooltip");
                if (tooltip) tooltip.remove();

                // Reset the highlights
                resetHighlights();
            });

            // Apply event-specific styles
            eventsOnDate.forEach(event => {
                if (event.type === "livestream") {
                    dayDiv.classList.add(
                        event.game === "honkaiStarRail" ? "highlight-livestream-hsr" : "highlight-livestream-zzz"
                    );
                } else if (event.type === "patch") {
                    dayDiv.classList.add(
                        event.game === "honkaiStarRail" ? "highlight-patch-hsr" : "highlight-patch-zzz"
                    );
                }
            });

            dayDiv.textContent = day;
            daysDiv.appendChild(dayDiv);
        }

        monthDiv.appendChild(daysDiv);
        calendarContainer.appendChild(monthDiv);
    }
}

// Function to highlight the patch duration
function highlightPatchDuration(startDate, endDate) {
    const allDays = document.querySelectorAll(".day");

    allDays.forEach(day => {
        const dayDate = new Date(`${day.parentElement.parentElement.querySelector(".month-header").textContent} ${day.textContent}, 2025`);
        if (dayDate >= startDate && dayDate <= endDate) {
            day.classList.add("highlight-duration");
        }
    });
}

// Reset the highlights
function resetHighlights() {
    const highlightedDays = document.querySelectorAll(".highlight-duration");
    highlightedDays.forEach(day => {
        day.classList.remove("highlight-duration");
    });
}