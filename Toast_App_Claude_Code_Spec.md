# Toast Score — Technical Specification

**Version:** 1.1
**Date:** March 13, 2026
**Status:** Pre-build — all decisions finalized, ready for Phase 1

---

## Project Overview

A web app where users submit photos of their toast and three AI judges — each with a radically different personality — rate it simultaneously with absurd precision. The results land on a public leaderboard. No accounts. No human comments. No social features. The AI is the only voice.

Every submission gets three verdicts. Three screenshots. Three reasons to share. The product is the screenshot.

---

## Core Loop

1. User opens the app.
2. User taps "Rate My Toast" and takes a photo or uploads one.
3. All three AI judges analyze the image simultaneously.
4. User receives three verdicts, each with its own TQI score. The highest TQI is the toast's official score.
5. The toast and all three verdicts are published to the public gallery and leaderboard.
6. User shares individual verdict cards (optimized for screenshot and social sharing).

**Target time from camera to results: under 20 seconds.**

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Fastest path to deployed full-stack app |
| Hosting | Vercel (free tier) | Zero-config deployment from GitHub |
| Database | Supabase (free tier) | Postgres with REST API, handles auth if ever needed |
| Image Storage | Supabase Storage (free tier) | Public bucket, direct URL access |
| AI | Anthropic Claude API (vision) | Three parallel API calls per submission (one per judge), structured JSON output |
| Styling | Tailwind CSS | Utility-first, mobile-first, fast iteration |
| Language | TypeScript | Type safety for the data model and API responses |

---

## Pages & Routes

### `/` — Homepage

The landing page and primary discovery surface.

**Layout:**
- Hero section with the #1 rated toast of the day (large card showing all three verdicts).
- "Rate My Toast" CTA button — prominent, fixed on mobile.
- Leaderboard table below the hero, defaulting to "Today" view.
- Tab switcher: Today | This Week | All Time.
- Leaderboard rows show: rank, toast thumbnail, nickname, all three judge icons, official TQI score (highest of three), tier badge.
- Below leaderboard: paginated gallery grid of recent submissions.
- Each gallery card: toast image, three mini judge icons, official TQI score, tier badge.
- Clicking any card navigates to its permalink.

### `/submit` — Submit Flow

**Step 1 — Capture:**
- Camera capture (mobile) or file upload (desktop).
- Accept JPEG and PNG. Max file size: 5MB.
- Square crop encouraged but not enforced.
- Optional nickname field (max 20 characters). Default: "Anonymous Toaster."

**Step 2 — Processing:**
- Full-screen loading state.
- All three judges are called in parallel.
- Humorous loading copy that cycles through all three judges:
  - "Jean-Pierre is examining your crumb structure..."
  - "Nana is putting on her reading glasses..."
  - "Chad is doing pre-toast stretches..."
  - "Consulting the bread sommelier..."
  - "Checking if you've eaten today..."
  - "Loading maximum hype..."
