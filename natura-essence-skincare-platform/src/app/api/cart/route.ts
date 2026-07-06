import { readStore, writeStore, ok, bad, makeId } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cartSummary(cart: any) {
  const items = cart.items || [];
  const count = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
  const total = items.reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  return {
    cart: {
      items,
      count,
      total
    },
    count,
    total
  };
}

export async function GET() {
  const store = await readStore();
  store.cart = store.cart || { items: [] };
  store.cart.items = store.cart.items || [];

  return ok({
    success: true,
    ...cartSummary(store.cart)
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId || "");
  const quantity = Math.max(1, Number(body.quantity || 1));

  if (!productId) {
    return bad("productId is required.");
  }

  const store = await readStore();
  const product = (store.products || []).find((item: any) => item.id === productId);

  if (!product) {
    return bad("Product not found.", 404);
  }

  store.cart = store.cart || { items: [] };
  store.cart.items = store.cart.items || [];

  const existing = store.cart.items.find((item: any) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
    existing.updatedAt = new Date().toISOString();
  } else {
    store.cart.items.unshift({
      id: makeId("cart"),
      productId,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      size: product.size,
      quantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  await writeStore(store);

  return ok({
    success: true,
    message: `${product.name} added to cart.`,
    ...cartSummary(store.cart)
  });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemId = String(body.itemId || "");
  const action = String(body.action || "");

  const store = await readStore();
  store.cart = store.cart || { items: [] };
  store.cart.items = store.cart.items || [];

  const item = store.cart.items.find((cartItem: any) => cartItem.id === itemId);

  if (!item) {
    return bad("Cart item not found.", 404);
  }

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
  } else {
    return bad("Invalid cart action.");
  }

  if (item.quantity <= 0) {
    store.cart.items = store.cart.items.filter((cartItem: any) => cartItem.id !== itemId);
  }

  await writeStore(store);

  return ok({
    success: true,
    message: "Cart updated.",
    ...cartSummary(store.cart)
  });
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const itemId = String(body.itemId || "");
  const clear = Boolean(body.clear);

  const store = await readStore();
  store.cart = store.cart || { items: [] };
  store.cart.items = store.cart.items || [];

  if (clear) {
    store.cart.items = [];
  } else {
    store.cart.items = store.cart.items.filter((item: any) => item.id !== itemId);
  }

  await writeStore(store);

  return ok({
    success: true,
    message: clear ? "Cart cleared." : "Item removed.",
    ...cartSummary(store.cart)
  });
}
