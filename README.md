# Param Pabari Portfolio Site

This is a multi-page, dynamic portfolio website for a finance-focused student profile. It is a static front-end project (HTML/CSS/JS) that runs without a backend.

## Features

- Multi-page site:
	- `index.html` (home)
	- `about.html`
	- `projects.html`
	- `blog.html`
	- `article.html`
	- `contact.html`
	- `editor.html` (private blog editor)
- Dynamic content rendering from local JS/JSON data.
- Smooth UI interactions:
	- reveal-on-scroll animations
	- counter animations
	- project filtering
	- blog search and tag filtering
- Contact flow with validation and prefilled mail composer (`mailto`).
- Password-protected rich blog editor with:
	- Quill rich text editor
	- image upload from device
	- video embed support
	- create/edit/delete posts
	- JSON import/export
	- reset-to-seed data

## Local Run

Use any static server. Example with Python:

```bash
cd portfolio-site
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Data Sources

- Projects: `projects.json`
- Seed blog posts: `posts/index.json`
- Runtime blog storage (browser): `localStorage` key
	- `param_portfolio_blog_posts_v2`

## Editor Access

- Open `editor.html`.
- Default password: `firebolt`
- On successful login, a session key is set in browser `sessionStorage`:
	- `param_editor_session_v2`

### Change Editor Password

1. Generate SHA-256 for your new password.
2. Replace `EDITOR_PASSWORD_HASH` in `editor.js`.

Browser console example to generate hash:

```js
async function hashPassword(value) {
	const bytes = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return Array.from(new Uint8Array(digest))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

hashPassword("your-new-password").then(console.log);
```

## Deployment

Deploy as a static site to GitHub Pages, Netlify, Vercel, or any static host.

For GitHub Pages:

1. Push the `portfolio-site` files to a repository.
2. In repository settings, enable Pages from the root of the main branch.

## Notes

- Blog posts created from the editor are stored per browser/device unless exported.
- Use Export JSON regularly for backup and portability.
