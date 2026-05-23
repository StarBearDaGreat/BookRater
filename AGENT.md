# AGENT.md — Book Rater

This file provides guidance for AI coding agents working on the Book Rater codebase. Read this before making any changes.

---

## Project Overview

Book Rater is a vanilla HTML/CSS/JS web app. There is no build step, no framework, and no bundler. Files are served directly. Supabase is used for persistence via its browser CDN client.

---

## Architecture

### Frontend
- Pure HTML, CSS, and JavaScript — no frameworks, no npm, no build tools
- JS is split into focused modules loaded via `<script>` tags in `index.html`
- No ES module imports — use the global scope and namespace objects (e.g. `BookRater.api`, `BookRater.shelves`)

### Backend / Database
- Supabase (PostgreSQL) via the Supabase JS CDN client
- All DB access goes through `js/supabase.js` — do not call Supabase directly from other files
- Credentials live in `config.js` (gitignored)

### External API
- Open Library Search API: `https://openlibrary.org/search.json?q=QUERY`
- All API calls go through `js/api.js`
- Covers: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`
- Always handle missing covers gracefully using `assets/placeholder-cover.png`

---

## File Responsibilities

| File | Responsibility |
|---|---|
| `js/api.js` | Open Library fetch, search, sort, and field normalisation |
| `js/supabase.js` | Supabase client init, all DB reads/writes |
| `js/shelves.js` | Shelf state, tab switching, custom list CRUD, auto-move logic |
| `js/ratings.js` | Personal star rating (1–5 whole stars) and comment save/load |
| `js/goals.js` | Yearly reading goal — set target, count books read this year |
| `js/app.js` | Bootstraps the app, wires up event listeners, coordinates modules |

---

## Database Schema

Refer to `supabase/schema.sql` for the full schema. Key tables:

- **books** — cached book data from Open Library (ol_id as primary key)
- **shelf_entries** — links a book to a shelf (`want_to_read` or `read`) and optional custom list name
- **ratings** — user's star rating (1–5 integer) and comment text per book
- **goals** — yearly reading goal target per year

### Important rules
- `ol_id` is the Open Library work ID (e.g. `OL45804W`) — use this as the stable identifier everywhere
- Never duplicate book data — upsert into `books` on search result save
- A book can only exist in one primary shelf at a time (`want_to_read` or `read`)
- Auto-move: when adding to `read`, delete any existing `want_to_read` entry for the same `ol_id`

---

## Key Behaviours to Preserve

### Search & Display
- Query Open Library with the user's input; do not cache search results in the DB
- Sort options: genre (subject), popularity (ratings_count), release date (first_publish_year)
- Show a "No description available" message if `first_sentence` is missing — do not hide the blurb area

### Ratings
- Community rating: pull `ratings_average` from Open Library, display to **1 decimal place** with a star icon
- Personal rating: whole stars only (1–5), stored in Supabase `ratings` table
- Both ratings shown on the book detail view; personal rating is editable

### Shelves & Lists
- Two fixed primary tabs: **Want to Read** and **Read**
- Within each tab, users can create simple named lists (strings only, no icons)
- A book belongs to one primary shelf and optionally one named list within that shelf
- When a book is moved from Want to Read → Read, remove the Want to Read entry automatically (no prompt)

### Yearly Goal
- One goal target per calendar year (integer, number of books)
- Progress = count of books in the `read` shelf with a `date_added` in the current year
- Display as "X of Y books read this year"

---

## Coding Conventions

- Use `const` and `let`; never `var`
- Async/await for all fetch and Supabase calls; always use try/catch
- Keep DOM manipulation in `app.js` or the relevant module — do not scatter `document.querySelector` calls everywhere
- CSS variables are defined in `:root` in `styles.css` — always use them, never hardcode colours
- All user-facing strings go through the DOM directly (no templating engine)
- No external JS libraries except the Supabase CDN client

### CSS Variables (Warm Neutral Palette)

```css
:root {
  --color-bg:        #FAF7F2;   /* cream background */
  --color-surface:   #F0EBE1;   /* card / panel surface */
  --color-border:    #DDD5C8;   /* subtle borders */
  --color-accent:    #C8A97E;   /* tan accent */
  --color-text:      #4A3728;   /* soft brown primary text */
  --color-text-muted:#8A7060;   /* secondary / muted text */
  --color-star:      #C8923A;   /* star rating colour */
}
```

---

## What Not To Do

- Do not introduce a JS framework (React, Vue, etc.)
- Do not add a bundler or build step
- Do not write to Supabase outside of `js/supabase.js`
- Do not call the Open Library API outside of `js/api.js`
- Do not store credentials in any file other than `config.js`
- Do not add half-star rating UI — personal ratings are whole stars only
- Do not add reading progress tracking — this feature was explicitly excluded
- Do not prompt the user when auto-moving a book from Want to Read to Read — it should be silent

---

## Common Tasks

### Adding a new Supabase query
1. Write the query function in `js/supabase.js`
2. Export it on the `BookRater.db` namespace
3. Call it from the appropriate module

### Adding a new UI section
1. Add the HTML structure to `index.html`
2. Add styles using existing CSS variables in `styles.css`
3. Wire up logic in the relevant JS module
4. Register event listeners in `app.js`

### Changing the Open Library fields used
1. Update the fetch and normalisation logic in `js/api.js`
2. Update `supabase/schema.sql` if new fields need to be persisted
3. Update this file if the change affects key behaviours above
