import {
  signIn,
  signOut,
  getSession,
  getLeads,
  updateLeadStatus,
  updateLeadMeta,
  deleteLead,
  subscribeToLeadChanges,
  getRealtimeMode
} from "./services/realtimeService.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginPanel = document.getElementById("loginPanel");
  const dashboard = document.getElementById("dashboard");

  const loginForm = document.getElementById("loginForm");
  const loginNotice = document.getElementById("loginNotice");
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");

  const demoBox = document.getElementById("demoBox");
  const modePill = document.getElementById("modePill");

  const totalLeads = document.getElementById("totalLeads");
  const newLeads = document.getElementById("newLeads");
  const qualifiedLeads = document.getElementById("qualifiedLeads");
  const urgentLeads = document.getElementById("urgentLeads");
  const wonRate = document.getElementById("wonRate");

  const leadSearchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const sourceFilter = document.getElementById("sourceFilter");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  const leadsTable = document.getElementById("leadsTable");
  const tableWrap = document.getElementById("tableWrap");
  const emptyState = document.getElementById("emptyState");
  const toast = document.getElementById("toast");

  let leads = [];
  let filteredLeads = [];
  let unsubscribe = null;

  const isSupabase = getRealtimeMode() === "supabase";

  if (demoBox) {
    demoBox.style.display = isSupabase ? "none" : "grid";
  }

  if (modePill) {
    modePill.textContent = isSupabase
      ? "Supabase Realtime Connected"
      : "Local Demo Realtime Mode";
  }

  bootAdmin();

  async function bootAdmin() {
    try {
      const session = await getSession();

      if (session) {
        await showDashboard();
      } else {
        showLogin();
      }
    } catch (error) {
      console.error(error);
      showLogin();
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginNotice.textContent = "";

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    try {
      await signIn(email, password);
      await showDashboard();
      showToast("Admin login successful.");
    } catch (error) {
      loginNotice.textContent = error.message || "Login failed.";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut();

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      showLogin();
      showToast("Logged out successfully.");
    } catch (error) {
      showToast(error.message || "Logout failed.");
    }
  });

  refreshBtn.addEventListener("click", async () => {
    await loadLeads();
    showToast("Dashboard refreshed.");
  });

  leadSearchInput.addEventListener("input", applyFiltersAndRender);
  statusFilter.addEventListener("change", applyFiltersAndRender);
  priorityFilter.addEventListener("change", applyFiltersAndRender);
  sourceFilter.addEventListener("change", applyFiltersAndRender);
  exportCsvBtn.addEventListener("click", exportLeadsToCsv);

  window.updateLeadStatusFromSelect = async function (id, status) {
    try {
      const updatedLead = await updateLeadStatus(id, status);

      leads = leads.map((lead) =>
        lead.id === updatedLead.id ? normalizeLead(updatedLead) : lead
      );

      applyFiltersAndRender();

      showToast("Lead status updated.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Status update failed.");
    }
  };

  window.updateLeadPriorityFromSelect = async function (id, priority) {
    try {
      const updatedLead = await updateLeadMeta(id, {
        priority
      });

      leads = leads.map((lead) =>
        lead.id === updatedLead.id ? normalizeLead(updatedLead) : lead
      );

      applyFiltersAndRender();

      showToast("Lead priority updated.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Priority update failed.");
    }
  };

  window.saveLeadNoteFromTextarea = async function (id, textarea) {
    try {
      const admin_notes = textarea.value.trim();

      const updatedLead = await updateLeadMeta(id, {
        admin_notes
      });

      leads = leads.map((lead) =>
        lead.id === updatedLead.id ? normalizeLead(updatedLead) : lead
      );

      applyFiltersAndRender();

      showToast("Admin note saved.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Note save failed.");
    }
  };

  window.deleteLeadFromButton = async function (id) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const deletedLead = await deleteLead(id);

      leads = leads.filter((lead) => lead.id !== deletedLead.id);

      applyFiltersAndRender();

      showToast("Lead deleted successfully.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Delete failed.");
    }
  };

  function showLogin() {
    dashboard.classList.add("hidden");
    loginPanel.classList.remove("hidden");
  }

  async function showDashboard() {
    loginPanel.classList.add("hidden");
    dashboard.classList.remove("hidden");

    await loadLeads();

    startRealtimeListener();
  }

  async function loadLeads() {
    try {
      const data = await getLeads();

      leads = data.map(normalizeLead);

      applyFiltersAndRender();
    } catch (error) {
      console.error(error);
      showToast(error.message || "Failed to load leads.");
    }
  }

  function startRealtimeListener() {
    if (unsubscribe) {
      unsubscribe();
    }

    unsubscribe = subscribeToLeadChanges(async (payload) => {
      if (!payload) {
        return;
      }

      if (payload.eventType === "INSERT" && payload.new) {
        const incomingLead = normalizeLead(payload.new);

        const exists = leads.some((lead) => lead.id === incomingLead.id);

        if (!exists) {
          leads.unshift(incomingLead);
        }

        applyFiltersAndRender();

        showToast(`New lead received: ${incomingLead.name}`);
        return;
      }

      if (payload.eventType === "UPDATE" && payload.new) {
        const updatedLead = normalizeLead(payload.new);

        leads = leads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        );

        applyFiltersAndRender();
        return;
      }

      if (payload.eventType === "DELETE" && payload.old) {
        leads = leads.filter((lead) => lead.id !== payload.old.id);

        applyFiltersAndRender();

        showToast("A lead was deleted.");
        return;
      }

      if (payload.eventType === "REFRESH") {
        await loadLeads();
      }
    });
  }

  function normalizeLead(lead) {
    return {
      id: lead.id,
      name: lead.name || "Unknown Lead",
      email: lead.email || "",
      phone: lead.phone || "",
      company: lead.company || "",
      service:
        lead.service ||
        extractServiceFromMessage(lead.message) ||
        "General Enquiry",
      timeline: lead.timeline || "",
      budget: lead.budget || "",
      message: lead.message || "",
      status: lead.status || "new",
      priority: lead.priority || "medium",
      source: lead.source || detectSource(lead.message),
      admin_notes: lead.admin_notes || "",
      created_at: lead.created_at || new Date().toISOString()
    };
  }

  function extractServiceFromMessage(message = "") {
    const text = String(message).toLowerCase();

    if (text.includes("ai automation")) return "AI Automation";
    if (text.includes("saas")) return "SaaS Development";
    if (text.includes("e-commerce") || text.includes("shopify")) return "E-commerce";
    if (text.includes("crm")) return "CRM Automation";
    if (text.includes("website")) return "Website Development";
    if (text.includes("dashboard")) return "Dashboard";

    return "";
  }

  function detectSource(message = "") {
    const text = String(message).toLowerCase();

    if (text.includes("chatbot enquiry")) {
      return "chatbot";
    }

    return "website-form";
  }

  function applyFiltersAndRender() {
    const searchTerm = leadSearchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;
    const selectedSource = sourceFilter.value;

    filteredLeads = leads.filter((lead) => {
      const searchable = `
        ${lead.name}
        ${lead.email}
        ${lead.phone}
        ${lead.company}
        ${lead.service}
        ${lead.timeline}
        ${lead.budget}
        ${lead.message}
        ${lead.status}
        ${lead.priority}
        ${lead.source}
        ${lead.admin_notes}
      `.toLowerCase();

      const matchesSearch = searchable.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" || lead.status === selectedStatus;

      const matchesPriority =
        selectedPriority === "all" || lead.priority === selectedPriority;

      const matchesSource =
        selectedSource === "all" || lead.source === selectedSource;

      return matchesSearch && matchesStatus && matchesPriority && matchesSource;
    });

    renderStats();
    renderLeads();
  }

  function renderStats() {
    totalLeads.textContent = leads.length;

    newLeads.textContent = leads.filter(
      (lead) => lead.status === "new"
    ).length;

    qualifiedLeads.textContent = leads.filter(
      (lead) => lead.status === "qualified"
    ).length;

    urgentLeads.textContent = leads.filter(
      (lead) => lead.priority === "urgent"
    ).length;

    const closed = leads.filter((lead) => lead.status === "closed").length;

    const rate = leads.length ? Math.round((closed / leads.length) * 100) : 0;

    wonRate.textContent = `${rate}%`;
  }

  function renderLeads() {
    const hasLeads = filteredLeads.length > 0;

    emptyState.style.display = hasLeads ? "none" : "block";
    tableWrap.style.display = hasLeads ? "block" : "none";

    leadsTable.innerHTML = filteredLeads
      .map((lead) => {
        return `
          <tr>
            <td>
              <div class="lead-main">
                <strong>${escapeHtml(lead.name)}</strong>
                <span>${escapeHtml(lead.company || "No company")}</span>
              </div>
            </td>

            <td>
              <div class="contact-cell">
                <a href="mailto:${escapeHtml(lead.email)}">
                  ${escapeHtml(lead.email || "-")}
                </a>
                <span>${escapeHtml(lead.phone || "No phone")}</span>
              </div>
            </td>

            <td>
              <div class="service-cell">
                <strong>${escapeHtml(lead.service)}</strong>
                <span>${escapeHtml(lead.timeline || "Timeline not shared")}</span>
              </div>
            </td>

            <td>
              <p class="message-cell">
                ${escapeHtml(cleanMessage(lead.message))}
              </p>
            </td>

            <td>
              <select
                class="status-select status-${escapeHtml(lead.status)}"
                onchange="window.updateLeadStatusFromSelect('${lead.id}', this.value)"
              >
                <option value="new" ${lead.status === "new" ? "selected" : ""}>New</option>
                <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>Contacted</option>
                <option value="qualified" ${lead.status === "qualified" ? "selected" : ""}>Qualified</option>
                <option value="closed" ${lead.status === "closed" ? "selected" : ""}>Closed</option>
              </select>
            </td>

            <td>
              <select
                class="priority-select priority-${escapeHtml(lead.priority)}"
                onchange="window.updateLeadPriorityFromSelect('${lead.id}', this.value)"
              >
                <option value="low" ${lead.priority === "low" ? "selected" : ""}>Low</option>
                <option value="medium" ${lead.priority === "medium" ? "selected" : ""}>Medium</option>
                <option value="high" ${lead.priority === "high" ? "selected" : ""}>High</option>
                <option value="urgent" ${lead.priority === "urgent" ? "selected" : ""}>Urgent</option>
              </select>
            </td>

            <td>
              <span class="source-pill source-${escapeHtml(lead.source)}">
                ${formatSource(lead.source)}
              </span>
            </td>

            <td>
              <textarea
                class="notes-box"
                placeholder="Internal notes..."
                onblur="window.saveLeadNoteFromTextarea('${lead.id}', this)"
              >${escapeHtml(lead.admin_notes)}</textarea>
            </td>

            <td>
              <span class="date-cell">
                ${formatDate(lead.created_at)}
              </span>
            </td>

            <td>
              <button
                class="delete-btn"
                onclick="window.deleteLeadFromButton('${lead.id}')"
              >
                Delete
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  function cleanMessage(message = "") {
    return String(message)
      .replace("[Website Chatbot Enquiry]", "")
      .replace("[Contact Form Enquiry]", "")
      .replace("Requirement:", "")
      .trim();
  }

  function formatSource(source = "") {
    if (source === "website-form") return "Website Form";
    if (source === "chatbot") return "Chatbot";
    if (source === "manual") return "Manual";
    return source || "Website";
  }

  function exportLeadsToCsv() {
    if (!filteredLeads.length) {
      showToast("No leads available to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Timeline",
      "Budget",
      "Message",
      "Status",
      "Priority",
      "Source",
      "Admin Notes",
      "Created At"
    ];

    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.service,
      lead.timeline,
      lead.budget,
      cleanMessage(lead.message),
      lead.status,
      lead.priority,
      lead.source,
      lead.admin_notes,
      formatDate(lead.created_at)
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `teczo-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast("CSV exported successfully.");
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }
});