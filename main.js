(function () {
  try {
    const intro = document.getElementById("intro");
    const particlesHost = document.getElementById("particles");
    const memoryStage = document.getElementById("memory-stage");
    const yearCounter = document.getElementById("year-counter");
    const startupHud = document.getElementById("startup-hud");
    const startupCountdown = document.getElementById("startup-countdown");
    const particleCount = 44;
    const optimizedMemoryFrames = Object.values(
      import.meta.glob("/assets/images-optimized/**/*.{jpg,jpeg,JPG,JPEG}", {
        eager: true,
        import: "default",
      }),
    );
    const fallbackMemoryFrames = Object.values(
      import.meta.glob("/assets/images/*.{jpg,jpeg,JPG,JPEG,png,webp,avif,gif}", {
        eager: true,
        import: "default",
      }),
    );
    const memoryFrames =
      optimizedMemoryFrames.length > 0 ? optimizedMemoryFrames : fallbackMemoryFrames;
    const fadeDurationMs = 900;
    const memoryChangeMs = 520;
    const memoryLifeMs = 2000;
    const initialBurstCount = 3;
    const startupDurationMs = 3000;
    const countdownStepMs = 900;
    let memoryIndex = 0;
    let memoryTimerId = 0;
    let didFinishIntro = false;
    const startYear = 2026;
    const endYear = 1956;
    const memoryPhaseDurationMs =
      memoryFrames.length > 0
        ? Math.max(
            4200,
            Math.max(memoryFrames.length - initialBurstCount, 0) * memoryChangeMs +
              memoryLifeMs +
              700,
          )
        : 3200;
    const introDurationMs = startupDurationMs + memoryPhaseDurationMs;

    function randomYearBetween(minYear, maxYear) {
      return Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    }

    function finishIntro() {
      if (didFinishIntro) return;
      didFinishIntro = true;
      window.clearInterval(memoryTimerId);
      yearCounter.textContent = String(endYear);
      intro.classList.add("done");
      document.body.classList.add("show-ticket");

      window.setTimeout(() => {
        intro.remove();
      }, fadeDurationMs + 50);
    }

    function showNextMemoryFrame() {
      if (memoryFrames.length === 0) return false;
      if (memoryIndex >= memoryFrames.length) return false;
      const memoryImage = document.createElement("img");
      const direction = memoryIndex % 2 === 0 ? "up" : "down";
      memoryImage.className = "memory-image memory-float " + direction;
      memoryImage.src = memoryFrames[memoryIndex];
      memoryImage.alt = "Memory flash during time travel";
      memoryImage.decoding = "async";
      memoryImage.style.setProperty("--life-ms", memoryLifeMs + "ms");
      memoryImage.style.setProperty("--start-x", (Math.random() * 14 - 7).toFixed(2) + "vmin");
      memoryImage.style.setProperty("--start-y", (Math.random() * 14 - 7).toFixed(2) + "vmin");
      memoryImage.style.setProperty("--start-rot", (Math.random() * 10 - 5).toFixed(2) + "deg");
      memoryStage.appendChild(memoryImage);
      window.setTimeout(() => {
        memoryImage.remove();
      }, memoryLifeMs + 120);

      const isLastFrame = memoryIndex === memoryFrames.length - 1;
      yearCounter.textContent = isLastFrame
        ? String(endYear)
        : String(randomYearBetween(endYear + 1, startYear));

      memoryIndex += 1;
      return true;
    }

    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      const angle = Math.random() * Math.PI * 2;
      const distance = 58 + Math.random() * 135;
      const tx = Math.cos(angle) * distance + "vmin";
      const ty = Math.sin(angle) * distance + "vmin";
      particle.style.setProperty("--tx", tx);
      particle.style.setProperty("--ty", ty);
      particle.style.animationDelay = (Math.random() * 1.4).toFixed(2) + "s";
      particle.style.opacity = (0.65 + Math.random() * 0.35).toFixed(2);
      particlesHost.appendChild(particle);
    }

    yearCounter.textContent = String(startYear);

    window.setTimeout(() => {
      startupCountdown.textContent = "2";
    }, countdownStepMs);
    window.setTimeout(() => {
      startupCountdown.textContent = "1";
    }, countdownStepMs * 2);
    window.setTimeout(() => {
      startupHud.remove();
      intro.classList.add("play-memories");

      for (let i = 0; i < Math.min(initialBurstCount, memoryFrames.length); i += 1) {
        window.setTimeout(showNextMemoryFrame, i * 120);
      }

      memoryTimerId = window.setInterval(() => {
        const didShowFrame = showNextMemoryFrame();
        if (!didShowFrame) {
          window.clearInterval(memoryTimerId);
          window.setTimeout(finishIntro, memoryLifeMs + 160);
        }
      }, memoryChangeMs);

      if (memoryFrames.length === 0) {
        window.setTimeout(finishIntro, 900);
      }
    }, startupDurationMs);

    window.setTimeout(() => {
      finishIntro();
    }, introDurationMs);
  } catch (error) {
    console.error("Intro startup failed", error);
  }
})();
