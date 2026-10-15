# MONUMENT Construction — Next.js Homepage Prototype

A responsive, animated concept homepage for an unnamed Nigerian civil engineering company. **MONUMENT is a placeholder identity**. Company statistics, projects, services, addresses and images are demonstration content, not verified claims.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Deploy on Netlify

Push this folder to a GitHub repository, connect it in Netlify, use `npm run build` as the build command. Netlify's Next.js integration handles the app automatically.

## Customize

- `src/components/Home.tsx`: copy, navigation, service and project data, images, interactions.
- `src/app/globals.css`: layout, palette, typography, responsive styling.
- `src/app/layout.tsx`: SEO metadata and fonts.
- `public/images/`: four example architecture photos from the user's supplied archive, available for replacement.

## Notes before production

- External Unsplash images are visual placeholders. Replace with licensed client assets before launch.
- The contact CTA uses `hello@example.com` intentionally; replace with the confirmed company address and implement a server-validated form when a delivery provider is chosen.
- The statistics display dashes until verified figures are supplied.
- Project cards select a concept project but are not live project detail pages yet.
- No business email or staff portal has been implemented; those are separate phases.
- Hero uses a photographic fallback for fast initial load. Add a licensed, optimized background video once a suitable source is approved.
- Supporting pages, CMS, analytics and real contact-form delivery are Stage 2.


## Cinematic hero video carousel

The homepage now uses `src/components/HeroVideoCarousel.tsx` with four automatic 10-second slides, 1-second crossfades, slide indicators, manual navigation, pause/play, reduced-motion support, and poster fallbacks.

**Add your own licensed MP4 videos** in `public/videos/hero/`:
- `building-construction.mp4`
- `infrastructure.mp4`
- `engineering.mp4`
- `completed-projects.mp4`

Matching poster images already exist under `public/images/hero/`. Videos are **not bundled** in this ZIP. The carousel shows poster images until videos are added. Edit slide text and paths in `HeroVideoCarousel.tsx`.


## Cinematic GSAP edition

The shared `src/components/useCinematicMotion.ts` hook animates **all pages**: scroll reveals, staggered cards, hero text entrances, subtle desktop parallax, photographic zoom-outs, numeric count-ups, and hover lift effects. ScrollTrigger is cleaned up between routes, and `prefers-reduced-motion` disables decorative motion. Existing video-carousel behavior is retained. The contact form remains a demo, and company information is illustrative.

### Demo checks

1. Run `npm install && npm run dev` and visit `/`, `/about`, `/services`, `/projects`, `/team`, `/careers`, `/insights`, `/contact`.
2. Scroll to trigger reveal sequences and the homepage count-up statistics.
3. Use the project filters and the fullscreen mobile menu; verify both remain interactive.
4. Enable reduced motion in your OS settings and reload; content should remain visible without motion.
5. Supply your own appropriately licensed hero videos under `public/videos/hero/`.


## New in Project Stories edition
- Rich individual project case studies with brief, challenges, engineering approach, scope, illustrative metrics, image gallery, services sidebar, and related projects.
- Six-question accessible FAQ accordion on the homepage, before the footer.
- Interactive team portraits open biographical cards with job descriptions, experience and focus areas. Escape or clicking outside closes the modal.
- All project metrics, team profiles and company data are placeholders and must not be published as verified claims.


## Header and animation refinement
- Removed top lime concept banner from homepage and interior pages. Demonstration figures remain labelled in content.
- Non-sticky, softly translucent floating mega-navigation; lime project CTA retained.
- ScrollTrigger reveals now use motion-only entrances rather than hiding or blurring sections before triggering. This is more robust for screenshots and fast scrolling.
