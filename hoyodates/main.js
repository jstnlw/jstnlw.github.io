// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];
const WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

const CURRENT_YEAR = new Date().getFullYear();
const DAY_MS = 86400000;
// Full patch cycle in days when a game has no autoInterval (autoInterval + 1 otherwise)
const DEFAULT_INTERVAL = 42;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const STORAGE_KEY = "gachaverse_toggles";
const DATA_URL = "highlight-dates.json";
const SITE_TITLE_PREFIX = "Gachaverse";
const MOBILE_BREAKPOINT = 480;

// Sort weight for day classes: patch wins over livestream, holiday last
const TYPE_PRIORITY = { patch: 0, livestream: 1 };
const TYPE_PRIORITY_DEFAULT = 2;

const TOOLTIP_GAP = 12;
const TOOLTIP_EDGE_PAD = 8;

// ─── CalendarManager ─────────────────────────────────────────────────────────

class CalendarManager {
	constructor() {
		this.globalData = [];
		this.activeGames = new Set();
		this.currentTooltip = null;
		this.colorCache = new Map();
		// dateStr → .day element, so hover ranges never re-query the document
		this.dayElements = new Map();

		// Cache today once to avoid repeated Date constructions
		this.today = CalendarManager.startOfDay(new Date());
		this.todayStr = CalendarManager.formatLocalDate(this.today);

		this.calendarEl = document.getElementById("calendar");
		this.toggle = document.getElementById("toggle");
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

	// Strips the time part so day arithmetic is never off by a fraction
	static startOfDay(date) {
		return new Date(date.getFullYear(), date.getMonth(), date.getDate());
	}

	static addDays(date, amount) {
		const next = new Date(date);
		next.setDate(next.getDate() + amount);
		return next;
	}

	static daysBetween(from, to) {
		return Math.round((to - from) / DAY_MS);
	}

	static daysInMonth(month, year) {
		return new Date(year, month + 1, 0).getDate();
	}

	static pluralDays(n) {
		return `${n} day${n !== 1 ? "s" : ""}`;
	}

	static clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	// Sorts in place by patch → livestream → everything else
	static sortByType(items, getType) {
		const rank = type => TYPE_PRIORITY[type] ?? TYPE_PRIORITY_DEFAULT;
		return items.sort((a, b) => rank(getType(a)) - rank(getType(b)));
	}

	/**
	 * Builds CSS class names used by index.html:
	 *   highlight-{shorthand}-patch
	 *   highlight-{shorthand}-livestream
	 *   highlight-{shorthand}-patch-phase-one
	 *   highlight-{shorthand}-patch-phase-two
	 */
	static getClassName(shorthand, type, suffix = "") {
		return `highlight-${shorthand.toLowerCase()}-${type}${suffix}`;
	}

	static getIconPath(shorthand) {
		return `assets/${shorthand.toLowerCase()}-icon.webp`;
	}

	static isMobile() {
		return window.innerWidth <= MOBILE_BREAKPOINT;
	}

	// ─── Patch Lookups ─────────────────────────────────────────────────────────

	/**
	 * Yields { version, date, days } for every patch of a game still ahead of today.
	 * Reads game.versions after normalizeGames, so auto-filled patches count.
	 */
	*upcomingPatches(game) {
		for (const patch of game?.versions ?? []) {
			const date = CalendarManager.parseLocalDate(patch.phaseOne);
			if (date <= this.today) continue;
			yield { version: patch.version, date, days: CalendarManager.daysBetween(this.today, date) };
		}
	}

	/**
	 * Next closest patch across all active games.
	 * Returns an array so simultaneous patches can share the same countdown.
	 */
	getNextPatchCountdown() {
		let upcoming = [];

		for (const game of this.globalData) {
			if (!this.activeGames.has(game.shorthand)) continue;

			for (const patch of this.upcomingPatches(game)) {
				const best = upcoming[0]?.days ?? Infinity;
				if (patch.days > best) continue;
				if (patch.days < best) upcoming = [];
				upcoming.push({ shorthand: game.shorthand.toUpperCase(), ...patch });
			}
		}
		return upcoming;
	}

	// Shared label for the today tooltip, e.g. "HSR v4.7 / ZZZ v3.2 in 12 days"
	formatCountdownText(countdown) {
		if (!countdown.length) return "";
		const label = countdown
			.map(p => `${p.shorthand} v${this.formatVersionNumber(p.version)}`)
			.join(" / ");
		return `${label} in ${CalendarManager.pluralDays(countdown[0].days)}`;
	}

	// ─── Event Processing ──────────────────────────────────────────────────────

	// Pass `games` to limit the lookup, e.g. a single game being toggled back on
	getEventsForDate(dateStr, games = this.globalData) {
		const events = [];
		for (const game of games) {
			// game.versions → patch/livestream events; only shown when toggled on
			if (game.versions && this.activeGames.has(game.shorthand)) {
				this.collectVersionEvents(game, dateStr, events);
			}
			// game.dates → holiday entries (Holidays game); always visible
			if (game.dates) {
				this.collectHolidayEvents(game, dateStr, events);
			}
		}
		return CalendarManager.sortByType(events, e => e.dateType);
	}

	collectVersionEvents(game, dateStr, events) {
		const shorthand = game.shorthand.toUpperCase();

		for (const patch of game.versions) {
			const vNum = this.formatVersionNumber(patch.version);

			if (patch.phaseOne === dateStr) {
				events.push(this.buildEvent(`${shorthand} Patch v${vNum}`, game.shorthand, "patch", patch));
			}
			if (patch.livestream === dateStr) {
				events.push(this.buildEvent(`${shorthand} Livestream v${vNum}`, game.shorthand, "livestream", patch));
			}
		}
	}

	collectHolidayEvents(game, dateStr, events) {
		for (const holiday of game.dates) {
			if (holiday.date !== dateStr) continue;
			events.push(this.buildEvent(holiday.name, "holiday", "holiday", null));
		}
	}

	// toFixed(1) also rounds away float drift from the auto-fill increments
	formatVersionNumber(version) {
		return version.toFixed(1);
	}

	buildEvent(text, patchType, dateType, patch) {
		return Object.freeze({ text, patchType, dateType, patch });
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

		this.preloadGameIcons(games);

		styleEl.textContent = games
			.filter(g => g.color)
			.map(g => this.generateGameStyles(g))
			.join("\n");
	}

	// Preloads icons declared in highlight-dates.json, guarding against duplicates
	preloadGameIcons(games) {
		for (const game of games) {
			if (!this.isPlayableGame(game)) continue;

			const iconPath = CalendarManager.getIconPath(game.shorthand);
			if (document.querySelector(`link[rel="preload"][href="${iconPath}"]`)) continue;

			const link = document.createElement("link");
			link.rel = "preload";
			link.as = "image";
			link.href = iconPath;
			link.type = "image/webp";
			link.fetchPriority = "high";
			document.head.appendChild(link);
		}
	}

	/**
	 * Generates CSS for each game using class names that match index.html selectors:
	 *   .toggle-{s}                         → toggle button background
	 *   .highlight-{s}-livestream           → border-radius: 50%  (from CSS .is-livestream)
	 *   .highlight-{s}-patch                → border-radius: var(--radius-day) (from CSS .is-patch)
	 *   .highlight-{s}-patch-phase-one/two → from CSS [class*="phase-one/two"]
	 *   .toggle-{s}::before                 → icon background image
	 *   .highlight-holiday                  → colored text for holiday dates
	 */
	generateGameStyles(game) {
		const { shorthand, color, dates } = game;
		const s = shorthand.toLowerCase();

		const holidayRule = dates
			? `.highlight-holiday { color: ${color} !important; }`
			: "";

		// Only emit ::before icon rule for real games
		const iconRule = this.isPlayableGame(game)
			? `.toggle-${s}::before { background: url("${CalendarManager.getIconPath(s)}"); }`
			: "";

		return `
		.toggle-${s},
		.highlight-${s}-livestream,
		.highlight-${s}-patch {
			background: ${color};
		}
		.highlight-${s}-patch-phase-one,
		.highlight-${s}-patch-phase-two {
			background: ${color} !important;
		}
		${iconRule}
		${holidayRule}
		`;
	}

	// ─── Toggle Management ─────────────────────────────────────────────────────

	// Skips the Template entry and anything marked active:false in the JSON
	isPlayableGame(game) {
		return game.active !== false && Array.isArray(game.versions) && game.versions.length > 0;
	}

	readToggleStates() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
		} catch {
			return {};
		}
	}

	saveToggleState(shorthand, isActive) {
		try {
			const states = this.readToggleStates();
			states[shorthand] = isActive;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
		} catch (e) {
			console.error("Could not save toggle state:", e);
		}
	}

	createToggleButtons(games) {
		this.applyStylesFromJSON(games);
		this.toggle.innerHTML = "";

		// Read storage once for all buttons
		const states = this.readToggleStates();
		const fragment = document.createDocumentFragment();

		for (const game of games) {
			if (!this.isPlayableGame(game)) continue;
			fragment.appendChild(this.createToggleButton(game, states));
		}
		this.toggle.appendChild(fragment);
	}

	createToggleButton(game, states) {
		// Saved state wins; otherwise fall back to the JSON default
		const isActive = states[game.shorthand] ?? game.toggle !== false;
		if (isActive) this.activeGames.add(game.shorthand);

		const btn = document.createElement("button");
		btn.className = `toggle-${game.shorthand.toLowerCase()}`;
		btn.dataset.game = game.shorthand;
		btn.setAttribute("aria-label", `Toggle ${game.game} events`);
		btn.classList.toggle("inactive", !isActive);

		this.setupToggleHandler(btn, game.shorthand);
		return btn;
	}

	setupToggleHandler(btn, shorthand) {
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
		// Built via getClassName so the phase suffixes match what hover actually adds
		const classes = [
			CalendarManager.getClassName(shorthand, "livestream"),
			CalendarManager.getClassName(shorthand, "patch"),
			CalendarManager.getClassName(shorthand, "patch", "-phase-one"),
			CalendarManager.getClassName(shorthand, "patch", "-phase-two")
		];

		this.dayElements.forEach(dayDiv => {
			dayDiv.classList.remove(...classes);
			this.refreshDayAppearance(dayDiv);
		});
	}

	reapplyHighlights(shorthand) {
		const game = this.globalData.find(g => g.shorthand === shorthand);
		if (!game?.versions) return;

		this.dayElements.forEach((dayDiv, dateStr) => {
			const events = this.getEventsForDate(dateStr, [game]);
			if (!events.length) return;
			this.applyEventClasses(dayDiv, events);
		});
	}

	// Shared by first render and toggle-on so both add classes the same way
	applyEventClasses(dayDiv, events) {
		for (const event of events) {
			const cls = event.patchType === "holiday"
				? "highlight-holiday"
				: CalendarManager.getClassName(event.patchType, event.dateType);
			dayDiv.classList.add(cls);
		}
		this.refreshDayAppearance(dayDiv);
	}

	// The three class/background passes every day needs after its classes change
	refreshDayAppearance(dayDiv) {
		this.syncDayTypeClasses(dayDiv);
		this.reorderDayClasses(dayDiv);
		this.updateSplitBackground(dayDiv);
	}

	/**
	 * Keeps the .is-patch / .is-livestream shorthand classes in step with the
	 * highlight classes currently on the element, so they are dropped again once
	 * the last game of that type is toggled off.
	 */
	syncDayTypeClasses(dayDiv) {
		const classes = this.getHighlightClasses(dayDiv.classList);
		dayDiv.classList.toggle("is-patch", classes.some(c => c.endsWith("-patch")));
		dayDiv.classList.toggle("is-livestream", classes.some(c => c.endsWith("-livestream")));
	}

	/**
	 * Returns only the primary highlight classes (patch/livestream),
	 * excluding phase-one/two — those are transient hover-only classes.
	 */
	getHighlightClasses(classList) {
		return Array.from(classList).filter(
			c => c.startsWith("highlight-") && (c.endsWith("-patch") || c.endsWith("-livestream"))
		);
	}

	/**
	 * Re-orders highlight classes so patch always precedes livestream in classList.
	 * This matters because both set border-radius — the last one in the class list
	 * wins for specificity ties.
	 */
	reorderDayClasses(dayDiv) {
		const highlights = this.getHighlightClasses(dayDiv.classList);
		if (highlights.length <= 1) return;

		const sorted = CalendarManager.sortByType([...highlights], cls =>
			cls.endsWith("-patch") ? "patch" : "livestream"
		);

		dayDiv.classList.remove(...highlights);
		dayDiv.classList.add(...sorted);
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
		const radius = "var(--radius-day, 0.25rem)";

		dayDiv.style.background = this.createGradientString(this.getColorsFromClasses(classes));
		// 50% top-left → circle side for livestream, patch corners for the rest
		dayDiv.style.borderRadius = (hasLivestream && hasPatch)
			? `50% ${radius} ${radius} ${radius}`
			: "";
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
			temp.remove();

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

	createTooltip(lines, dayDiv, pageY) {
		this.removeTooltip();

		const tooltip = document.createElement("div");
		tooltip.className = "custom-tooltip";
		tooltip.setAttribute("role", "tooltip");

		for (const line of lines) {
			const div = document.createElement("div");
			div.textContent = line;
			tooltip.appendChild(div);
		}
		document.body.appendChild(tooltip);

		this.currentTooltip = tooltip;
		this.positionTooltip(dayDiv, pageY);
	}

	/**
	 * Centres the tooltip over its day and keeps it inside the viewport.
	 * Used on create and on every mousemove so both paths clamp the same way.
	 */
	positionTooltip(dayDiv, pageY) {
		const tooltip = this.currentTooltip;
		if (!tooltip) return;

		const rect = dayDiv.getBoundingClientRect();
		const scrollY = window.scrollY ?? window.pageYOffset;

		const left = CalendarManager.clamp(
			rect.left + rect.width / 2 - tooltip.offsetWidth / 2,
			TOOLTIP_EDGE_PAD,
			window.innerWidth - tooltip.offsetWidth - TOOLTIP_EDGE_PAD
		);

		// Prefer sitting above the cursor, drop below when there is no room
		const above = pageY - tooltip.offsetHeight - TOOLTIP_GAP;
		const top = above > scrollY + TOOLTIP_EDGE_PAD ? above : pageY + TOOLTIP_GAP;

		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${top}px`;
	}

	removeTooltip() {
		this.currentTooltip?.remove();
		this.currentTooltip = null;
	}

	// ─── Hover Bindings ────────────────────────────────────────────────────────

	/**
	 * Binds one day, replacing any handler already on it.
	 * Today always gets a handler so its countdown tooltip works on a bare day.
	 */
	bindDayHandler(dayDiv, dateStr, events = this.getEventsForDate(dateStr)) {
		dayDiv._dayHandler?.detach();
		dayDiv._dayHandler = null;

		if (events.length === 0 && dateStr !== this.todayStr) return;

		const handler = new DayEventHandler(this, dayDiv, events);
		handler.attach();
		// Stored for explicit cleanup — avoids cloning the node to drop listeners
		dayDiv._dayHandler = handler;
	}

	refreshAllDayHoverBindings() {
		this.dayElements.forEach((dayDiv, dateStr) => this.bindDayHandler(dayDiv, dateStr));
	}

	// ─── Mobile ────────────────────────────────────────────────────────────────

	scrollToCurrentMonth() {
		if (!CalendarManager.isMobile()) return;

		const el = this.calendarEl.children[this.today.getMonth()];
		if (!el) return;

		setTimeout(() =>
			window.scrollTo({ top: Math.max(0, el.offsetTop), behavior: "smooth" }), 100
		);
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
		const res = await fetch(DATA_URL, { priority: "high" });
		if (!res.ok) {
			throw new Error(`Failed to fetch ${DATA_URL}: ${res.status} ${res.statusText}`);
		}
		const data = await res.json();
		this.normalizeGames(data, CURRENT_YEAR);
		return data;
	}

	// ─── Patch Dates ───────────────────────────────────────────────────────────

	/**
	 * Turns each game's JSON versions into complete patches, all dates as "YYYY-MM-DD":
	 *   { version, livestream, phaseOne, phaseTwo, end }
	 *
	 * Date rules:
	 *   Phase 1 = phaseOne up to the day before phaseTwo
	 *   Phase 2 = phaseTwo up to end
	 *   end     = the day before the next patch's phaseOne, or one cycle after
	 *             phaseOne for the last patch
	 *   A JSON entry without phaseTwo is Phase 1 for the whole patch.
	 *
	 * Auto-fill (cycle = autoInterval + 1, or DEFAULT_INTERVAL):
	 *   After each JSON entry the next patch is expected one cycle later.
	 *   Between two JSON entries, a patch is only added when at least half a cycle
	 *   is left and its version stays below the next listed one.
	 *   After the last JSON entry, patches are added until the year ends.
	 *   Auto-filled patches always get phaseTwo at the halfway point.
	 */
	normalizeGames(games, year) {
		for (const game of games) {
			if (!Array.isArray(game.versions)) continue;
			if (game.active === false) {
				game.versions = [];
				continue;
			}

			const cycle = game.autoInterval !== undefined ? game.autoInterval + 1 : DEFAULT_INTERVAL;
			const listed = this.readListedVersions(game);
			const patches = [];

			listed.forEach((curr, i) => {
				patches.push(curr);
				this.fillGap(patches, curr, listed[i + 1], cycle, year);
			});

			this.setEndDates(patches, cycle);
			game.versions = patches;
		}
	}

	// Keeps valid JSON entries, sorted by start date
	readListedVersions(game) {
		return game.versions
			.filter(v => {
				const ok = DATE_PATTERN.test(v.phaseOne ?? "");
				if (!ok) console.warn(`${game.shorthand} v${v.version}: phaseOne must be YYYY-MM-DD`, v);
				return ok;
			})
			.map(v => ({
				version: v.version,
				livestream: DATE_PATTERN.test(v.livestream ?? "") ? v.livestream : null,
				phaseOne: v.phaseOne,
				phaseTwo: DATE_PATTERN.test(v.phaseTwo ?? "") ? v.phaseTwo : null
			}))
			.sort((a, b) => a.phaseOne.localeCompare(b.phaseOne));
	}

	// Adds auto-filled patches after `curr`, up to `next` or the end of the year
	fillGap(patches, curr, next, cycle, year) {
		const halfCycle = Math.ceil(cycle / 2);
		const boundary = next ? CalendarManager.parseLocalDate(next.phaseOne) : null;

		let cursor = CalendarManager.addDays(CalendarManager.parseLocalDate(curr.phaseOne), cycle);
		let vNum = this.nextVersionNumber(curr.version);

		while (cursor.getFullYear() === year) {
			if (boundary) {
				if (CalendarManager.daysBetween(cursor, boundary) < halfCycle) break;
				if (vNum >= next.version) break;
			}

			patches.push({
				version: vNum,
				livestream: null,
				phaseOne: CalendarManager.formatLocalDate(cursor),
				phaseTwo: CalendarManager.formatLocalDate(
					CalendarManager.addDays(cursor, Math.floor((cycle - 1) / 2) + 1)
				)
			});
			cursor = CalendarManager.addDays(cursor, cycle);
			vNum = this.nextVersionNumber(vNum);
		}
	}

	// Each patch ends the day before the next one starts; the last runs one cycle
	setEndDates(patches, cycle) {
		patches.forEach((patch, i) => {
			const start = CalendarManager.parseLocalDate(patch.phaseOne);
			const next = patches[i + 1];
			const end = next
				? CalendarManager.addDays(CalendarManager.parseLocalDate(next.phaseOne), -1)
				: CalendarManager.addDays(start, cycle - 1);

			patch.end = CalendarManager.formatLocalDate(end);
			// A phaseTwo outside the patch would never show, so drop it
			if (patch.phaseTwo && (patch.phaseTwo <= patch.phaseOne || patch.phaseTwo > patch.end)) {
				console.warn(`v${patch.version}: phaseTwo ${patch.phaseTwo} is outside the patch`, patch);
				patch.phaseTwo = null;
			}
		});
	}

	nextVersionNumber(version) {
		return Math.round((version + 0.1) * 10) / 10;
	}

	// ─── Grid ──────────────────────────────────────────────────────────────────

	renderCalendarGrid(year) {
		this.calendarEl.innerHTML = "";
		this.dayElements.clear();

		const fragment = document.createDocumentFragment();
		for (let month = 0; month < 12; month++) {
			fragment.appendChild(this.createMonthElement(month, year));
		}
		this.calendarEl.appendChild(fragment);
	}

	createMonthElement(month, year) {
		const monthDiv = document.createElement("div");
		monthDiv.className = "month";

		const header = document.createElement("div");
		header.className = "month-header";
		header.textContent = MONTHS[month];

		monthDiv.append(header, this.createWeekdaysRow(), this.createDaysGrid(month, year));
		return monthDiv;
	}

	createWeekdaysRow() {
		const row = document.createElement("div");
		row.className = "weekdays";

		for (const label of WEEKDAYS_SHORT) {
			const cell = document.createElement("div");
			cell.textContent = label;
			row.appendChild(cell);
		}
		return row;
	}

	createDaysGrid(month, year) {
		const grid = document.createElement("div");
		grid.className = "days";

		// (getDay() + 6) % 7 converts Sun-start (0) to Mon-start (0) to match WEEKDAYS_SHORT
		const offset = (new Date(year, month, 1).getDay() + 6) % 7;
		for (let i = 0; i < offset; i++) {
			const empty = document.createElement("div");
			empty.className = "empty";
			grid.appendChild(empty);
		}

		const total = CalendarManager.daysInMonth(month, year);
		for (let day = 1; day <= total; day++) {
			grid.appendChild(this.createDayElement(day, month, year));
		}
		return grid;
	}

	createDayElement(day, month, year) {
		const dayDiv = document.createElement("div");
		dayDiv.className = "day";
		dayDiv.textContent = day;

		const dateObj = new Date(year, month, day);
		const dateStr = CalendarManager.formatLocalDate(dateObj);
		dayDiv.dataset.date = dateStr;
		this.dayElements.set(dateStr, dayDiv);

		if (dateStr === this.todayStr) dayDiv.classList.add("today");

		const events = this.getEventsForDate(dateStr);
		this.applyEventClasses(dayDiv, events);
		this.bindDayHandler(dayDiv, dateStr, events);
		return dayDiv;
	}

	updatePageMetadata(year) {
		const title = `${SITE_TITLE_PREFIX} ${year}`;
		this.footerEl.textContent = year;
		document.title = title;
		document.querySelector(`meta[name="title"]`)?.setAttribute("content", title);
	}

	displayError(err) {
		console.error("Error loading calendar data:", err);
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
	constructor(calendar, dayDiv, events) {
		this.calendar = calendar;
		this.dayDiv = dayDiv;
		this.events = events;
		this.isToday = dayDiv.classList.contains("today");
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

	// Holiday events are always visible; game events depend on active toggle state
	visibleEvents() {
		return this.events.filter(
			e => e.patchType === "holiday" || this.calendar.activeGames.has(e.patchType)
		);
	}

	/**
	 * Adds or removes phase-one/two classes from the day after phaseOne up to end.
	 * Days before phaseTwo are Phase 1; from phaseTwo onward they are Phase 2.
	 * ISO date strings compare correctly as plain strings.
	 */
	setHighlightRange(event, add) {
		if (event.dateType !== "patch") return;

		const { phaseOne, phaseTwo, end } = event.patch;
		let cursor = CalendarManager.addDays(CalendarManager.parseLocalDate(phaseOne), 1);
		let dateKey = CalendarManager.formatLocalDate(cursor);

		while (dateKey <= end) {
			const target = this.calendar.dayElements.get(dateKey);
			if (target) {
				const suffix = phaseTwo && dateKey >= phaseTwo ? "-phase-two" : "-phase-one";
				target.classList.toggle(CalendarManager.getClassName(event.patchType, "patch", suffix), add);
			}
			cursor = CalendarManager.addDays(cursor, 1);
			dateKey = CalendarManager.formatLocalDate(cursor);
		}
	}

	// Event labels, plus the next-patch countdown when this day is today
	tooltipLines(visibleEvents) {
		const lines = visibleEvents.map(e => e.text);

		if (this.isToday) {
			const countdown = this.calendar.getNextPatchCountdown();
			if (countdown.length) lines.push(this.calendar.formatCountdownText(countdown));
		}
		return lines;
	}

	handleMouseEnter(e) {
		if (this.isHovering) return;

		const visibleEvents = this.visibleEvents();
		const lines = this.tooltipLines(visibleEvents);
		if (lines.length === 0) return;

		this.isHovering = true;
		this.calendar.createTooltip(lines, this.dayDiv, e.pageY);
		visibleEvents.forEach(ev => this.setHighlightRange(ev, true));
	}

	handleMouseMove(e) {
		if (!this.isHovering) return;
		this.calendar.positionTooltip(this.dayDiv, e.pageY);
	}

	handleMouseLeave() {
		if (!this.isHovering) return;

		this.isHovering = false;
		this.calendar.removeTooltip();
		// Clear phase ranges for all visible patch events
		this.visibleEvents().forEach(e => this.setHighlightRange(e, false));
	}
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const calendarManager = new CalendarManager();

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => calendarManager.renderCalendar(CURRENT_YEAR));
} else {
	calendarManager.renderCalendar(CURRENT_YEAR);
}
