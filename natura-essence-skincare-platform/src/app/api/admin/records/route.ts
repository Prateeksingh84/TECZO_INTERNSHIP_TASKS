import { readStore, ok } from "../../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();

  return ok({
    success: true,
    counts: {
      products: store.products?.length || 0,
      cartItems: store.cart?.items?.length || 0,
      newsletter: store.newsletter?.length || 0,
      leads: store.leads?.length || 0,
      orders: store.orders?.length || 0
    },
    products: store.products || [],
    cart: store.cart || { items: [] },
    newsletter: store.newsletter || [],
    leads: store.leads || [],
    orders: store.orders || []
  });
}
