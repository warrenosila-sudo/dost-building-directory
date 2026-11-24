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

## AVP

The fourth home option (`#avp`) lists the office's audio-visual presentations by category (Safety and Health, Environment, Public Service and Transparency). Each video has its own link, `#avp-<id>`, for example `#avp-evacuation`.

Videos live in `avp/` as `<id>.mp4` (720p H.264, under 100 MB each for GitHub) with a poster `<id>.jpg`. To add one: compress it, put both files in `avp/`, add a line to `AVP` in `index.html` (and a category to `AVP_CATS` if needed), bump the build stamp and push. While a video is playing, the kiosk does not return to the main menu.

## Citizen/Client Satisfaction Survey (CCSS)

The fifth home option (`#ccss`) is the DOST-CO CCSS, form DOSTCO-001 Rev. 7: client details, purpose of visit, CC1 to CC3, the eight service quality statements (faces plus "Not applicable"), comments and complaints.

Answers are saved on the tablet first, then sent to a Google Apps Script web app that adds a row to the Google Sheet "DOST-CO CCSS – Kiosk Responses" and emails the answer to woosila@dost.gov.ph. To connect it (once):

1. Open the Sheet, go to Extensions > Apps Script, paste `survey/ccss-apps-script.gs`, and save.
2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Authorize, then copy the web app URL.
3. Put that URL in `SURVEY_ENDPOINT` in `index.html`, bump the build stamp, and push. Saved answers then send automatically.
