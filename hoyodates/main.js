const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const getYear = new Date().getFullYear();
let globalData = [];

// Cache DOM elements
const calendar = document.getElementById('calendar');
const toggleContainer = document.getElementById('toggle-container');
const yearFooter = document.querySelector('footer');

// --- Helper Functions ---

function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getClassName(gameShorthand, type, suffix = '') {
  return `highlight-${gameShorthand.toLowerCase()}-${type}${suffix}`;
}

// --- Mobile Detection ---
function isMobile() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// --- Scroll to Current Month ---
function scrollToCurrentMonth() {
  if (!isMobile()) return;

  const currentMonth = new Date().getMonth();
  const currentMonthElement = document.querySelector(`.month:nth-child(${currentMonth + 1})`);

  if (currentMonthElement) {
    const offsetTop = currentMonthElement.offsetTop - 0;

    // Use smooth scrolling with a slight delay to ensure DOM is fully rendered
    setTimeout(() => {
      window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth'
      });
    }, 100);
  }
}

// --- Styling Functions ---

function applyStylesFromJSON(games) {
  let styleEl = document.getElementById('game-properties');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'game-properties';
    document.head.appendChild(styleEl);
  }

  const styles = games
    .filter(game => game.color)
    .map(game => {
      const shorthand = game.shorthand.toLowerCase();
      const color = game.color;
      const icon = game.icon || 'none';

      return `
        .label-${shorthand},
        .highlight-${shorthand}-livestream,
        .highlight-${shorthand}-patch {
          background: ${color};
        }

        .highlight-${shorthand}-patch-banner-one,
        .highlight-${shorthand}-patch-banner-two {
          background: ${color} !important;
        }

        .label-${shorthand}::before {
          background: url("${icon}");
        }

        .highlight-holiday {
          color: ${color} !important;
        }
      `;
    })
    .join('\n');

  styleEl.textContent = styles;
}

// --- Toggle Buttons ---

let activeGames = new Set();

function createToggleButton(game) {
  if (game.active === false) return null;

  const btn = document.createElement('button');
  btn.className = `label-${game.shorthand.toLowerCase()}`;
  btn.setAttribute('data-game', game.shorthand);
  btn.setAttribute('aria-label', `Toggle ${game.game} events`);

  // Check if game has valid versions
  const hasVersions = Array.isArray(game.versions) && game.versions.length > 0;

  if (!hasVersions) {
    btn.style.display = 'none';
    btn.style.pointerEvents = 'none';
    return btn;
  }

  // Initially add to active games
  activeGames.add(game.shorthand);

  const handleToggle = () => {
    const shorthand = game.shorthand;
    const isInactive = btn.classList.toggle('inactive');

    if (isInactive) {
      activeGames.delete(shorthand);
      removeHighlights(shorthand);
    } else {
      activeGames.add(shorthand);
      reapplyHighlights(shorthand);
    }

    // Debounce the refresh to avoid multiple rapid calls
    clearTimeout(btn.refreshTimeout);
    btn.refreshTimeout = setTimeout(() => {
      refreshAllDayHoverBindings();
    }, 50);
  };

  btn.addEventListener('click', handleToggle);

  // Initially toggle off specific games
  if (game.toggleload === false) {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      btn.click();
    });
  }

  return btn;
}

// Optimized refresh function with better performance
function refreshAllDayHoverBindings() {
  const dayDivs = document.querySelectorAll('.day');

  // Use document fragment to batch DOM operations
  dayDivs.forEach(dayDiv => {
    const dateStr = dayDiv.getAttribute('data-date');
    if (!dateStr) return;

    const dateObj = parseLocalDate(dateStr);
    const eventsTexts = getEventsForDate(dateObj);

    // Remove old event listeners by cloning
    const newDayDiv = dayDiv.cloneNode(true);
    dayDiv.parentNode.replaceChild(newDayDiv, dayDiv);

    if (eventsTexts.length > 0) {
      attachHoverEvents(newDayDiv, eventsTexts);
    }
  });
}

// Extract events logic into separate function for reusability
function getEventsForDate(dateObj) {
  const eventsTexts = [];

  globalData.forEach(game => {
    // Skip inactive games
    if (game.versions && !activeGames.has(game.shorthand)) return;

    // Process game versions
    if (game.versions) {
      game.versions.forEach(version => {
        version.dates.forEach(date => {
          const eventMonth = months.indexOf(date.month);
          if (eventMonth === dateObj.getMonth() && date.day === dateObj.getDate()) {
            const versionNum = version.version % 1 === 0
              ? version.version.toFixed(1)
              : version.version.toFixed(2).replace(/(\.\d+?)0$/, '$1');

            const versionLabel = `${game.shorthand.toUpperCase()} ${date.type.charAt(0).toUpperCase() + date.type.slice(1)} ${versionNum}`;

            eventsTexts.push({
              text: versionLabel,
              currentDate: dateObj,
              patchType: game.shorthand,
              isLivestream: date.type === 'livestream',
              highlightRange: version.highlightRange || 41,
              bannerOne: version.bannerOne || 20,
              bannerTwo: version.bannerTwo || 20,
              dateType: date.type
            });
          }
        });
      });
    }

    // Process holidays (always active)
    if (game.dates) {
      game.dates.forEach(date => {
        const eventMonth = months.indexOf(date.month);
        if (eventMonth === dateObj.getMonth() && date.day === dateObj.getDate()) {
          eventsTexts.push({
            text: date.name,
            currentDate: dateObj,
            patchType: 'holiday',
            isLivestream: false,
            highlightRange: 0,
            bannerOne: 0,
            bannerTwo: 0,
            dateType: 'holiday'
          });
        }
      });
    }
  });

  return eventsTexts;
}

