import "./styles/style.css";
import "./customerChatbot.js";

import {
  insertLead,
  getRealtimeMode
} from "./services/realtimeService.js";

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const floatCta = document.getElementById("floatCta");

  function onScroll() {
    const scrollTop = window.scrollY;

    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (header) {
      header.classList.toggle("scrolled", scrollTop > 40);
    }

    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }

    if (floatCta) {
      floatCta.classList.toggle("show", scrollTop > 600);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      navToggle.classList.toggle("open", isOpen);

      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("in-view");
          }, index * 60);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  const typedEl = document.getElementById("typedText");
  const phases = document.querySelectorAll(".phase");

  const phaseMessages = [
    "validating idea...",
    "architecting system...",
    "building product...",
    "shipping to production...",
    "scaling infrastructure..."
  ];

  let phaseIndex = 0;
  let terminalStarted = false;

  function typeMessage(message, onDone) {
    if (!typedEl) {
      return;
    }

    let index = 0;

    typedEl.textContent = "";

    const interval = setInterval(() => {
      typedEl.textContent += message.charAt(index);

      index += 1;

      if (index >= message.length) {
        clearInterval(interval);

        setTimeout(onDone, 900);
      }
    }, 38);
  }

  function eraseMessage(onDone) {
    if (!typedEl) {
      return;
    }

    const interval = setInterval(() => {
      const text = typedEl.textContent;

      typedEl.textContent = text.slice(0, -1);

      if (text.length <= 1) {
        clearInterval(interval);

        onDone();
      }
    }, 18);
  }

  function runPhaseCycle() {
    phases.forEach((phase) => phase.classList.remove("active"));

    const current = phases[phaseIndex];

    if (current) {
      current.classList.add("active");
    }

    typeMessage(phaseMessages[phaseIndex], () => {
      if (current) {
        current.classList.remove("active");
        current.classList.add("done");
      }

      eraseMessage(() => {
        phaseIndex += 1;

        if (phaseIndex >= phaseMessages.length) {
          phaseIndex = 0;

          phases.forEach((phase) => phase.classList.remove("done"));
        }

        runPhaseCycle();
      });
    });
  }

  const terminal = document.querySelector(".terminal");

  if (terminal) {
    const termObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !terminalStarted) {
            terminalStarted = true;

            runPhaseCycle();

            termObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    termObserver.observe(terminal);
  }

  const counters = document.querySelectorAll(".counter, .perk-stat");

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          const target =
            parseInt(
              el.dataset.count || el.dataset.target || el.textContent,
              10
            ) || 0;

          const duration = 1400;
          const startTime = performance.now();

          function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);

            const eased = 1 - Math.pow(1 - progress, 3);

            el.textContent = Math.round(eased * target);

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }

          requestAnimationFrame(step);

          counterObserver.unobserve(el);
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Service card touch flip support ---------- */
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (window.matchMedia("(hover: none)").matches) {
        card.classList.toggle("flipped");
      }
    });
  });

  const modeBadge = document.getElementById("realtimeMode");

  if (modeBadge) {
    modeBadge.textContent =
      getRealtimeMode() === "supabase"
        ? "Live Database Mode: Supabase connected"
        : "Live Demo Mode: local real-time active";
  }

  const form = document.getElementById("contactForm");
  const successMsg = document.getElementById("formSuccess");

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitBtn = form.querySelector(".btn-submit");
      const btnText = submitBtn.querySelector(".btn-text");

      const originalText = btnText
        ? btnText.textContent
        : "Submit Request";

      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      if (btnText) {
        btnText.textContent = "Saving...";
      }

      if (successMsg) {
        successMsg.classList.remove("show");
      }

      const lead = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        company: document.getElementById("company").value,
        message: document.getElementById("message").value
      };

      try {
        await insertLead(lead);

        if (successMsg) {
          successMsg.textContent =
            getRealtimeMode() === "supabase"
              ? "Success — your message was saved to Supabase database."
              : "Success — saved in local real-time demo mode. Open admin.html to see it instantly.";

          successMsg.classList.add("show");
        }

        form.reset();

        form
          .querySelectorAll(".field input, .field textarea")
          .forEach((field) => field.blur());

      } catch (error) {
        console.error("Lead submission failed:", error);

        if (successMsg) {
          successMsg.textContent =
            error.message || "Something went wrong. Please try again.";

          successMsg.classList.add("show");
        }
      } finally {
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;

        if (btnText) {
          btnText.textContent = originalText;
        }
      }
    });
  }

  const marquee = document.getElementById("marquee");

  if (marquee) {
    let touchTimer;

    marquee.addEventListener(
      "touchstart",
      () => {
        marquee.style.animationPlayState = "paused";
      },
      {
        passive: true
      }
    );

    marquee.addEventListener(
      "touchend",
      () => {
        clearTimeout(touchTimer);

        touchTimer = setTimeout(() => {
          marquee.style.animationPlayState = "running";
        }, 1500);
      },
      {
        passive: true
      }
    );
  }
});