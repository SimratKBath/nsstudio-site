// NS Studio — site-wide interactions
(function () {
  // Mark JS-enabled so reveal animations only trigger when JS is running
  document.documentElement.classList.add('js');

  // Theme toggle (in-memory, no localStorage)
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateToggleIcon(t);
  });

  function updateToggleIcon(btn) {
    btn.setAttribute(
      'aria-label',
      'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode',
    );
    btn.innerHTML =
      theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(updateToggleIcon);

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
    });
  }

  // Sticky header — add shadow on scroll
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Reveal on scroll — also reveal on initial load for elements already in viewport
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px 100px 0px' },
  );
  reveals.forEach((el) => io.observe(el));
  // Safety net: after 2.5s, force-reveal anything still hidden (covers scroll-jacked pages)
  setTimeout(() => {
    reveals.forEach((el) => el.classList.add('in'));
  }, 2500);

  // Form handler — uses Formspree-style fallback; user replaces endpoint
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('[data-form-status]');
      const submitBtn = form.querySelector('[type="submit"]');
      const data = Object.fromEntries(new FormData(form));
      const formType = form.dataset.form;

      submitBtn.disabled = true;
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      try {
        // Replace this endpoint with your Formspree / Netlify Forms / serverless URL
        // For now we simulate success and provide a mailto fallback.
        const endpoint = window.NS_STUDIO_FORM_ENDPOINT;
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ formType, ...data }),
          });
          if (!res.ok) throw new Error('Request failed');
        } else {
          // Fallback: open mailto with prefilled body
          const subject = encodeURIComponent(`NS Studio — ${formType} submission`);
          const body = encodeURIComponent(
            Object.entries(data)
              .map(([k, v]) => `${k}: ${v}`)
              .join('\n'),
          );
          window.location.href = `mailto:simratbath@gmail.com?subject=${subject}&body=${body}`;
        }

        if (status) {
          status.textContent =
            formType === 'lead-magnet'
              ? "✓ Thanks. Check your email for the download link."
              : "✓ Got it. We'll respond within one business day.";
          status.style.color = 'var(--color-success)';
        }
        form.reset();
      } catch (err) {
        if (status) {
          status.textContent =
            'Something went wrong. Email simratbath@gmail.com directly and we will get back to you.';
          status.style.color = 'var(--color-error)';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = origText;
      }
    });
  });
})();
