---
name: MovieZone
description: Fast, cinematic movie and TV discovery where the artwork is the screen.
colors:
  usher-red: "#e43f5a"
  usher-red-strong: "#c42c46"
  usher-red-deep: "#a82338"
  usher-red-text: "#b3283f"
  usher-red-text-dark: "oklch(0.78 0.14 15)"
  on-usher-red: "#ffffff"
  house-dark: "oklch(0.13 0.012 20)"
  canvas: "oklch(0.975 0.005 20)"
  canvas-dark: "oklch(0.15 0.01 20)"
  surface: "oklch(1 0 0)"
  surface-dark: "oklch(0.205 0.012 20)"
  surface-muted: "oklch(0.958 0.006 20)"
  surface-muted-dark: "oklch(0.255 0.012 20)"
  line: "oklch(0.9 0.008 20)"
  line-dark: "oklch(0.3 0.014 20)"
  line-strong: "oklch(0.59 0.02 20)"
  line-strong-dark: "oklch(0.62 0.016 20)"
  ink: "oklch(0.22 0.012 20)"
  ink-dark: "oklch(0.97 0.004 20)"
  ink-muted: "oklch(0.45 0.016 20)"
  ink-muted-dark: "oklch(0.79 0.012 20)"
  ink-subtle: "oklch(0.535 0.014 20)"
  ink-subtle-dark: "oklch(0.695 0.014 20)"
  skeleton: "oklch(0.92 0.008 20)"
  skeleton-dark: "oklch(0.3 0.012 20)"
typography:
  display:
    fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  card-title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.025em"
rounded:
  thumb-sm: "4px"
  media: "6px"
  menu: "8px"
  panel: "12px"
  pill: "9999px"
spacing:
  gap-tight: "4px"
  gap: "16px"
  grid-row: "24px"
  section: "64px"
  page-top: "96px"
components:
  button-primary:
    backgroundColor: "{colors.usher-red-strong}"
    textColor: "{colors.on-usher-red}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.usher-red-deep}"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  segmented-control:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "4px"
  segmented-option-active:
    backgroundColor: "{colors.usher-red-strong}"
    textColor: "{colors.on-usher-red}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  genre-chip:
    backgroundColor: "{colors.usher-red-strong}"
    textColor: "{colors.on-usher-red}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  media-thumb:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.media}"
  panel-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "16px"
  menu:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.menu}"
    padding: "8px 0"
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 12px"
---

# Design System: MovieZone

## Overview

**Creative North Star: "The House Lights Dim"**

MovieZone is a warm, darkened room whose screen is the artwork. Backdrops, posters and inline trailers are the light source; everything else is house: warm near-black or a pale, faintly rosy canvas whose job is to frame the picture and then step back. Chrome is quiet so the image can be loud.

One color does the guiding. Usher Red is the light that walks you to your seat: the brand rule beside every heading, the selected option, the primary action, the rating star, the timer on the hero. It is never wallpaper. Neutrals carry a trace of the same 20° hue, so light and dark schemes read as one theatre with the lights up or down, not two products.

