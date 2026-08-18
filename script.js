(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const updateThemeControls = () => {
    const isLight = root.dataset.theme === "light";
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight ? "Switch to dark mode" : "Switch to light mode",
    );
    themeColor?.setAttribute("content", isLight ? "#f6f9fb" : "#050d16");
  };

  updateThemeControls();

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("specula-theme", nextTheme);
    } catch (_) {}
    updateThemeControls();
  });

  const tabs = [...document.querySelectorAll("[data-command-tab]")];
  const panels = [...document.querySelectorAll("[data-command-panel]")];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.commandTab;
      tabs.forEach((item) => {
        item.setAttribute("aria-selected", String(item === tab));
        item.tabIndex = item === tab ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.commandPanel !== selected;
      });
    });

    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (tabs.indexOf(tab) + direction + tabs.length) % tabs.length;
      tabs[nextIndex].click();
      tabs[nextIndex].focus();
    });
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const previous = button.innerHTML;
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? "");
        button.textContent = "Copied ✓";
      } catch (_) {
        button.textContent = "Copy failed";
      }
      window.setTimeout(() => {
        button.innerHTML = previous;
      }, 1600);
    });
  });
})();
