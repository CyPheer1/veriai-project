You are redesigning a premium enterprise SaaS platform called "VeriAI" — an AI Content Detection Dashboard. The current design is functional but looks generic and flat. I need you to transform it into a jaw-dropping, Fortune 500-grade interface that feels like it belongs to a $100M company — think the visual quality of Vercel's dashboard meets Apple Vision Pro aesthetics.

═══════════════════════════════════════════
PLATFORM OVERVIEW & PAGES TO REDESIGN
═══════════════════════════════════════════

The platform has these key screens:
1. **Logged-In Dashboard** (MAIN SCREEN — prioritize this): Contains a top Header/Navbar, a main content area (left: InputPanel + ResultsPanel stacked vertically), and a right Sidebar with stats and recent scans.
2. **Guest Dashboard**: Similar layout but with a promotional sidebar encouraging sign-up.
3. **Login Page**: Authentication screen.

═══════════════════════════════════════════
CRITICAL ISSUE #1: THE ANIMATED BACKGROUND
═══════════════════════════════════════════

This is THE most important upgrade. The current design has a plain flat background. I need a stunning, animated living background that makes the platform feel alive and futuristic — directly related to the AI detection domain.

**DARK MODE Background:**
- Create a deep, infinite cosmic void base color: #05050A to #0A0B14
- Add a slow-moving, organic fluid mesh gradient animation with 3-4 large blurred orbs that drift slowly and morph
- Color palette for the orbs: Electric Indigo (#4F46E5 at 8-12% opacity), Deep Cyan (#06B6D4 at 5-8% opacity), Violet (#7C3AED at 6-10% opacity), and a subtle Deep Blue (#1E3A8A at 4-6% opacity)
- The orbs should have massive blur (blur: 120-180px) and move in a slow, organic, sine-wave pattern
- Add a very subtle dot-grid overlay (1px dots, spacing 32px, at 4-6% white opacity) over the entire background for a "digital matrix" feel
- Add a faint "aurora borealis" gradient band at the top edge that subtly shifts colors
- The overall effect should feel like looking into deep space where AI neural pathways are forming — mysterious, intelligent, alive

**LIGHT MODE Background:**
- Base: pristine crystalline white #F8FAFB
- Add 2-3 very soft, slow-drifting pastel luminous orbs: Soft Lavender (#E0E7FF at 40% opacity), Pale Sky Blue (#DBEAFE at 30% opacity), Rose Quartz (#FCE7F3 at 20% opacity)
- Much larger blur (200px+), very gentle movement
- Add a subtle prismatic light refraction effect at the top — like morning sunlight through a glass prism
- Faint dot-grid overlay (1px dots, spacing 32px, 3-4% black opacity)
- The feeling should be "premium Apple store lighting" — clean, ethereal, crystalline

═══════════════════════════════════════════
CRITICAL ISSUE #2: GLASSMORPHISM CARDS
═══════════════════════════════════════════

ALL card surfaces must use deep glassmorphism so the animated background is visible through them:

**Dark Mode Cards:**
- Background: rgba(15, 17, 26, 0.55) — semi-transparent dark
- backdrop-filter: blur(40px) saturate(1.4)
- Border: 1px solid rgba(255, 255, 255, 0.06) with a subtle gradient border (top-left slightly brighter)
- Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)
- The inset shadow creates a subtle "inner light edge" effect at the top

**Light Mode Cards:**
- Background: rgba(255, 255, 255, 0.65)
- backdrop-filter: blur(40px) saturate(1.3)
- Border: 1px solid rgba(255, 255, 255, 0.8)
- Box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)

Apply this glassmorphism to: InputPanel card, ResultsPanel cards (Submitted Text, Global AI Probability, Model Attribution, Semantic Breakdown), Sidebar stat cards, and Sidebar recent scans card.

═══════════════════════════════════════════
CRITICAL ISSUE #3: DONUT CHART — "87%" IS INVISIBLE
═══════════════════════════════════════════

The "Global AI Probability" circular donut chart currently fails — the center percentage (87%) is not rendering/displaying. Fix and enhance it:

- The "87%" text must be large (30-34px), bold (font-weight: 700), highly visible, perfectly centered inside the donut
- Below it: "High Likelihood" in small muted text (11px, font-weight: 500)
- The donut ring itself should have a GLOWING effect — the AI arc (azure to indigo gradient) should emit a soft outer glow: filter: drop-shadow(0 0 10px rgba(79,70,229,0.35))
- The human arc should be a very subtle teal track
- Below the donut: "Human 13%" and "AI 87%" labels with small colored square indicators
- Below that: a 3-column stat strip showing: "5 SCANNED", "3 FLAGGED", "2 CLEAN" — inside a subtle inner card

═══════════════════════════════════════════
COMPONENT-BY-COMPONENT SPECIFICATIONS
═══════════════════════════════════════════

