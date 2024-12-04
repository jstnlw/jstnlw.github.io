const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

// Function to calculate all highlight dates starting from a given date
const getHighlightDates = (year, startMonth, startDay, intervalDays) => {
  const highlightDates = [];
  const startDate = new Date(year, startMonth, startDay);
  while (startDate.getFullYear() === year) {
    highlightDates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + intervalDays); // Add interval
  }
  return highlightDates;
};

// Calculate the patch version based on index and starting version
const calculatePatchVersion = (baseVersion, index) => {
  const major = Math.floor(baseVersion);
  const minor = baseVersion % 1 + index * 0.1;
  return (major + minor).toFixed(1);
};

// Custom Tooltip Functions
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

// Attach hover events for tooltips and highlight future days
const attachHoverEvents = (dayDiv, text, currentDate, highlightDates, patchType) => {
  dayDiv.addEventListener('mouseenter', (e) => {
    const tooltip = createTooltip(text, e.pageX + 10, e.pageY + 10); // Add offset to tooltip position

    // Highlight the next 41 days if it's a patch day
    highlightDates.forEach((date) => {
      const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
      if (targetDayDiv) {
        if (patchType === 'hsr') {
          targetDayDiv.classList.add('highlight-duration-hsr');
        } else if (patchType === 'zzz') {
          targetDayDiv.classList.add('highlight-duration-zzz');
        }
      }
    });
    
    dayDiv.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
    });
  });

  dayDiv.addEventListener('mouseleave', () => {
    removeTooltip();

    // Remove future day highlights
    highlightDates.forEach((date) => {
      const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
      if (targetDayDiv) {
        if (patchType === 'hsr') {
          targetDayDiv.classList.remove('highlight-duration-hsr');
        } else if (patchType === 'zzz') {
          targetDayDiv.classList.remove('highlight-duration-zzz');
        }
      }
    });
  });
};


// Render the calendar
const renderCalendar = (year) => {
  const calendar = document.getElementById('calendar');

  // Calculate four sets of highlight dates
  const hsrLivestream = getHighlightDates(year, 0, 3, 42);  // Starting 3 Jan, every 6 weeks
  const hsrPatch = getHighlightDates(year, 0, 15, 42); // Starting 15 Jan, every 6 weeks
  const zzzLivestream = getHighlightDates(year, 0, 17, 42); // Starting 17 Jan, every 6 weeks
  const zzzPatch = getHighlightDates(year, 0, 30, 42); // Starting 29 Jan, every 6 weeks

  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(year, month, 1).getDay();
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
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
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
      dayDiv.textContent = day;
      // Set a data-date attribute for each day
      const currentDate = new Date(year, month, day);
      dayDiv.setAttribute('data-date', currentDate.toISOString().split('T')[0]);

      // Apply appropriate highlight class and tooltip logic
      if (hsrLivestream.some(date => +date === +currentDate)) {
        const index = hsrLivestream.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(3.0, index);
        dayDiv.classList.add('highlight-hsr-livestream');
        attachHoverEvents(dayDiv, `HSR Livestream ${version}`, currentDate, [], 'hsr');
      } else if (hsrPatch.some(date => +date === +currentDate)) {
        const index = hsrPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(3.0, index);
        dayDiv.classList.add('highlight-hsr-patch');

        // Calculate the next 41 days
        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `HSR Patch ${version}`, currentDate, futureDates, 'hsr');
      } else if (zzzLivestream.some(date => +date === +currentDate)) {
        const index = zzzLivestream.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(1.5, index);
        dayDiv.classList.add('highlight-zzz-livestream');
        attachHoverEvents(dayDiv, `ZZZ Livestream ${version}`, currentDate, [], 'zzz');
      } else if (zzzPatch.some(date => +date === +currentDate)) {
        const index = zzzPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(1.5, index);
        dayDiv.classList.add('highlight-zzz-patch');

        // Calculate the next 41 days
        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `ZZZ Patch ${version}`, currentDate, futureDates, 'zzz');
      }

      daysGrid.appendChild(dayDiv);
    }
    monthDiv.appendChild(daysGrid);

    calendar.appendChild(monthDiv);
  }
};

// Render the calendar for the year 2025
renderCalendar(2025);
