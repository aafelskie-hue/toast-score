# Toast Score — Brand Guide

**Version:** 1.1
**Date:** March 13, 2026
**Status:** Foundational — authoritative reference for all visual and tonal decisions

---

## Brand Essence

Toast Score is an AI-powered toast rating app. Three AI judges with distinct personalities rate every submission with absurd precision, producing a composite Toast Quality Index (TQI) score out of 100.00.

The brand voice is deadpan serious. The comedy comes from treating toast with the gravity of a government inspection. The visual identity reinforces this: the logo is a certification stamp. Your toast has been officially evaluated.

**Brand personality in three words:** Official. Absurd. Shareable.

---

## Logo: The Stamp

The primary logo is a square stamp mark with a slight rotation (-2.5°), evoking the look of a physical rubber stamp pressed onto a document. The stamp contains three elements stacked vertically: the word TOAST, the score number, and the word SCORE, separated by thin horizontal rules.

### Key properties

- The rotation is always -2.5 degrees. Never straighten the stamp. Never rotate it more.
- The score number inside the stamp is contextual. On marketing materials, use 93 as the default. On verdict cards, use the actual TQI. On the homepage, use the day's top score.
- The outer border is heavy (4–5px at full size). The inner border is thin (1–1.2px). The double border is essential to the institutional feel.
- Corner radius on the outer square is minimal (rx=4). This is a stamp, not a button.

### Logo versions

**Primary stamp** — Full double-border stamp with TOAST / score / SCORE. Used on verdict cards (as watermark at 40% opacity), homepage hero, marketing materials, and social media profile images.

**Wordmark** — TOAST in primary text color, SCORE in pink, stacked. Used in navigation bars, headers, and contexts where the full stamp is too heavy. Always letterspaced (tracking 3–7 depending on size).

**App icon** — Black square with rounded corners, single pink border, score number in white. The TOAST/SCORE text is omitted at small sizes — the number alone carries the brand.

**Favicon** — Pink square, white score number. Smallest expression of the brand.

### Logo clear space

Maintain clear space equal to the height of the TOAST text on all sides of the stamp. No other elements should intrude into this zone.

### Logo misuse

- Never straighten the rotation.
- Never fill the stamp background with a solid color.
- Never change the pink to another color.
- Never use a drop shadow or glow effect.
- Never stretch or distort the proportions.
- Never place the stamp on a busy photographic background without sufficient contrast.

---

## Color Palette

The palette is deliberately restrained. Three functional colors plus two utility tones. The restraint is the brand.

### Primary colors

| Name | Hex | Usage |
|---|---|---|
| **Black** | `#111111` | Primary text, dark backgrounds, app icon base |
| **White** | `#FFFFFF` | Page backgrounds, text on dark, app icon text |
| **Toast Pink** | `#D4537E` | Accent — stamp borders, SCORE text, tier badges, CTAs, links, anything that needs to pop |

### Utility colors

| Name | Hex | Usage |
|---|---|---|
| **Off-white** | `#F5F5F5` | Card backgrounds, subtle surface separation |
| **Pink tint** | `#D4537E` at 12% opacity | Hover states, selected states, light accent backgrounds |

### Extended palette (for TQI tiers only)

These colors appear exclusively on tier badges and nowhere else in the UI. They are functional, not decorative.

| Tier | Color | Hex |
|---|---|---|
| Legendary | Gold | `#EFC820` |
| Golden | Warm amber | `#D4A017` |
| Respectable | Pink (brand) | `#D4537E` |
| Questionable | Gray | `#888780` |
| Concerning | Light gray | `#B4B2A9` |
| Criminal | Black | `#111111` |

### Color rules

- Pink is used sparingly. If everything is pink, nothing is pink. Reserve it for elements that need attention: the stamp, the SCORE half of the wordmark, CTAs, tier badges, and links.
- Never use pink as a background fill at full opacity. Use the 12% tint for light accent areas.
- On dark backgrounds, pink remains unchanged. White replaces black for text.
- No gradients anywhere in the UI. Flat fills only.
- No orange. No amber. No burnt sienna. No warm toast tones outside of tier badge colors. The palette is black, white, and pink. Period.

---

## Typography

Two weights of one font family. That's it.

### Font

**Primary:** Inter (Google Fonts, free, universally supported)

