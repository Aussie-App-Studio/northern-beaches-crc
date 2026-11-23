# Northern Beaches Christian Reformed Church — Website Redesign Preview

A clean, sunlit, mobile-first redesign preview for **Northern Beaches Christian Reformed Church** (58 Fisher Road, Dee Why, NSW 2099), replacing the legacy Weebly site (`https://deewhy.crca.org.au`) while preserving every core message, worship detail, confession, mission partnership, sermon link, and safe-church document.

- **GitHub Pages Preview:** https://aussie-app-studio.github.io/northern-beaches-crc/
- **Current Official Site:** https://deewhy.crca.org.au

## Key Improvements Over Legacy Site
- **Coastal Sunlit Brand Identity:** Deep coastal navy (`#162A5A`) and warm gold (`#DDA954`) drawn directly from the church's exterior signage at 58 Fisher Road, paired with warm alabaster surfaces (`#FAF8F4`), `Newsreader` editorial serif typography, and `Plus Jakarta Sans` UI copy.
- **Crisp Vector Brand Wordmark:** Replaces the opaque rectangular JPEG header logo with a sharp scalable SVG emblem + wordmark.
- **Clear Visitor Experience (`visit.html`):** Consolidates Sunday 10am worship expectations, Good Friday & Christmas 9:30am times, Tuesday 7:30pm small group, interactive Google Map, and the Sunday parking guide (fixing typos and formatting in the PCYC / Children's Centre / Fisher Road notes).
- **Unified Beliefs & Confessions (`beliefs.html`):** Brings together Core Beliefs, The 5 Loves (with framed original illustrations), The Five Solas (semantic typography replacing raster images), interactive Doctrines of Grace (TULIP), and Forms of Unity.
- **Fast Searchable Sermons & Study Notes (`sermons.html`):** Replaces dozens of heavy simultaneous embeds with lightweight click-to-play `youtube-nocookie.com` video cards, series filtering, keyword search, the Nehemiah 13 PDF transcript, and downloadable Ephesians `.docx` study guides.
- **Clean Direct Links & Security:** Removes visible `google-site-verification` text from the homepage, replaces Mailchimp click-tracking wrapper URLs on Missions with clean HTTPS links, updates copyright to 2026, and bundles all authentic church photos and PDFs locally under `assets/`.
- **Privacy & Content Hygiene:** Removes the leftover `/test.html` draft and withholds unlinked personal mobile phone numbers from the legacy `/leadership-team.html` page pending church review.

## Local Preview
Serve the repository root with any static HTTP server:

```powershell
python -m http.server 4173
# or:
npx --yes http-server . -p 4173 -c-1
```

Then open `http://localhost:4173`.

## Checklist Before Moving to Official Domain (`deewhy.crca.org.au`)
1. Confirm current Eldership & Deacon details if the congregation wishes to publish a Leadership section on `about.html`.
2. Verify whether an evening service or updated holiday schedule should be noted on `visit.html`.
3. Optionally point `#contact-form` in `contact.html` / `js/main.js` to a static-site form endpoint (e.g. Formspree or Web3Forms) if server-side email forwarding is preferred over the visitor's email client.
4. Add a `CNAME` file when switching DNS to `deewhy.crca.org.au`, and update `robots.txt` and `sitemap.xml` URLs accordingly.
