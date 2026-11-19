# New version toast

The public layout includes a small bottom toast that tells visitors when a newer
production deployment is available. It is rendered by
`src/components/UpdateToast.tsx` and is only mounted inside the localized public
layout, so `/login` and `/control-panel` are unaffected.

## How the version is detected

- `next.config.ts` bakes a build version into `NEXT_PUBLIC_APP_VERSION` using
  `VERCEL_DEPLOYMENT_ID`, `VERCEL_GIT_COMMIT_SHA`, or a manual
  `NEXT_PUBLIC_APP_VERSION` override.
- `/api/version` returns the version of the deployment serving the request with
  `Cache-Control: no-store`.
- An already-open page keeps its old build version. It checks `/api/version`
  every 60 seconds, when the tab becomes visible, and when the browser comes
  back online. When the returned version differs, the toast appears.
- `Actualizar ahora` reloads the page so the visitor loads the new deployment.
  `Ahora no` hides the toast for that version in the current tab; a newer
  deployment will show it again.

## Exchange badge

The Exchange tab shows the existing `new.png` notification badge until the
visitor opens `/es/exchange` or `/en/exchange`. The seen state uses the same
`localStorage` notification list as the Info badge. The key is defined in
`src/lib/exchangeNotifications.ts`.
