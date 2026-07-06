import { readStore, ok } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const store = await readStore();
  const url = new URL(request.url);
  const search = (url.searchParams.get("search") || "").toLowerCase();
  const category = (url.searchParams.get("category") || "").toLowerCase();

  let products = store.products || [];

  if (search) {
    products = products.filter((product: any) =>
      [
        product.name,
        product.category,
        product.description,
        product.badge
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  if (category) {
    products = products.filter((product: any) =>
      String(product.category || "").toLowerCase() === category
    );
  }

  return ok({
    success: true,
    count: products.length,
    products
  });
}
