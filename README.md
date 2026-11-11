# Maître d' — Business Dining Etiquette

A static website (HTML, CSS, vanilla JavaScript and inline SVG) that teaches University of Arizona students business dining etiquette. Built for SIE 515 (individual assignment).

## Pages

| File | Content |
|---|---|
| `index.html` | Home: hero, the four big ideas (3D icons), B·M·W trick, original captioned video, 3D dish carousel, key numbers, external resources |
| `table.html` | Interactive place-setting explorer, "Which one do I use first?" game, pause/finished demo |
| `behavior.html` | Meal timeline: Before → Arrival → Ordering → Eating → Conversation → Paying → Thank-you |
| `carreno.html` | The Carreño Rules (1853 manual), paraphrased, with "classic rule → today's tip" flip cards |
| `quiz.html` | Self-scoring 10-question quiz plus a printable question list with answer key |
| `references.html` | APA citations, image and font credits |
| `design-options.html` | Phase 1 design comparison (not in the main navigation) |

Assets live in `assets/css`, `assets/js` and `assets/img`. All paths are relative, and `.nojekyll` tells GitHub Pages to serve the files as they are.

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy to GitHub Pages

This repository is named `anyelinariv.github.io`, which makes it a **user site**. It will be published at the root URL.

1. Push the files to the `main` branch (merge the working branch into `main` first if needed):
   ```bash
   git checkout main
   git merge claude/sharp-cannon-q9gaa1
   git push origin main
   ```
2. On GitHub, open the repository → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, then choose **Branch: `main`** and folder **`/ (root)`**. Click **Save**.
4. Wait 1–2 minutes and refresh the Pages settings. The site URL appears at the top:
   **https://anyelinariv.github.io/**

If you later move the site into a different repository (for example `business-dining-etiquette`), the URL becomes `https://<user>.github.io/<repo>/`. No code changes are needed because every link is relative.

## Credits

Illustrations are original SVG. Fonts: Playfair Display and Source Sans 3 (SIL Open Font License, via Google Fonts). Full sources are listed on `references.html`.
