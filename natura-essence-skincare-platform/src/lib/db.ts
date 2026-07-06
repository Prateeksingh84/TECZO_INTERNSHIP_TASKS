import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "natura-store.json");

export async function readStore() {
  const raw = await fs.readFile(DATA_FILE, "utf8");

  const cleanRaw = raw
    .replace(/^\uFEFF/, "")
    .replace(/^\u00EF\u00BB\u00BF/, "")
    .trim();

  const data = JSON.parse(cleanRaw);

  data.cart = data.cart || { items: [] };
  data.cart.items = data.cart.items || [];
  data.newsletter = data.newsletter || [];
  data.leads = data.leads || [];
  data.orders = data.orders || [];

  return data;
}

export async function writeStore(data: any) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function ok(data: any, status = 200) {
  return Response.json(data, { status });
}

export function bad(message: string, status = 400) {
  return Response.json({ success: false, message }, { status });
}
