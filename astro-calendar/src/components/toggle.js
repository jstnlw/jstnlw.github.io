export function initializeToggles() {
    const toggles = document.querySelectorAll(".toggle-container input[type='checkbox']");
  
    toggles.forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const className = toggle.id.replace("toggle-", "");
        document
          .querySelectorAll(`.${className}`)
          .forEach((day) => day.classList.toggle("hidden", !toggle.checked));
      });
    });
  }
  