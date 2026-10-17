# Pishu's Botanical House — Static Demo

The daylight café demo as plain HTML, CSS and JS — no build step, no assets folder.
All images load from live URLs, so the files work exactly as-is.

## Files

```
index.html     → the Botanical House site (open this)
favicon.svg    → the leaf logo mark (used as favicon)
css/style.css  → all styles
js/data.js     → menu dishes + images (edit this file to change the menu)
js/main.js     → all interactions (menu filter, cart, reservation modal)
```

## Upload to GitHub

1. Create a new repository on github.com (e.g. `pishus-botanical-house`).
2. Click **Add file → Upload files**.
3. Drag in `index.html`, `favicon.svg`, and the `css` and `js` folders (keep the structure).
4. Commit.

## Publish free on GitHub Pages

1. Repo → **Settings → Pages**.
2. Source: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Save — your site goes live at `https://<your-username>.github.io/pishus-botanical-house/`.

## Notes

- Includes the masked hero reveal, menu with category filters, a browser-saved cart,
  Dish of the Day badge, reservation form UI, and the QR-menu table chip:
  open `index.html?table=5` (tables 1–8) to see a guest's table-tagged view.
- Orders and reservations are front-end demos here — the live full-stack version
  (admin portal, menu management, stored orders, per-table QR codes) runs on the
  React + FastAPI app in your Emergent project.
