// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];
const MONTH_INDEX = Object.fromEntries(MONTHS.map((m, i) => [m, i]));
const WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];

const CURRENT_YEAR = new Date().getFullYear();
const DAY_MS = 86400000;
const DEFAULT_INTERVAL = 42; // 6 weeks patch cycle if not specified in JSON; can be overridden per-game with autoInterval or per-version with highlightRange

const STORAGE_KEY = "gachaverse_toggles";
const DATA_URL = "highlight-dates.json";
const SITE_TITLE_PREFIX = "Gachaverse";
const MOBILE_BREAKPOINT = 480;

// ─── CalendarManager ─────────────────────────────────────────────────────────

class CalendarManager {
	constructor() {
		this.globalData = [];
		this.activeGames = new Set();
		this.currentTooltip = null;
		this.colorCache = new Map();

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

	static daysBetween(from, to) {
		return Math.round((to - from) / DAY_MS);
	}

	static daysInMonth(month, year) {
		return new Date(year, month + 1, 0).getDate();
	}

	static pluralDays(n) {
		return `${n} day${n !== 1 ? "s" : ""}`;
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

	static getIconPath(shorthand) {
		return `assets/${shorthand.toLowerCase()}-icon.webp`;
	}

	static isMobile() {
		return window.innerWidth <= MOBILE_BREAKPOINT;
	}

	// ─── Patch Lookups ─────────────────────────────────────────────────────────

	/**
	 * Yields { version, date } for every patch of a game.
	 * Reads game.versions, which by this point already contains the entries
	 * created by autoPopulatePatchesForYear, so auto-interval patches are included.
	 */
	*patchDates(game) {
		for (const version of game.versions ?? []) {
			const patch = version.dates?.find(d => d.type === "patch");
			if (!patch) continue;
			yield {
				version: version.version,
				date: new Date(CURRENT_YEAR, MONTH_INDEX[patch.month], patch.day)
			};
		}
	}

	/**
	 * Days from today until one game's next patch.
	 * Returns { version, date, days } or null if no patch remains this year.
	 */
	getNextPatchForGame(shorthand) {
		const game = this.globalData.find(g => g.shorthand === shorthand);
		if (!game) return null;

		let best = null;
		for (const patch of this.patchDates(game)) {
			if (patch.date <= this.today) continue;
			if (best && patch.date >= best.date) continue;
			best = patch;
		}
		if (!best) return null;

		return { ...best, days: CalendarManager.daysBetween(this.today, best.date) };
	}

	/**
	 * Next closest patch across all active games.
	 * Returns an array so simultaneous patches can share the same countdown.
	 */
	getNextPatchCountdown() {
		let minDays = Infinity;
		let upcoming = [];

		for (const game of this.globalData) {
			if (!this.activeGames.has(game.shorthand)) continue;

			for (const patch of this.patchDates(game)) {
				const days = CalendarManager.daysBetween(this.today, patch.date);
				if (days <= 0 || days > minDays) continue;

				if (days < minDays) {
					minDays = days;
					upcoming = [];
				}
				upcoming.push({ shorthand: game.shorthand.toUpperCase(), version: patch.version, days });
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
				const label = `${game.shorthand.toUpperCase()} ${this.capitalize(date.type)} v${vNum}`;
				events.push(this.buildEvent(label, dateObj, game.shorthand, date, version));
			}
		}
	}

	collectHolidayEvents(game, dateObj, events) {
		const month = dateObj.getMonth();
		const day = dateObj.getDate();

		for (const date of game.dates) {
			if (!this.isDateMatch(date, month, day)) continue;
			const d = date.type ? date : { ...date, type: "holiday" };
			events.push(this.buildEvent(date.name, dateObj, "holiday", d, {}));
		}
	}

	isDateMatch(date, month, day) {
		return MONTH_INDEX[date.month] === month && date.day === day;
	}

	formatVersionNumber(version) {
		// Ensure precision-safe formatting to avoid floating-point errors
		const formatted = parseFloat(version.toFixed(1));
		return Number.isInteger(formatted)
			? formatted.toFixed(1)
			: String(formatted).replace(/(\.(\d))0$/, "$1");
	}

	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	buildEvent(text, currentDate, patchType, date, version) {
		const highlightRange = version.highlightRange ?? DEFAULT_INTERVAL - 1;
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

		this.preloadGameIcons(games);

		styleEl.textContent = games
			.filter(g => g.color)
			.map(g => this.generateGameStyles(g))
			.join("\n");
	}

	// Preloads icons declared in highlight-dates.json, guarding against duplicates
	preloadGameIcons(games) {
		for (const game of games) {
			if (!game.versions || game.active === false) continue;

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
	 *   .highlight-{s}-patch                → border-radius: 0.25rem (from CSS .is-patch)
	 *   .highlight-{s}-patch-banner-one/two → from CSS [class*="banner-one/two"]
	 *   .toggle-{s}::before                 → icon background image
	 *   .highlight-holiday                  → colored text for holiday dates
	 */
	generateGameStyles({ shorthand, color, dates, versions, active }) {
		const s = shorthand.toLowerCase();

		const holidayRule = dates
			? `.highlight-holiday { color: ${color} !important; }`
			: "";

		// Only emit ::before icon rule for real games
		const iconRule = (versions && active !== false)
			? `.toggle-${s}::before { background: url("${CalendarManager.getIconPath(s)}"); }`
			: "";

		return `
		.toggle-${s},
		.highlight-${s}-livestream,
		.highlight-${s}-patch {
			background: ${color};
		}
		.highlight-${s}-patch-banner-one,
		.highlight-${s}-patch-banner-two {
			background: ${color} !important;
		}
		${iconRule}
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
		this.toggle.innerHTML = "";

		const fragment = document.createDocumentFragment();
		for (const game of games) {
			const btn = this.createToggleButton(game);
			if (btn) fragment.appendChild(btn);
		}
		this.toggle.appendChild(fragment);
	}

	createToggleButton(game) {
		// Games with active:false or no versions are fully skipped (e.g. Template entry in JSON)
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
		btn.className = `toggle-${game.shorthand.toLowerCase()}`;
		btn.dataset.game = game.shorthand;
		btn.setAttribute("aria-label", `Toggle ${game.game} events`);

		if (!isActive) {
			btn.classList.add("inactive");
		} else {
			this.activeGames.add(game.shorthand);
		}

		// Corner badge counting down to this game's next patch
		const badge = document.createElement("span");
		badge.className = "toggle-badge";
		badge.setAttribute("aria-hidden", "true");
		btn.appendChild(badge);
		// this.updateToggleBadge(btn, game.shorthand);

		return btn;
	}

	/**
	 * Writes the countdown into one button's badge.
	 * Badge is emptied and given .is-empty when the game has no upcoming patch,
	 * so CSS controls whether it shows without the JS needing to change.
	 */
	updateToggleBadge(btn, shorthand) {
		const badge = btn.querySelector(".toggle-badge");
		if (!badge) return;

		const next = this.getNextPatchForGame(shorthand);
		if (!next) {
			badge.textContent = "";
			badge.removeAttribute("title");
			badge.classList.add("is-empty");
			return;
		}

		// badge.textContent = `v${this.formatVersionNumber(next.version)} ${next.days}d`;
		badge.textContent = `${next.days}d`;
		badge.classList.remove("is-empty");
		badge.title = `v${this.formatVersionNumber(next.version)} in ${CalendarManager.pluralDays(next.days)}`;
	}

	updateAllToggleBadges() {
		this.toggle.querySelectorAll("button[data-game]").forEach(btn => {
			this.updateToggleBadge(btn, btn.dataset.game);
		});
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
		// Built via getClassName so the banner suffixes match what hover actually adds
		const classes = [
			CalendarManager.getClassName(shorthand, "livestream"),
			CalendarManager.getClassName(shorthand, "patch"),
			CalendarManager.getClassName(shorthand, "patch", "-banner-one"),
			CalendarManager.getClassName(shorthand, "patch", "-banner-two")
		];

		const selector = classes.map(c => `.${c}`).join(", ");
		document.querySelectorAll(selector).forEach(el => {
			classes.forEach(cls => el.classList.remove(cls));
		});

		document.querySelectorAll(`.day.is-patch, .day.is-livestream`).forEach(el => {
			this.syncDayTypeClasses(el);
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
			.forEach(e => dayDiv.classList.add(e.className));

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

	createTooltip(lines, x, y) {
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

	// Re-centres the tooltip over its day while the pointer moves
	positionTooltipAtDay(dayDiv, pageY) {
		const tooltip = this.currentTooltip;
		if (!tooltip) return;

		const rect = dayDiv.getBoundingClientRect();
		tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
		tooltip.style.top = `${pageY - 48}px`;
	}

	removeTooltip() {
		this.currentTooltip?.remove();
		this.currentTooltip = null;
	}

	// ─── Hover Bindings ────────────────────────────────────────────────────────

	attachHoverEvents(dayDiv, events) {
		const handler = new DayEventHandler(this, dayDiv, events);
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
			const events = this.sortEventsByPriority(this.getEventsForDate(dateObj));
			// Today always gets a handler so its countdown tooltip works on bare days
			if (events.length > 0 || dateStr === this.todayStr) {
				this.attachHoverEvents(dayDiv, events);
			}
		});
	}

	// ─── Mobile ────────────────────────────────────────────────────────────────

	scrollToCurrentMonth() {
		if (!CalendarManager.isMobile()) return;

		const el = document.querySelector(`.month:nth-child(${this.today.getMonth() + 1})`);
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
		this.autoPopulatePatchesForYear(data, CURRENT_YEAR);
		return data;
	}

	// Forward-fills patch versions for the rest of the current year
	// Fills gaps between listed versions, then forward-fills to end of year
	autoPopulatePatchesForYear(games, year) {
		for (const game of games) {
			if (!game.versions?.length) continue;

			const autoInterval = game.autoInterval !== undefined
				? game.autoInterval + 1
				: DEFAULT_INTERVAL;

			const filled = [];
			for (let i = 0; i < game.versions.length; i++) {
				const curr = game.versions[i];
				filled.push(curr);

				const currPatchDate = this.getLastPatchDate(curr);
				if (!currPatchDate) continue;

				const currRange = curr.highlightRange ?? DEFAULT_INTERVAL - 1;
				const cursor = new Date(currPatchDate);
				cursor.setDate(cursor.getDate() + currRange + 1);
				let vNum = Math.round((curr.version + 0.1) * 10) / 10;

				// If a next listed version exists, stop before its patch date
				const boundary = this.getLastPatchDate(game.versions[i + 1] ?? {});

				while (cursor.getFullYear() === year) {
					if (boundary && cursor >= boundary) break;

					filled.push({
						version: vNum,
						// bannerOne intentionally omitted so buildEvent uses the default
						highlightRange: autoInterval - 1,
						dates: [{
							type: "patch",
							month: MONTHS[cursor.getMonth()],
							day: cursor.getDate()
						}]
					});
					cursor.setDate(cursor.getDate() + autoInterval);
					vNum = Math.round((vNum + 0.1) * 10) / 10;
				}
			}
			game.versions = filled;
		}
	}

	getLastPatchDate(version) {
		const patch = version?.dates?.find(d => d.type === "patch");
		if (!patch) return null;
		return new Date(CURRENT_YEAR, MONTH_INDEX[patch.month], patch.day);
	}

	renderCalendarGrid(year) {
		this.calendarEl.innerHTML = "";

		const fragment = document.createDocumentFragment();
		for (let month = 0; month < 12; month++) {
			fragment.appendChild(this.createMonthElement(month, year));
		}
		this.calendarEl.appendChild(fragment);
	}

	createMonthElement(month, year) {
		const monthDiv = document.createElement("div");
		monthDiv.className = "month";
		monthDiv.appendChild(this.createMonthHeader(month));
		monthDiv.appendChild(this.createWeekdaysRow());
		monthDiv.appendChild(this.createDaysGrid(month, year));
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

		if (dateStr === this.todayStr) dayDiv.classList.add("today");

		this.setupDayEvents(dayDiv, date);
		return dayDiv;
	}

	setupDayEvents(dayDiv, date) {
		const events = this.sortEventsByPriority(this.getEventsForDate(date));

		for (const event of events) {
			const cls = event.patchType === "holiday"
				? "highlight-holiday"
				: CalendarManager.getClassName(event.patchType, event.dateType);
			dayDiv.classList.add(cls);
		}

		this.syncDayTypeClasses(dayDiv);
		this.reorderDayClasses(dayDiv);
		this.updateSplitBackground(dayDiv);

		// One handler per day; it covers both the event tooltip and the today countdown
		if (events.length > 0 || dayDiv.classList.contains("today")) {
			this.attachHoverEvents(dayDiv, events);
		}
	}

	/**
	 * Re-orders highlight classes so patch always precedes livestream in classList.
	 * This matters because both set border-radius — the last one in the class list
	 * wins for specificity ties.
	 */
	reorderDayClasses(dayDiv) {
		const highlights = this.getHighlightClasses(dayDiv.classList);
		if (highlights.length <= 1) return;

		const sorted = this.sortByTypePriority([...highlights], cls => {
			if (cls.endsWith("-patch")) return "patch";
			if (cls.endsWith("-livestream")) return "livestream";
			return "other";
		});

		highlights.forEach(cls => dayDiv.classList.remove(cls));
		sorted.forEach(cls => dayDiv.classList.add(cls));
	}

	updatePageMetadata(year) {
		this.footerEl.textContent = year;
		document.title = `${SITE_TITLE_PREFIX} ${year}`;
		document.querySelector(`meta[name="title"]`)
			?.setAttribute("content", `${SITE_TITLE_PREFIX} ${year}`);
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
	_visibleEvents() {
		return this.events.filter(
			e => e.patchType === "holiday" || this.calendar.activeGames.has(e.patchType)
		);
	}

	/**
	 * Single method to add or remove banner-one/two classes over the highlight range.
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

	// Event labels, plus the next-patch countdown when this day is today
	_tooltipLines(visibleEvents) {
		const lines = visibleEvents.map(e => e.text);

		if (this.isToday) {
			const countdown = this.calendar.getNextPatchCountdown();
			if (countdown.length) lines.push(this.calendar.formatCountdownText(countdown));
		}
		return lines;
	}

	handleMouseEnter() {
		if (this.isHovering) return;

		const visibleEvents = this._visibleEvents();
		const lines = this._tooltipLines(visibleEvents);
		if (lines.length === 0) return;

		this.isHovering = true;

		const rect = this.dayDiv.getBoundingClientRect();
		const scrollY = window.scrollY ?? window.pageYOffset;
		this.calendar.createTooltip(lines, rect.left, rect.top + scrollY);

		visibleEvents.forEach(e => this._mutateHighlightRange(e, true));
	}

	handleMouseMove(e) {
		this.calendar.positionTooltipAtDay(this.dayDiv, e.pageY);
	}

	handleMouseLeave() {
		if (!this.isHovering) return;

		this.isHovering = false;
		this.calendar.removeTooltip();
		// Clear banner ranges for all visible patch events
		this._visibleEvents().forEach(e => this._mutateHighlightRange(e, false));
	}
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const calendarManager = new CalendarManager();

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => calendarManager.renderCalendar(CURRENT_YEAR));
} else {
	calendarManager.renderCalendar(CURRENT_YEAR);
}
