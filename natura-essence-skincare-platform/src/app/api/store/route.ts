import { readStore, ok } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStore();

  return ok({
    success: true,
    brand: store.brand,
    navigation: store.navigation,
    hero: store.hero,
    about: store.about,
    collection: store.collection,
    natureSection: store.natureSection,
    benefits: store.benefits
  });
}
