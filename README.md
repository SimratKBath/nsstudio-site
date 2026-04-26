# NS Studio LLC — Site

Static HTML site for [nsstudiollc.com](https://nsstudiollc.com).
Articles are managed through a password-protected admin at `/admin/`.

## Stack

- Static HTML/CSS/JS (no framework)
- [Decap CMS](https://decapcms.org/) for article publishing
- [Netlify Identity](https://docs.netlify.com/security/secure-access-to-sites/identity/) for `/admin` auth
- Netlify hosting + CI

## Local dev

Just open `index.html` in a browser, or:

```bash
npx serve .
```

To rebuild articles from `content/articles/*.md`:

```bash
npm install
npm run build
```

## Publishing articles

1. Visit `https://nsstudiollc.com/admin/` and log in
2. Click **New Article**, fill in title / cover / body
3. Click **Publish** — Decap commits a markdown file to `content/articles/`
4. Netlify auto-builds → article goes live within ~60 seconds

Three writing modes are available in the editor: Markdown, Rich Text, and paste-from-Word.

## Folder structure

```
.
├── admin/               Decap CMS (login + config)
├── assets/uploads/      Cover + inline images uploaded via /admin
├── blog/                Generated article HTML (do not edit by hand)
├── content/articles/    Source markdown — Decap writes here
├── pages/               Static pages (about, services, research, etc.)
├── scripts/             Build script
├── netlify.toml         Build + redirect config
└── package.json
```

## Deploy

Push to `main` → Netlify rebuilds. That's it.
