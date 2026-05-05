// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

const MONTH_INDEX = Object.fromEntries(MONTHS.map((m, i) => [m, i]));

// Mon-start weekday labels, matching the CSS grid of 7 columns in .weekdays
const WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

const CURRENT_YEAR = new Date().getFullYear();
// DEFAULT_RANGE  = visual duration of a patch (days after the patch date that are highlighted)
// DEFAULT_INTERVAL = gap in days between consecutive patch start dates
// They are intentionally different: 42-day cycle, 41-day highlight (patch day is day 0)
const DEFAULT_RANGE = 41;
const DEFAULT_INTERVAL = 42;
const STORAGE_KEY = "gachaverse_toggles";
const DATA_URL = "highlight-dates.json"; // matches <link rel="preload"> in <head>
const SITE_TITLE_PREFIX = "Gachaverse";  // matches <title> and <meta name="title">
const MOBILE_BREAKPOINT = 480;           // matches @media (max-width: 480px) in CSS

// ─── CalendarManager ─────────────────────────────────────────────────────────

class CalendarManager {
	constructor() {
		this.globalData = [];
		this.activeGames = new Set();
		this.currentTooltip = null;
		this.colorCache = new Map();

		// Cache today once to avoid repeated Date constructions
		this.today = new Date();
		this.todayStr = CalendarManager.formatLocalDate(this.today);

		// IDs/selectors match index.html exactly
		this.calendarEl = document.getElementById("calendar");
		this.toggleContainer = document.getElementById("toggle-container");
		this.footerEl = document.querySelector("footer");

		this.refreshAllDayHoverBindings = this.refreshAllDayHoverBindings.bind(this);
	}

	// ─── Static Utilities ──────────────────────────────────────────────────────

	static parseLocalDate(dateStr) {
		const [y, m, d] = dateStr.split("-").map(Number);
		return new Date(y, m - 1, d);
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

	/**
	 * Builds CSS class names used by index.html:
	 *   highlight-{shorthand}-patch
	 *   highlight-{shorthand}-livestream
	 *   highlight-{shorthand}-patch-banner-one
	 *   highlight-{shorthand}-patch-banner-two
	 */
	static getClassName(shorthand, type, suffix = "") {
		return `highlight-${shorthand.toLowerCase()}-${type}${suffix}`;
	}

	static isMobile() {
		return window.innerWidth <= MOBILE_BREAKPOINT;
	}

	// ─── Event Processing ──────────────────────────────────────────────────────

	getEventsForDate(dateObj) {
		const events = [];
		for (const game of this.globalData) {
			// game.versions → patch/livestream events; only shown when toggled on
			if (game.versions && this.activeGames.has(game.shorthand)) {
				this.collectVersionEvents(game, dateObj, events);
			}
			// game.dates → holiday entries (Holidays game); always visible
			if (game.dates) {
				this.collectHolidayEvents(game, dateObj, events);
			}
		}
		return events;
	}

	/**
	 * Sort priority: patch → livestream → holiday
	 * Drives class ordering on .day divs (patch border-radius wins over livestream)
	 */
	sortByTypePriority(items, getType) {
		items.sort((a, b) => {
			const ta = getType(a), tb = getType(b);
			if (ta === tb) return 0;
			if (ta === "patch") return -1;
			if (tb === "patch") return 1;
			if (ta === "livestream") return -1;
			return 1;
		});
		return items;
	}

	sortEventsByPriority(events) {
		return this.sortByTypePriority(events, e => e.dateType);
	}

	collectVersionEvents(game, dateObj, events) {
		const month = dateObj.getMonth();
		const day = dateObj.getDate();
		for (const version of game.versions) {
			for (const date of version.dates) {
				if (!this.isDateMatch(date, month, day)) continue;
				const vNum = this.formatVersionNumber(version.version);
				const label = `${game.shorthand.toUpperCase()} ${this.capitalize(date.type)} ${vNum}`;
				events.push(this.buildEvent(label, dateObj, game.shorthand, date, version));
			}
		}
	}

	collectHolidayEvents(game, dateObj, events) {
		const month = dateObj.getMonth();
		const day = dateObj.getDate();
		for (const date of game.dates) {
			if (this.isDateMatch(date, month, day)) {
				// patchType "holiday" → CSS class "highlight-holiday" (defined in index.html)
				events.push(this.buildEvent(date.name, dateObj, "holiday", date, {}));
			}
		}
	}


	isDateMatch(date, month, day) {
		return MONTH_INDEX[date.month] === month && date.day === day;
	}


	formatVersionNumber(version) {
		return Number.isInteger(version)
			? version.toFixed(1)
			: String(version).replace(/(\.\d)0$/, "$1");
	}

	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	buildEvent(text, currentDate, patchType, date, version) {
		const highlightRange = version.highlightRange ?? DEFAULT_RANGE;
		return Object.freeze({
			text,
			currentDate,
			patchType,
			isPatch: date.type === "patch",
			highlightRange,
			// bannerOne threshold — splits banner-one / banner-two CSS classes
			bannerOne: version.bannerOne ?? Math.floor(highlightRange / 2),
			dateType: date.type
		});
	}

	// ─── Styling ───────────────────────────────────────────────────────────────

	applyStylesFromJSON(games) {
		// Inject into a single <style id="game-properties"> to avoid duplicate sheets
		let styleEl = document.getElementById("game-properties");
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = "game-properties";
			document.head.appendChild(styleEl);
		}

		// Preload game icons declared in highlight-dates.json
		// Guard against duplicate <link rel="preload"> on re-renders
		for (const game of games) {
			if (!game.icon || game.icon === "none" || game.icon === "") continue;
			if (document.querySelector(`link[rel="preload"][href="${game.icon}"]`)) continue;
			const link = document.createElement("link");
			link.rel = "preload";
			link.as = "image";
			link.href = game.icon;
			link.type = "image/webp";
			link.fetchPriority = "high";
			document.head.appendChild(link);
		}

		styleEl.textContent = games
			.filter(g => g.color)
			.map(g => this.generateGameStyles(g))
			.join("\n");
	}

