# Photo sources

## Site photography
The pictures in `public/images/site` were supplied by the client on 12 November 2026 (originals, unedited, in
`design-source/supplied-pictures`). The site versions were enlarged and lightly sharpened because most originals
are about 735 px wide. Their origin and licence were not stated: confirm you have the right to publish each one
before launch. Several appear to be AI-generated.

They are illustrative. None of them shows a Konsadem project, and the project showcase labels its picture
"Illustrative image". Every picture is assigned in one place, `src/lib/media.ts`, except the four hero slides,
which are set at the top of `src/components/HeroVideoCarousel.tsx`.

## Konsadem archive photographs
The field images in `public/images/field` come from the supplied Konsadem brochure and are low resolution. They
are used only as the small archive figure on four project pages (Wigwe University p. 22, Edo water schemes p. 26,
Port Harcourt / Obio-Akpor p. 40, Hawal Inter-Basin Water Transfer p. 45).

## Portraits
The leadership cards show initials and "Portrait to come". Add real portraits when available.

## Hero video
The hero still supports video. Put MP4 files in `public/videos/hero` using the names in
`HeroVideoCarousel.tsx`; until then each slide shows its picture.
