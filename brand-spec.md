# NS Studio — Brand Spec
**Version 1.0 · April 2026 · maintained by Simrat Bath**

> A short, opinionated rulebook. Read once. Reference often. Override only with cause.

---

## 1. Brand in one sentence

**NS Studio is a boutique AI product advisory that tells F500 operators which AI products to build, which to kill, and how to ship the rest.**

If a deliverable, a page, a post, or an asset doesn't sound like something a senior partner would say with a straight face to a CEO — it isn't us.

---

## 2. Voice rules

| Do | Don't |
|---|---|
| Short sentences | Long, qualifier-stuffed sentences |
| Specific dollar figures | "Significant ROI" |
| "We tell you which to kill." | "We help you optimize your portfolio." |
| Italic amber on the one phrase per paragraph that matters | Bold-everything |
| Honest scarcity ("3 engagements per quarter") | Fake urgency ("limited time only") |
| First-person plural for the studio ("we") | Third-person marketing voice ("the team") |
| End with a clear next step | End with "let's chat" |

**Banned words (zero exceptions):**
synergy · leverage · transform · unlock · journey · ecosystem · robust · innovative · cutting-edge · revolutionary · solutions · empower · best-in-class · world-class · seamless · holistic · paradigm · disrupt

**Banned visuals:**
stock photography of people in suits · gradient-purple SaaS aesthetic · neural-network art · blue-brain art · robot-hand art · emoji in marketing · sans-serif headlines

---

## 3. Colors

| Role | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F4EFE4` | Cream paper — default page background |
| `--color-surface` | `#FAF6EC` | Lighter cream — section backgrounds |
| `--color-surface-2` | `#FFFCF4` | Card backgrounds on cream |
| `--color-text` | `#1A1612` | Body text on cream · also dark-card backgrounds |
| `--color-text-muted` | `#4D453A` | Secondary text |
| `--color-text-faint` | `#8B7E68` | Captions, page numbers |
| `--color-text-inverse` | `#F0E8D8` | Cream text on dark cards |
| `--color-primary` | `#C44510` | **Italic emphasis · prompt-card tags · primary CTAs** |
| `--color-primary-hover` | `#A8380B` | Hover state |
| `--color-accent-2` | `#8C5A1F` | Secondary accent — use sparingly |
| `--color-border` | `#C9BC97` | Borders on cream |

**The amber rule:** `#C44510` is reserved for *one phrase per paragraph* and prompt-card tags. If amber appears twice in a paragraph, you've cheapened it. Treat it like the only seasoning in the dish.

---

## 4. Typography

Three families. No more. No less.

| Family | Use | Source |
|---|---|---|
| **Instrument Serif** | Display headlines, italic emphasis | Google Fonts (free) |
| **Inter** | Body text, UI, navigation | Google Fonts (free) |
| **JetBrains Mono** | Inside prompt cards · eyebrow labels · page numbers | Google Fonts (free) |

**Type rules:**
- Headlines are *Instrument Serif 400* — never bold, never italic except for the one accent phrase
- The accent phrase per headline goes in `<em>` tags and inherits italic + amber
- Body is *Inter 400* at clamp(1rem, 0.95rem + 0.25vw, 1.125rem), line-height 1.6
- Eyebrow labels are *JetBrains Mono uppercase tracked +0.12em* — amber
- Mono is *exclusively* inside prompt cards or as eyebrows; never as body text

---

## 5. The prompt card — our signature element

The dark `#1A1612` rounded-rectangle card with mono cream text and amber XML tags is the most ownable visual in the brand. It appears on:
- Homepage hero
- One per service section
- Every case study (the prompt that ran the engagement)
- The free-guide PDF (one per flaw)
- Pitch deck slides 5 and 8
- LinkedIn cover image

**Anatomy of a prompt card:**

```html
<div class="prompt-card prompt-card--dark">
  <pre><code><span class="tag">&lt;role&gt;</span>
Act as a CFO reviewing every active AI pilot.
You are paid to ask one question: which of these
will I defend to the board?
<span class="tag">&lt;/role&gt;</span>

<span class="tag">&lt;rules&gt;</span>
- Pilot must produce a defendable dollar figure by week 6
- "Promising" is not a status — it's a stall
<span class="tag">&lt;/rules&gt;</span>

<span class="tag">&lt;output&gt;</span>
Defendable list → Stall list → Kill list
<span class="tag">&lt;/output&gt;</span></code></pre>
</div>
```

