# Chris Mathis Portfolio

GitHub Actions uploads `site/` to Azure Storage when changes reach `main`.
Open the [hosted portfolio](https://cmathiswebsite.z14.web.core.windows.net/).

## Run locally

From the repository root, run `npm ci`, then `npm run lint`.
With Python installed, start a local web server with
`python -m http.server 8000 --bind 127.0.0.1 --directory site`.
Open `http://127.0.0.1:8000/`. Use localhost or HTTPS for geolocation and token
generation. Opening pages directly from disk prevents the same-origin JSON fetch.

## Sprint C1

- `projects.json` contains the catalog. Each project has a unique ID, title,
  description, and technologies. The gallery checks optional links and image names
  and builds cards with DOM methods and `textContent`.
- `project-request.js` checks the HTTP response, JSON content type, and timeout.
  The gallery validates the catalog before rendering it or writing it to
  `localStorage`. If the request or data fails, it can show a valid saved catalog
  for up to seven days. If the cache is missing, damaged, or expired, it shows
  fallback information. Both recovery states offer a retry.
- `contact-location.js` requests browser permission only after the visitor clicks.
  It calculates approximate straight-line distance to Wausau in the browser.
  Coordinates are neither saved nor sent by the site.
- `contact-form.js` reports required fields, malformed email, and length violations
  next to each input and focuses the first invalid field on submission.
  `portfolio-security.js` validates a random per-page contact token and allows
  four form attempts per rolling minute. The catalog has its own four-request
  limit. The contact form is a browser-only CSRF token and throttling demo.
  A future submission endpoint would need to enforce both controls on the server.

## Test with browser DevTools

Open the Console for diagnostics and the Network panel with **Disable cache**
selected to see catalog requests. Use Application → Local Storage to inspect the
`portfolio.projects.v1` entry.

| Check | Steps | Expected result |
| --- | --- | --- |
| Live JSON | Open Projects over HTTP on localhost or HTTPS. | Four cards render, and the project catalog is saved. |
| Request or JSON failure | Block only `projects.json`, or use local overrides to replace its body with malformed JSON. Reload after a successful visit. | Saved projects appear with a message and a retry button. |
| Broken or expired cache | While the catalog is unavailable, clear the storage key, replace its value with malformed JSON, or set its `savedAt` to `1`. Reload. | Basic fallback information and the retry button appear. Restore the catalog and retry to repopulate the gallery and cache. |
| Contact validation | Submit empty fields, then try an invalid email. Assign an overlength message through DevTools to check validation beyond the input limit. Correct all fields. | Field-specific messages appear, focus moves to the first invalid field, and valid input clears the form. |
| Token and rate limiter | Reload Contact, change the hidden `contactToken` input value in DevTools, and submit. Reload and make five attempts within a minute. | The modified token is rejected. The fifth attempt is throttled. |
| Geolocation | Use the DevTools Sensors panel to set coordinates, then click **Check distance to Wausau**. Test the denied and unavailable states using site permissions and location overrides. | Distance appears after permission is granted. Failure explains how to proceed. |

ESLint passed. Headless Chrome verified live loading, the cache write, HTTP 503
and malformed JSON recovery, corrupt and expired cache fallback, retry, contact
field validation and reset, token mismatch, the fifth-attempt throttle, and
geolocation success, denial, and simulated timeout. There were no uncaught
JavaScript exceptions in these checks.
