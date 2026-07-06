import { createClient } from "@supabase/supabase-js";

const env = import.meta.env;

const SUPABASE_URL = env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || "";

const USE_LOCAL_DEMO_IF_NOT_CONFIGURED =
  String(env.VITE_USE_LOCAL_DEMO_IF_NOT_CONFIGURED || "true") === "true";

const DEMO_ADMIN_EMAIL = env.VITE_DEMO_ADMIN_EMAIL || "admin@teczo.demo";
const DEMO_ADMIN_PASSWORD = env.VITE_DEMO_ADMIN_PASSWORD || "Teczo@123";

const STORAGE_KEY = "teczo_demo_leads";
const SESSION_KEY = "teczo_demo_admin_session";
const CHANNEL_NAME = "teczo-leads-realtime";

const hasSupabaseConfig = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith("https://")
);

const mode = hasSupabaseConfig ? "supabase" : "local-demo";

if (!hasSupabaseConfig && !USE_LOCAL_DEMO_IF_NOT_CONFIGURED) {
  console.warn("Supabase is not configured and local demo mode is disabled.");
}

const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const broadcastChannel =
  "BroadcastChannel" in window
    ? new BroadcastChannel(CHANNEL_NAME)
    : null;

function getLocalLeads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Failed to read local leads:", error);
    return [];
  }
}

function saveLocalLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function publishLocalChange(payload) {
  if (broadcastChannel) {
    broadcastChannel.postMessage(payload);
  }

  window.dispatchEvent(
    new CustomEvent("teczo-local-realtime", {
      detail: payload
    })
  );
}

function sanitizeLead(input) {
  return {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim(),
    phone: String(input.phone || "").trim(),
    company: String(input.company || "").trim(),
    service: String(input.service || "").trim(),
    timeline: String(input.timeline || "").trim(),
    budget: String(input.budget || "").trim(),
    message: String(input.message || "").trim(),
    source: String(input.source || "website-form").trim(),
    status: String(input.status || "new").trim(),
    priority: String(input.priority || "medium").trim(),
    admin_notes: String(input.admin_notes || "").trim()
  };
}

function validateLead(lead) {
  if (!lead.name) {
    throw new Error("Name is required.");
  }

  if (!lead.email) {
    throw new Error("Email is required.");
  }

  if (!lead.message) {
    throw new Error("Message is required.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(lead.email)) {
    throw new Error("Please enter a valid email address.");
  }
}

export async function insertLead(input) {
  const lead = sanitizeLead(input);

  validateLead(lead);

  if (mode === "supabase") {
    const { data, error } = await supabase
      .from("leads")
      .insert([lead])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const newLead = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ...lead,
    created_at: new Date().toISOString()
  };

  const leads = getLocalLeads();

  leads.unshift(newLead);

  saveLocalLeads(leads);

  publishLocalChange({
    eventType: "INSERT",
    new: newLead
  });

  return newLead;
}

export async function getLeads() {
  if (mode === "supabase") {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  return getLocalLeads().sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

export async function updateLeadStatus(id, status) {
  const validStatuses = ["new", "contacted", "qualified", "closed"];

  if (!validStatuses.includes(status)) {
    throw new Error("Invalid lead status.");
  }

  if (mode === "supabase") {
    const { data, error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const leads = getLocalLeads();

  const index = leads.findIndex((lead) => lead.id === id);

  if (index === -1) {
    throw new Error("Lead not found.");
  }

  leads[index] = {
    ...leads[index],
    status
  };

  saveLocalLeads(leads);

  publishLocalChange({
    eventType: "UPDATE",
    new: leads[index]
  });

  return leads[index];
}

export async function updateLeadMeta(id, updates) {
  if (!id) {
    throw new Error("Lead ID is required.");
  }

  const validPriorities = ["low", "medium", "high", "urgent"];

  const payload = {};

  if (updates.priority) {
    if (!validPriorities.includes(updates.priority)) {
      throw new Error("Invalid priority value.");
    }

    payload.priority = updates.priority;
  }

  if (typeof updates.admin_notes === "string") {
    payload.admin_notes = updates.admin_notes;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error("No valid update provided.");
  }

  if (mode === "supabase") {
    const { data, error } = await supabase
      .from("leads")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const leads = getLocalLeads();

  const index = leads.findIndex((lead) => lead.id === id);

  if (index === -1) {
    throw new Error("Lead not found.");
  }

  leads[index] = {
    ...leads[index],
    ...payload
  };

  saveLocalLeads(leads);

  publishLocalChange({
    eventType: "UPDATE",
    new: leads[index]
  });

  return leads[index];
}

export async function deleteLead(id) {
  if (!id) {
    throw new Error("Lead ID is required.");
  }

  if (mode === "supabase") {
    const { data, error } = await supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const leads = getLocalLeads();

  const deletedLead = leads.find((lead) => lead.id === id);

  if (!deletedLead) {
    throw new Error("Lead not found.");
  }

  const updatedLeads = leads.filter((lead) => lead.id !== id);

  saveLocalLeads(updatedLeads);

  publishLocalChange({
    eventType: "DELETE",
    old: deletedLead
  });

  return deletedLead;
}

export async function signIn(email, password) {
  if (mode === "supabase") {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    return data;
  }

  if (email === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
    const session = {
      user: {
        email
      },
      created_at: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return {
      session
    };
  }

  throw new Error("Invalid admin email or password.");
}

export async function signOut() {
  if (mode === "supabase") {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

export async function getSession() {
  if (mode === "supabase") {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function subscribeToLeadChanges(callback) {
  if (mode === "supabase") {
    const channel = supabase
      .channel("public:leads")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads"
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const onBroadcast = (event) => {
    callback(event.data);
  };

  const onCustom = (event) => {
    callback(event.detail);
  };

  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      callback({
        eventType: "REFRESH"
      });
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", onBroadcast);
  }

  window.addEventListener("teczo-local-realtime", onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", onBroadcast);
    }

    window.removeEventListener("teczo-local-realtime", onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function getRealtimeMode() {
  return mode;
}