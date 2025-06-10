const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdaysShort = ["M", "T", "W", "T", "F", "S", "S"];
const currentYear = new Date().getFullYear();

class CalendarManager {
  constructor() {
    this.globalData = [];
    this.activeGames = new Set();
    this.currentTooltip = null;

    // Cache DOM elements
    this.calendar = document.getElementById("calendar");
    this.toggleContainer = document.getElementById("toggle-container");
    this.yearFooter = document.querySelector("footer");

    // Bind methods to preserve context
    this.refreshAllDayHoverBindings = this.refreshAllDayHoverBindings.bind(this);
  }

  // --- Utility Functions ---
  static parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  static formatLocalDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  static daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  static getClassName(gameShorthand, type, suffix = "") {
    return `highlight-${gameShorthand.toLowerCase()}-${type}${suffix}`;
  }

  static isMobile() {
    return window.innerWidth <= 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // --- Event Processing ---
  getEventsForDate(dateObj) {
    const eventsTexts = [];

    this.globalData.forEach(game => {
      // Process game versions (check if active)
      if (game.versions && this.activeGames.has(game.shorthand)) {
        this.processGameVersions(game, dateObj, eventsTexts);
      }

      // Process holidays (always active)
      if (game.dates) {
        this.processHolidays(game, dateObj, eventsTexts);
      }
    });

    return eventsTexts;
  }

  processGameVersions(game, dateObj, eventsTexts) {
    game.versions.forEach(version => {
      version.dates.forEach(date => {
        if (this.isDateMatch(date, dateObj)) {
          const versionNum = this.formatVersionNumber(version.version);
          const versionLabel = `${game.shorthand.toUpperCase()} ${this.capitalize(date.type)} ${versionNum}`;

          eventsTexts.push(this.createEventData(versionLabel, dateObj, game.shorthand, date, version));
        }
      });
    });
  }

  processHolidays(game, dateObj, eventsTexts) {
    game.dates.forEach(date => {
      if (this.isDateMatch(date, dateObj)) {
        eventsTexts.push(this.createEventData(date.name, dateObj, "holiday", date, {}));
      }
    });
  }

  isDateMatch(date, dateObj) {
    const eventMonth = months.indexOf(date.month);
    return eventMonth === dateObj.getMonth() && date.day === dateObj.getDate();
  }

  formatVersionNumber(version) {
    return version % 1 === 0
      ? version.toFixed(1)
      : version.toFixed(2).replace(/(\.\d+?)0$/, "$1");
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  createEventData(text, currentDate, patchType, date, version) {
    return {
      text,
      currentDate,
      patchType,
      isLivestream: date.type === "livestream",
      highlightRange: version.highlightRange || 41,
      bannerOne: version.bannerOne || 20,
      bannerTwo: version.bannerTwo || 20,
      dateType: date.type || "holiday"
    };
  }

  // --- Styling ---
  applyStylesFromJSON(games) {
    let styleEl = document.getElementById("game-properties");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "game-properties";
      document.head.appendChild(styleEl);
    }

    const styles = games
      .filter(game => game.color)
      .map(game => this.generateGameStyles(game))
      .join("\n");

    styleEl.textContent = styles;
  }

  generateGameStyles(game) {
    const shorthand = game.shorthand.toLowerCase();
    const { color, icon = "none" } = game;

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
  }

  // --- Toggle Management ---
  createToggleButtons(games) {
    this.applyStylesFromJSON(games);
    this.toggleContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();
    games.forEach(game => {
      const btn = this.createToggleButton(game);
      if (btn) fragment.appendChild(btn);
    });

    this.toggleContainer.appendChild(fragment);
  }

  createToggleButton(game) {
    if (game.active === false || !this.hasValidVersions(game)) {
      return this.createInactiveButton(game);
    }

    const btn = this.createActiveButton(game);
    this.setupToggleHandler(btn, game);

    // Handle initial toggle state
    if (game.toggleload === false) {
      requestAnimationFrame(() => btn.click());
    }

    return btn;
  }

  hasValidVersions(game) {
    return Array.isArray(game.versions) && game.versions.length > 0;
  }

  createInactiveButton(game) {
    const btn = document.createElement("button");
    btn.className = `label-${game.shorthand.toLowerCase()}`;
    btn.style.display = "none";
    btn.style.pointerEvents = "none";
    return btn;
  }

  createActiveButton(game) {
    const btn = document.createElement("button");
    btn.className = `label-${game.shorthand.toLowerCase()}`;
    btn.setAttribute("data-game", game.shorthand);
    btn.setAttribute("aria-label", `Toggle ${game.game} events`);

    // Initially add to active games
    this.activeGames.add(game.shorthand);
    return btn;
  }

  setupToggleHandler(btn, game) {
    const handleToggle = () => {
      const shorthand = game.shorthand;
      const isInactive = btn.classList.toggle("inactive");

      if (isInactive) {
        this.activeGames.delete(shorthand);
        this.removeHighlights(shorthand);
      } else {
        this.activeGames.add(shorthand);
        this.reapplyHighlights(shorthand);
      }

      // Debounce the refresh
      clearTimeout(btn.refreshTimeout);
      btn.refreshTimeout = setTimeout(this.refreshAllDayHoverBindings, 50);
    };

    btn.addEventListener("click", handleToggle);
  }

  // --- Highlight Management ---
  removeHighlights(shorthand) {
    const classesToRemove = [
      `highlight-${shorthand}-livestream`,
      `highlight-${shorthand}-patch`,
      `highlight-${shorthand}-banner-one`,
      `highlight-${shorthand}-banner-two`,
    ];

    this.removeClassesFromElements(classesToRemove);
    this.updateAllDaysBackgrounds();
  }

  removeClassesFromElements(classesToRemove) {
    const selector = classesToRemove.map(c => `.${c}`).join(", ");
    document.querySelectorAll(selector).forEach(el => {
      classesToRemove.forEach(cls => el.classList.remove(cls));
      this.updateSplitBackground(el);
    });
  }

  reapplyHighlights(shorthand) {
    const game = this.globalData.find(g => g.shorthand === shorthand);
    if (!game?.versions) return;

    document.querySelectorAll(".day").forEach(dayDiv => {
      this.applyHighlightsToDay(dayDiv, game);
    });

    this.updateAllDaysBackgrounds();
  }

  applyHighlightsToDay(dayDiv, game) {
    const dateStr = dayDiv.getAttribute("data-date");
    if (!dateStr) return;

    const dateObj = CalendarManager.parseLocalDate(dateStr);

    game.versions.forEach(version => {
      version.dates.forEach(date => {
        if (this.isDateMatch(date, dateObj)) {
          dayDiv.classList.add(CalendarManager.getClassName(game.shorthand, date.type));
          this.updateSplitBackground(dayDiv);
        }
      });
    });
  }

  updateAllDaysBackgrounds() {
    document.querySelectorAll(".day").forEach(dayDiv => this.updateSplitBackground(dayDiv));
  }

  updateSplitBackground(dayDiv) {
    const patchClasses = Array.from(dayDiv.classList)
      .filter(c => c.startsWith("highlight-") && c.endsWith("-patch") || c.endsWith("-livestream"));

    if (patchClasses.length <= 1) {
      dayDiv.style.background = "";
      return;
    }

    // Multiple highlights: create gradient
    const colors = this.getColorsFromClasses(patchClasses);
    const gradient = this.createGradientString(colors);
    dayDiv.style.background = gradient;
  }

  getColorsFromClasses(patchClasses) {
    return patchClasses.map(className => {
      const temp = document.createElement("div");
      temp.classList.add(className);
      document.body.appendChild(temp);
      const color = getComputedStyle(temp).backgroundColor || "transparent";
      document.body.removeChild(temp);
      return color;
    });
  }

  createGradientString(colors) {
    const sizePercent = 100 / colors.length;
    const stops = colors.map((color, i) => {
      const start = i * sizePercent;
      const end = (i + 1) * sizePercent;
      return `${color} ${start}%, ${color} ${end}%`;
    }).join(", ");

    return `linear-gradient(-45deg, ${stops})`;
  }

  // --- Tooltip Management ---
  createTooltip(text, x, y) {
    this.removeTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.setAttribute("role", "tooltip");

    text.split("\n").forEach(line => {
      const lineDiv = document.createElement("div");
      lineDiv.textContent = line;
      tooltip.appendChild(lineDiv);
    });

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;

    document.body.appendChild(tooltip);
    this.currentTooltip = tooltip;
  }

  removeTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }

