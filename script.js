(() => {
  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const supportsObserver = "IntersectionObserver" in window;

  if (supportsObserver && !reducedMotion.matches) {
    root.classList.add("motion-ready");
    const revealItems = [...document.querySelectorAll(".reveal")];
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.addEventListener(
            "transitionend",
            () => entry.target.style.setProperty("will-change", "auto"),
            { once: true },
          );
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );

    revealItems.forEach((item) => {
      const siblings = [...(item.parentElement?.children ?? [])].filter((child) =>
        child.classList.contains("reveal"),
      );
      const siblingIndex = Math.max(0, siblings.indexOf(item));
      item.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 2) * 60}ms`);
      revealObserver.observe(item);
    });

    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => heroVisual.classList.toggle("is-in-view", entry.isIntersecting),
        { rootMargin: "120px 0px" },
      );
      heroObserver.observe(heroVisual);
    }
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

  systemTheme.addEventListener?.("change", (event) => {
    let hasSavedTheme = false;
    try {
      const savedTheme = localStorage.getItem("specula-theme");
      hasSavedTheme = savedTheme === "light" || savedTheme === "dark";
    } catch (_) {}

    if (hasSavedTheme) return;
    root.dataset.theme = event.matches ? "dark" : "light";
    updateThemeControls();
  });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("specula-theme", nextTheme);
    } catch (_) {}
    updateThemeControls();
  });

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

  const builder = document.querySelector("[data-command-builder]");
  if (builder) {
    const modeButtons = [...builder.querySelectorAll("[data-builder-mode]")];
    const agentButtons = [...builder.querySelectorAll("[data-builder-agent]")];
    const sourceButtons = [...builder.querySelectorAll("[data-builder-source]")];
    const runConfigRows = [...builder.querySelectorAll("[data-run-config]")];
    const command = builder.querySelector("[data-generated-command]");
    const sourceHelp = builder.querySelector("[data-source-help]");
    let mode = "install";
    let agent = "claude-code";
    let source = "working";

    const selectButton = (buttons, selected) => {
      buttons.forEach((button) => {
        const value =
          button.dataset.builderMode ??
          button.dataset.builderAgent ??
          button.dataset.builderSource;
        button.setAttribute("aria-pressed", String(value === selected));
      });
    };

    const renderCommand = () => {
      const isRun = mode === "run";
      runConfigRows.forEach((row) => {
        row.hidden = !isRun;
      });

      if (!isRun) {
        command.textContent = [
          "git clone https://github.com/specula-org/Specula.git",
          "cd Specula",
          "uv tool install -e .",
          "specula setup",
        ].join("\n");
        return;
      }

      const options = [];
      if (agent !== "claude-code") options.push(`--agent=${agent}`);
      if (source === "keep") options.push("--keep-original");
      options.push("--artifact=/path/to/repo");
      command.textContent = [
        "specula run mysys \\",
        ...options.map(
          (option, index) =>
            `  ${option}${index === options.length - 1 ? "" : " \\"}`,
        ),
      ].join("\n");
      sourceHelp.textContent =
        source === "keep"
          ? "Keeps the original repository untouched and saves changes to changes.patch."
          : "Specula works in the selected repository and may modify its files.";
    };

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.builderMode;
        selectButton(modeButtons, mode);
        renderCommand();
      });
    });

    agentButtons.forEach((button) => {
      button.addEventListener("click", () => {
        agent = button.dataset.builderAgent;
        selectButton(agentButtons, agent);
        renderCommand();
      });
    });

    sourceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        source = button.dataset.builderSource;
        selectButton(sourceButtons, source);
        renderCommand();
      });
    });

    renderCommand();
  }

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
