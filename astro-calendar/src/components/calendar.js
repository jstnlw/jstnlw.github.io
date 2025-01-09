import highlightData from "../assets/highlight-dates.json";

export function generateCalendar(year = 2025, selectedGame = "HonkaiStarRail") {
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];
  const months = [];

  const game = highlightData.find((g) => g.game === selectedGame);
  if (!game) {
    console.error(`Game ${selectedGame} not found.`);
    return { daysOfWeek, months: [] };
  }

  const highlights = [];
  game.versions.forEach((version) => {
    version.dates.forEach((date) => {
      const monthIndex = getMonthIndex(date.month);
      highlights.push({
        type: `${selectedGame.toLowerCase()}-${date.type}`, // Add game-type classes
        month: monthIndex,
        day: date.day,
      });
    });
  });

  // Build calendar for each month
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Adjust so Monday starts the week
    let startDay = firstDay === 0 ? 6 : firstDay - 1;

    const monthData = {
      name: getMonthName(month),
      weeks: [],
      highlights: highlights.filter((h) => h.month === month), // Filter highlights for the month
    };

    let week = new Array(7).fill(null);
    let dayCounter = 1;

    // Fill the calendar weeks
    for (let i = 0; i < startDay; i++) {
      week[i] = null;
    }

    while (dayCounter <= daysInMonth) {
      for (let i = startDay; i < 7; i++) {
        if (dayCounter > daysInMonth) break;

        week[i] = dayCounter++;
      }
      monthData.weeks.push([...week]);
      week = new Array(7).fill(null);
      startDay = 0;
    }

    months.push(monthData);
  }

  return { daysOfWeek, months };
}

function getMonthIndex(monthName) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months.indexOf(monthName);
}

function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
}