If Inter is unavailable, fall back to the system sans-serif stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### Weights

| Weight | Name | Usage |
|---|---|---|
| 400 | Regular | Body text, verdicts, descriptions, metadata |
| 500 | Medium | Headings, TQI scores, TOAST/SCORE wordmark, judge names, CTAs |

Never use bold (700) or light (300). The brand has two speeds: calm and confident.

### Sizes

| Element | Size | Weight | Notes |
|---|---|---|---|
| TQI score (verdict card) | 48–64px | 500 | The largest element on any screen |
| Page heading | 28–36px | 500 | Homepage hero, page titles |
| Section heading | 20–24px | 500 | Leaderboard headers, section labels |
| Body text | 16px | 400 | Verdicts, descriptions |
| Small text | 13–14px | 400 | Metadata, timestamps, sub-metrics |
| Tier badge | 11–12px | 500 | Letterspaced, uppercase |
| Stamp text (TOAST/SCORE) | Relative to stamp size | 500 | Always uppercase, always letterspaced |

### Letterspacing

- The TOAST SCORE wordmark always uses generous letterspacing: `letter-spacing: 3px` at nav size, `letter-spacing: 6–7px` at display size.
- Tier badge labels use `letter-spacing: 1–2px` and are always uppercase.
- Body text uses default letterspacing. Never letterspace body copy.

---

## The Verdict Card

This is the most important design element in the entire product. Every verdict card is a potential screenshot, and every screenshot is an ad. Design decisions on the card are marketing decisions.

### Anatomy

From top to bottom:

1. **Toast photo** — Square crop, prominent, slightly rounded corners (8px).
2. **Judge identity** — Judge avatar icon + name. Small, above the verdict.
3. **Verdict text** — 2–4 sentences in the judge's voice. Regular weight, 16px.
4. **TQI score** — The largest element on the card. 48–64px, medium weight.
5. **Tier badge** — Uppercase, letterspaced, in the tier's assigned color.
6. **Sub-metric bars** — Six thin horizontal bars showing individual metric scores. Minimal, secondary. **On mobile composite view (three cards stacked), these collapse behind a tap-to-expand interaction** to ensure three cards fit in one screenshot.
7. **Share buttons** — Row of share actions at the bottom.
8. **Stamp watermark** — The Toast Score stamp in the bottom corner at 40% opacity. Present on every card. This is how the brand travels. Non-negotiable.

### Card design rules

- Background: white or off-white (`#F5F5F5`). Never dark. Verdict cards must feel clean and bright in screenshots.
- No colored borders. The card should feel like it floats.
- The TQI score must be readable at Instagram Story thumbnail size. If it's not big enough, make it bigger.
- The stamp watermark is non-negotiable. Every screenshot must carry the brand.
- Each of the three judge cards should be visually identical in structure — only the text content and judge icon change. The comedy is in the contrast of voices, not the contrast of layouts.

### Three-card layout

When all three verdicts are displayed together:

- **Mobile:** Vertical stack, full-width cards, 12px gap between them. Toast photo and official TQI displayed once above all three cards. Sub-metric bars collapsed. The composite must fit in a single mobile screenshot without scrolling.
- **Desktop:** Three cards side by side, equal width. Toast photo centered above. Sub-metric bars visible.
- The composite three-card view is the premium share format.

---

## Judge Avatars

Each judge has a simple illustrated avatar icon. These are not photographs. They are minimal, two-color (black + pink) illustrations that read clearly at 32px.

### Silhouettes