【HEADER / NAVBAR】
- Floating glassmorphism bar, centered items with the navbar appearing like a pill/capsule shape
- Logo: "Veri" in white/dark + "AI" in brand indigo (#4F46E5)
- Shield icon in a rounded indigo container with a subtle glow: box-shadow: 0 4px 14px rgba(79,70,229,0.3)
- Nav items: Dashboard (active with subtle brand background), History, Docs
- Right side: theme toggle (sun/moon with smooth rotation animation), user avatar with name
- The entire header should have: backdrop-filter: blur(20px), semi-transparent background, thin bottom border

【INPUT PANEL】
- Glassmorphism card containing:
  - Tab switcher ("Text Input" / "File Upload") inside a subtle inner pill background
  - Active tab: slightly elevated with subtle shadow and brighter text
  - Textarea: semi-transparent background, subtle border that glows indigo on focus (transition: border-color 0.3s)
  - "Detect AI Content →" button: solid indigo gradient (#4F46E5 → #4338CA) with a glow shadow (0 4px 20px rgba(79,70,229,0.35)), sparkle icon
  - Word/character counter in bottom-right corner, very subtle text

【RESULTS: SUBMITTED TEXT CARD】
- Shows the analyzed text preview with expand/collapse
- "AI-Generated" verdict badge in top-right: red-tinted pill with Bot icon
- Metadata chips at bottom: "350 words", "Just now", "94% confidence" — all in subtle pill badges
- "Re-analyze" button with rotate icon

【RESULTS: MODEL ATTRIBUTION CARD】
- 4 model rows: GPT-4 Turbo (62%), Claude 3 Opus (18%), Gemini 1.5 Pro (13%), Llama 3 70B (7%)
- Each row has: rank number, model name, percentage, and a horizontal progress bar
- The #1 model bar should use a gradient fill (azure → indigo) and be the most prominent
- Lower-ranked bars progressively fade in opacity
- Include a footnote: "Attribution is probabilistic..."

【RESULTS: SEMANTIC BREAKDOWN CARD】
- Title "Semantic Breakdown" with a "Sentence-level" chip badge
- Legend dots: green for Human, red for AI-Detected
- The analyzed text paragraph with inline sentence highlighting:
  - AI sentences: soft red-tinted background with a left red border (2px solid)
  - Human sentences: soft teal-tinted background with a left teal border
  - Each sentence smoothly fades in sequentially
- Bottom summary pills: "5 AI sentences" (red), "2 human sentences" (green), "94% avg. confidence" (indigo), "High risk" (amber)

【SIDEBAR — AUTHENTICATED】
- Two stat cards in a 2-column grid:
  - "Total Scans: 1,247" with violet sparkline chart and "+12%" trend
  - "Accuracy: 98.7%" with emerald sparkline chart and "+0.3%" trend
- "Recent Scans" list with 5 items, each showing: document icon, title (truncated), time ago, and color-coded AI% badge (red for high AI, green for human, amber for mixed)

═══════════════════════════════════════════
TYPOGRAPHY & SPACING
═══════════════════════════════════════════

- Font: "Inter" or "Geist Sans" — clean geometric sans-serif
- Headings: tight letter-spacing (-0.02em), medium weight (500-600)
- Numbers/percentages: tabular-nums, weight 700, slightly larger
- Section labels: ALL CAPS, 10-11px, letter-spacing: 0.08em, very muted color
- Body text: 13-14px, line-height: 1.7, comfortable reading
- Consistent spacing: 16px inner padding on cards, 14-16px gaps between cards
- Border radius: 16px for outer cards, 12px for inner elements, 8px for pills/badges

═══════════════════════════════════════════
COLOR SYSTEM
═══════════════════════════════════════════

Dark Mode:
- Background void: #05050A → #0A0B14
- Card glass: rgba(15,17,26,0.55)
- Text primary: rgba(255,255,255,0.92)
- Text secondary: rgba(255,255,255,0.50)
- Text muted: rgba(255,255,255,0.28)
- Brand: #4F46E5 (indigo)
- Success/Human: #14B8A6 (teal)
- Danger/AI: #DC2626 (red)
- Warning: #F59E0B (amber)
- Borders: rgba(255,255,255,0.06)

Light Mode:
- Background: #F8FAFB
- Card glass: rgba(255,255,255,0.65)
- Text primary: #0F111A
- Text secondary: #4B5563
- Text muted: #9CA3AF
- Brand: #4F46E5
- Success/Human: #0D9488 (darker teal)
- Danger/AI: #B91C1C (darker red)
- Warning: #B45309 (darker amber)
- Borders: rgba(0,0,0,0.07)

═══════════════════════════════════════════
MICRO-ANIMATIONS & INTERACTIONS
═══════════════════════════════════════════

- Cards mount with staggered fade-in + slide-up (y: 16px → 0, opacity: 0 → 1, delay: each +0.08s)
- Donut chart: animated stroke drawing from 0 to final value (1.4s ease-out)
- Progress bars: smooth width animation from 0% to final % (0.75s ease-out, staggered by rank)
- Buttons: magnetic hover effect — slight scale(1.02) + enhanced glow shadow on hover
- Theme toggle: smooth sun/moon icon rotation transition
- Analyze button during loading: pulsing animation + spinning border
- Sentence highlights: sequential fade-in (0.04s delay per sentence)
- Stat numbers: count-up animation on mount
- The background orbs animate continuously with CSS @keyframes (15-25 second cycles)

═══════════════════════════════════════════
FINAL QUALITY CHECKLIST
═══════════════════════════════════════════

✅ The animated background must be visible through ALL glassmorphism cards
✅ The 87% score MUST be clearly visible in the donut center
✅ Both dark AND light mode must look equally stunning
✅ No flat, opaque backgrounds — everything should feel layered and dimensional
✅ The donut chart should have a soft outer GLOW on its stroke
✅ Typography hierarchy must be crystal clear — headings stand out, labels recede
✅ The overall impression should be: "This looks like a $100M enterprise product"
✅ The background animation should be subtle enough to not distract from data
✅ All status colors (AI=red, Human=teal, Mixed=amber) must be consistent everywhere
✅ Cards should feel like they're FLOATING over the background with layered shadows

Generate the complete redesigned layout for the DARK MODE Logged-In Dashboard as the primary deliverable, including the animated background, header, input panel, results panel (all 4 sections), and sidebar. Then show the LIGHT MODE variant of the same layout.
