// Netlify Function — handles lead magnet form submissions.
// 1. Validates name + email
// 2. Sends the PDF email via Resend
// 3. Forwards the lead to a Google Sheet via Apps Script webhook (best-effort)
// 4. Returns JSON; the static site shows a success message
//
// Required environment variables (set in Netlify dashboard → Site settings → Environment):
//   RESEND_API_KEY      — re_... key from resend.com/api-keys
//   FROM_EMAIL          — e.g. "NS Studio <hello@nsstudiollc.com>"
//   REPLY_TO_EMAIL      — e.g. simratbath@gmail.com
//   SHEET_WEBHOOK_URL   — your Apps Script /exec URL (optional but recommended)
//   NOTIFY_EMAIL        — your inbox for new-lead notifications (optional)

const PDF_URL = 'https://nsstudiollc.com/assets/brand/nsstudio-fatal-flaws-guide.pdf';

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
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#4D453A">Here's the 12-minute PDF: the five fatal flaws we see kill AI initiatives, distilled from the diagnostic framework we run in paid engagements.</p>
        <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#4D453A">Read it. Decide if our thinking matches yours. If it does, my calendar's at the bottom.</p>
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

Here's the 12-minute PDF: the five fatal flaws we see kill AI initiatives, distilled from the diagnostic framework we run in paid engagements.

Download: ${PDF_URL}

Read it. Decide if our thinking matches yours. If it does, my calendar's at the bottom.

No drip sequence. No follow-ups. One email, one PDF, done — as promised.

Calendar: https://calendly.com/simratbath/30min

— Simrat
NS Studio
nsstudiollc.com
`;
}

async function sendResendEmail({ to, name }) {
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
      subject: 'Your NS Studio guide: 5 Fatal Flaws in AI Strategy',
      html: leadEmailHtml(name),
      text: leadEmailText(name),
      tags: [{ name: 'campaign', value: 'fatal-flaws-lead-magnet' }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error ${res.status}: ${errText}`);
  }
  return res.json();
}

async function sendNotificationEmail({ name, email, context }) {
  const notify = process.env.NOTIFY_EMAIL;
  if (!notify) return; // optional
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || 'NS Studio <hello@nsstudiollc.com>';
  if (!apiKey) return;

  const subject = `New lead: ${name || email}`;
  const text = `New fatal-flaws lead-magnet signup:

Name: ${name || '(not provided)'}
Email: ${email}
Context: ${context || '(not provided)'}
Time: ${new Date().toISOString()}
`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [notify], subject, text }),
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
  const formType = (body.form_type || 'lead-magnet').toString().slice(0, 50);

  if (!name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Name is required' }) };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email is required' }) };
  }

  const leadPayload = {
    name,
    email,
    context,
    form_type: formType,
    submitted_at: new Date().toISOString(),
    ip: event.headers['x-forwarded-for'] || '',
    user_agent: event.headers['user-agent'] || '',
    referer: event.headers.referer || event.headers.referrer || '',
  };

  // Send PDF email — must succeed
  try {
    console.log('[lead-magnet] sending Resend email to', email);
    const resendResult = await sendResendEmail({ to: email, name });
    console.log('[lead-magnet] Resend OK, id:', resendResult && resendResult.id);
  } catch (err) {
    console.error('[lead-magnet] Resend send failed:', err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "We couldn't send the email. Please try again or email simratbath@gmail.com directly." }),
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
      message: "Thanks. Check your inbox — the PDF is on its way.",
    }),
  };
};
