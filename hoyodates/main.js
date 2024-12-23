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
    const rect = dayDiv.getBoundingClientRect();
    const tooltip = createTooltip(text);

    highlightDates.forEach((date, index) => {
      const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
      if (targetDayDiv) {
        if (index < 20) {
          // First 20 days
          if (patchType === 'hsr') {
            targetDayDiv.classList.add('highlight-hsr-banner-one');
          } else if (patchType === 'zzz') {
            targetDayDiv.classList.add('highlight-zzz-banner-one');
          } else if (patchType === 'gi') {
            targetDayDiv.classList.add('highlight-gi-banner-one');
          } else if (patchType === 'hi3') {
            targetDayDiv.classList.add('highlight-hi3-banner-one');
          } else if (patchType === 'ww') {
            targetDayDiv.classList.add('highlight-ww-banner-one');
          }
        } else if (index < 41) {
          // Next 20 days
          if (patchType === 'hsr') {
            targetDayDiv.classList.add('highlight-hsr-banner-two');
          } else if (patchType === 'zzz') {
            targetDayDiv.classList.add('highlight-zzz-banner-two');
          } else if (patchType === 'gi') {
            targetDayDiv.classList.add('highlight-gi-banner-two');
          } else if (patchType === 'hi3') {
            targetDayDiv.classList.add('highlight-hi3-banner-two');
          } else if (patchType === 'ww') {
            targetDayDiv.classList.add('highlight-ww-banner-two');
          }
        }
      }
    });

    dayDiv.addEventListener('mousemove', (e) => {
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${e.pageY - 48}px`;
    });
  });

  dayDiv.addEventListener('mouseleave', () => {
    removeTooltip();

    highlightDates.forEach((date, index) => {
      const targetDayDiv = document.querySelector(`.day[data-date='${date.toISOString().split('T')[0]}']`);
      if (targetDayDiv) {
        if (index < 20) {
          if (patchType === 'hsr') {
            targetDayDiv.classList.remove('highlight-hsr-banner-one');
          } else if (patchType === 'zzz') {
            targetDayDiv.classList.remove('highlight-zzz-banner-one');
          } else if (patchType === 'gi') {
            targetDayDiv.classList.remove('highlight-gi-banner-one');
          } else if (patchType === 'hi3') {
            targetDayDiv.classList.remove('highlight-hi3-banner-one');
          } else if (patchType === 'ww') {
            targetDayDiv.classList.remove('highlight-ww-banner-one');
          }
        } else if (index < 41) {
          if (patchType === 'hsr') {
            targetDayDiv.classList.remove('highlight-hsr-banner-two');
          } else if (patchType === 'zzz') {
            targetDayDiv.classList.remove('highlight-zzz-banner-two');
          } else if (patchType === 'gi') {
            targetDayDiv.classList.remove('highlight-gi-banner-two');
          } else if (patchType === 'hi3') {
            targetDayDiv.classList.remove('highlight-hi3-banner-two');
          } else if (patchType === 'ww') {
            targetDayDiv.classList.remove('highlight-ww-banner-two');
          }
        }
      }
    });
  });
};

// Render the calendar
const renderCalendar = (year) => {
  const calendar = document.getElementById('calendar');

  // Calculate all highlight dates
  const hsrLivestream = getHighlightDates(year, 0, 3, 42);
  const hsrPatch = getHighlightDates(year, 0, 15, 42);
  const zzzLivestream = getHighlightDates(year, 0, 10, 42);
  const zzzPatch = getHighlightDates(year, 0, 22, 42);
  const giLivestream = getHighlightDates(year, 0, 31, 42);
  const giPatch = getHighlightDates(year, 0, 1, 42);
  const hi3Livestream = getHighlightDates(year, 1, 8, 42);
  const hi3Patch = getHighlightDates(year, 0, 8, 42);
  const wwLivestream = getHighlightDates(year, 1, 2, 42);
  const wwPatch = getHighlightDates(year, 0, 2, 42);

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

    // Add day numbers and apply highlight logic
    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      const currentDate = new Date(year, month, day);
      dayDiv.setAttribute('data-date', currentDate.toISOString().split('T')[0]);
      dayDiv.textContent = day;

      // HSR Highlights
      if (hsrLivestream.some(date => +date === +currentDate)) {
        const index = hsrLivestream.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(3.0, index);
        dayDiv.classList.add('highlight-hsr-livestream');
        attachHoverEvents(dayDiv, `HSR Livestream ${version}`, currentDate, [], 'hsr');
      } else if (hsrPatch.some(date => +date === +currentDate)) {
        const index = hsrPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(3.0, index);
        dayDiv.classList.add('highlight-hsr-patch');

        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `HSR Patch ${version}`, currentDate, futureDates, 'hsr');
      }

      // ZZZ Highlights
      else if (zzzLivestream.some(date => +date === +currentDate)) {
        const index = zzzLivestream.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(1.5, index);
        dayDiv.classList.add('highlight-zzz-livestream');
        attachHoverEvents(dayDiv, `ZZZ Livestream ${version}`, currentDate, [], 'zzz');
      } else if (zzzPatch.some(date => +date === +currentDate)) {
        const index = zzzPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(1.5, index);
        dayDiv.classList.add('highlight-zzz-patch');

        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `ZZZ Patch ${version}`, currentDate, futureDates, 'zzz');
      }

      // GI Highlights
      else if (giLivestream.some(date => +date === +currentDate)) {
        const index = giLivestream.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(5.4, index);
        dayDiv.classList.add('highlight-gi-livestream');
        attachHoverEvents(dayDiv, `GI Livestream ${version}`, currentDate, [], 'gi');
      } else if (giPatch.some(date => +date === +currentDate)) {
        const index = giPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(5.3, index);
        dayDiv.classList.add('highlight-gi-patch');

        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `GI Patch ${version}`, currentDate, futureDates, 'gi');
      }

      // HI3 Highlights
      // else if (hi3Livestream.some(date => +date === +currentDate)) {
      //   const index = hi3Livestream.findIndex(date => +date === +currentDate);
      //   const version = calculatePatchVersion(8.1, index);
      //   dayDiv.classList.add('highlight-hi3-livestream');
      //   attachHoverEvents(dayDiv, `HI3 Livestream ${version}`, currentDate, [], 'hi3');
      // } 
      else if (hi3Patch.some(date => +date === +currentDate)) {
        const index = hi3Patch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(8.0, index);
        dayDiv.classList.add('highlight-hi3-patch');

        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `HI3 Patch ${version}`, currentDate, futureDates, 'hi3');
      }

      // WW Highlights
      // else if (wwLivestream.some(date => +date === +currentDate)) {
      //   const index = giLivestream.findIndex(date => +date === +currentDate);
      //   const version = calculatePatchVersion(5.4, index);
      //   dayDiv.classList.add('highlight-ww-livestream');
      //   attachHoverEvents(dayDiv, `WW Livestream ${version}`, currentDate, [], 'ww');
      // } 
      else if (wwPatch.some(date => +date === +currentDate)) {
        const index = giPatch.findIndex(date => +date === +currentDate);
        const version = calculatePatchVersion(5.3, index);
        dayDiv.classList.add('highlight-ww-patch');

        const futureDates = [];
        for (let i = 1; i <= 41; i++) {
          const futureDate = new Date(currentDate);
          futureDate.setDate(currentDate.getDate() + i);
          futureDates.push(futureDate);
        }

        attachHoverEvents(dayDiv, `WW Patch ${version}`, currentDate, futureDates, 'ww');
      }

      daysGrid.appendChild(dayDiv);
    }
    monthDiv.appendChild(daysGrid);
    calendar.appendChild(monthDiv);
  }
};

// Render the calendar for the year 2025
renderCalendar(2025);
