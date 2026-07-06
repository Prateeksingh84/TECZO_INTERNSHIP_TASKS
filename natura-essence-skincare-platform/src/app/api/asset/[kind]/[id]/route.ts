import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedKinds = new Set(["hero", "editorial", "product"]);

export async function GET(
  request: Request,
  context: any
) {
  const params = await context.params;
  const kind = String(params.kind || "");
  const id = String(params.id || "");

  if (!allowedKinds.has(kind)) {
    return Response.json(
      { success: false, message: "Invalid asset kind." },
      { status: 400 }
    );
  }

  const fileName = `${kind}-${id}.svg`;
  const filePath = path.join(process.cwd(), "public", "assets", "natura", fileName);

  try {
    const svg = await fs.readFile(filePath, "utf8");

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Asset not found.",
        expectedFile: `/public/assets/natura/${fileName}`
      },
      { status: 404 }
    );
  }
}
