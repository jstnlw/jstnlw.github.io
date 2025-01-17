const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const createToggleButtons = async () => {
  const response = await fetch('highlight-dates.json');
  const data = await response.json();

  const toggleContainer = document.getElementById('toggle-container'); // The container for the buttons
  toggleContainer.innerHTML = ""; // Clear existing buttons

  data.forEach(game => {
    // Exclude specific entries
    if (game.game === "Template" || game.game === "Holidays") {
      return;
    }

    const button = document.createElement('button');
    button.className = `label-${game.shorthand.toLowerCase()}`; // Add the shorthand-based class
    button.setAttribute('data-game', game.shorthand);
    toggleContainer.appendChild(button);

    button.addEventListener('click', () => {
      const highlights = document.querySelectorAll(`.highlight-${game.shorthand}-livestream, .highlight-${game.shorthand}-patch`);

      highlights.forEach(highlight => {
        if (highlight.classList.contains(`hidden-${game.shorthand}`)) {
          highlight.classList.remove(`hidden-${game.shorthand}`);
        } else {
          highlight.classList.add(`hidden-${game.shorthand}`);
        }
      });
      button.classList.toggle('inactive');
    });
  });
};

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

const createTooltip = (text, x, y) => {
  let tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.textContent = text;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  document.body.appendChild(tooltip);
  return tooltip;
};

const removeTooltip = () => {
  const existingTooltip = document.querySelector('.custom-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
};

const attachHoverEvents = (dayDiv, text, currentDate, highlightDates, patchType, isLivestream, bannerOne, bannerTwo) => {
  dayDiv.addEventListener('mouseenter', (e) => {
    const rect = dayDiv.getBoundingClientRect();
    const tooltip = createTooltip(text, rect.left, rect.top);

    if (!isLivestream) {
      highlightDates.forEach((date, index) => {
        const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
        if (targetDayDiv) {
          const classToAdd = `highlight-${patchType}-${index < bannerOne ? 'banner-one' : 'banner-two'}`;
          targetDayDiv.classList.add(classToAdd);
        }
      });
    }

    dayDiv.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${e.pageY - 48}px`;
    });
  });

  dayDiv.addEventListener('mouseleave', () => {
    removeTooltip();

    if (!isLivestream) {
      highlightDates.forEach((date, index) => {
        const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
        if (targetDayDiv) {
          const classToRemove = `highlight-${patchType}-${index < bannerOne ? 'banner-one' : 'banner-two'}`;
          targetDayDiv.classList.remove(classToRemove);
        }
      });
    }
  });
};

const renderCalendar = async (year) => {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = ""; // Clear the calendar

  // Fetch the external JSON
  const response = await fetch('highlight-dates.json');
  const data = await response.json();

  // Call createToggleButtons to dynamically generate the toggle buttons
  createToggleButtons();

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Loop through months
  for (let month = 0; month < 12; month++) {
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = daysInMonth(month, year);
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';

    // Month header
    const header = document.createElement('div');
    header.className = 'month-header';
    header.textContent = months[month];
    monthDiv.appendChild(header);

    // Weekday names
    const weekdays = document.createElement('div');
    weekdays.className = 'weekdays';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.textContent = day;
      weekdays.appendChild(dayDiv);
    });
    monthDiv.appendChild(weekdays);

    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days';

    // Add empty divs for days before the first day
    for (let i = 0; i < firstDay; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty';
      daysGrid.appendChild(emptyDiv);
    }

    // Add day numbers
    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      const currentDate = new Date(year, month, day);
      dayDiv.setAttribute('data-date', currentDate.toISOString().split('T')[0]);
      dayDiv.textContent = day;

      // Add .today class if the current date matches today's date
      if (currentDate.getTime() === today.getTime()) {
        dayDiv.classList.add('today');
      }

      // Highlight logic based on JSON data
      data.forEach(game => {
        if (game.versions) {
          game.versions.forEach(version => {
            const highlightRange = version.highlightRange || 41; // Default to 41 if not specified
            const bannerOne = version.bannerOne || 20; // Default to 20 if not specified
            const bannerTwo = version.bannerTwo || 20; // Default to 20 if not specified

            version.dates.forEach(date => {
              const eventMonth = months.indexOf(date.month);
              if (eventMonth === month && date.day === day) {
                const versionText = `${game.shorthand.toUpperCase()} ${date.type.charAt(0).toUpperCase() + date.type.slice(1)} ${version.version.toFixed(1)}`;
                const highlightClass = `highlight-${game.shorthand}-${date.type}`;
                const isLivestream = date.type === 'livestream';

                dayDiv.classList.add(highlightClass);

                const futureDates = [];
                if (!isLivestream) {
                  for (let i = 1; i <= highlightRange; i++) {
                    const futureDate = new Date(currentDate);
                    futureDate.setDate(currentDate.getDate() + i);
                    futureDates.push(futureDate);
                  }
                }

                attachHoverEvents(dayDiv, versionText, currentDate, futureDates, game.shorthand, isLivestream, bannerOne, bannerTwo);
              }
            });
          });
        }

        // Handle holidays
        if (game.dates) {
          game.dates.forEach(date => {
            const eventMonth = months.indexOf(date.month);
            if (eventMonth === month && date.day === day) {
              dayDiv.classList.add('highlight-holiday');
              attachHoverEvents(dayDiv, date.name, currentDate, [], 'holiday', false);
            }
          });
        }
      });

      daysGrid.appendChild(dayDiv);
    }
    monthDiv.appendChild(daysGrid);
    calendar.appendChild(monthDiv);
  }
};

// Call the function to render the calendar for 2025
renderCalendar(2025);