- As each judge returns, their verdict card animates in (progressive reveal — don't wait for all three).

**Step 3 — Verdicts:**
- Three verdict cards displayed together (vertical stack on mobile, side-by-side on desktop).
- Each card shows:
  - Judge avatar + name.
  - That judge's TQI score (large, medium weight, two decimal places).
  - Tier badge with tier name.
  - Written verdict (2–4 sentences).
  - Sub-metric breakdown (six small bars). **On mobile composite view, sub-metric bars collapse behind a tap-to-expand.** This is required to fit three cards in a single mobile screenshot.
  - Individual share button for that specific verdict card.
- Above the three cards: toast photo (square, prominent) and official TQI score (highest of the three).
- Below the three cards:
  - "Share All" button (composite image of all three verdicts).
  - "Rate Another Toast" button (returns to Step 1).
- After all three judge promises have **settled** (resolved or rejected — not just resolved), the submission is saved to the database and appears in the gallery. Partial results (one or two judges failed) are still saved.

### `/toast/[id]` — Individual Toast Page

- Permalink for each submission.
- Toast photo at top with official TQI score and tier badge.
- All three verdict cards displayed below (same layout as submit Step 3).
- Each verdict card is individually shareable.
- Open Graph meta tags: toast image as `og:image`, official TQI score in `og:title`, highest-scoring judge's verdict excerpt as `og:description`.
- "Rate Your Own Toast" CTA below the cards.

---

## The Toast Quality Index (TQI)

Composite score out of 100.00 (two decimal places — the false precision is the joke).

### Sub-Metrics

Each scored 0.00–10.00:

| Metric | Key | What the AI Evaluates |
|---|---|---|
| Browning Uniformity | `browning_uniformity` | Evenness of golden-brown color across the entire surface |
| Crust Integrity | `crust_integrity` | Edge definition and structural soundness of the crust |
| Crumb-to-Crust Ratio | `crumb_crust_ratio` | Visible balance between soft interior and crisp exterior |
| Char Analysis | `char_analysis` | Char presence and distribution — too much or too little penalized |
| Surface Texture | `surface_texture` | Quality of the Maillard reaction as visible on the surface |
| Presentation | `presentation` | Overall aesthetic — plate, angle, lighting, butter/topping distribution |

### TQI Calculation

Each judge's TQI is calculated independently:

```
judge_tqi = (browning_uniformity + crust_integrity + crumb_crust_ratio + char_analysis + surface_texture + presentation) / 6 * 10
```

Rendered to two decimal places.

### Official TQI

The toast's official score for leaderboard ranking is the **highest TQI of the three judges**. This means Chad's relentless optimism might carry a mediocre toast onto the leaderboard while Jean-Pierre gave it a 34. That tension is the content.

### Tier System

| Score Range | Tier Key | Display Name |
|---|---|---|
| 90.00–100.00 | `legendary` | Legendary |
| 75.00–89.99 | `golden` | Golden |
| 60.00–74.99 | `respectable` | Respectable |
| 40.00–59.99 | `questionable` | Questionable |
| 20.00–39.99 | `concerning` | Concerning |
| 0.00–19.99 | `criminal` | Criminal |

Each tier has a distinct visual treatment (color, badge) on the verdict card and leaderboard. Tier colors are defined in the Brand Guide and appear only on tier badges — nowhere else in the UI.

---

## The Three Judges

Each judge shares the same TQI rubric but delivers the verdict in a completely different voice. All three judges rate every submission simultaneously. The same toast, three verdicts, three screenshots — that's the viral engine.

### Jean-Pierre

- **Tagline:** "Michelin-starred. Merciless."
- **Voice:** Cold, precise, French. Treats every submission with devastating seriousness. The comedy is in the disproportionate gravity applied to toast.
- **Tone rules:** Formal. Clipped sentences. Occasional French words (never more than one per verdict). References to professional culinary standards. Never kind. At best, grudgingly respectful.
- **Sample verdict (TQI 61.28):** "The browning is uneven — the left hemisphere has surrendered while the right clings to dignity. The crust weeps at the corners. I have seen better structural integrity in a napkin. This is not toast. This is bread that has been shown a photograph of heat. 61.28."

### Nana

- **Tagline:** "Supportive. Savage. Sends love."
- **Voice:** Someone's grandmother. Warm, encouraging, quietly devastating beneath the sweetness. The knife wrapped in a hug.
- **Tone rules:** Terms of endearment ("sweetheart," "honey," "dear"). Backhanded compliments. References to deceased or absent family members. Occasionally pivots to unsolicited life advice. Always gives the impression of love, even while eviscerating.
- **Sample verdict (TQI 61.28):** "Oh sweetheart, look at that! You made toast all by yourself. It's a little pale in the middle but that's okay — your grandfather used to make toast just like this. He was colourblind, rest his soul. I'm giving you a 61.28 because you tried and that's what matters. Now eat something real."

### Chad

- **Tagline:** "Everything is a PR, bro."
- **Voice:** Hypermasculine gym bro. Relentlessly, aggressively positive. Everything is a personal record. Sees peak performance in a piece of bread.
- **Tone rules:** ALL CAPS energy (use actual caps sparingly — two to three capitalized words per verdict, not entire sentences). Exclamation marks. Bro/dude address. Gym and fitness metaphors. Always supportive, always excessive. Even bad toast gets praised for effort.
- **Sample verdict (TQI 61.28):** "DUDE. Look at that TOAST. That char pattern is INSANE — you can literally see where the heat hit different. Crust is TIGHT. Crumb ratio is absolutely dialed in bro. Honestly this is like a 61.28 which is SOLID — you're in the top percentile of people who actually care about their breakfast game. KEEP GRINDING."

---

## AI Integration

### API Calls

Three parallel calls to the Anthropic Claude API with vision capability per submission — one for each judge.

**Request structure (per judge):**
- System prompt: that judge's persona + TQI rubric + output format instructions.
- User message: the uploaded toast image + brief instruction ("Rate this toast.").

**All three calls fire simultaneously using `Promise.allSettled()`.** The frontend renders each verdict card as its promise resolves (progressive reveal). If one judge fails, the other two still display.

**The system prompt must instruct the model to be entertaining first and accurate second. This is comedy, not food science.**

**Important:** Each judge must produce independent scores. Do not pass one judge's output to another. The comedy value of disagreement between judges (Jean-Pierre gives 42, Chad gives 78 for the same toast) is a feature, not a bug.

### Expected Response Format (per judge)

Each judge's system prompt must instruct the model to respond with **only** a JSON object, no markdown fencing, no preamble:

```json
{
  "verdict": "The browning is uneven — the left hemisphere has surrendered...",
  "sub_metrics": {
    "browning_uniformity": 5.8,
    "crust_integrity": 6.1,
    "crumb_crust_ratio": 5.5,
    "char_analysis": 7.2,
    "surface_texture": 6.0,
    "presentation": 6.2
  },
  "tqi": 61.33
}
```

### Validation (per judge response)

- Parse the JSON response. If parsing fails, retry once. If second attempt fails, mark that judge as failed (see error handling in API routes).
- Validate all sub-metric scores are between 0.00 and 10.00.
- Recalculate that judge's TQI server-side from sub-metrics (don't trust the model's arithmetic).
- Derive that judge's tier from recalculated TQI.

### Image Validation

Before sending to the AI:
- File type must be JPEG or PNG.
- File size must be under 5MB.
- Non-toast submissions are allowed through. Three judges roasting a photo of a shoe or a cat — each in their own voice — is funnier than a validation error. This is a feature, not a gap.

---

## Data Model

### Supabase Schema

Each toast submission is one row. All three judge verdicts are stored on the same row as JSONB columns. Judge fields are nullable to support partial failures.

```sql
create table toasts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  nickname text not null default 'Anonymous Toaster',

  -- Official score (highest TQI of the successful judges)
  official_tqi numeric(5,2) not null,
  official_tier text not null check (official_tier in ('legendary', 'golden', 'respectable', 'questionable', 'concerning', 'criminal')),

  -- Jean-Pierre's verdict (nullable — judge may have failed)
  jp_verdict text,
  jp_tqi numeric(5,2),
  jp_tier text,
  jp_metrics jsonb,
  -- jp_metrics shape: { "browning_uniformity": 5.8, "crust_integrity": 6.1, ... }

  -- Nana's verdict (nullable)
  nana_verdict text,
  nana_tqi numeric(5,2),
  nana_tier text,
  nana_metrics jsonb,

  -- Chad's verdict (nullable)
  chad_verdict text,
  chad_tqi numeric(5,2),
  chad_tier text,
  chad_metrics jsonb,

  created_at timestamptz not null default now()
);

-- Indexes for leaderboard queries
create index idx_toasts_official_tqi on toasts (official_tqi desc);
create index idx_toasts_created_at on toasts (created_at desc);
create index idx_toasts_official_tier on toasts (official_tier);
```

**Why flat columns instead of a separate verdicts table?** One query returns everything needed to render a toast card. No joins. Weekend-build simplicity. If the schema needs to evolve later, migrate then.

**Why nullable judge fields?** If one judge fails after retry, the submission still saves with the remaining verdicts. The frontend handles missing judges gracefully.

### Image Storage

- Bucket: `toast-images` (public).
- Path: `toasts/{id}.{ext}`
- Store the public URL in `image_url`.

---

## API Routes

### `POST /api/rate`

**Request:** multipart form data with `image` (file), `nickname` (string, optional).

**Rate limiting:** 5 submissions per IP per hour, 15 per IP per day. Return 429 with message: "The Bureau has received sufficient toast from your location. Please try again later."

**Flow:**
1. Check rate limit. Reject if exceeded.
2. Validate image (type, size).
3. Upload image to Supabase Storage. Get public URL.
4. Fire three parallel API calls using `Promise.allSettled()` — one per judge, each with its own system prompt.
5. For each settled promise: if fulfilled, parse and validate JSON. If rejected, mark that judge as failed.
6. Recalculate each successful judge's TQI server-side from their sub-metrics.
7. Derive each successful judge's tier from their recalculated TQI.
8. Determine official TQI (highest of the successful judges) and official tier.
9. Insert single row into `toasts` table with all verdicts (null for failed judges).
10. Return the full toast object to the client.

**Error handling:** If one judge call fails after retry, still save and return the other two. Mark the failed judge's fields as null. The frontend handles partial results gracefully with judge-specific failure messages:
- Jean-Pierre: "Jean-Pierre has stormed out of the kitchen."
- Nana: "Nana had to step out. She says she still loves you."
- Chad: "Chad is at the gym. He'll catch the next one, bro."

If all three judges fail, return 500 with message: "All judges are currently unavailable. Please toast responsibly."

**Response:** JSON toast object (same shape as database row).

### `GET /api/leaderboard`

**Query params:** `period` (today | week | alltime), `limit` (default 20), `offset` (default 0).

**Returns:** Array of toast objects, ordered by official TQI descending, filtered by period.

### `GET /api/toast/[id]`

**Returns:** Single toast object by ID. 404 if not found.

### `GET /api/gallery`

**Query params:** `sort` (tqi | recent), `limit` (default 20), `offset` (default 0).

**Returns:** Array of toast objects with pagination metadata.

---

## Design Direction

**The Brand Guide is the authoritative reference for all visual decisions.** The summary below is provided for quick reference only. If any detail here conflicts with the Brand Guide, the Brand Guide wins.

### Visual Identity

- **Mood:** Official, slightly absurd, confident. A certification bureau, not a food blog.
- **Primary palette:** Black (`#111111`), White (`#FFFFFF`), Toast Pink (`#D4537E`). Off-white (`#F5F5F5`) for card backgrounds. Pink tint (`#D4537E` at 12% opacity) for hover/selected states.
- **No orange. No amber. No warm toast tones. No gradients.** The restraint is the brand.
- **Typography:** Inter, two weights only (400 Regular, 500 Medium). Never bold (700). Never light (300).
- **Judge avatars:** Simple illustrated icons, not photos. Black + pink, two-color. No facial features. Distinct silhouettes that read at 32px.

### Verdict Card (The Screenshot Target)

This is the single most important design element. Two screenshot formats must work:

**Individual verdict card** (one judge): Must look good as an Instagram Story screenshot. TQI score visible at thumbnail size. Judge identity clear. Stamp watermark at 40% opacity in bottom corner. This is the atomic unit of sharing.

**Three-verdict composite** (all judges): Vertical stack on mobile, side-by-side on desktop. Toast photo and official TQI displayed once above all three cards. **Must fit in a single mobile screenshot without scrolling.** Sub-metric bars collapse behind tap-to-expand on mobile to make this possible.

### Mobile First

- Primary use case: someone standing in their kitchen with a phone.
- Camera capture must be one tap.
- Verdict must render without scrolling on mobile.
- Leaderboard must be thumb-scrollable.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SITE_URL=https://toastscore.com
```

---

## Out of Scope (v1)

- User accounts and authentication.
- Comments, likes, follows, or any user-to-user interaction.
- Native mobile apps.
- Monetization.
- Analytics beyond Vercel's built-in.
- Internationalization.
- Accessibility beyond Tailwind defaults.
- Content moderation beyond basic image validation.

---

## Build Sequence

This is a weekend project. Build in this order:

### Phase 1 — Skeleton (Saturday morning)
- [ ] Initialize Next.js project with TypeScript and Tailwind.
- [ ] Set up Supabase project (database + storage bucket).
- [ ] Create the `toasts` table and indexes.
- [ ] Build the `/submit` page with image upload (camera + file).
- [ ] Wire up Supabase Storage for image uploads.
- [ ] Build `POST /api/rate` with one judge (Jean-Pierre) to validate the pipeline end-to-end.
- [ ] Implement rate limiting on `/api/rate` (5/hour, 15/day per IP).
- [ ] Display the verdict on screen (unstyled is fine).

### Phase 2 — All Three Judges & Verdict Cards (Saturday afternoon)
- [ ] Write system prompts for all three judges.
- [ ] Implement parallel API calls (`Promise.allSettled()`) for all three judges.
- [ ] Handle partial failures (one judge fails, other two still display with failure message).
- [ ] Design and build the verdict card component (single judge).
- [ ] Build the three-verdict layout (vertical stack mobile, side-by-side desktop).
- [ ] Add TQI breakdown visualization (bars) per judge — collapsible on mobile.
- [ ] Add progressive reveal — each card animates in as its judge responds.
- [ ] Add loading states with cycling judge-specific copy.

### Phase 3 — Gallery & Leaderboard (Sunday morning)
- [ ] Build the homepage with leaderboard table (sorted by official TQI).
- [ ] Add period switcher (Today / This Week / All Time).
- [ ] Build gallery grid with pagination.
- [ ] Build `/toast/[id]` permalink page showing all three verdicts.
- [ ] Add Open Graph meta tags for social sharing.

### Phase 4 — Polish & Deploy (Sunday afternoon)
- [ ] Refine verdict cards for screenshot quality.
- [ ] Add individual share buttons per verdict card + "Share All" composite.
- [ ] Add tier badges with distinct visual treatment per Brand Guide.
- [ ] Stamp watermark on every verdict card at 40% opacity.
- [ ] Responsive pass — test on iPhone, Android, desktop.
- [ ] Deploy to Vercel.
- [ ] Test with real toast.

### Phase 5 — Prompt Refinement (Dedicated session)
- [ ] Test all three judge prompts against a range of toast images.
- [ ] Iterate until verdicts are consistently funny across all tiers.
- [ ] Test non-toast submissions (shoe, cat, person) for comedic quality.
- [ ] Verify score disagreement between judges produces entertaining contrasts.
- [ ] Finalize prompts.

---

## Notes for Development

- **The AI prompts are the product.** Spend real time on all three judge system prompts. Iterate until the verdicts are consistently funny. If the verdicts aren't funny, nothing else matters.
- **Recalculate TQI server-side.** The AI model will sometimes get the arithmetic wrong. Always derive each judge's TQI from their six sub-metrics on the server.
- **Judge disagreement is content.** Jean-Pierre giving 38 while Chad gives 79 for the same toast is inherently funny. Never normalize or align scores between judges.
- **The verdict card is the growth engine.** Every pixel of the verdict card is a marketing decision. If it doesn't look good as a screenshot, it won't spread.
- **Three API calls means 3x cost per submission.** Monitor usage. If it gets expensive, consider using a cheaper model (Haiku) for one or two of the judges while keeping Sonnet for the "lead" judge.
- **Don't over-engineer.** No auth, no caching, no CDN, no CI/CD pipeline. This is a weekend build. Ship it ugly and iterate if it gets traction.
- **Let non-toast submissions through.** Three judges roasting a photo of a shoe or a cat — each in their own voice — is funnier than a validation error. This is a feature.
- **The Brand Guide is law.** All visual decisions defer to the Brand Guide. No exceptions. This boundary is non-negotiable.
