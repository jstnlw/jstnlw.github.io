const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const getYear = new Date().getFullYear();
let globalData = [];

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

// --- Styling Functions ---

function applyStylesFromJSON(games) {
  let styleEl = document.getElementById('game-properties');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'game-properties';
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = games
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

        [class*="hidden"] {
          background: transparent;
        }

        .highlight-holiday {
          color: ${color} !important;
        }
      `;
    })
    .join('\n');
}

// --- Toggle Buttons ---

let activeGames = new Set();

function createToggleButton(game) {
  if (game.game === "Template") return null;
  // if (game.game === "Template" || game.game === "Holidays") return null;

  const btn = document.createElement('button');
  btn.className = `label-${game.shorthand.toLowerCase()}`;
  btn.setAttribute('data-game', game.shorthand);

  if (!Array.isArray(game.versions) || game.versions.length === 0) {
    btn.style.display = 'none';
    btn.style.pointerEvents = 'none';
  } else {
    // Only add to activeGames if it has versions
    activeGames.add(game.shorthand);
  }

  // Initially active unless toggled off by your condition
  activeGames.add(game.shorthand);

  btn.addEventListener('click', () => {
    const shorthand = game.shorthand;
    const isInactive = btn.classList.toggle('inactive');

    if (isInactive) {
      activeGames.delete(shorthand);
      removeHighlights(shorthand);
    } else {
      activeGames.add(shorthand);
      reapplyHighlights(shorthand);
    }
    
    // After toggling, refresh tooltip bindings for all days
    refreshAllDayHoverBindings();
  });

  // Initially toggle off for specific games (adjust activeGames accordingly)
  if (game.game === "HonkaiImpact3rd" || game.game === "GenshinImpact") {
    setTimeout(() => {
      btn.click();
      btn.classList.add('inactive');
    }, 0);
  }

  return btn;
}

// Function to rebuild hover bindings for all days with current active games
function refreshAllDayHoverBindings() {
  document.querySelectorAll('.day').forEach(dayDiv => {
    // Remove previous hover listeners by cloning node
    const newDayDiv = dayDiv.cloneNode(true);
    dayDiv.parentNode.replaceChild(newDayDiv, dayDiv);

    // Rebuild eventsTexts based on active games and date of the dayDiv
    const dateStr = newDayDiv.getAttribute('data-date');
    const dateObj = parseLocalDate(dateStr);

    const eventsTexts = [];

    globalData.forEach(game => {
      if (!activeGames.has(game.shorthand)) return; // skip inactive games

      if (game.versions) {
        game.versions.forEach(version => {
          version.dates.forEach(date => {
            const eventMonth = months.indexOf(date.month);
            if (eventMonth === dateObj.getMonth() && date.day === dateObj.getDate()) {
              const versionLabel = `${game.shorthand.toUpperCase()} ${date.type.charAt(0).toUpperCase() + date.type.slice(1)} ${version.version % 1 === 0 ? version.version.toFixed(1) : version.version.toFixed(2).replace(/(\.\d+?)0$/, '$1')}`;
              const isLivestream = date.type === 'livestream';

              eventsTexts.push({
                text: versionLabel,
                currentDate: dateObj,
                patchType: game.shorthand,
                isLivestream,
                highlightRange: version.highlightRange || 41,
                bannerOne: version.bannerOne || 20,
                bannerTwo: version.bannerTwo || 20,
                dateType: date.type
              });
            }
          });
        });
      }

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

    if (eventsTexts.length > 0) attachHoverEvents(newDayDiv, eventsTexts);
  });
}

function createToggleButtons(games) {
  applyStylesFromJSON(games);
  toggleContainer.innerHTML = '';

  games.forEach(game => {
    const btn = createToggleButton(game);
    if (btn) toggleContainer.appendChild(btn);
  });
}

// --- Highlight Management ---

function removeHighlights(shorthand) {
  const selectors = [
    `.highlight-${shorthand}-livestream`,
    `.highlight-${shorthand}-patch`,
    `.highlight-${shorthand}-banner-one`,
    `.highlight-${shorthand}-banner-two`,
  ].join(', ');

  document.querySelectorAll(selectors).forEach(el => {
    el.classList.remove(
      `highlight-${shorthand}-livestream`,
      `highlight-${shorthand}-patch`,
      `highlight-${shorthand}-banner-one`,
      `highlight-${shorthand}-banner-two`
    );
    updateSplitBackground(el);  // update background after removing classes
  });
  
  // After removing, update backgrounds of all days to reflect toggled off game
  updateAllDaysBackgrounds();
}

function reapplyHighlights(shorthand) {
  const dayDivs = document.querySelectorAll('.day');

  dayDivs.forEach(dayDiv => {
    const dateStr = dayDiv.getAttribute('data-date');
    const dateObj = parseLocalDate(dateStr);

    const game = globalData.find(g => g.shorthand === shorthand);
    if (!game || !game.versions) return;

    game.versions.forEach(version => {
      version.dates.forEach(date => {
        const eventMonth = months.indexOf(date.month);
        if (eventMonth === dateObj.getMonth() && date.day === dateObj.getDate()) {
          dayDiv.classList.add(getClassName(game.shorthand, date.type));
          updateSplitBackground(dayDiv); // update background after adding classes
        }
      });
    });
  });

  // After reapplying, update backgrounds of all days to reflect toggled on game
  updateAllDaysBackgrounds();
}

// --- New function to update all days' backgrounds ---
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

  // Multiple highlights: get colors from CSS variables
  const colors = patchClasses.map(c => {
    const temp = document.createElement('div');
    temp.classList.add(c);
    document.body.appendChild(temp);
    const style = getComputedStyle(temp);
    const color = style.getPropertyValue('--highlight-color').trim() || style.backgroundColor;
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

function createTooltip(text, x, y) {
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';

  text.split('\n').forEach(line => {
    const lineDiv = document.createElement('div');
    lineDiv.textContent = line;
    tooltip.appendChild(lineDiv);
  });

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;

  document.body.appendChild(tooltip);
  return tooltip;
}

function removeTooltip() {
  const tooltip = document.querySelector('.custom-tooltip');
  if (tooltip) tooltip.remove();
}

// --- Event Attachment ---

function isGameActive(shorthand) {
  const btn = document.querySelector(`button[data-game="${shorthand}"]`);
  return btn && !btn.classList.contains('inactive');
}

function attachHoverEvents(dayDiv, eventTexts) {

  dayDiv.addEventListener('mouseenter', e => {
    const firstEvent = eventTexts[0];
    if (firstEvent.patchType !== 'holiday' && !isGameActive(firstEvent.patchType)) return;

    const rect = dayDiv.getBoundingClientRect();

    const combinedText = eventTexts.map(e => e.text).join('\n');
    const tooltip = createTooltip(combinedText, rect.left, rect.top);

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

    dayDiv.addEventListener('mousemove', moveEvent => {
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${moveEvent.pageY - 48}px`;
    });
  });

  dayDiv.addEventListener('mouseleave', () => {
    removeTooltip();

    const firstEvent = eventTexts[0];
    if (firstEvent.patchType !== 'holiday' && !isGameActive(firstEvent.patchType)) return;

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
  });
}