Motion behaves like a house settling: short rises and fades on one decisive ease, a crossfade between rooms (routes), and a single authored moment per surface (the hero's slow push-in and filling progress bar). Nothing bounces, nothing performs.

**Key Characteristics:**
- Imagery leads; full-bleed backdrops under a warm House Dark scrim.
- Single accent (Usher Red), used for guidance and state, never decoration.
- Hue-tinted neutrals, separately composed for light and dark schemes.
- Quiet frames around content, confident pill-shaped controls.
- One easing curve, exits faster than entrances, reduced motion always honored.

## Colors

A one-accent palette: Usher Red over warm, hue-tinted neutrals and a House Dark for everything photographic.

### Primary
- **Usher Red** (usher-red): the accent itself. Heading rules, rating stars, the hero progress fill, focus-adjacent emphasis, the rank pennant notch. Graphic marks only; at this lightness it does not carry small text on the light canvas.
- **Usher Red, Strong** (usher-red-strong): the only red that carries white text. Primary buttons, active segmented option, genre chips, the Top-N pennant.
- **Usher Red, Deep** (usher-red-deep): hover and press state of every red fill.
- **Usher Red Text** (usher-red-text / usher-red-text-dark): the red when it must be read as text (links, active nav, review authors, hover titles), tuned per scheme to pass 4.5:1. It is also the focus-ring color.

### Neutral
- **House Dark** (house-dark): the scrim. Every overlay on a photograph or trailer (hero gradients, nav fade, details stage, modal backdrop, carousel arrows, video controls). Theme-independent: a photograph is dark in both schemes.
- **Canvas** (canvas / canvas-dark): the page.
- **Surface** (surface / surface-dark): raised panels, menus, segmented controls, toasts. In dark mode elevation comes from surface being lighter than canvas.
- **Surface Muted** (surface-muted / surface-muted-dark): image wells before load, inset fills, hover fills.
- **Line** (line / line-dark): panel and menu borders, separators.
- **Line Strong** (line-strong / line-strong-dark): control boundaries (outline buttons, search field), ≥3:1.
- **Ink, Ink Muted, Ink Subtle**: primary, secondary and tertiary text. Body ≥4.5:1 in both schemes.
- **Skeleton** (skeleton / skeleton-dark): loading placeholders.

### Named Rules
**The Usher Rule.** Red guides, it never decorates. If a red element doesn't mark an action, a selection, a rating, or a heading, it shouldn't be red.

**The Two Reds Rule.** White text sits only on Usher Red Strong or Deep, never on Usher Red (4.1:1 fails AA). Red text uses Usher Red Text, never the raw accent.

**The House Dark Rule.** Overlays on imagery use House Dark at an opacity, never pure black, so photographs fade into the same warm hue as the neutrals. Text over imagery is white at fixed opacities (100 / 90 / 85 / 70), never inherited from the scheme.

## Typography

**Display Font:** Poppins (with ui-sans-serif, system-ui)
**Body Font:** the system UI sans stack

**Character:** Poppins, geometric and slightly theatrical, is reserved for titles printed over artwork; everything the user reads or operates is set in the platform sans for speed and legibility.

### Hierarchy
- **Display** (400, 30–48px, 1.1): title of a work over its backdrop (hero slide, details page when no logo art exists). Balanced wrapping, max ~2xl measure.
- **Headline** (700, 30px, 1.2): page title (list, search, genre, season, person, login, profile) with the brand rule at 40px.
- **Title** (700, 24px, 1.33): section heading (carousel rows, Cast, Reviews, Seasons, Episodes, Known For) with the brand rule at 32px.
- **Card Title** (500, 14px): title under every poster or still; truncates to one line.
- **Body** (400, 14px, 1.625): synopses, biographies, reviews; capped at ~65ch (`max-w-prose` / `max-w-xl`).
- **Label** (400, 12px, +0.025em, uppercase where it names a control group): metadata lines (year, rating, episode count), filter labels ("Type", "Genres"). Numerals are tabular.

### Named Rules
**The Over-the-Picture Rule.** Poppins appears only on top of imagery. Interface text never uses it.

## Layout

A single centered column at 85% of the viewport width carries nav, sections and footer, so every edge lines up from the logo down. Routes without a full-bleed opening start 96px down to clear the overlaid nav. Sections are separated by 64px; inside a section the heading sits 24–32px above its content.

Home and details open with a full-viewport stage (hero carousel, video backdrop) whose copy aligns to the same 85% column. Browsing grids run 2 → 3 → 4 → 5 → 6 columns from phone to wide desktop, with 16px column gaps and 24px row gaps. Carousels are horizontal rows of fixed-width cards (landscape 200/300px, portrait 160/250px) that scroll by drag, with arrows revealed on hover on desktop and always visible on touch.

Skeletons reproduce exact final geometry so nothing shifts when data lands.

## Elevation & Depth

Flat by default, tonal in dark mode. Depth comes from surface lightness and 1px Line borders, not shadows. The single shadow role is the popover: menus, search results and toasts float over arbitrary content and get an offset, House-Dark-tinted shadow plus their border.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 18px 40px -18px oklch(0.13 0.012 20 / 0.45)`): dropdown menus, search autocomplete, toasts. Nothing else.

### Named Rules
**The Quiet Frame Rule.** Cards and panels declare elevation once, with a border. No resting shadows on cards; hover changes the border to Usher Red, not the depth.

## Shapes

Three corner families with distinct jobs: imagery is gently rounded (6px) so posters read as prints; panels and dialogs are softer (12px); every control a user presses (buttons, segmented controls, search, genre chips) is a full pill. Menus sit between at 8px. Avatars are circles. The brand rule is a 4px-wide rounded bar.

## Components

### Buttons
Confident pills; the primary is unmistakable and rare.
- **Shape:** full pill (9999px).
- **Primary:** Usher Red Strong fill, white 14–16px medium text, 10px × 20px. Hover deepens to Usher Red Deep. Used once per context (See More, Try again, Login with TMDB).
- **Outline:** transparent, 1px Line Strong border, Ink text; hover turns border Usher Red and text Usher Red Text (Logout, Browse as Guest, Return to Home).
- **On imagery:** House Dark at 25% with backdrop blur, white/40 border, white text; hover brightens the border to white. Active toggles (Favorited, On Watchlist) switch to the primary fill and their icon pops once (0.6 → 1.25 → 1 scale, 350ms).
- **Focus:** 2px Usher Red Text outline, 2px offset, everywhere.

### Segmented Control
The one either/or control (Movies / TV Shows, Favorites / Rated / Watchlist).
- **Style:** Surface pill with 1px Line border and 4px inset; options are 14px medium Ink Muted text.
- **State:** the selected option sits on an Usher Red Strong pill that slides between options (300ms, emphasized ease); text turns white. Implemented as a fieldset with a hidden legend and `aria-pressed` options.

### Chips
- **Genre chip:** Usher Red Strong pill, white 12px text, 4px × 10px, links to genre browse; hover Usher Red Deep.

### Cards / Containers
- **Title card (poster / backdrop / season):** no frame; a 6px-rounded image well (Surface Muted while loading or missing, with the title as fallback text), then card title and a year · ★ rating line. Hover scales the image 1.04 over 500ms and turns the title Usher Red Text.
- **Panel card (cast, review, episode, login):** Surface fill, 1px Line border, 12px radius, 16–20px padding. Interactive panels turn their border Usher Red on hover (200ms).
- **Rank pennant:** Usher Red Strong tab with notched tail on Top-10 posters.

### Inputs / Fields
- **Search:** pill, 1px Line Strong border on Surface; over imagery, white/60 border on House Dark 30% with blur. Focus turns the border Usher Red and adds the 2px focus outline around the whole pill.
- **Multi-select (genres):** a pill trigger matching the segmented control's height; opens a Menu of checkboxes tinted with the accent.

### Navigation
- **Style:** overlaid, transparent bar at the top of the 85% column. Over imagery it is white on a House Dark fade; on the canvas it takes Ink. Links hover to Usher Red Text.
- **Menus:** Surface, 8px radius, Line border, Popover shadow, fade-and-drop in 200ms; items highlight with a 15% Usher Red wash.
- **Mobile:** a right-hand drawer (Surface) sliding in over a House Dark 60% veil; 44px tap targets.

### Hero Carousel (signature)
Full-viewport backdrop under a House Dark gradient, slow 8s push-in on the active slide, copy staggered in on the column. Segmented progress bar: the active segment fills in Usher Red over exactly one cycle and freezes when paused (hover, keyboard focus, hidden tab, off-screen, pause button). Reduced motion stops autoplay and the push-in.

### Section Heading (signature)
The brand rule (4px Usher Red bar) beside every page and section title. It draws upward (scaleY 0 → 1, 500ms) the first time the heading enters view.

### Motion
- **Ease:** `cubic-bezier(0.22, 1, 0.36, 1)` for every arrival.
- **Durations:** 200ms feedback and menus; 400ms entrances (14px rise + fade, sibling stagger 40ms, capped); 500ms heading rule; route change crossfade 140ms out / 280ms in via View Transitions.
- **Reduced motion:** no rise, no push-in, no autoplay, no route crossfade; state changes stay legible.

## Do's and Don'ts

### Do:
- **Do** put the brand rule beside every page and section title, using the shared heading component.
- **Do** use House Dark (`oklch(0.13 0.012 20)`) at an opacity for any overlay on a photograph or video.
- **Do** keep white text on red to Usher Red Strong or Deep, and red text to Usher Red Text.
- **Do** show ratings as a red star plus one-decimal number in the surrounding text color.
- **Do** make pressable controls pills, imagery 6px, panels 12px.
- **Do** align every block to the 85% column.
- **Do** give every entrance the shared ease and honor `prefers-reduced-motion`.

### Don't:
- **Don't** use pure black overlays or the raw accent (#e43f5a) as a text color on the light canvas.
- **Don't** put shadows on resting cards or panels; the popover shadow is for floating menus and toasts only.
- **Don't** set interface text in Poppins.
- **Don't** add a second accent hue; status and emphasis come from Usher Red, weight and position.
- **Don't** invent per-page toggles, card styles or entrance animations; extend the shared ones.
- **Don't** let anything auto-advance without a visible, pausable state.
