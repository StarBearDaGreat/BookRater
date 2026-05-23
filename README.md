# 📚 Book Rater

A cozy, minimal book saving and rating app built with plain HTML, CSS, and JavaScript. Search for books, save them to personalised shelves, rate them, and track your yearly reading goal.

---

## Features

- **Search** — Search by title or author using the Open Library API
- **Sort & Filter** — Sort results by genre, popularity, or release date
- **Book Details** — View cover, title, author, release date, blurb, and community rating
- **Shelves** — Two core tabs: *Want to Read* and *Read*, each supporting custom named lists
- **Ratings** — Community rating displayed to 1 decimal place; add your own whole-star rating (1–5) and a written comment
- **Auto-move** — Marking a wish list book as read automatically moves it to your Read shelf
- **Yearly Goal** — Set a book goal for the year and track your progress

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Data persistence | Supabase (PostgreSQL) |
| Book data | [Open Library Search API](https://openlibrary.org/developers/api) |

---

## Getting Started

### Prerequisites

- A modern web browser
- A [Supabase](https://supabase.com) account and project

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/book-rater.git
   cd book-rater
   ```

2. **Configure Supabase**

   - Create a new Supabase project
   - Run the SQL schema found in `supabase/schema.sql` in your Supabase SQL editor
   - Copy your project URL and anon key

3. **Add environment config**

   Create a `config.js` file in the root:

   ```js
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

4. **Open the app**

   Open `index.html` directly in your browser, or serve it with a simple local server:

   ```bash
   npx serve .
   ```

---

## Project Structure

```
book-rater/
├── index.html
├── config.js              # Supabase credentials (not committed)
├── css/
│   └── styles.css
├── js/
│   ├── api.js             # Open Library API calls
│   ├── supabase.js        # Supabase client and DB helpers
│   ├── shelves.js         # Shelf and list logic
│   ├── ratings.js         # Rating and review logic
│   ├── goals.js           # Yearly reading goal tracker
│   └── app.js             # Main entry point
├── supabase/
│   └── schema.sql         # Database schema
└── assets/
    └── placeholder-cover.png
```

---

## Design

- **Palette** — Warm neutrals: cream backgrounds, tan accents, soft brown typography
- **Style** — Cozy and minimal, inspired by Notion and Readwise
- **Shelves** — Two primary tabs (*Want to Read* / *Read*) with support for custom named sub-lists

---

## API Reference

Book data is sourced from the Open Library Search API:

```
GET https://openlibrary.org/search.json?q=YOUR_QUERY
```

Fields used: `title`, `author_name`, `first_publish_year`, `cover_i`, `subject`, `ratings_average`, `ratings_count`, `first_sentence`.

Cover images are loaded via:

```
https://covers.openlibrary.org/b/id/{cover_i}-M.jpg
```

---

## License

MIT
