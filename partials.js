// Renders shared header + footer on every page. Call after DOMContentLoaded.
(function () {
  // Auto-redirect Netlify Identity invite/recovery tokens to /admin/
  // (Decap CMS handles the password set/reset flow there)
  if (window.location.hash && /(invite_token|recovery_token|confirmation_token)=/.test(window.location.hash)) {
    const adminPath = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/blog/') ? '../admin/' : '/admin/';
    window.location.replace(adminPath + window.location.hash);
    return;
  }

  const path = window.location.pathname;
  const isActive = (href) => {
    if (href === '/' || href === '/index.html') {
      return (
        path === '/' || path.endsWith('/index.html') || path.endsWith('/nsstudio/')
      );
    }
    return path.includes(href.replace(/^\//, ''));
  };

  const navItems = [
    { href: 'services.html', label: 'Services' },
    { href: 'pricing.html', label: 'Pricing' },
    { href: 'portfolio.html', label: 'Case Studies' },
    { href: 'research.html', label: 'Research' },
    { href: 'about.html', label: 'About' },
    { href: 'blog.html', label: 'Articles' },
    { href: 'brand.html', label: 'Brand' },
    { href: 'faq.html', label: 'FAQ' },
  ];

  // Find prefix — pages in /pages/ subfolder need ../ prefix
  const inPages = path.includes('/pages/') || path.includes('\\pages\\');
  const inBlog = path.includes('/blog/') || path.includes('\\blog\\');
  const prefix = inPages || inBlog ? '../' : './';

  // Editorial monogram lockup — N (currentColor) + italic S (amber) + hairline + STUDIO
  // Glyph paths from Instrument Serif Regular/Italic at upem=1000.
  // viewBox 1054 × 900 keeps the rule + STUDIO inside the box at every size.
  const logoSvg = `<svg class="brand-mark" viewBox="0 0 1054 900" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NS Studio">
    <g transform="translate(0, 720) scale(1, -1)"><path d="M429 -9Q413 -9 402 15L131 603Q128 610 123.5 609.0Q119 608 119 600V86Q119 58 128.5 43.5Q138 29 163 25L176 23Q189 22 189 11Q189 0 174 0H31Q16 0 16 11Q16 22 29 23L42 25Q68 29 78.0 43.5Q88 58 88 86V654Q88 675 81.5 682.0Q75 689 52 693L29 697Q16 700 16 709Q16 720 31 720H138Q163 720 173 698L409 179Q412 173 416.5 174.0Q421 175 421 181V634Q421 666 410.0 678.5Q399 691 382 694L364 697Q351 700 351 709Q351 720 366 720H509Q524 720 524 709Q524 698 511 697L498 695Q472 691 462.0 678.5Q452 666 452 634V23Q452 5 445.5 -2.0Q439 -9 429 -9Z" fill="currentColor"/></g>
    <g transform="translate(630, 720) scale(1, -1)"><path d="M173 -9Q145 -9 113.5 -3.0Q82 3 54.5 13.5Q27 24 11 38Q6 43 4.5 48.0Q3 53 5 63L33 220Q36 238 49 238Q61 238 61 218L62 179Q64 95 91.0 58.0Q118 21 179 21Q235 21 272.0 61.5Q309 102 309 170Q309 214 285.0 262.0Q261 310 218 358Q167 415 142.5 462.0Q118 509 118 561Q118 602 138.0 640.5Q158 679 198.5 704.5Q239 730 302 730Q389 730 435 691Q449 680 445 658L417 512Q414 497 403 497Q392 497 390 514L389 535Q385 616 366.5 658.5Q348 701 293 701Q253 701 229.0 683.0Q205 665 194.0 638.5Q183 612 183 586Q183 557 191.0 530.5Q199 504 218.5 474.5Q238 445 272 403Q320 346 347.0 294.0Q374 242 374 193Q374 134 347.5 88.5Q321 43 276.0 17.0Q231 -9 173 -9Z" fill="#C44510"/></g>
    <line x1="0" y1="780" x2="1054" y2="780" stroke="currentColor" stroke-width="8"/>
    <text x="0" y="860" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace" font-size="70" font-weight="500" letter-spacing="14" fill="currentColor">STUDIO</text>
  </svg>`;

  const headerHtml = `
    <header class="site-header" role="banner">
      <a href="#main" class="skip-link">Skip to main content</a>
      <div class="container">
        <nav class="nav" aria-label="Primary">
          <a class="nav-logo" href="${prefix}index.html" aria-label="NS Studio — home">
            ${logoSvg}
          </a>
          <ul class="nav-links" role="list">
            ${navItems
              .map(
                (item) =>
                  `<li><a href="${prefix}pages/${item.href}" ${
                    isActive(item.href) ? 'class="active"' : ''
                  }>${item.label}</a></li>`,
              )
              .join('')}
          </ul>
          <div class="nav-cta">
            <button class="theme-toggle" data-theme-toggle aria-label="Toggle dark mode" type="button"></button>
            <a class="btn btn-secondary" href="${prefix}pages/contact.html">Contact</a>
            <a class="btn btn-primary" href="${prefix}pages/contact.html#book">Book a call</a>
            <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  `;

  const footerHtml = `
    <footer class="site-footer" role="contentinfo">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="nav-logo nav-logo--footer" href="${prefix}index.html" style="margin-bottom: var(--space-4)">
              ${logoSvg}
            </a>
            <p>An advisory studio for AI products. We tell you which products to build, which to kill, and how to ship the rest.</p>
            <div style="margin-top: var(--space-6)">
              <span class="footer-cert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
                CA Small Business · ID 2045105
              </span>
            </div>
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <ul role="list">
              <li><a href="${prefix}pages/services.html#strategy">AI product strategy</a></li>
              <li><a href="${prefix}pages/services.html#workflow">Workflow design</a></li>
              <li><a href="${prefix}pages/services.html#governance">AI governance</a></li>
              <li><a href="${prefix}pages/pricing.html">Pricing</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Studio</h4>
            <ul role="list">
              <li><a href="${prefix}pages/about.html">About</a></li>
              <li><a href="${prefix}pages/portfolio.html">Case studies</a></li>
              <li><a href="${prefix}pages/research.html">Research</a></li>
              <li><a href="${prefix}pages/blog.html">Articles</a></li>
              <li><a href="${prefix}pages/brand.html">Brand</a></li>
              <li><a href="${prefix}pages/faq.html">FAQ</a></li>
              <li><a href="${prefix}admin/">Admin</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Get in touch</h4>
            <ul role="list">
              <li><a href="${prefix}pages/contact.html#book">Book a call</a></li>
              <li><a href="${prefix}pages/contact.html#discovery">Discovery form</a></li>
              <li><a href="${prefix}pages/contact.html#fatal-flaws">Free: 5 Fatal Flaws guide</a></li>
              <li><a href="mailto:simratbath@gmail.com">simratbath@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year"></span> NS Studio LLC. All rights reserved.</span>
          <span>California, United States</span>
        </div>
      </div>
    </footer>
  `;

  // Inject
  const headerSlot = document.getElementById('site-header');
  const footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.outerHTML = headerHtml;
  if (footerSlot) footerSlot.outerHTML = footerHtml;
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

})();
