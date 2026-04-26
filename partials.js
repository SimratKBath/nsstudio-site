// Renders shared header + footer on every page. Call after DOMContentLoaded.
(function () {
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
    { href: 'faq.html', label: 'FAQ' },
  ];

  // Find prefix — pages in /pages/ subfolder need ../ prefix
  const inPages = path.includes('/pages/') || path.includes('\\pages\\');
  const inBlog = path.includes('/blog/') || path.includes('\\blog\\');
  const prefix = inPages || inBlog ? '../' : './';

  const logoSvg = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NS Studio">
    <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" stroke-width="2"/>
    <path d="M9 22 L9 10 L23 22 L23 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;

  const headerHtml = `
    <header class="site-header" role="banner">
      <a href="#main" class="skip-link">Skip to main content</a>
      <div class="container">
        <nav class="nav" aria-label="Primary">
          <a class="nav-logo" href="${prefix}index.html" aria-label="NS Studio — home">
            ${logoSvg}
            <span>NS Studio</span>
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
            <a class="nav-logo" href="${prefix}index.html" style="margin-bottom: var(--space-4)">
              ${logoSvg}
              <span>NS Studio</span>
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
              <li><a href="${prefix}pages/faq.html">FAQ</a></li>
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
