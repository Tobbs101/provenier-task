import { proxyJson } from "@/lib/server/proxy-response";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyJson("/health");
}