**Card rules:**
- Padding 24–32px
- Border-radius 12px
- Background `#1A1612`, text `#F0E8D8`, tags `#C44510`
- Font: JetBrains Mono 13–15px, line-height 1.65
- Optional: rotate ±2° for "editorial paper" feel when standalone
- Never put more than one card per row above 1280px viewport — they need breathing room

---

## 6. The kill list — second signature element

Every engagement ends with a kill list. On the site and in deliverables it should appear as:

- A dark `#1A1612` card
- Mono-font items, each prefixed with an amber `✕` or strikethrough
- Items written in real, specific language ("Vendor X enterprise renewal — ROI undefended after 9 months") not abstract ones ("legacy systems")

---

## 7. Logo

**Primary:** `[N]` — the bracketed N inside a 2px-stroked rounded square, accompanied by the wordmark "NS Studio" in *Inter 600*.

**Secondary (new):** `<NS />` — XML-tag wordmark for use on prompt-card-heavy surfaces (PDF cover, deck cover, LinkedIn header, /brand page header). Renders as:

```
<NS />     ← amber tags, cream NS, JetBrains Mono
```

The amber dot (`·`) separator is a recurring brand element. Use it between identity strings: `NS Studio · Boutique AI advisory · California`.

---

## 8. Layout & spacing

- Container max-width: 1200px wide / 960px default / 640px narrow
- Section vertical padding: clamp(64px, 8vw, 128px)
- Body line measure: 60–66ch
- Eyebrow → headline → body: gap of 12–16px
- Cards: 24–32px internal padding minimum
- Page edge: clamp(16px, 4vw, 48px)

---

## 9. The voice card

Every page (other than the homepage) starts with a one-line italic amber phrase that frames the page. Always under the eyebrow, always as a single short sentence.

| Page | Voice card |
|---|---|
| /services | *What you actually buy.* |
| /pricing | *Three shapes. One conversation.* |
| /portfolio | *The work that earned the opinions.* |
| /research | *The work that funds the opinions.* |
| /about | *Why this exists.* |
| /articles | *Frameworks, in long form.* |
| /faq | *The honest answers.* |
| /contact | *The shortest path to a conversation.* |
| /brand | *The rules we hold ourselves to.* |

---

## 10. Photography & illustration

Default position: **none.**

If used, the rule is: black-and-white only · only artifacts (the kill list, a memo page, a sketched framework) or people working (no smiling stock-photo handshakes) · never AI-cliché art.

---

## 11. Anti-brand checklist (before publishing anything)

Run this before pushing any new page, post, or deliverable:

- [ ] Zero banned words?
- [ ] Amber appears at most once per paragraph?
- [ ] At least one prompt card, voice card, or kill list element?
- [ ] No emoji in marketing copy?
- [ ] Single decision/CTA at the end?
- [ ] Is there an italic amber accent phrase?
- [ ] Could this have been written by McKinsey? (If yes, rewrite.)
- [ ] Does it survive being read aloud to a skeptical CEO?

---

## 12. Cadence — when to use what

| Surface | Required brand elements |
|---|---|
| Site page | Voice card · ≥1 prompt card OR kill list · italic amber accent in headline |
| Blog post | Italic amber accent · pull-quote ≥1 |
| LinkedIn post | Italic-emphasis approximation (single bold word at most) · always end with one CTA |
| PDF / Field Guide | Cover prompt card · ≥1 prompt card per chapter · kill list · colophon |
| Pitch deck | Cover, problem, prompt card slide, kill list slide, principles slide |
| SOW / proposal | Header `<NS />` mark · prompt card on cover · kill clause in terms |
| Email signature | Italic amber tagline · `nsstudiollc.com` · nothing else |

---

*This spec is the source of truth. When the site disagrees with the spec, the site is wrong. Update the spec only deliberately.*
