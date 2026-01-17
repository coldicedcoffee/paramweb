# Portfolio Website — Finance & Consulting

This is a minimal, responsive static portfolio site intended for a finance/consultant professional. It is designed to be hosted as a static site (GitHub Pages, Netlify, Vercel, etc.).

Getting started locally:

1. Open the folder `portfolio-site` in your editor or serve it with a static server.

Quick preview using Python (if installed):

```bash
cd portfolio-site
python -m http.server 8000
# then open http://localhost:8000
```

Deploy to GitHub Pages:

1. Create a new GitHub repository (e.g. `username/portfolio`).
2. From the `portfolio-site` directory run:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. In the repository settings -> Pages: set the source to `main` branch and `/ (root)` folder. GitHub Pages will publish the site shortly.

Optional:
- Replace `Your Name` in `index.html` and fill the case studies.
- Point the contact form to Formspree or your preferred form endpoint.
