// Netlify Function — handles ALL form submissions for nsstudiollc.com.
//
// Routes by `form_type`:
//   • lead-magnet  → emails the user the Fatal Flaws PDF (download link), notifies owner, logs to sheet
//   • discovery    → emails the user a confirmation, notifies owner with full details, logs to sheet
//
// Always logs to the Google Sheet via Apps Script webhook (best-effort).
//
// Required environment variables (set in Netlify dashboard → Site settings → Environment):
//   RESEND_API_KEY      — re_... key from resend.com/api-keys
//   FROM_EMAIL          — e.g. "NS Studio <hello@nsstudiollc.com>"
//   REPLY_TO_EMAIL      — e.g. simratbath@gmail.com
//   SHEET_WEBHOOK_URL   — your Apps Script /exec URL (optional but recommended)
//   NOTIFY_EMAIL        — your inbox for new-lead notifications (optional)

const PDF_URL = 'https://nsstudiollc.com/assets/brand/nsstudio-kill-or-ship-guide.pdf';
const PDF_TITLE = 'Kill or Ship';
const PDF_SUBLINE = 'A field guide for deciding which AI pilots survive — and which to stop.';

const ALLOWED_ORIGINS = [
  'https://nsstudiollc.com',
  'https://www.nsstudiollc.com',
  'https://nsstudiollc.netlify.app',
];

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function leadEmailHtml(name) {
  const firstName = escapeHtml((name || '').split(' ')[0] || 'there');
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4EFE4;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#1A1612">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE4;padding:40px 20px">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FAF6EC;border:1px solid #C9BC97;border-radius:4px;padding:48px 40px">
      <tr><td>
        <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;color:#8B7E68;text-transform:uppercase">NS Studio</p>
        <h1 style="margin:0 0 24px;font-family:'Instrument Serif',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:#1A1612">Hi ${firstName} — your guide.</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4D453A">Here's <em>Kill or Ship</em>: the seven-signal rubric and decision tree we use to triage active AI pilots in client engagements. 17 pages. Four anonymized case sketches. One scoring worksheet you can run yourself this quarter.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#4D453A">Read it. If it matches how you already think about pilots, my calendar's at the bottom.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px">
          <tr><td style="background:#C44510;border-radius:2px"><a href="${PDF_URL}" style="display:inline-block;padding:14px 28px;color:#F0E8D8;text-decoration:none;font-size:15px;font-weight:500">Download the PDF →</a></td></tr>
        </table>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4D453A">If the button doesn't work, paste this:</p>
        <p style="margin:0 0 32px;font-size:13px;font-family:'JetBrains Mono',monospace;word-break:break-all;color:#8B7E68"><a href="${PDF_URL}" style="color:#C44510">${PDF_URL}</a></p>
        <hr style="border:none;border-top:1px solid #C9BC97;margin:32px 0"/>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4D453A">No drip sequence. No follow-ups. One email, one PDF, done — as promised.</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4D453A">If you want to talk, my calendar: <a href="https://calendly.com/simratbath/30min" style="color:#C44510">calendly.com/simratbath/30min</a></p>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#4D453A">— Simrat<br/><span style="color:#8B7E68">NS Studio</span></p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:11px;color:#8B7E68;font-family:'JetBrains Mono',monospace">nsstudiollc.com</p>
  </td></tr>
</table>
</body></html>`;
}

function leadEmailText(name) {
  const firstName = (name || '').split(' ')[0] || 'there';
  return `Hi ${firstName},

Here's Kill or Ship — the seven-signal rubric and decision tree we use to triage active AI pilots in client engagements. 17 pages. Four anonymized case sketches. One scoring worksheet you can run yourself this quarter.

Download: ${PDF_URL}

Read it. If it matches how you already think about pilots, my calendar's at the bottom.

No drip sequence. No follow-ups. One email, one PDF, done — as promised.

Calendar: https://calendly.com/simratbath/30min

— Simrat
NS Studio
nsstudiollc.com
`;
}

// Discovery confirmation email — sent to the lead after they submit a discovery form
function discoveryConfirmHtml(name) {
  const firstName = escapeHtml((name || '').split(' ')[0] || 'there');
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4EFE4;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;color:#1A1612">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE4;padding:40px 20px">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FAF6EC;border:1px solid #C9BC97;border-radius:4px;padding:48px 40px">
      <tr><td>
        <p style="margin:0 0 8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2px;color:#8B7E68;text-transform:uppercase">NS Studio</p>
        <h1 style="margin:0 0 24px;font-family:'Instrument Serif',Georgia,serif;font-size:32px;line-height:1.2;font-weight:400;color:#1A1612">Got it, ${firstName}.</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4D453A">Your inquiry is in. I read every one of these personally and will respond within one business day with either a calendar link or a thoughtful reason we're not the right fit.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#4D453A">If you'd rather skip the wait, my calendar is open: <a href="https://calendly.com/simratbath/30min" style="color:#C44510">calendly.com/simratbath/30min</a></p>
        <hr style="border:none;border-top:1px solid #C9BC97;margin:32px 0"/>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#4D453A">— Simrat<br/><span style="color:#8B7E68">NS Studio</span></p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:11px;color:#8B7E68;font-family:'JetBrains Mono',monospace">nsstudiollc.com</p>
  </td></tr>
</table>
</body></html>`;
}

function discoveryConfirmText(name) {
  const firstName = (name || '').split(' ')[0] || 'there';
  return `Got it, ${firstName}.

Your inquiry is in. I read every one of these personally and will respond within one business day with either a calendar link or a thoughtful reason we're not the right fit.

If you'd rather skip the wait, my calendar: https://calendly.com/simratbath/30min

— Simrat
NS Studio
nsstudiollc.com
`;
}

