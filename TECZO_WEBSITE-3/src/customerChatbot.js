import { insertLead } from "./services/realtimeService.js";

document.addEventListener("DOMContentLoaded", () => {
  createCustomerAIBot();
});

function createCustomerAIBot() {
  if (document.querySelector(".customer-chatbot")) {
    return;
  }

  const chatbot = document.createElement("div");

  chatbot.className = "customer-chatbot";

  chatbot.innerHTML = `
    <button
      class="customer-chatbot-toggle"
      id="customerChatbotToggle"
      aria-label="Open Teczo AI Assistant"
    >
      <span class="bot-icon">✦</span>
      <span class="bot-label">AI Assistant</span>
    </button>

    <section
      class="customer-chatbot-panel"
      id="customerChatbotPanel"
      aria-label="Teczo AI enquiry assistant"
    >
      <header class="customer-chatbot-header">
        <div>
          <strong>Teczo AI Assistant</strong>
          <p>Online · Ask about services, pricing, timeline or project enquiry</p>
        </div>

        <button
          type="button"
          id="customerChatbotClose"
          aria-label="Close assistant"
        >
          ×
        </button>
      </header>

      <div class="customer-chatbot-body" id="customerChatbotMessages">
        <div class="bot-bubble">
Hi! Welcome to Teczo Softwares 👋

I can help you with:
• AI Automation
• SaaS Product Development
• Custom Software
• E-commerce Engineering
• CRM Workflow Automation
• Website Development
• Project enquiry
        </div>
      </div>

      <div class="customer-chatbot-quick">
        <button type="button" data-question="services">Services</button>
        <button type="button" data-question="pricing">Pricing</button>
        <button type="button" data-question="timeline">Timeline</button>
        <button type="button" data-question="ai automation">AI Automation</button>
        <button type="button" data-question="project enquiry">Project Enquiry</button>
      </div>

      <form class="customer-chatbot-form" id="customerChatbotForm">
        <input
          type="text"
          id="customerChatbotInput"
          placeholder="Type your message..."
          autocomplete="off"
        />

        <button type="submit">
          Send
        </button>
      </form>
    </section>
  `;

  document.body.appendChild(chatbot);

  const toggleBtn = document.getElementById("customerChatbotToggle");
  const closeBtn = document.getElementById("customerChatbotClose");
  const panel = document.getElementById("customerChatbotPanel");
  const messages = document.getElementById("customerChatbotMessages");
  const form = document.getElementById("customerChatbotForm");
  const input = document.getElementById("customerChatbotInput");
  const quickButtons = document.querySelectorAll(".customer-chatbot-quick button");

  let enquiryMode = false;
  let enquiryStep = 0;

  const enquiryData = {
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    budget: "",
    timeline: "",
    message: ""
  };

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.remove("open");
  });

  quickButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const question = button.dataset.question;
      await handleUserMessage(question);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
      return;
    }

    input.value = "";

    await handleUserMessage(text);
  });

  async function handleUserMessage(text) {
    addMessage(text, "user");

    if (enquiryMode) {
      await handleEnquiryFlow(text);
      return;
    }

    const reply = getBotReply(text);

    setTimeout(() => {
      addMessage(reply.message, "bot");

      if (reply.startEnquiry) {
        startEnquiryFlow();
      }
    }, 350);
  }

  function getBotReply(text) {
    const message = String(text).toLowerCase();

    if (
      message.includes("service") ||
      message.includes("what do you do") ||
      message.includes("work") ||
      message === "services"
    ) {
      return {
        message:
          "Teczo Softwares provides AI automation, SaaS product development, custom software development, e-commerce engineering, CRM workflow automation, business websites, dashboards and integrations.",
        startEnquiry: false
      };
    }

    if (
      message.includes("ai") ||
      message.includes("automation") ||
      message.includes("chatbot") ||
      message.includes("gpt") ||
      message.includes("workflow") ||
      message === "ai automation"
    ) {
      return {
        message:
          "Yes, Teczo can build AI chatbots, workflow automation, CRM automation, OCR tools, internal AI dashboards, lead routing systems and GPT-powered business tools. I can collect your requirement now.",
        startEnquiry: true
      };
    }

    if (
      message.includes("saas") ||
      message.includes("mvp") ||
      message.includes("product")
    ) {
      return {
        message:
          "Teczo can help build SaaS MVPs with authentication, database, admin dashboard, APIs, subscription-ready architecture and deployment. I can collect your SaaS requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("website") ||
      message.includes("landing page") ||
      message.includes("web app") ||
      message.includes("frontend")
    ) {
      return {
        message:
          "Teczo builds responsive business websites, landing pages, web apps, admin dashboards and SEO-ready service pages. I can collect your website requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("ecommerce") ||
      message.includes("e-commerce") ||
      message.includes("shopify") ||
      message.includes("store")
    ) {
      return {
        message:
          "Teczo can build e-commerce platforms, Shopify apps, payment integrations, product catalogs, checkout flows and automation systems. I can collect your requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("crm") ||
      message.includes("lead") ||
      message.includes("sales") ||
      message.includes("pipeline")
    ) {
      return {
        message:
          "Teczo can build CRM workflows, lead capture systems, follow-up automation, sales dashboards and reporting systems. I can collect your requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("price") ||
      message.includes("pricing") ||
      message.includes("cost") ||
      message.includes("budget") ||
      message.includes("charges")
    ) {
      return {
        message:
          "Pricing depends on project scope, timeline, number of features, design complexity, backend/database needs and integrations. I can collect your details so the team can estimate properly.",
        startEnquiry: true
      };
    }

    if (
      message.includes("time") ||
      message.includes("timeline") ||
      message.includes("duration") ||
      message.includes("how long")
    ) {
      return {
        message:
          "A simple website can take 1–2 weeks. SaaS, dashboard, AI automation or CRM systems usually take 3–8 weeks depending on features. I can collect your requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("contact") ||
      message.includes("call") ||
      message.includes("demo") ||
      message.includes("book") ||
      message.includes("enquiry") ||
      message.includes("project") ||
      message.includes("quote") ||
      message.includes("yes")
    ) {
      return {
        message:
          "Sure. I will collect a few details and send your enquiry to the Teczo team.",
        startEnquiry: true
      };
    }

    return {
      message:
        "I can help you with Teczo services, pricing, timeline, AI automation, SaaS, websites, dashboards and project enquiries. Would you like to submit an enquiry?",
      startEnquiry: false
    };
  }

  function startEnquiryFlow() {
    enquiryMode = true;
    enquiryStep = 1;

    setTimeout(() => {
      addMessage("Great. Please share your full name.", "bot");
    }, 400);
  }

  async function handleEnquiryFlow(text) {
    if (enquiryStep === 1) {
      enquiryData.name = text;
      enquiryStep = 2;

      addMessage("Thanks. Please share your email address.", "bot");
      return;
    }

    if (enquiryStep === 2) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(text)) {
        addMessage("Please enter a valid email address.", "bot");
        return;
      }

      enquiryData.email = text;
      enquiryStep = 3;

      addMessage("Please share your company name. Type NA if not applicable.", "bot");
      return;
    }

    if (enquiryStep === 3) {
      enquiryData.company = text.toLowerCase() === "na" ? "" : text;
      enquiryStep = 4;

      addMessage("Please share your phone number. Type NA if you do not want to share.", "bot");
      return;
    }

    if (enquiryStep === 4) {
      enquiryData.phone = text.toLowerCase() === "na" ? "" : text;
      enquiryStep = 5;

      addMessage(
        "Which service are you interested in? Example: AI Automation, SaaS, Website, Dashboard, CRM, E-commerce.",
        "bot"
      );
      return;
    }

    if (enquiryStep === 5) {
      enquiryData.service = text;
      enquiryStep = 6;

      addMessage("What is your expected timeline? Example: Immediate, 2 weeks, 1 month, flexible.", "bot");
      return;
    }

    if (enquiryStep === 6) {
      enquiryData.timeline = text;
      enquiryStep = 7;

      addMessage("What is your approximate budget? Type NA if not decided.", "bot");
      return;
    }

    if (enquiryStep === 7) {
      enquiryData.budget = text.toLowerCase() === "na" ? "" : text;
      enquiryStep = 8;

      addMessage("Please describe your project requirement in 1–2 lines.", "bot");
      return;
    }

    if (enquiryStep === 8) {
      enquiryData.message = text;

      const finalMessage = `
[Website Chatbot Enquiry]

Service Interested: ${enquiryData.service}
Phone: ${enquiryData.phone || "Not shared"}
Timeline: ${enquiryData.timeline || "Not shared"}
Budget: ${enquiryData.budget || "Not shared"}

Requirement:
${enquiryData.message}
      `.trim();

      try {
        await insertLead({
          name: enquiryData.name,
          email: enquiryData.email,
          phone: enquiryData.phone,
          company: enquiryData.company,
          service: enquiryData.service,
          timeline: enquiryData.timeline,
          budget: enquiryData.budget,
          message: finalMessage,
          source: "chatbot",
          status: "new",
          priority: detectPriority(enquiryData)
        });

        addMessage(
          "Thank you! Your enquiry has been submitted successfully. Teczo team will contact you soon.",
          "bot"
        );

        resetEnquiryFlow();
      } catch (error) {
        console.error(error);

        addMessage(
          error.message || "Sorry, something went wrong while submitting your enquiry. Please try again.",
          "bot"
        );
      }
    }
  }

  function detectPriority(data) {
    const combinedText = `
      ${data.service}
      ${data.timeline}
      ${data.budget}
      ${data.message}
    `.toLowerCase();

    if (
      combinedText.includes("urgent") ||
      combinedText.includes("immediate") ||
      combinedText.includes("asap") ||
      combinedText.includes("today")
    ) {
      return "urgent";
    }

    if (
      combinedText.includes("high") ||
      combinedText.includes("enterprise") ||
      combinedText.includes("saas") ||
      combinedText.includes("automation")
    ) {
      return "high";
    }

    return "medium";
  }

  function resetEnquiryFlow() {
    enquiryMode = false;
    enquiryStep = 0;

    enquiryData.name = "";
    enquiryData.email = "";
    enquiryData.company = "";
    enquiryData.phone = "";
    enquiryData.service = "";
    enquiryData.budget = "";
    enquiryData.timeline = "";
    enquiryData.message = "";
  }

  function addMessage(text, type) {
    const bubble = document.createElement("div");

    bubble.className = type === "user" ? "user-bubble" : "bot-bubble";
    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
}