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
assets/css/main.css        Design tokens, layout, components, motion
assets/js/main.js          Interactions: hero thread, reveals, count-ups, demo, previews, TOC, lightbox
assets/img/<project>/      Images cropped from the source files in Project/
assets/docs/               CV (PDF)
Project/                   Original source material (not used by the site directly)
```

## Design system

- **Fonts:** Bricolage Grotesque for display, Geist for UI and body, Newsreader for long-form case study text.
- **Color:** dark graphite background, warm off-white text, one vermilion accent for keyword highlights and focus states.
- **Type scale:** major third on a 16px base, fluid with `clamp()`. Case study body is 18 to 21px at a 68ch measure.
- **Motion:** one hero moment (a tangled line that straightens), scroll reveals, keyword highlight sweeps, and a curtain-reveal footer with a giant wordmark. Everything respects `prefers-reduced-motion`.

## Editing content

Each page is self-contained HTML. Keywords are highlighted by wrapping them in `<span class="kw">…</span>`. Count-up numbers use `data-count="83"`.