	/**
	 * Generates CSS for each game using class names that match index.html selectors:
	 *   .label-{s}                          → toggle button background
	 *   .highlight-{s}-livestream           → border-radius: 50%  (from CSS [class*="livestream"])
	 *   .highlight-{s}-patch                → border-radius: 0.25rem (from CSS [class*="patch"])
	 *   .highlight-{s}-patch-banner-one/two → from CSS [class*="banner-one/two"]
	 *   .label-{s}::before                  → icon background image
	 *   .highlight-holiday                  → colored text for holiday dates
	 */
	generateGameStyles({ shorthand, color, icon = "none", dates }) {
		const s = shorthand.toLowerCase();
		// Only emit .highlight-holiday rule for the Holidays entry (has flat dates[], no versions)
		const holidayRule = dates
			? `.highlight-holiday { color: ${color} !important; }`
			: "";

		return `
      .label-${s},
      .highlight-${s}-livestream,
      .highlight-${s}-patch {
        background: ${color};
      }
      .highlight-${s}-patch-banner-one,
      .highlight-${s}-patch-banner-two {
        background: ${color} !important;
      }
      .label-${s}::before {
        background: url("${icon}");
      }
      ${holidayRule}
    `;
	}

	// ─── Toggle Management ─────────────────────────────────────────────────────

