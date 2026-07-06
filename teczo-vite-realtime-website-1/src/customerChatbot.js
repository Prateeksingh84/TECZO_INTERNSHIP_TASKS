import { insertLead } from "./services/realtimeService.js";

document.addEventListener("DOMContentLoaded", () => {
  const chatbot = document.createElement("div");

  chatbot.className = "customer-chatbot";

  chatbot.innerHTML = `
    <button class="customer-chatbot-toggle" id="customerChatbotToggle" aria-label="Open enquiry assistant">
      <span>💬</span>
    </button>

    <div class="customer-chatbot-panel" id="customerChatbotPanel">

      <div class="customer-chatbot-header">
        <div>
          <strong>Teczo Enquiry Assistant</strong>
          <p>Online · Usually replies instantly</p>
        </div>

        <button id="customerChatbotClose" aria-label="Close chatbot">
          ×
        </button>
      </div>

      <div class="customer-chatbot-body" id="customerChatbotMessages">
        <div class="bot-bubble">
          Hi! Welcome to Teczo Softwares 👋
          <br><br>
          I can help you with services, pricing, timeline, AI automation, websites, dashboards, and project enquiries.
        </div>
      </div>

      <div class="customer-chatbot-quick">
        <button data-question="services">Services</button>
        <button data-question="pricing">Pricing</button>
        <button data-question="timeline">Timeline</button>
        <button data-question="ai automation">AI Automation</button>
        <button data-question="project enquiry">Project Enquiry</button>
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

    </div>
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
      await handleCustomerMessage(question);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
      return;
    }

    input.value = "";

    await handleCustomerMessage(text);
  });

  async function handleCustomerMessage(text) {
    addMessage(text, "user");

    if (enquiryMode) {
      await handleEnquiryFlow(text);
      return;
    }

    const reply = getAssistantReply(text);

    setTimeout(() => {
      addMessage(reply.message, "bot");

      if (reply.startEnquiry) {
        startEnquiryFlow();
      }
    }, 450);
  }

  function getAssistantReply(text) {
    const message = text.toLowerCase();

    if (
      message.includes("service") ||
      message.includes("what do you do") ||
      message.includes("work") ||
      message === "services"
    ) {
      return {
        message:
          "Teczo Softwares provides SaaS product development, business websites, AI automation, e-commerce engineering, dashboards, CRM integrations, and ongoing support.",
        startEnquiry: false
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
          "Pricing depends on the project scope. A website, SaaS platform, AI automation system, dashboard, or e-commerce product will have different pricing. I can collect your requirement and send it to our team.",
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
          "A simple business website can take around 1–2 weeks. A SaaS product, dashboard, or AI automation system may take 3–8 weeks depending on features. I can collect your requirement now.",
        startEnquiry: true
      };
    }

    if (
      message.includes("ai") ||
      message.includes("automation") ||
      message.includes("chatbot") ||
      message.includes("gpt") ||
      message.includes("workflow")
    ) {
      return {
        message:
          "Yes, Teczo can help with AI chatbots, workflow automation, CRM automation, OCR, AI dashboards, and GPT-powered tools. I can collect your project requirement.",
        startEnquiry: true
      };
    }

    if (
      message.includes("website") ||
      message.includes("landing page") ||
      message.includes("frontend") ||
      message.includes("web app")
    ) {
      return {
        message:
          "Yes, Teczo builds responsive websites, landing pages, web apps, admin dashboards, and business platforms. I can collect your enquiry and send it to the team.",
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
        "I can help you with Teczo services, pricing, project timeline, AI automation, websites, dashboards, and project enquiry. Would you like to submit an enquiry?",
      startEnquiry: false
    };
  }

  function startEnquiryFlow() {
    enquiryMode = true;
    enquiryStep = 1;

    setTimeout(() => {
      addMessage("Please share your full name.", "bot");
    }, 500);
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
        "Which service are you interested in? Example: Website, SaaS, AI Automation, Dashboard, E-commerce, Mobile App.",
        "bot"
      );
      return;
    }

    if (enquiryStep === 5) {
      enquiryData.service = text;
      enquiryStep = 6;

      addMessage("Please describe your project requirement in 1–2 lines.", "bot");
      return;
    }

    if (enquiryStep === 6) {
      enquiryData.message = text;

      const finalMessage = `
[Website Chatbot Enquiry]

Service Interested: ${enquiryData.service}
Phone: ${enquiryData.phone || "Not shared"}

Requirement:
${enquiryData.message}
      `.trim();

      try {
        await insertLead({
          name: enquiryData.name,
          email: enquiryData.email,
          company: enquiryData.company,
          message: finalMessage
        });

        addMessage(
          "Thank you! Your enquiry has been submitted successfully. Our team will review it and contact you soon.",
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

  function resetEnquiryFlow() {
    enquiryMode = false;
    enquiryStep = 0;

    enquiryData.name = "";
    enquiryData.email = "";
    enquiryData.company = "";
    enquiryData.phone = "";
    enquiryData.service = "";
    enquiryData.message = "";
  }

  function addMessage(text, type) {
    const bubble = document.createElement("div");

    bubble.className = type === "user" ? "user-bubble" : "bot-bubble";
    bubble.textContent = text;

    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
});