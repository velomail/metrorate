# Extension icons

Add your extension icons here so the packaged extension (and Chrome Web Store) can display them.

**Required:**

- `metrorate-logo-128.png` – 128×128 px (used for store and all sizes in the manifest)

**Optional (for sharper scaling):**

- `metrorate-logo-16.png` (16×16)
- `metrorate-logo-32.png` (32×32)
- `metrorate-logo-48.png` (48×48)

The manifest currently references `icons/metrorate-logo-128.png` for all sizes. If you add only the 128px file, the build will copy it to `dist/icons/` and the extension will work. See `CHROME_WEB_STORE.md` in the project root for the full audit and pre-publish checklist.
