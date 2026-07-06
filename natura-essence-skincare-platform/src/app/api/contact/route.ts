import { readStore, writeStore, ok, bad, makeId } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return bad("Name, email, and message are required.");
  }

  const store = await readStore();

  store.leads = store.leads || [];
  store.leads.unshift({
    id: makeId("lead"),
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  });

  await writeStore(store);

  return ok({
    success: true,
    message: "Contact request saved."
  });
}
