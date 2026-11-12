# DOST Building Directory & Citizen's Charter kiosk

A touch-friendly lobby kiosk for the DOST Central Office.

- **Main menu** — choose *Citizen's Charter*, *Building Directory* or *Key Officials*; full-screen button for kiosk use.
- **Key Officials** — executive officials and service directors with local numbers and a "Find office" link; photos go in `officials/` (see `officials/README.txt`).
- **Citizen's Charter** — 8 services with full tarpaulin layouts (zoom, page switching, "Find office").
- **Building Directory** — 3D model of the Ground Floor to the 4th Floor with search, floor switcher,
  turn-by-turn directions from the Front Lobby, and a "Walk me there" guided walk (elevator included).

## Run it

It is a static site: open `index.html` in a browser, or host the folder on any web server.
Three.js and the Atkinson Hyperlegible font load from public CDNs, so the kiosk needs internet access.

### GitHub Pages
Settings → Pages → *Deploy from a branch* → `main` / root. The site appears at
`https://<user>.github.io/<repo>/`.

## Links
- `#home`, `#officials`, `#charter`, `#charter-<id>` (e.g. `#charter-gia`), `#directory`
- `#<office-id>` opens an office route, `#<office-id>-walk` also starts the guided walk (e.g. `#f2-coa-walk`)

## Updating content
- **Bump the build stamp** `<meta name="build" content="YYYYMMDDhhmmss">` near the top of `index.html` on every change.
  Kiosks check every 5 minutes and reload themselves (only while idle on the main menu) when the stamp changes.
- Office names, floors and routes live in the `GF_ROOMS` / `UP_ROOMS` tables inside `index.html`.
- Citizen's Charter services are in the `CHARTER` list in `index.html`; images are in `charter/`
  (`<id>-1.jpg`, `<id>-2.jpg` for extra pages, `<id>-thumb.jpg` for the menu preview).

## Client Satisfaction Survey

The fourth home option (`#ccss`) shows the office's Google Form (tinyurl.com/DOST-CO-OnlineCCSS) inside the kiosk. Responses go to the form's own response sheet. The form reloads empty each time it is opened, and "Start over" clears it for the next visitor. To change the form, edit `data-src` on `#ccssFrame` in `index.html` (keep `?embedded=true`).
