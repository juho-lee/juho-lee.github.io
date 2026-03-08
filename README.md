# Academic Website Prototype (No Framework)

This is a from-scratch, beginner-friendly academic homepage prototype.

## Why this setup is easy to maintain

- No build tools and no dependencies.
- Publications can be regenerated from one source markdown file.
- Conference/journal aliases are centralized (e.g., `neurips`, `icml`) and auto-formatted.

## Files

- `index.html`: page structure.
- `styles.css`: minimalist style (white background, black text, one link color).
- `app.js`: renders about + publication entries from data.
- `data/about.js`: your About content (bio/interests/prospective students).
- `data/publications.js`: generated publication data for the webpage.
- `data/publications_source.md`: source markdown for publication sync.
- `data/activities.js`: talks, teaching, and service content.
- `scripts/sync_publications.py`: sync + validation script.

## Edit About section

1. Open `data/about.js`.
2. Edit these arrays:
   - `bio` (paragraphs)
   - `researchInterests` (bullet points)
   - `prospectiveStudents` (paragraphs)
3. Save and refresh `http://localhost:8080`.

## Edit Talks / Teaching / Service

1. Open `data/activities.js`.
2. Edit:
   - `TALKS`
   - `TEACHING`
   - `SERVICE`
3. Save and refresh `http://localhost:8080`.

## Add a publication

1. Edit `data/publications_source.md`.
2. Run:

```bash
python3 scripts/sync_publications.py
```

3. Validate metadata quality checks:

```bash
python3 scripts/sync_publications.py --check
```

4. Refresh `http://localhost:8080`.

Example:

```js
{
  title: "My New Paper",
  category: "conference",
  authors: [
    { name: "Juho Lee", corresponding: true },
    { name: "Coauthor Z", corresponding: true },
    { name: "Coauthor A", equalContribution: true },
    { name: "Coauthor B", equalContribution: true },
  ],
  year: 2026,
  venue: "neurips",
  status: "to_appear", // optional
  note: "Oral", // optional
  links: [{ label: "Paper", url: "https://arxiv.org/abs/xxxx.xxxxx" }],
}
```

## Author marker system

- `equalContribution: true` -> adds superscript `*`
- `corresponding: true` -> adds superscript `†` (only when multiple corresponding authors are marked)
- You can set both on the same author.
- A legend is shown above the publication lists automatically.

You can still write simple authors as plain strings:

```js
authors: ["Juho Lee", "Coauthor A"];
```

## Automatic title sentence case (with BibTeX-style braces)

- By default, each publication `title` is converted to sentence case automatically.
- Use braces to preserve forced capitals, similar to BibTeX:
  - `"{NeurIPS}"`, `"{ICLR}"`, `"{GPT-4}"`
- Example:

```js
title: "learning transferable features for {NeurIPS} benchmarks";
```

This is rendered as:
`Learning transferable features for NeurIPS benchmarks`

- If needed, disable conversion for a single item:

```js
title: "My Custom Title Style",
titleSentenceCase: false,
```

## BibTex export

- Each publication now has one `BibTex` button.
- `BibTex` copies a compact BibTeX-style citation snippet:
  - short key (e.g. `kim2025active`)
  - abbreviated author names (e.g. `Kim, Y.`)
  - parsed `booktitle` text based on venue/year alias rules

## Add a new venue alias

In `VENUE_ALIASES`:

```js
cvpr: {
  name: "IEEE/CVF Conference on Computer Vision and Pattern Recognition",
  short: "CVPR",
},
```

Then use `venue: "cvpr"` in publications.

## Preview locally

Because this project uses ES modules, open it through a tiny local server (not by double-clicking `index.html`).

### Step-by-step (macOS)

1. Open `Terminal` (press `Cmd + Space`, type `Terminal`, press Enter).
2. Move to this project folder:

```bash
cd /Users/juho/Documents/Playground
```

3. Start a local server:

```bash
python3 -m http.server 8080
```

4. Keep that terminal window open. You should see a line like:
   `Serving HTTP on :: port 8080 ...`
5. Open your browser and go to:
   `http://localhost:8080`
6. Edit files and save. Then refresh the browser tab to see changes.
7. Stop the server when done by going back to Terminal and pressing `Ctrl + C`.

### If `python3` is not found

Try:

```bash
python -m http.server 8080
```

## Use Google Sans / Google Sans Light

Important: Google Sans is not provided through Google Fonts, so you need the font files locally to use it reliably.

1. Create a folder named `fonts` in the project root:

```bash
mkdir -p /Users/juho/Documents/Playground/fonts
```

2. Put these files inside `/Users/juho/Documents/Playground/fonts`:
   - `GoogleSansFlex_24pt-Regular.ttf`
   - `GoogleSansFlex_24pt-Light.ttf`
3. `styles.css` is already configured to use them with `@font-face`.
4. Refresh the page at `http://localhost:8080`.

If the files are missing, the page automatically falls back to Helvetica/Arial.

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. In repository settings, enable GitHub Pages from the default branch root.
3. Your site will be served automatically.
