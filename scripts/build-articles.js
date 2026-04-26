// Build script: turns each markdown file in content/articles/*.md
// into a matching HTML file in blog/<slug>.html, and rebuilds pages/blog.html
// listing. Runs on every Netlify deploy.

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.resolve(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "content", "articles");
const BLOG_OUT_DIR = path.join(ROOT, "blog");
const LISTING_PATH = path.join(ROOT, "pages", "blog.html");

// ---------- helpers ----------

function fmtDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------- article HTML template ----------

function articleHTML({ title, subtitle, category, read_time, date, cover_image, cover_alt, excerpt, meta_description, bodyHtml }) {
  const desc = meta_description || excerpt || "";
  const cover = cover_image
    ? `<figure class="article-cover" style="margin: 0 0 var(--space-12) 0">
         <img src="${escapeHtml(cover_image)}" alt="${escapeHtml(cover_alt || title)}" style="width:100%; height:auto; border-radius: 4px" />
       </figure>`
    : "";

  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} — NS Studio</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="stylesheet" href="../base.css" />
    <link rel="stylesheet" href="../style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
  </head>
  <body>
    <div id="site-header"></div>

    <main id="main">
      <section class="page-hero">
        <div class="container container--default">
          <div class="blog-card-meta" style="margin-bottom: var(--space-4)">
            <span class="category">${escapeHtml(category || "Frameworks")}</span>
            ${read_time ? `<span>${escapeHtml(read_time)}</span>` : ""}
            ${date ? `<span>Published ${escapeHtml(fmtDate(date))}</span>` : ""}
          </div>
          <h1 style="font-size: var(--text-2xl)">${escapeHtml(title)}</h1>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        </div>
      </section>

      <section class="tight">
        <div class="container">
          ${cover}
          <article class="article">
            ${bodyHtml}
          </article>
        </div>
      </section>

      <section class="tight">
        <div class="container" style="text-align:center">
          <a class="btn btn-primary" href="../pages/blog.html">← All articles</a>
        </div>
      </section>
    </main>

    <div id="site-footer"></div>
    <script src="../partials.js"></script>
  </body>
</html>
`;
}

// ---------- listing card template ----------

function listingCard(meta, slug, featured = false) {
  const date = fmtDate(meta.date);
  const read = meta.read_time || "";
  const cat = meta.category || "Frameworks";

  if (featured) {
    return `
          <a href="../blog/${escapeHtml(slug)}.html" class="blog-card" style="margin-bottom: var(--space-16); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-8); align-items: center">
            ${meta.cover_image
              ? `<div class="blog-card-image" style="aspect-ratio: 16/10; overflow: hidden; border-radius: 4px"><img src="${escapeHtml(meta.cover_image)}" alt="${escapeHtml(meta.cover_alt || meta.title)}" style="width:100%; height:100%; object-fit:cover" /></div>`
              : ""}
            <div>
              <div class="blog-card-meta">
                <span class="category">Featured · ${escapeHtml(cat)}</span>
                ${read ? `<span>${escapeHtml(read)}</span>` : ""}
                ${date ? `<span>${escapeHtml(date)}</span>` : ""}
              </div>
              <h3 style="font-size: var(--text-xl)">${escapeHtml(meta.title)}</h3>
              <p>${escapeHtml(meta.excerpt || "")}</p>
            </div>
          </a>`;
  }

  return `
            <a href="../blog/${escapeHtml(slug)}.html" class="blog-card">
              ${meta.cover_image
                ? `<div class="blog-card-image" style="aspect-ratio: 16/10; overflow: hidden; border-radius: 4px; margin-bottom: var(--space-4)"><img src="${escapeHtml(meta.cover_image)}" alt="${escapeHtml(meta.cover_alt || meta.title)}" style="width:100%; height:100%; object-fit:cover" /></div>`
                : ""}
              <div class="blog-card-meta">
                <span class="category">${escapeHtml(cat)}</span>
                ${read ? `<span>${escapeHtml(read)}</span>` : ""}
                ${date ? `<span>${escapeHtml(date)}</span>` : ""}
              </div>
              <h3>${escapeHtml(meta.title)}</h3>
              <p>${escapeHtml(meta.excerpt || "")}</p>
            </a>`;
}

// ---------- listing page template ----------

function listingHTML(featured, rest) {
  return `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Articles — NS Studio</title>
    <meta
      name="description"
      content="Frameworks, opinions, and field notes from inside AI advisory engagements. New articles every two weeks."
    />
    <link rel="stylesheet" href="../base.css" />
    <link rel="stylesheet" href="../style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
  </head>
  <body>
    <div id="site-header"></div>

    <main id="main">
      <section class="page-hero">
        <div class="container">
          <span class="eyebrow">Articles</span>
          <h1>Field notes from inside AI advisory engagements.</h1>
          <p>
            Frameworks, opinions, and the reasoning behind decisions we make
            with paying clients. New articles every two weeks. No SEO bait.
          </p>
        </div>
      </section>

      <section class="tight">
        <div class="container">
          ${featured || ""}

          <div class="blog-grid">
            ${rest.join("\n")}
          </div>
        </div>
      </section>
    </main>

    <div id="site-footer"></div>
    <script src="../partials.js"></script>
  </body>
</html>
`;
}

// ---------- main ----------

function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.log(`[build-articles] no ${ARTICLES_DIR} — skipping`);
    return;
  }

  const files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".md"));
  if (!files.length) {
    console.log("[build-articles] no markdown articles yet — skipping listing rebuild");
    return;
  }

  fs.mkdirSync(BLOG_OUT_DIR, { recursive: true });

  const articles = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = slugify(data.slug || path.basename(file, ".md") || data.title);
    const bodyHtml = marked.parse(content || "");
    const html = articleHTML({ ...data, bodyHtml });
    fs.writeFileSync(path.join(BLOG_OUT_DIR, `${slug}.html`), html);
    articles.push({ data, slug });
    console.log(`  ✓ blog/${slug}.html`);
  }

  // Sort by date desc
  articles.sort((a, b) => new Date(b.data.date || 0) - new Date(a.data.date || 0));

  const featuredArticle = articles.find((a) => a.data.featured) || articles[0];
  const rest = articles
    .filter((a) => a !== featuredArticle)
    .map((a) => listingCard(a.data, a.slug));
  const featuredHtml = featuredArticle
    ? listingCard(featuredArticle.data, featuredArticle.slug, true)
    : "";

  fs.writeFileSync(LISTING_PATH, listingHTML(featuredHtml, rest));
  console.log(`  ✓ pages/blog.html (${articles.length} article${articles.length === 1 ? "" : "s"})`);
}

main();