	_getToggleStates() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
		} catch {
			return {};
		}
	}

	loadToggleState(shorthand) {
		const states = this._getToggleStates();
		return states[shorthand] !== undefined ? states[shorthand] : null;
	}

	saveToggleState(shorthand, isActive) {
		try {
			const states = this._getToggleStates();
			states[shorthand] = isActive;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
		} catch (e) {
			console.error("Could not save toggle state:", e);
		}
	}

	createToggleButtons(games) {
		this.applyStylesFromJSON(games);
		this.toggleContainer.innerHTML = "";
		const fragment = document.createDocumentFragment();
		for (const game of games) {
			const btn = this.createToggleButton(game);
			if (btn) fragment.appendChild(btn);
		}
		this.toggleContainer.appendChild(fragment);
	}

	createToggleButton(game) {
		// Games with active:false or no versions are fully skipped (e.g. Template entry in JSON)
		// No hidden placeholder is needed since we don't rely on CSS nth-child for toggle ordering
		if (game.active === false || !this.hasValidVersions(game)) return null;
		const saved = this.loadToggleState(game.shorthand);
		const isActive = saved !== null ? saved : game.toggle !== false;
		const btn = this.buildToggleButton(game, isActive);
		this.setupToggleHandler(btn, game);
		return btn;
	}

	hasValidVersions(game) {
		return Array.isArray(game.versions) && game.versions.length > 0;
	}

	buildToggleButton(game, isActive) {
		const btn = document.createElement("button");
		btn.className = `label-${game.shorthand.toLowerCase()}`;
		btn.dataset.game = game.shorthand;
		btn.setAttribute("aria-label", `Toggle ${game.game} events`);
		if (!isActive) {
			btn.classList.add("inactive");
		} else {
			this.activeGames.add(game.shorthand);
		}
		return btn;
	}

	setupToggleHandler(btn, { shorthand }) {
		btn.addEventListener("click", () => {
			const isNowInactive = btn.classList.toggle("inactive");
			if (isNowInactive) {
				this.activeGames.delete(shorthand);
				this.removeHighlights(shorthand);
			} else {
				this.activeGames.add(shorthand);
				this.reapplyHighlights(shorthand);
			}
			this.saveToggleState(shorthand, !isNowInactive);
			// Debounce hover rebind so rapid clicks don't thrash the DOM
			clearTimeout(btn._refreshTimeout);
			btn._refreshTimeout = setTimeout(this.refreshAllDayHoverBindings, 50);
		});
	}

	// ─── Highlight Management ──────────────────────────────────────────────────

	removeHighlights(shorthand) {
		const classes = [
			`highlight-${shorthand}-livestream`,
			`highlight-${shorthand}-patch`,
			`highlight-${shorthand}-banner-one`,
			`highlight-${shorthand}-banner-two`
		];
		const selector = classes.map(c => `.${c}`).join(", ");
		document.querySelectorAll(selector).forEach(el => {
			classes.forEach(cls => el.classList.remove(cls));
			this.updateSplitBackground(el);
		});
		this.updateAllDaysBackgrounds();
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
		const month = dateObj.getMonth();
		const day = dateObj.getDate();

		const dayEvents = game.versions.flatMap(version =>
			version.dates
				.filter(date => this.isDateMatch(date, month, day))
				.map(date => ({
					type: date.type,
					className: CalendarManager.getClassName(game.shorthand, date.type)
				}))
		);


		this.sortByTypePriority(dayEvents, e => e.type)
			.forEach(e => {
				dayDiv.classList.add(e.className);
				if (e.type === "patch") dayDiv.classList.add("is-patch");
				else if (e.type === "livestream") dayDiv.classList.add("is-livestream");
			});


		this.reorderDayClasses(dayDiv);
		this.updateSplitBackground(dayDiv);
	}

	updateAllDaysBackgrounds() {
		document.querySelectorAll(".day").forEach(d => this.updateSplitBackground(d));
	}

	/**
	 * Returns only the primary highlight classes (patch/livestream),
	 * excluding banner-one/two — those are transient hover-only classes.
	 */
	getHighlightClasses(classList) {
		return Array.from(classList).filter(
			c => c.startsWith("highlight-") && (c.endsWith("-patch") || c.endsWith("-livestream"))
		);
	}

	/**
	 * When a .day has multiple highlights, build a CSS gradient so both colors show.
	 * Special case: livestream (circle) + patch (rounded square) → asymmetric border-radius
	 * matching the CSS rule combo in index.html.
	 */
	updateSplitBackground(dayDiv) {
		const classes = this.getHighlightClasses(dayDiv.classList);
		if (classes.length <= 1) {
			dayDiv.style.background = "";
			dayDiv.style.borderRadius = "";
			return;
		}
		const hasLivestream = classes.some(c => c.endsWith("-livestream"));
		const hasPatch = classes.some(c => c.endsWith("-patch"));
		dayDiv.style.background = this.createGradientString(this.getColorsFromClasses(classes));
		// 50% top-left → circle side for livestream; 0.25rem for patch corners
		dayDiv.style.borderRadius = (hasLivestream && hasPatch) ? "50% 0.25rem 0.25rem 0.25rem" : "";
	}

	getColorsFromClasses(classes) {
		return classes.map(cls => {
			if (this.colorCache.has(cls)) return this.colorCache.get(cls);
			// Measure computed background-color via a temporary off-screen element
			const temp = document.createElement("div");
			temp.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;";
			temp.classList.add(cls);
			document.body.appendChild(temp);
			const color = getComputedStyle(temp).backgroundColor || "transparent";
			document.body.removeChild(temp);
			this.colorCache.set(cls, color);
			return color;
		});
	}

	createGradientString(colors) {
		const pct = 100 / colors.length;
		const stops = colors.map((c, i) =>
			`${c} ${i * pct}%, ${c} ${(i + 1) * pct}%`
		).join(", ");
		return `linear-gradient(-45deg, ${stops})`;
	}

	// ─── Tooltip ───────────────────────────────────────────────────────────────

	createTooltip(text, x, y) {
		this.removeTooltip();
		// Matches .custom-tooltip in index.html CSS
		const tooltip = document.createElement("div");
		tooltip.className = "custom-tooltip";
		tooltip.setAttribute("role", "tooltip");
		text.split("\n").forEach(line => {
			const div = document.createElement("div");
			div.textContent = line;
			tooltip.appendChild(div);
		});
		document.body.appendChild(tooltip);

		const pad = 8;
		const left = Math.min(Math.max(pad, x), window.innerWidth - tooltip.offsetWidth - pad);
		const topAbove = y - tooltip.offsetHeight - 12;
		const top = topAbove > pad
			? topAbove
			: Math.min(y + pad, window.innerHeight - tooltip.offsetHeight - pad);

		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${top}px`;
		this.currentTooltip = tooltip;
	}

	removeTooltip() {
		this.currentTooltip?.remove();
		this.currentTooltip = null;
	}

	// ─── Hover Bindings ────────────────────────────────────────────────────────

	attachHoverEvents(dayDiv, eventTexts) {
		const handler = new DayEventHandler(this, dayDiv, eventTexts);
		handler.attach();
		// Store reference for explicit cleanup — avoids DOM cloning on refresh
		dayDiv._dayHandler = handler;
	}

	refreshAllDayHoverBindings() {
		document.querySelectorAll(".day").forEach(dayDiv => {
			// Explicitly detach old listeners instead of cloning the node
			dayDiv._dayHandler?.detach();
			dayDiv._dayHandler = null;

			const dateStr = dayDiv.getAttribute("data-date");
			if (!dateStr) return;
			const dateObj = CalendarManager.parseLocalDate(dateStr);
			const sortedEvents = this.sortEventsByPriority(this.getEventsForDate(dateObj));
			if (sortedEvents.length > 0) this.attachHoverEvents(dayDiv, sortedEvents);
		});
	}

	// ─── Mobile ────────────────────────────────────────────────────────────────

	scrollToCurrentMonth() {
		if (!CalendarManager.isMobile()) return;
		const el = document.querySelector(`.month:nth-child(${new Date().getMonth() + 1})`);
		if (el) {
			setTimeout(() =>
				window.scrollTo({ top: Math.max(0, el.offsetTop), behavior: "smooth" }), 100
			);
		}
	}

	// ─── Rendering ─────────────────────────────────────────────────────────────

	async renderCalendar(year) {
		try {
			this.globalData = await this.fetchCalendarData();
			this.createToggleButtons(this.globalData);
			this.renderCalendarGrid(year);
			this.updatePageMetadata(year);
			this.scrollToCurrentMonth();
		} catch (err) {
			this.displayError(err);
		}
	}

	async fetchCalendarData() {
		// DATA_URL matches the <link rel="preload" href="highlight-dates.json"> in <head>
		const res = await fetch(DATA_URL, { priority: "high" });
		if (!res.ok) {
			throw new Error(`Failed to fetch ${DATA_URL}: ${res.status} ${res.statusText}`);
		}
		const data = await res.json();
		this.autoPopulatePatchesForYear(data, CURRENT_YEAR);
		return data;
	}

	// Forward-fills patch versions for the rest of the current year
	autoPopulatePatchesForYear(games, year) {
		for (const game of games) {
			if (!game.versions?.length) continue;

			const lastVersion = game.versions[game.versions.length - 1];
			const lastPatchDate = this.getLastPatchDate(lastVersion);
			if (!lastPatchDate) continue;

			// autoInterval: gap between patch starts. Distinct from highlightRange (visual length).
			// Falls back to DEFAULT_INTERVAL (42), not highlightRange, to keep concepts separate.
			const autoInterval = game.autoInterval ?? DEFAULT_INTERVAL;

			// Cursor starts directly on the next expected patch date
			const cursor = new Date(lastPatchDate);
			// cursor.setDate(cursor.getDate() + autoInterval);
			const lastHighlightRange = lastVersion.highlightRange ?? DEFAULT_RANGE;
			cursor.setDate(cursor.getDate() + lastHighlightRange + 1);

			let vNum = Math.round((lastVersion.version + 0.1) * 10) / 10;

			while (cursor.getFullYear() === year) {
				const newVersion = {
					version: vNum,
					// Auto-populated patches use the interval as their highlight range.
					// bannerOne is intentionally omitted so buildEvent calculates the correct
					// default (floor(highlightRange / 2)) from the new range, not the last version's.
					highlightRange: autoInterval - 1,
					dates: [{
						type: "patch",
						month: MONTHS[cursor.getMonth()],
						day: cursor.getDate()
					}]
				};
				game.versions.push(newVersion);
				cursor.setDate(cursor.getDate() + autoInterval);
				vNum = Math.round((vNum + 0.1) * 10) / 10;
			}
		}
	}

	getLastPatchDate(version) {
		if (!version.dates?.length) return null;
		const patch = version.dates.find(d => d.type === "patch");
		if (!patch) return null;
		return new Date(CURRENT_YEAR, MONTHS.indexOf(patch.month), patch.day);
	}

	renderCalendarGrid(year) {
		this.calendarEl.innerHTML = "";
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const fragment = document.createDocumentFragment();
		for (let month = 0; month < 12; month++) {
			fragment.appendChild(this.createMonthElement(month, year, today));
		}
		this.calendarEl.appendChild(fragment);
	}

	createMonthElement(month, year, today) {
		const monthDiv = document.createElement("div");
		monthDiv.className = "month";
		monthDiv.appendChild(this.createMonthHeader(month));
		monthDiv.appendChild(this.createWeekdaysRow());
		monthDiv.appendChild(this.createDaysGrid(month, year, today));
		return monthDiv;
	}

	createMonthHeader(month) {
		const header = document.createElement("div");
		header.className = "month-header";
		header.textContent = MONTHS[month];
		return header;
	}

	createWeekdaysRow() {
		const row = document.createElement("div");
		row.className = "weekdays";
		WEEKDAYS_SHORT.forEach(label => {
			const cell = document.createElement("div");
			cell.textContent = label;
			row.appendChild(cell);
		});
		return row;
	}


	createDaysGrid(month, year) {
		const grid = document.createElement("div");
		grid.className = "days";
		this.addEmptyDays(grid, month, year);
		const total = CalendarManager.daysInMonth(month, year);
		for (let day = 1; day <= total; day++) {
			grid.appendChild(this.createDayElement(day, month, year));
		}
		return grid;
	}


	addEmptyDays(grid, month, year) {
		// (getDay() + 6) % 7 converts Sun-start (0) to Mon-start (0) to match WEEKDAYS_SHORT
		const offset = (new Date(year, month, 1).getDay() + 6) % 7;
		for (let i = 0; i < offset; i++) {
			const empty = document.createElement("div");
			empty.className = "empty";
			grid.appendChild(empty);
		}
	}


	createDayElement(day, month, year) {
		const dayDiv = document.createElement("div");
		dayDiv.className = "day";
		dayDiv.textContent = day;
		const date = new Date(year, month, day);
		const dateStr = CalendarManager.formatLocalDate(date);
		dayDiv.setAttribute("data-date", dateStr);
		if (+date === +this.today) dayDiv.classList.add("today");
		this.setupDayEvents(dayDiv, date);
		return dayDiv;
	}



	setupDayEvents(dayDiv, date) {
		const sorted = this.sortEventsByPriority(this.getEventsForDate(date));
		for (const event of sorted) {
			const cls = event.patchType === "holiday"
				? "highlight-holiday"
				: CalendarManager.getClassName(event.patchType, event.dateType);
			dayDiv.classList.add(cls);

			// ← ADD base type class for cheaper CSS selectors
			if (event.dateType === "patch") dayDiv.classList.add("is-patch");
			else if (event.dateType === "livestream") dayDiv.classList.add("is-livestream");
		}
		this.reorderDayClasses(dayDiv);
		if (sorted.length > 0) this.attachHoverEvents(dayDiv, sorted);
		this.updateSplitBackground(dayDiv);
	}

	/**
	 * Re-orders highlight classes so patch always precedes livestream in classList.
	 * This matters because CSS [class*="patch"] and [class*="livestream"] both set
	 * border-radius — the last one in the class list wins for specificity ties.
	 */
	reorderDayClasses(dayDiv) {
		const highlights = this.getHighlightClasses(dayDiv.classList);
		if (highlights.length <= 1) return;
		const sorted = this.sortByTypePriority(highlights, cls => {
			if (cls.endsWith("-patch")) return "patch";
			if (cls.endsWith("-livestream")) return "livestream";
			return "other";
		});
		highlights.forEach(cls => dayDiv.classList.remove(cls));
		sorted.forEach(cls => dayDiv.classList.add(cls));
	}

	updatePageMetadata(year) {
		// Matches <title>, <meta name="title">, and <footer> in index.html
		this.footerEl.textContent = year;
		document.title = `${SITE_TITLE_PREFIX} ${year}`;
		document.querySelector(`meta[name="title"]`)
			?.setAttribute("content", `${SITE_TITLE_PREFIX} ${year}`);
	}

	displayError(err) {
		console.error("Error loading calendar data:", err);
		// Replace <main id="calendar"> with a user-friendly error panel
		this.calendarEl.outerHTML = `
      <main class="error-message">
        <h3>Unable to load calendar data</h3>
        <p>Please check that ${DATA_URL} is available and try refreshing the page.</p>
        <p>Error: ${err.message}</p>
      </main>
    `;
	}
}

// ─── DayEventHandler ─────────────────────────────────────────────────────────

class DayEventHandler {
	constructor(calendar, dayDiv, eventTexts) {
		this.calendar = calendar;
		this.dayDiv = dayDiv;
		this.eventTexts = eventTexts;
		this.isHovering = false;

		this.handleMouseEnter = this.handleMouseEnter.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
	}

	attach() {
		this.dayDiv.addEventListener("mouseenter", this.handleMouseEnter);
		this.dayDiv.addEventListener("mousemove", this.handleMouseMove);
		this.dayDiv.addEventListener("mouseleave", this.handleMouseLeave);
	}

	detach() {
		this.dayDiv.removeEventListener("mouseenter", this.handleMouseEnter);
		this.dayDiv.removeEventListener("mousemove", this.handleMouseMove);
		this.dayDiv.removeEventListener("mouseleave", this.handleMouseLeave);
	}

	_isVisible(event) {
		// Holiday events are always visible; game events depend on active toggle state
		return event.patchType === "holiday" || this.calendar.activeGames.has(event.patchType);
	}

	/**
	 * Single method to add or remove banner-one/two classes over the highlight range.
	 * Replaces the previous duplicate applyHighlightRange / removeHighlightRange pair.
	 * Banner classes match [class*="banner-one"] and [class*="banner-two"] in CSS.
	 */
	_mutateHighlightRange(event, add) {
		if (!event.isPatch) return;
		const base = new Date(event.currentDate);
		for (let i = 1; i <= event.highlightRange; i++) {
			const future = new Date(base);
			future.setDate(base.getDate() + i);
			const dateKey = CalendarManager.formatLocalDate(future);
			const target = document.querySelector(`.day[data-date="${dateKey}"]`);
			if (!target) continue;
			// banner-one for first half of patch cycle, banner-two for second half
			const suffix = i <= event.bannerOne ? "-banner-one" : "-banner-two";
			const cls = CalendarManager.getClassName(event.patchType, event.dateType, suffix);
			target.classList[add ? "add" : "remove"](cls);
		}
	}

	handleMouseEnter() {
		if (this.isHovering) return;
		// Collect all visible events for this day (supports multiple games on same date)
		const visibleEvents = this.eventTexts.filter(e => this._isVisible(e));
		if (visibleEvents.length === 0) return;
		this.isHovering = true;

		// Show .custom-tooltip with all event names for this day
		const rect = this.dayDiv.getBoundingClientRect();
		const scrollY = window.scrollY ?? window.pageYOffset;
		this.calendar.createTooltip(
			visibleEvents.map(e => e.text).join("\n"),
			rect.left,
			rect.top + scrollY
		);
		// Paint banner ranges for all visible patch events, not just the first
		visibleEvents.forEach(e => this._mutateHighlightRange(e, true));
	}

	handleMouseMove(e) {
		const tooltip = this.calendar.currentTooltip;
		if (!tooltip) return;
		const rect = this.dayDiv.getBoundingClientRect();
		tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
		tooltip.style.top = `${e.pageY - 48}px`;
	}

	handleMouseLeave() {
		this.isHovering = false;
		this.calendar.removeTooltip();
		// Clear banner ranges for all visible patch events
		this.eventTexts.filter(e => this._isVisible(e))
			.forEach(e => this._mutateHighlightRange(e, false));
	}
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const calendarManager = new CalendarManager();
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => calendarManager.renderCalendar(CURRENT_YEAR));
} else {
	calendarManager.renderCalendar(CURRENT_YEAR);
}