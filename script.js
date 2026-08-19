(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    root.classList.add("motion-ready");
    const revealItems = [...document.querySelectorAll(".reveal")];
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
      revealObserver.observe(item);
    });
  }

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

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    if (!copied) throw new Error("Copy unavailable");
  };

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
        await copyText(button.dataset.copy ?? "");
        button.textContent = "Copied ✓";
      } catch (_) {
        button.textContent = "Copy failed";
      }
      window.setTimeout(() => {
        button.innerHTML = previous;
      }, 1600);
    });
  });

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const previous = button.innerHTML;
      const source = document.querySelector(button.dataset.copyTarget ?? "");
      try {
        await copyText(source?.textContent?.trim() ?? "");
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