async function sendResendEmail({ to, subject, html, text, campaign }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'NS Studio <hello@nsstudiollc.com>';
  const replyTo = process.env.REPLY_TO_EMAIL || 'simratbath@gmail.com';
  if (!apiKey) throw new Error('RESEND_API_KEY not set');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
      text,
      tags: campaign ? [{ name: 'campaign', value: campaign }] : undefined,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error ${res.status}: ${errText}`);
  }
  return res.json();
}

async function sendNotificationEmail(payload) {
  const notify = process.env.NOTIFY_EMAIL;
  if (!notify) return; // optional
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'NS Studio <hello@nsstudiollc.com>';
  if (!apiKey) return;

  const { name, email, form_type } = payload;
  const isDiscovery = form_type === 'discovery';

  const subject = isDiscovery
    ? `New discovery inquiry: ${name || email}`
    : `New lead: ${name || email}`;

  const lines = isDiscovery
    ? [
        'New discovery form submission:',
        '',
        `Name: ${name || '(not provided)'}`,
        `Email: ${email}`,
        `Company & role: ${payload.company || '(not provided)'}`,
        `Engagement: ${payload.engagement || '(not provided)'}`,
        '',
        'Message:',
        payload.message || '(not provided)',
        '',
        `Time: ${payload.submitted_at}`,
        `Referer: ${payload.referer || '(none)'}`,
      ]
    : [
        'New Kill or Ship lead-magnet signup:',
        '',
        `Name: ${name || '(not provided)'}`,
        `Email: ${email}`,
        `Context: ${payload.context || '(not provided)'}`,
        `Time: ${payload.submitted_at}`,
      ];

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [notify], subject, text: lines.join('\n') }),
  }).catch(() => {});
}

async function forwardToSheet(payload) {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return;
  // Apps Script web apps return a 302 redirect on POST; modern fetch follows
  // redirects by default which is what we want. Use a short timeout so a slow
  // sheet write never blocks the user response.
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn('Sheet webhook non-OK:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.warn('Sheet webhook failed:', err.message);
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const headers = corsHeaders(origin);
  console.log('[lead-magnet] start', { method: event.httpMethod, origin });

  if (event.httpMethod === 'OPTIONS') {
    console.log('[lead-magnet] preflight -> 204');
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    console.log('[lead-magnet] wrong method -> 405');
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    console.log('[lead-magnet] invalid JSON -> 400');
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  console.log('[lead-magnet] payload keys:', Object.keys(body));

  // Honeypot — bots fill the hidden "website_url_extra" field, real users don't.
  // Use a less-guessable name so password managers don't autofill it.
  const honeypot = body.website_url_extra || body.company_website;
  if (honeypot && String(honeypot).length > 0) {
    console.log('[lead-magnet] honeypot tripped, value len:', String(honeypot).length);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const name = (body.name || '').toString().trim().slice(0, 200);
  const email = (body.email || '').toString().trim().toLowerCase().slice(0, 320);
  const context = (body.context || '').toString().trim().slice(0, 200);
  const company = (body.company || '').toString().trim().slice(0, 300);
  const engagement = (body.engagement || '').toString().trim().slice(0, 200);
  const message = (body.message || '').toString().trim().slice(0, 4000);
  const formType = (body.form_type || 'lead-magnet').toString().slice(0, 50);

  if (!name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name is required' }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email is required' }) };
  }

  // Discovery form requires company + message; lead magnet does not.
  if (formType === 'discovery') {
    if (!company) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Company & role is required' }) };
    }
    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'A message is required' }) };
    }
  }

  const leadPayload = {
    name,
    email,
    context: formType === 'discovery'
      ? `${company}${engagement ? ' | ' + engagement : ''}${message ? ' | ' + message : ''}`.slice(0, 4000)
      : context,
    company,
    engagement,
    message,
    form_type: formType,
    submitted_at: new Date().toISOString(),
    ip: event.headers['x-forwarded-for'] || '',
    user_agent: event.headers['user-agent'] || '',
    referer: event.headers.referer || event.headers.referrer || '',
  };

  // Send the user-facing email — must succeed
  try {
    console.log('[lead-magnet] sending Resend email', { to: email, formType });
    let resendResult;
    if (formType === 'discovery') {
      resendResult = await sendResendEmail({
        to: email,
        subject: "NS Studio — got your inquiry",
        html: discoveryConfirmHtml(name),
        text: discoveryConfirmText(name),
        campaign: 'discovery-confirmation',
      });
    } else {
      // lead-magnet (default)
      resendResult = await sendResendEmail({
        to: email,
        subject: 'Your NS Studio field guide: Kill or Ship',
        html: leadEmailHtml(name),
        text: leadEmailText(name),
        campaign: 'kill-or-ship-lead-magnet',
      });
    }
    console.log('[lead-magnet] Resend OK, id:', resendResult && resendResult.id);
  } catch (err) {
    console.error('[lead-magnet] Resend send failed:', err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "We couldn't process that. Please try again or email simratbath@gmail.com directly." }),
    };
  }

  // Forward to Sheet + send admin notification — best-effort, don't fail the request
  await Promise.all([forwardToSheet(leadPayload), sendNotificationEmail(leadPayload)]);
  console.log('[lead-magnet] done -> 200');

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      message: formType === 'discovery'
        ? "Thanks. We'll respond within one business day."
        : "Thanks. Check your inbox — the PDF is on its way.",
    }),
  };
};