- **Jean-Pierre:** Toque (chef's hat) silhouette. Stern. Upright.
- **Nana:** Reading glasses. Possibly a bun hairstyle. Warm but sharp.
- **Chad:** Backwards baseball cap. Wide shoulders implied.

### Style rules

- Line weight: 2px at 64px display size, 1px at 32px.
- Colors: Black outline on light backgrounds, white outline on dark backgrounds. Pink used only as an accent (the toque band, the glasses frames, the cap brim).
- No facial features. The silhouette tells you everything. Faces would make them too specific and limit the universality.
- Circular crop, 32–64px depending on context.

---

## Tone of Voice

### Brand voice (outside the judges)

The brand itself speaks like a factual, slightly amused institution. Think of the voice that writes the copy on government forms if the government found its own forms funny.

- **Headlines:** Short, declarative, no exclamation marks. "Your toast has been evaluated." "The results are in." "Submit your toast for official review."
- **Microcopy:** Dry humor in unexpected places. Loading states, error messages, empty states. "No toast found. This is concerning." "Our judges are experiencing technical difficulties. Please toast responsibly."
- **Error messages:** Maintain the institutional tone. Never apologize. Examples:
  - Rate limit exceeded: "The Bureau has received sufficient toast from your location. Please try again later."
  - All judges failed: "All judges are currently unavailable. Please toast responsibly."
  - Single judge failed (Jean-Pierre): "Jean-Pierre has stormed out of the kitchen."
  - Single judge failed (Nana): "Nana had to step out. She says she still loves you."
  - Single judge failed (Chad): "Chad is at the gym. He'll catch the next one, bro."
- **Never:** Emojis in brand copy. Slang (unless in Chad's voice). Self-deprecation. Apologies. The institution does not apologize for evaluating your toast.

### Judge voices

Covered in detail in the technical specification. The brand guide summary:

- **Jean-Pierre:** Formal, cold, clipped. Occasional French. Never kind.
- **Nana:** Warm, supportive, quietly savage. Terms of endearment.
- **Chad:** ALL CAPS energy. Gym metaphors. Relentlessly positive.

The judge voices exist only inside verdict text. They never bleed into UI copy, marketing, or error messages. The brand is the institution; the judges are its employees.

---

## Imagery

### Toast photography

When Toast Score uses toast imagery in marketing or as placeholder content:

- Shot from directly above (flat lay) or at a slight angle.
- Clean, bright lighting. No moody food photography.
- Simple backgrounds: white plate, marble counter, wooden cutting board.
- The toast itself should look real, not styled. A slightly burnt corner is more on-brand than a perfect slice.

### No stock photography

Toast Score never uses generic stock photography. Every image is either user-submitted toast or a deliberately simple product shot. The brand's visual world is toast, the UI, and nothing else.

---

## Layout Principles

### Mobile first

The primary user is standing in their kitchen with a phone. Every layout decision starts with a 375px-wide screen.

### Spacing

Use an 8px grid. Common spacing values: 8, 16, 24, 32, 48, 64.

### Cards

- Border radius: 12px on cards, 8px on internal elements (photos, badges), 4px on small elements (metric bars).
- No visible borders on cards. Use subtle shadow or background color differentiation.
- Cards float on the page. They are not contained in boxes or sections.

### The homepage

- Hero: Top-rated toast of the day with its stamp. Large, confident, minimal.
- Leaderboard: Clean table. Rank, thumbnail, nickname, TQI, tier. No clutter.
- Gallery: Grid of toast cards. Generous spacing. The photos sell the app.

---

## Social Media

### Profile image

The stamp with 93 as the score, on a black background. Square crop.

### Cover / banner

White background. The wordmark (TOAST stacked above SCORE) centered, with the tagline "Your toast. Officially rated." below in small caps.

### Sharing format

When users share verdict cards, the Open Graph image should be the verdict card itself — toast photo, judge verdict, TQI score, and stamp watermark. The card IS the social content. No additional framing needed.

---

## What Toast Score Is Not

- Not cute. Not quirky. Not wacky. The humor comes from seriousness, not silliness.
- Not a food blog. No recipes, no tips, no "how to make the perfect toast" content.
- Not a tech product. No feature announcement language, no "we're excited to share" copy.
- Not Halloween. No orange. No burnt umber. No pumpkin anything.

Toast Score is an institution that takes toast very seriously. That's the whole joke. The brand guide exists to make sure nobody ruins it by being obviously funny.

---

## Quick Reference

| Element | Value |
|---|---|
| Primary font | Inter (400, 500) |
| Black | `#111111` |
| White | `#FFFFFF` |
| Toast Pink | `#D4537E` |
| Off-white | `#F5F5F5` |
| Pink tint | `#D4537E` at 12% opacity |
| Stamp rotation | -2.5° |
| Default score (marketing) | 93 |
| Border radius (cards) | 12px |
| Border radius (stamp) | 4px |
| Spacing grid | 8px |
| Domain | toastscore.com |
| Rate limit | 5/hour, 15/day per IP |