  // --- Event Handlers ---
  attachHoverEvents(dayDiv, eventTexts) {
    const eventHandler = new DayEventHandler(this, dayDiv, eventTexts);
    eventHandler.attach();
  }

  refreshAllDayHoverBindings() {
    document.querySelectorAll(".day").forEach(dayDiv => {
      const dateStr = dayDiv.getAttribute("data-date");
      if (!dateStr) return;

      const dateObj = CalendarManager.parseLocalDate(dateStr);
      const eventsTexts = this.getEventsForDate(dateObj);

      // Replace element to remove old event listeners
      const newDayDiv = dayDiv.cloneNode(true);
      dayDiv.parentNode.replaceChild(newDayDiv, dayDiv);

      if (eventsTexts.length > 0) {
        this.attachHoverEvents(newDayDiv, eventsTexts);
      }
    });
  }

  // --- Mobile Utilities ---
  scrollToCurrentMonth() {
    if (!CalendarManager.isMobile()) return;

    const currentMonth = new Date().getMonth();
    const currentMonthElement = document.querySelector(`.month:nth-child(${currentMonth + 1})`);

    if (currentMonthElement) {
      setTimeout(() => {
        window.scrollTo({
          top: Math.max(0, currentMonthElement.offsetTop),
          behavior: "smooth"
        });
      }, 100);
    }
  }

