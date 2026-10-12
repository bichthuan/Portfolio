# Portfolio — Thuan (Mei) Nguyen

Static portfolio site for a Senior Product Designer. Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

```bash
cd Portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html                 Home: hero, impact strip, capabilities, work list, current role, experience, contact
work/trueprofit.html       Case study 01: shipping cost settings (Shopify SaaS)
work/vieclam24h.html       Case study 02: login flow revamp (short read)
work/payme.html            Case study 03: embedded finance e-wallet
work/bewell.html           Case study 04: Home Doctor (healthcare)
work/research-os.html                Case study 05: Research OS (password protected)
work/virtual-teammates.html          Case study 06: Virtual Teammates (password protected)
work/usage-billing-visibility.html   Case study 07: Usage & Billing visibility (password protected)
work/self-service-revenue.html       Case study 08: Self-service revenue (password protected)
assets/css/cases.css       Shared components for the four Optimizely case studies
assets/css/main.css        Design tokens, layout, components, motion
assets/js/main.js          Interactions: hero thread, reveals, count-ups, demo, previews, TOC, tabs, lightbox
assets/js/unlock.js        Password gate: decrypts protected pages in the browser
tools/protect.py           Encrypts every page in private/ into work/ (one shared password)
private/                   Plaintext sources for protected pages (git-ignored, never commit)
assets/img/<project>/      Images cropped from the source files in Project/
assets/docs/               CV (PDF)
Project/                   Original source material (not used by the site directly)
```

## Design system

- **Fonts:** Bricolage Grotesque for display, Geist for UI and body, Newsreader for long-form case study text.
- **Color:** dark graphite background, warm off-white text. Aqua `#69E2D9` is the primary accent (highlights, lines, focus). Indigo `#5433E0` is secondary, used for emphasis tints and text selection.
- **Type scale:** major third on a 16px base, fluid with `clamp()`. Case study body is 18 to 21px at a 68ch measure.
- **Motion:** one hero moment (a tangled line that straightens), scroll reveals, keyword highlight sweeps, and a curtain-reveal footer with a giant wordmark. Everything respects `prefers-reduced-motion`.

## Editing content

Each page is self-contained HTML. Keywords are highlighted by wrapping them in `<span class="kw">…</span>`. Count-up numbers use `data-count="83"`.

## Password-protected case study

The four Optimizely case studies in `work/` contain only encrypted content (AES-256-GCM, key derived with PBKDF2-SHA256, 600,000 iterations). Their readable sources live in `private/<slug>.html`, which is git-ignored. Each source holds its page-specific `<style>` plus everything inside `<main>`.

To edit the case or change the password:

```bash
pip3 install cryptography
# edit a file in private/, then:
python3 tools/protect.py        # asks for the password
```

Re-run the script after every edit, then commit the files it rewrites in `work/`. Keep a backup of `private/` somewhere safe: it is not in git.

Visitors unlock once per browser tab, and every protected page shares the same password, so one unlock opens all of them. The password is held in `sessionStorage` until the tab closes.