function createToggleButtons(games) {
  applyStylesFromJSON(games);
  toggleContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  games.forEach(game => {
    const btn = createToggleButton(game);
    if (btn) fragment.appendChild(btn);
  });

  toggleContainer.appendChild(fragment);
}

// --- Highlight Management ---

function removeHighlights(shorthand) {
  const classesToRemove = [
    `highlight-${shorthand}-livestream`,
    `highlight-${shorthand}-patch`,
    `highlight-${shorthand}-banner-one`,
    `highlight-${shorthand}-banner-two`,
  ];

  const selector = classesToRemove.map(c => `.${c}`).join(', ');

  document.querySelectorAll(selector).forEach(el => {
    classesToRemove.forEach(cls => el.classList.remove(cls));
    updateSplitBackground(el);
  });

  updateAllDaysBackgrounds();
}

function reapplyHighlights(shorthand) {
  const game = globalData.find(g => g.shorthand === shorthand);
  if (!game?.versions) return;

  const dayDivs = document.querySelectorAll('.day');

  dayDivs.forEach(dayDiv => {
    const dateStr = dayDiv.getAttribute('data-date');
    if (!dateStr) return;

    const dateObj = parseLocalDate(dateStr);

    game.versions.forEach(version => {
      version.dates.forEach(date => {
        const eventMonth = months.indexOf(date.month);
        if (eventMonth === dateObj.getMonth() && date.day === dateObj.getDate()) {
          dayDiv.classList.add(getClassName(game.shorthand, date.type));
          updateSplitBackground(dayDiv);
        }
      });
    });
  });

  updateAllDaysBackgrounds();
}

function updateAllDaysBackgrounds() {
  document.querySelectorAll('.day').forEach(dayDiv => updateSplitBackground(dayDiv));
}

// --- Background splitting function ---
function updateSplitBackground(dayDiv) {
  // Find all patch highlight classes currently on this dayDiv
  const patchClasses = Array.from(dayDiv.classList).filter(c => c.startsWith('highlight-') && c.endsWith('-patch'));

  if (patchClasses.length === 0) {
    // No highlight patches: clear inline background
    dayDiv.style.background = '';
    return;
  }

  if (patchClasses.length === 1) {
    // Single highlight: remove inline background to fallback on CSS background
    dayDiv.style.background = '';
    return;
  }

  // Multiple highlights: get colors from CSS by creating temporary elements
  const colors = patchClasses.map(c => {
    const temp = document.createElement('div');
    temp.classList.add(c);
    document.body.appendChild(temp);
    const style = getComputedStyle(temp);
    const color = style.backgroundColor;
    document.body.removeChild(temp);
    return color || 'transparent';
  });

  const sizePercent = 100 / colors.length;
  const stops = colors.map((color, i) => {
    const start = i * sizePercent;
    const end = (i + 1) * sizePercent;
    return `${color} ${start}%, ${color} ${end}%`;
  }).join(', ');

  dayDiv.style.background = `linear-gradient(-45deg, ${stops})`;
}

// --- Tooltip Functions ---

let currentTooltip = null;

function createTooltip(text, x, y) {
  // Remove existing tooltip
  removeTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.setAttribute('role', 'tooltip');

  text.split('\n').forEach(line => {
    const lineDiv = document.createElement('div');
    lineDiv.textContent = line;
    tooltip.appendChild(lineDiv);
  });

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;

  document.body.appendChild(tooltip);
  currentTooltip = tooltip;

  return tooltip;
}

function removeTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

// --- Event Attachment ---

function isGameActive(shorthand) {
  return activeGames.has(shorthand);
}