// --- Render Calendar ---

async function renderCalendar(year) {
  try {
    const response = await fetch('highlight-dates.json');
    if (!response.ok) throw new Error('Failed to fetch highlight-dates.json');

    const data = await response.json();
    globalData = data;

    createToggleButtons(data);
    calendar.innerHTML = ''; // Clear previous calendar if any

    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

      // First day offset (Mon-start)
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
        dayDiv.setAttribute('data-date', formatLocalDate(currentDate));
        dayDiv.textContent = day;

        if (+currentDate === +today) dayDiv.classList.add('today');

        // Gather event texts for this day
        const eventsTexts = [];

        globalData.forEach(game => {
          // Game versions with highlight dates
          if (game.versions) {
            game.versions.forEach(version => {
              const highlightRange = version.highlightRange || 41;
              const bannerOne = version.bannerOne || 20;
              const bannerTwo = version.bannerTwo || 20;

              version.dates.forEach(date => {
                const eventMonth = months.indexOf(date.month);
                if (eventMonth === month && date.day === day) {
                  const versionLabel = `${game.shorthand.toUpperCase()} ${date.type.charAt(0).toUpperCase() + date.type.slice(1)} ${version.version % 1 === 0 ? version.version.toFixed(1) : version.version.toFixed(2).replace(/(\.\d+?)0$/, '$1')}`;
                  const isLivestream = date.type === 'livestream';

                  // Add highlight class for the day
                  dayDiv.classList.add(getClassName(game.shorthand, date.type));

                  eventsTexts.push({
                    text: versionLabel,
                    currentDate,
                    patchType: game.shorthand,
                    isLivestream,
                    highlightRange,
                    bannerOne,
                    bannerTwo,
                    dateType: date.type
                  });
                }
              });
            });
          }

          // Holidays handling
          if (game.dates) {
            game.dates.forEach(date => {
              const eventMonth = months.indexOf(date.month);
              if (eventMonth === month && date.day === day) {
                dayDiv.classList.add('highlight-holiday');
                eventsTexts.push({
                  text: date.name,
                  currentDate,
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

        if (eventsTexts.length > 0) attachHoverEvents(dayDiv, eventsTexts);

        updateSplitBackground(dayDiv);

        daysGrid.appendChild(dayDiv);
      }

      monthDiv.appendChild(daysGrid);
      calendar.appendChild(monthDiv);
    }

    yearFooter.textContent = year;

  } catch (error) {
    console.error('Error loading calendar data:', error);
  }
}

window.onload = () => renderCalendar(getYear);