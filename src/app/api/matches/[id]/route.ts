import { proxyJson } from "@/lib/server/proxy-response";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return Response.json({ success: false, error: "Invalid match identifier." }, { status: 400 });
  }

  return proxyJson(`/api/matches/${encodeURIComponent(id)}`);
}