function attachHoverEvents(dayDiv, eventTexts) {
  let isHovering = false;

  const handleMouseEnter = (e) => {
    if (isHovering) return;
    isHovering = true;

    const firstEvent = eventTexts[0];
    if (firstEvent.patchType !== 'holiday' && !isGameActive(firstEvent.patchType)) {
      isHovering = false;
      return;
    }

    const rect = dayDiv.getBoundingClientRect();
    const combinedText = eventTexts.map(e => e.text).join('\n');
    createTooltip(combinedText, rect.left, rect.top);

    // Handle highlight range
    if (!firstEvent.isLivestream && firstEvent.highlightRange) {
      for (let i = 1; i <= firstEvent.highlightRange; i++) {
        const futureDate = new Date(firstEvent.currentDate);
        futureDate.setDate(firstEvent.currentDate.getDate() + i);

        const targetDayDiv = document.querySelector(`.day[data-date='${formatLocalDate(futureDate)}']`);
        if (targetDayDiv) {
          const classToAdd = i <= firstEvent.bannerOne
            ? getClassName(firstEvent.patchType, firstEvent.dateType, '-banner-one')
            : getClassName(firstEvent.patchType, firstEvent.dateType, '-banner-two');

          targetDayDiv.classList.add(classToAdd);
        }
      }
    }
  };

  const handleMouseMove = (moveEvent) => {
    if (!currentTooltip) return;

    const rect = dayDiv.getBoundingClientRect();
    currentTooltip.style.left = `${rect.left + rect.width / 2 - currentTooltip.offsetWidth / 2}px`;
    currentTooltip.style.top = `${moveEvent.pageY - 48}px`;
  };

  const handleMouseLeave = () => {
    isHovering = false;
    removeTooltip();

    const firstEvent = eventTexts[0];
    if (firstEvent.patchType !== 'holiday' && !isGameActive(firstEvent.patchType)) return;

    // Remove highlight range classes
    if (!firstEvent.isLivestream && firstEvent.highlightRange) {
      for (let i = 1; i <= firstEvent.highlightRange; i++) {
        const futureDate = new Date(firstEvent.currentDate);
        futureDate.setDate(firstEvent.currentDate.getDate() + i);

        const targetDayDiv = document.querySelector(`.day[data-date='${formatLocalDate(futureDate)}']`);
        if (targetDayDiv) {
          const classToRemove = i <= firstEvent.bannerOne
            ? getClassName(firstEvent.patchType, firstEvent.dateType, '-banner-one')
            : getClassName(firstEvent.patchType, firstEvent.dateType, '-banner-two');

          targetDayDiv.classList.remove(classToRemove);
        }
      }
    }
  };

  dayDiv.addEventListener('mouseenter', handleMouseEnter);
  dayDiv.addEventListener('mousemove', handleMouseMove);
  dayDiv.addEventListener('mouseleave', handleMouseLeave);
}

// --- Render Calendar ---

async function renderCalendar(year) {
  try {
    const response = await fetch('highlight-dates.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch highlight-dates.json: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    globalData = data;

    createToggleButtons(data);
    calendar.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fragment = document.createDocumentFragment();

    for (let month = 0; month < 12; month++) {
      const monthDiv = document.createElement('div');
      monthDiv.className = 'month';

      // Header
      const header = document.createElement('div');
      header.className = 'month-header';
      header.textContent = months[month];
      monthDiv.appendChild(header);

      // Weekdays
      const weekdaysDiv = document.createElement('div');
      weekdaysDiv.className = 'weekdays';
      weekdaysShort.forEach(day => {
        const d = document.createElement('div');
        d.textContent = day;
        weekdaysDiv.appendChild(d);
      });
      monthDiv.appendChild(weekdaysDiv);

      // Days grid
      const daysGrid = document.createElement('div');
      daysGrid.className = 'days';

      // First day offset (Monday start)
      const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        daysGrid.appendChild(empty);
      }

      const totalDays = daysInMonth(month, year);

      for (let day = 1; day <= totalDays; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        const currentDate = new Date(year, month, day);
        const dateStr = formatLocalDate(currentDate);
        dayDiv.setAttribute('data-date', dateStr);
        dayDiv.textContent = day;

        if (+currentDate === +today) {
          dayDiv.classList.add('today');
        }

        // Get events for this day and add highlight classes
        const eventsTexts = getEventsForDate(currentDate);

        // Add CSS classes based on events found
        eventsTexts.forEach(event => {
          if (event.patchType === 'holiday') {
            dayDiv.classList.add('highlight-holiday');
          } else {
            dayDiv.classList.add(getClassName(event.patchType, event.dateType));
          }
        });

        if (eventsTexts.length > 0) {
          attachHoverEvents(dayDiv, eventsTexts);
        }

        updateSplitBackground(dayDiv);
        daysGrid.appendChild(dayDiv);
      }

      monthDiv.appendChild(daysGrid);
      fragment.appendChild(monthDiv);
    }

    calendar.appendChild(fragment);
    yearFooter.textContent = year;
    document.title = `Gachaverse ${getYear}`;
    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', `Gachaverse ${getYear}`);
    }

    // Scroll to current month on mobile after calendar is rendered
    scrollToCurrentMonth();

  } catch (error) {
    console.error('Error loading calendar data:', error);

    // Display user-friendly error message
    calendar.outerHTML = `
      <main class="error-message">
        <h3>Unable to load calendar data</h3>
        <p>Please check that the highlight-dates.json file is available and try refreshing the page.</p>
        <p>Error: ${error.message}</p>
      </main>
    `;
  }
}

// Initialize calendar when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => renderCalendar(getYear));
} else {
  renderCalendar(getYear);
}