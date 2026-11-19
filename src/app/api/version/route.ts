import { getAppVersion } from "@/lib/appVersion";

// Always read the version of the deployment that is serving this request.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: getAppVersion() },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}