  // --- Calendar Rendering ---
  async renderCalendar(year) {
    try {
      const data = await this.fetchCalendarData();
      this.globalData = data;

      this.createToggleButtons(data);
      this.renderCalendarGrid(year);
      this.updatePageMetadata(year);
      this.scrollToCurrentMonth();

    } catch (error) {
      this.displayError(error);
    }
  }

  async fetchCalendarData() {
    const response = await fetch("highlight-dates.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch highlight-dates.json: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  renderCalendarGrid(year) {
    this.calendar.innerHTML = "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fragment = document.createDocumentFragment();

    for (let month = 0; month < 12; month++) {
      const monthDiv = this.createMonthElement(month, year, today);
      fragment.appendChild(monthDiv);
    }

    this.calendar.appendChild(fragment);
  }

  createMonthElement(month, year, today) {
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    // Add header and weekdays
    monthDiv.appendChild(this.createMonthHeader(month));
    monthDiv.appendChild(this.createWeekdaysHeader());
    monthDiv.appendChild(this.createDaysGrid(month, year, today));

    return monthDiv;
  }

  createMonthHeader(month) {
    const header = document.createElement("div");
    header.className = "month-header";
    header.textContent = months[month];
    return header;
  }

  createWeekdaysHeader() {
    const weekdaysDiv = document.createElement("div");
    weekdaysDiv.className = "weekdays";

    weekdaysShort.forEach(day => {
      const d = document.createElement("div");
      d.textContent = day;
      weekdaysDiv.appendChild(d);
    });

    return weekdaysDiv;
  }

  createDaysGrid(month, year, today) {
    const daysGrid = document.createElement("div");
    daysGrid.className = "days";

    // Add empty cells for first week offset
    this.addEmptyDays(daysGrid, month, year);

    // Add actual days
    const totalDays = CalendarManager.daysInMonth(month, year);
    for (let day = 1; day <= totalDays; day++) {
      const dayDiv = this.createDayElement(day, month, year, today);
      daysGrid.appendChild(dayDiv);
    }

    return daysGrid;
  }

  addEmptyDays(daysGrid, month, year) {
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "empty";
      daysGrid.appendChild(empty);
    }
  }

  createDayElement(day, month, year, today) {
    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.textContent = day;

    const currentDate = new Date(year, month, day);
    const dateStr = CalendarManager.formatLocalDate(currentDate);
    dayDiv.setAttribute("data-date", dateStr);

    if (+currentDate === +today) {
      dayDiv.classList.add("today");
    }

    this.setupDayEvents(dayDiv, currentDate);
    return dayDiv;
  }

  setupDayEvents(dayDiv, currentDate) {
    const eventsTexts = this.getEventsForDate(currentDate);

    // Add CSS classes for events
    eventsTexts.forEach(event => {
      const className = event.patchType === "holiday"
        ? "highlight-holiday"
        : CalendarManager.getClassName(event.patchType, event.dateType);

      dayDiv.classList.add(className);
    });

    if (eventsTexts.length > 0) {
      this.attachHoverEvents(dayDiv, eventsTexts);
    }

    this.updateSplitBackground(dayDiv);
  }

