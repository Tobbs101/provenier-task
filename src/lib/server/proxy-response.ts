const DEFAULT_API_URL = "https://profootball.srv883830.hstgr.cloud";
const REQUEST_TIMEOUT_MS = 10_000;

function getApiUrl() {
  return (process.env.PROFOOTBALL_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function proxyJson(path: string): Promise<Response> {
  try {
    const upstreamResponse = await fetch(`${getApiUrl()}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const body = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type") ?? "application/json";

    return new Response(body, {
      status: upstreamResponse.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";

    return Response.json(
      {
        success: false,
        error: timedOut
          ? "The live match service took too long to respond."
          : "The live match service is currently unavailable.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}
