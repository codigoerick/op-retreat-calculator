# Version update notifications

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
  The notice is intentionally non-dismissible: there is no `Ahora no` action
  and no close button, so the only way to clear it is to reload into the new
  version. It does not depend on `localStorage` or `sessionStorage`.

## Release notice for visitors who load after a deploy

The bottom toast only helps tabs that were already open during a deployment.
Visitors who load the site after the deployment never see a version mismatch,
so the root layout also mounts `src/components/ReleaseNotice.tsx`.

- It compares the current build version with
  `op-release-notice-seen-v1` in `localStorage`.
- When the stored version is missing or different, it shows a single modal with
  links to Exchange/Info and a dismiss button.
- Dismissing it stores the current deployment version, so it appears once per
  deployment per browser. A later deployment shows it again.
- It is skipped on `/login`, `/control-panel`, and `/auth` routes.
- It does not depend on the old one-time maintenance notice key.

## Versioned Exchange and Info badges

The Exchange and Info tabs show the existing `new.png` notification badge when
there is unseen content. Their seen state is now stored as
`{ version, keys }` under `op-info-seen-v1` in `localStorage`.

- When the stored `version` differs from the current deployment, the badge list
  is treated as empty, so the badges reappear after each deployment.
- Legacy plain-array values are ignored for the current deployment, which makes
  existing visitors see the badges again after this change.
- Opening the Exchange page marks `exchange-catalog-v1` as seen for the current
  deployment. The key is defined in `src/lib/exchangeNotifications.ts`.
