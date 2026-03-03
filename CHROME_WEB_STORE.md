# Chrome Web Store – Audit & Pre-Publish Checklist

This document is an analyst-style review of the MetroRate extension against Chrome Web Store program policies and quality guidelines. Use it before submitting to the store.

---

## Audit summary

| Area | Status | Notes |
|------|--------|--------|
| Manifest V3 | ✅ Pass | Uses MV3; single purpose; no remote code |
| Permissions | ✅ Pass | `storage`, `sidePanel` only; both justified |
| Remote code / eval | ✅ Pass | No `eval()`, no remote script loading |
| External resources | ✅ Pass | Only Google Fonts (CSS); no logic from remote |
| Icons | ⚠️ Action | Manifest references `icons/`; add PNGs before packaging |
| Privacy & listing | 📋 Dashboard | Fill Single Purpose, Permissions, Privacy URL in CWS dashboard |

**Verdict:** Code and structure are store-ready once icons are added and dashboard fields are completed.

---

## 1. Manifest V3 & single purpose

- **Manifest version:** 3 ✅  
- **Single purpose:** Extension has one clear purpose: "Minimalist glassmorphic commission tracker side panel." ✅  
- **Discernible functionality:** All logic is in the extension package (side panel UI, background script). No remote code execution. ✅  

**Dashboard:** In *Privacy practices* → *Single purpose description*, use something like:  
*"MetroRate is a commission and deal tracker that runs in the Chrome side panel. It lets users log deals, view a dashboard, and track progress. Data is stored locally in the browser."*

---

## 2. Permissions

Declared in manifest:

- **`storage`** – Used to persist deals, settings, and limit state in the side panel. ✅  
- **`sidePanel`** – Used to show the tracker UI in the side panel. ✅  

No `host_permissions`, `content_scripts`, or optional permissions. Minimum necessary for the stated purpose. ✅  

**Dashboard:** In *Privacy practices* → *Permissions justification*, for each permission briefly state:  
- **storage:** "Storing user-entered deals, dashboard settings, and usage state locally."  
- **sidePanel:** "Displaying the commission tracker UI in the Chrome side panel."

---

## 3. Remote code & external resources (MV3 requirements)

- **No `eval()` or `new Function()`** – Grep over `src/` found none. ✅  
- **No remote script loading** – No dynamic `<script src="https://...">` or logic from remote URLs. ✅  
- **External resources:** Only Google Fonts (CSS) in `src/sidepanel/index.html`. Loading fonts/CSS from external URLs is allowed; they do not contain executable logic. ✅  
- **Extension logic:** All behavior is in the packaged extension (React app, background script, config constants for landing/store URLs). ✅  

**Dashboard:** In *Privacy practices* → *Remote code*: select **"No, I am not using remote code."**

---

## 4. Icons (required before publish)

Manifest expects:

- `icons/metrorate-logo-128.png` (used for 16, 32, 48, 128 in manifest).

There are no PNG files in the repo. You must add icons so the packaged extension (e.g. from `dist/`) includes them.

**Action:**

1. Add at least one PNG (e.g. 128×128) as `public/icons/metrorate-logo-128.png`.  
2. Optionally add 16, 32, 48 for sharper scaling; the manifest can reference the same 128px file for all sizes if needed.  
3. Run `npm run build` and confirm `dist/icons/` contains the icon(s).

Without icons, the extension may load with broken icons and the store may reject or flag the item.

---

## 5. Privacy policy & data use

- **Privacy policy URL:** Required in the **Chrome Web Store dashboard**, not in the manifest.  
- **Landing:** Privacy section is at `https://velomail.github.io/metrorate/#privacy` (or your configured landing URL).  

**Dashboard:**

- In *Privacy practices* → *Privacy policy*, set: `https://velomail.github.io/metrorate/#privacy` (or the URL where your full policy lives).  
- In *Data usage*: disclose that the extension stores data locally (e.g. "Stored locally in the user's browser only") and certify limited use if applicable.

---

## 6. Project layout & packaging

- **Single manifest source:** Use `public/manifest.json` as the only source; it is copied to `dist/` by Vite.  
- **Build output:** `npm run build` produces a valid extension in `dist/` (manifest, background, side panel HTML/JS/CSS, and `public/` contents such as icons).  
- **Side panel path:** Manifest uses `side_panel.default_path: "src/sidepanel/index.html"`; the build outputs that path under `dist/`, so it is correct for the packaged extension.

---

## Pre-publish checklist

Before uploading to the Chrome Web Store:

- [ ] Add icon(s) under `public/icons/` (see section 4).  
- [ ] Run `npm run build` and confirm `dist/` contains `manifest.json`, `background.js`, `src/sidepanel/index.html`, `assets/`, and `icons/`.  
- [ ] In CWS dashboard: complete *Single purpose description*.  
- [ ] In CWS dashboard: justify *storage* and *sidePanel* under Permissions.  
- [ ] In CWS dashboard: set *Remote code* to "No, I am not using remote code."  
- [ ] In CWS dashboard: set *Privacy policy* URL (e.g. `https://velomail.github.io/metrorate/#privacy`).  
- [ ] In CWS dashboard: complete Data usage disclosure and certification.  
- [ ] Update `urls.json` with the real Chrome Web Store listing URL after publish, then run `npm run sync-urls` so landing pages point to your listing.

---

## References

- [Additional requirements for Manifest V3](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements)  
- [Fill out the privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)  
- [Extension quality guidelines](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines-faq)
