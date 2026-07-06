import "./styles/admin.css";

import {
  signIn,
  signOut,
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
  const logoutBtn = document.getElementById("logoutBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const loginNotice = document.getElementById("loginNotice");
  const modePill = document.getElementById("modePill");
  const demoBox = document.getElementById("demoBox");

  const totalLeads = document.getElementById("totalLeads");
  const newLeads = document.getElementById("newLeads");
  const contactedLeads = document.getElementById("contactedLeads");
  const qualifiedLeads = document.getElementById("qualifiedLeads");

  const leadsTable = document.getElementById("leadsTable");
  const emptyState = document.getElementById("emptyState");
  const tableWrap = document.getElementById("tableWrap");
  const toast = document.getElementById("toast");

  const leadSearchInput = document.getElementById("leadSearchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const exportCsvBtn = document.getElementById("exportCsvBtn");

  let leads = [];
  let filteredLeads = [];
  let unsubscribe = null;

  const isSupabase = getRealtimeMode() === "supabase";

  if (demoBox) {
    demoBox.style.display = isSupabase ? "none" : "flex";
  }

  if (modePill) {
    modePill.textContent = isSupabase
      ? "Live Database Mode: Supabase Realtime connected"
      : "Live Demo Mode: localStorage + BroadcastChannel";
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginNotice.textContent = "";

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    try {
      await signIn(email, password);
      await showDashboard();

      showToast("Admin login successful. Realtime dashboard active.");
    } catch (error) {
      loginNotice.textContent = error.message || "Login failed.";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut();

    if (unsubscribe) {
      unsubscribe();
    }

    dashboard.classList.add("hidden");
    loginPanel.classList.remove("hidden");

    showToast("Logged out.");
  });

  refreshBtn.addEventListener("click", async () => {
    await loadLeads();
    showToast("Dashboard refreshed.");
  });

  if (leadSearchInput) {
    leadSearchInput.addEventListener("input", applyFiltersAndRender);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFiltersAndRender);
  }

  if (priorityFilter) {
    priorityFilter.addEventListener("change", applyFiltersAndRender);
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", exportLeadsToCsv);
  }

  window.updateLeadStatusFromSelect = async function (id, status) {
    try {
      const updatedLead = await updateLeadStatus(id, status);

      leads = leads.map((lead) =>
        lead.id === updatedLead.id ? updatedLead : lead
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
        lead.id === updatedLead.id ? updatedLead : lead
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
        lead.id === updatedLead.id ? updatedLead : lead
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
      "Are you sure you want to delete this message submission?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const deletedLead = await deleteLead(id);

      leads = leads.filter((lead) => lead.id !== deletedLead.id);

      applyFiltersAndRender();

      showToast("Message submission deleted successfully.");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Delete failed.");
    }
  };

  async function showDashboard() {
    loginPanel.classList.add("hidden");
    dashboard.classList.remove("hidden");

    await loadLeads();

    startRealtimeListener();
  }

  async function loadLeads() {
    try {
      leads = await getLeads();

      leads = leads.map((lead) => ({
        ...lead,
        priority: lead.priority || "medium",
        admin_notes: lead.admin_notes || ""
      }));

      applyFiltersAndRender();
    } catch (error) {
      console.error("Failed to load leads:", error);
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
        const exists = leads.some((lead) => lead.id === payload.new.id);

        if (!exists) {
          leads.unshift({
            ...payload.new,
            priority: payload.new.priority || "medium",
            admin_notes: payload.new.admin_notes || ""
          });
        }

        applyFiltersAndRender();

        showToast(`New lead received: ${payload.new.name}`);

        return;
      }

      if (payload.eventType === "UPDATE" && payload.new) {
        leads = leads.map((lead) =>
          lead.id === payload.new.id
            ? {
                ...payload.new,
                priority: payload.new.priority || "medium",
                admin_notes: payload.new.admin_notes || ""
              }
            : lead
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

  function applyFiltersAndRender() {
    const searchTerm = leadSearchInput
      ? leadSearchInput.value.trim().toLowerCase()
      : "";

    const selectedStatus = statusFilter ? statusFilter.value : "all";
    const selectedPriority = priorityFilter ? priorityFilter.value : "all";

    filteredLeads = leads.filter((lead) => {
      const searchableText = `
        ${lead.name || ""}
        ${lead.email || ""}
        ${lead.company || ""}
        ${lead.message || ""}
        ${lead.status || ""}
        ${lead.priority || ""}
        ${lead.admin_notes || ""}
      `.toLowerCase();

      const matchesSearch = searchableText.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" || lead.status === selectedStatus;

      const matchesPriority =
        selectedPriority === "all" || lead.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    renderLeads();
  }

  function renderLeads() {
    totalLeads.textContent = leads.length;

    newLeads.textContent = leads.filter(
      (lead) => lead.status === "new"
    ).length;

    contactedLeads.textContent = leads.filter(
      (lead) => lead.status === "contacted"
    ).length;

    qualifiedLeads.textContent = leads.filter(
      (lead) => lead.status === "qualified"
    ).length;

    emptyState.style.display = filteredLeads.length ? "none" : "block";
    tableWrap.style.display = filteredLeads.length ? "block" : "none";

    leadsTable.innerHTML = filteredLeads
      .map(
        (lead) => `
        <tr>
          <td class="lead-name">
            ${escapeHtml(lead.name)}
          </td>

          <td>
            <a href="mailto:${escapeHtml(lead.email)}">
              ${escapeHtml(lead.email)}
            </a>
          </td>

          <td>
            ${escapeHtml(lead.company || "-")}
          </td>

          <td class="message-cell">
            ${escapeHtml(lead.message)}
          </td>

          <td>
            <select onchange="window.updateLeadStatusFromSelect('${lead.id}', this.value)">
              <option value="new" ${lead.status === "new" ? "selected" : ""}>
                New
              </option>

              <option value="contacted" ${lead.status === "contacted" ? "selected" : ""}>
                Contacted
              </option>

              <option value="qualified" ${lead.status === "qualified" ? "selected" : ""}>
                Qualified
              </option>

              <option value="closed" ${lead.status === "closed" ? "selected" : ""}>
                Closed
              </option>
            </select>
          </td>

          <td>
            <select
              class="priority-select priority-${escapeHtml(lead.priority || "medium")}"
              onchange="window.updateLeadPriorityFromSelect('${lead.id}', this.value)"
            >
              <option value="low" ${lead.priority === "low" ? "selected" : ""}>
                Low
              </option>

              <option value="medium" ${lead.priority === "medium" ? "selected" : ""}>
                Medium
              </option>

              <option value="high" ${lead.priority === "high" ? "selected" : ""}>
                High
              </option>

              <option value="urgent" ${lead.priority === "urgent" ? "selected" : ""}>
                Urgent
              </option>
            </select>
          </td>

          <td>
            <textarea
              class="notes-box"
              placeholder="Add internal note..."
              onblur="window.saveLeadNoteFromTextarea('${lead.id}', this)"
            >${escapeHtml(lead.admin_notes || "")}</textarea>
          </td>

          <td>
            ${formatDate(lead.created_at)}
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
      `
      )
      .join("");
  }

  function exportLeadsToCsv() {
    if (!filteredLeads.length) {
      showToast("No leads available to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Company",
      "Message",
      "Status",
      "Priority",
      "Admin Notes",
      "Created At"
    ];

    const rows = filteredLeads.map((lead) => [
      lead.name || "",
      lead.email || "",
      lead.company || "",
      lead.message || "",
      lead.status || "",
      lead.priority || "",
      lead.admin_notes || "",
      formatDate(lead.created_at)
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
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