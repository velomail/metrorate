# MetroRate

Chrome extension: minimalist commission tracker side panel. Log deals, see commission and pipeline at a glance.

## Build & reload (see UI updates)

Chrome runs the extension from **built files** in `dist/`, not from source. After any code change:

1. **Rebuild:** In the project root run:
   ```bash
   npm run build
   ```
   This regenerates `dist/` (manifest, background, side panel HTML/JS/CSS, and assets from `public/`).

2. **Reload the extension:** Open **chrome://extensions**, find **MetroRate**, and click the **Reload** (circular arrow) button.

3. Open the side panel again to see the updated UI.

**Load unpacked:** When first loading the extension in Chrome, choose the **`dist`** folder (not the project root or `public/`). The built side panel and assets live in `dist/`.
