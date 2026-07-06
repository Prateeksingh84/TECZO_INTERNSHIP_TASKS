import "./customerChatbot.js";

import {
  insertLead,
  getRealtimeMode,
  trackEvent
} from "./services/realtimeService.js";

document.addEventListener("DOMContentLoaded", () => {
  makeContentVisibleImmediately();
  initNavigation();
  initProgress();
  initRevealAnimations();
  initTerminal();
  initCounters();
  initServiceCards();
  initTestimonials();
  initLeadForms();
  initAnalyticsHooks();
  updateRealtimeBadge();
});

function makeContentVisibleImmediately() {
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("in-view");
  });
}

function initNavigation() {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");

  window.addEventListener(
    "scroll",
    () => {
      if (header) {
        header.classList.toggle("scrolled", window.scrollY > 24);
      }
    },
    { passive: true }
  );

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");

    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initProgress() {
  const bar = document.getElementById("progressBar");
  const floatCta = document.getElementById("floatCta");

  const update = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? (window.scrollY / height) * 100 : 0;

    if (bar) {
      bar.style.width = `${pct}%`;
    }

    if (floatCta) {
      floatCta.classList.toggle("show", window.scrollY > 700);
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;

        setTimeout(() => {
          entry.target.classList.add("in-view");
        }, index * 50);

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    }
  );

  elements.forEach((el) => observer.observe(el));
}

function initTerminal() {
  const typed = document.getElementById("typedText");
  const phases = document.querySelectorAll(".phase");

  if (!typed) return;

  const messages = [
    "diagnosing UX friction...",
    "building service pages...",
    "saving leads to Supabase...",
    "shipping realtime dashboard...",
    "optimizing SEO signals..."
  ];

  let phaseIndex = 0;
  let started = false;

  const type = (message, done) => {
    let i = 0;
    typed.textContent = "";

    const timer = setInterval(() => {
      typed.textContent += message.charAt(i);
      i += 1;

      if (i >= message.length) {
        clearInterval(timer);
        setTimeout(done, 700);
      }
    }, 34);
  };

  const erase = (done) => {
    const timer = setInterval(() => {
      typed.textContent = typed.textContent.slice(0, -1);

      if (!typed.textContent.length) {
        clearInterval(timer);
        done();
      }
    }, 15);
  };

  const cycle = () => {
    phases.forEach((phase) => phase.classList.remove("active"));

    const current = phases[phaseIndex];

    if (current) {
      current.classList.add("active");
    }

    type(messages[phaseIndex], () => {
      if (current) {
        current.classList.remove("active");
      }

      erase(() => {
        phaseIndex = (phaseIndex + 1) % messages.length;
        cycle();
      });
    });
  };

  const terminal = document.querySelector(".terminal");

  if (!terminal) {
    cycle();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !started) {
        started = true;
        cycle();
        observer.disconnect();
      }
    },
    { threshold: 0.25 }
  );

  observer.observe(terminal);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-count]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = Number(entry.target.dataset.count || 0);
        const start = performance.now();
        const duration = 1300;

        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);

          entry.target.textContent = Math.round(target * eased);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initServiceCards() {
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;

      if (window.matchMedia("(hover: none)").matches) {
        card.classList.toggle("flipped");
      }
    });
  });
}

function initTestimonials() {
  const track = document.getElementById("testimonialTrack");
  const button = document.getElementById("toggleMotion");

  if (!track || !button) return;

  button.addEventListener("click", () => {
    const moving = track.dataset.moving !== "false";

    track.dataset.moving = moving ? "false" : "true";
    button.setAttribute("aria-pressed", String(moving));

    button.textContent = moving
      ? "Resume testimonial motion"
      : "Pause testimonial motion";

    safeTrackEvent("testimonial_motion_toggle", {
      paused: moving
    });
  });
}

function initLeadForms() {
  document.querySelectorAll(".lead-form").forEach((form) => {
    let started = false;

    form.addEventListener("input", () => {
      if (!started) {
        started = true;

        safeTrackEvent("form_start", {
          form_id: form.id || "lead-form"
        });
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector(".form-status");

      const oldText = button ? button.textContent : "Submit";

      if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
      }

      if (status) {
        status.textContent = "";
      }

      const formData = new FormData(form);
      const lead = Object.fromEntries(formData.entries());

      lead.consent = formData.get("consent") === "on";
      lead.source = form.dataset.source || "website-form";
      lead.service = lead.service_interest || lead.service || "General Enquiry";

      try {
        await insertLead(lead);

        await safeTrackEvent("generate_lead", {
          source: lead.source,
          service: lead.service_interest || "general"
        });

        form.reset();

        if (status) {
          status.textContent =
            "Success. Your enquiry has been submitted. We usually respond within 1 business day.";
        }
      } catch (error) {
        console.error(error);

        if (status) {
          status.textContent =
            error.message || "Something went wrong. Please try again.";
        }
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = oldText;
        }
      }
    });
  });
}

function initAnalyticsHooks() {
  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      safeTrackEvent(element.dataset.track, {
        label: element.textContent.trim(),
        href: element.getAttribute("href") || ""
      });
    });
  });

  let scrollTracked = false;

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTracked) return;

      const progress =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight;

      if (progress >= 0.75) {
        scrollTracked = true;
        safeTrackEvent("scroll_75");
      }
    },
    { passive: true }
  );
}

function updateRealtimeBadge() {
  const badge = document.getElementById("realtimeMode");

  if (!badge) return;

  badge.textContent =
    getRealtimeMode() === "supabase"
      ? "Live Database Mode: Supabase realtime connected"
      : "Live Demo Mode: local realtime active";
}

async function safeTrackEvent(eventName, payload = {}) {
  try {
    if (typeof trackEvent === "function") {
      await trackEvent(eventName, payload);
    }

    if (window.gtag) {
      window.gtag("event", eventName, payload);
    }
  } catch (error) {
    console.warn("Tracking failed:", error);
  }
}