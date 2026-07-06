import { readStore, writeStore, ok, bad, makeId } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return bad("Valid email is required.");
  }

  const store = await readStore();

  store.newsletter = store.newsletter || [];
  store.newsletter.unshift({
    id: makeId("newsletter"),
    email,
    createdAt: new Date().toISOString()
  });

  await writeStore(store);

  return ok({
    success: true,
    message: "Newsletter subscription saved."
  });
}