  updatePageMetadata(year) {
    this.yearFooter.textContent = year;
    document.title = `Gachaverse ${year}`;

    const metaTitle = document.querySelector(`meta[name="title"]`);
    if (metaTitle) {
      metaTitle.setAttribute("content", `Gachaverse ${year}`);
    }
  }

  displayError(error) {
    console.error("Error loading calendar data:", error);
    this.calendar.outerHTML = `
      <main class="error-message">
        <h3>Unable to load calendar data</h3>
        <p>Please check that the highlight-dates.json file is available and try refreshing the page.</p>
        <p>Error: ${error.message}</p>
      </main>
    `;
  }
}

// Separate class for handling day-specific events
class DayEventHandler {
  constructor(calendarManager, dayDiv, eventTexts) {
    this.calendar = calendarManager;
    this.dayDiv = dayDiv;
    this.eventTexts = eventTexts;
    this.isHovering = false;
  }

  attach() {
    this.dayDiv.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
    this.dayDiv.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.dayDiv.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
  }

  handleMouseEnter(e) {
    if (this.isHovering) return;
    this.isHovering = true;

    const firstEvent = this.eventTexts[0];
    if (!this.shouldShowTooltip(firstEvent)) {
      this.isHovering = false;
      return;
    }

    this.showTooltip();
    this.applyHighlightRange(firstEvent);
  }

  shouldShowTooltip(firstEvent) {
    return firstEvent.patchType === "holiday" ||
      this.calendar.activeGames.has(firstEvent.patchType);
  }

  showTooltip() {
    const rect = this.dayDiv.getBoundingClientRect();
    const combinedText = this.eventTexts.map(e => e.text).join("\n");
    this.calendar.createTooltip(combinedText, rect.left, rect.top);
  }

  applyHighlightRange(firstEvent) {
    if (firstEvent.isLivestream || !firstEvent.highlightRange) return;

    for (let i = 1; i <= firstEvent.highlightRange; i++) {
      const futureDate = new Date(firstEvent.currentDate);
      futureDate.setDate(firstEvent.currentDate.getDate() + i);

      const targetDayDiv = document.querySelector(
        `.day[data-date="${CalendarManager.formatLocalDate(futureDate)}"]`
      );

      if (targetDayDiv) {
        const className = this.getHighlightClassName(firstEvent, i);
        targetDayDiv.classList.add(className);
      }
    }
  }

  getHighlightClassName(firstEvent, dayOffset) {
    const suffix = dayOffset <= firstEvent.bannerOne ? "-banner-one" : "-banner-two";
    return CalendarManager.getClassName(firstEvent.patchType, firstEvent.dateType, suffix);
  }

  handleMouseMove(moveEvent) {
    if (!this.calendar.currentTooltip) return;

    const rect = this.dayDiv.getBoundingClientRect();
    this.calendar.currentTooltip.style.left =
      `${rect.left + rect.width / 2 - this.calendar.currentTooltip.offsetWidth / 2}px`;
    this.calendar.currentTooltip.style.top = `${moveEvent.pageY - 48}px`;
  }

  handleMouseLeave() {
    this.isHovering = false;
    this.calendar.removeTooltip();

    const firstEvent = this.eventTexts[0];
    if (!this.shouldShowTooltip(firstEvent)) return;

    this.removeHighlightRange(firstEvent);
  }

  removeHighlightRange(firstEvent) {
    if (firstEvent.isLivestream || !firstEvent.highlightRange) return;

    for (let i = 1; i <= firstEvent.highlightRange; i++) {
      const futureDate = new Date(firstEvent.currentDate);
      futureDate.setDate(firstEvent.currentDate.getDate() + i);

      const targetDayDiv = document.querySelector(
        `.day[data-date="${CalendarManager.formatLocalDate(futureDate)}"]`
      );

      if (targetDayDiv) {
        const className = this.getHighlightClassName(firstEvent, i);
        targetDayDiv.classList.remove(className);
      }
    }
  }
}

// Initialize calendar
const calendarManager = new CalendarManager();

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => calendarManager.renderCalendar(currentYear));
} else {
  calendarManager.renderCalendar(currentYear);
}