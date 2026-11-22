# Assets and credits

## Scene photography (Pexels License)

Free for commercial use, attribution not required, modification allowed
(<https://www.pexels.com/license/>). Credit is given anyway. No photo shows people, buildings or text.

| Scene | Title | Photographer | Page |
| --- | --- | --- | --- |
| Emerald Mist | Misty lake with lush greenery and fog-shrouded mountains | Sami TÜRK | <https://www.pexels.com/photo/misty-lake-with-lush-greenery-and-foggy-mountains-39757686/> |
| Ink Mountains | Misty mountains | Marina Solis | <https://www.pexels.com/photo/misty-mountains-10989215/> |
| Lake at Dawn | Serene mountain lake reflection at dawn | eberhard grossgasteiger | <https://www.pexels.com/photo/serene-mountain-lake-reflection-at-dawn-29609552/> |
| Golden Dunes | Golden Sahara desert dunes at sunset | NaturEye Conservation | <https://www.pexels.com/photo/golden-sahara-desert-dunes-at-sunset-28829635/> |
| Crescent Night | Crescent moon in a starry night sky | Cris Ménlés | <https://www.pexels.com/photo/crescent-moon-in-a-starry-night-sky-28849652/> |

The catalogue lives in `src/lib/scenes.ts`. Photos load from `images.pexels.com` unless you run
`pnpm wallpapers:fetch` to self-host them. The Pexels license page does not address hot-linking,
so self-hosting is the safer production choice.

A dune photo with two silhouetted people was considered and rejected; scenes must not show people.

## Footer and 404 film

Supplied by the project owner, used verbatim from the URLs in `src/lib/media.ts` (not downloaded).

## Icons

Lucide (<https://lucide.dev>), ISC licence, inlined as path data in `src/components/Icon.tsx`.
Copyright (c) Lucide Contributors; portions (c) Cole Bemis 2013-2022 (Feather, MIT).
The mosque glyph and the Al-Hidayah logo mark are original.

## Audio

- Recitation: streamed from EveryAyah (https://everyayah.com); not bundled, not re-hosted. Check their terms for your use.
- Calm sounds and the 404 ambience: recordings you add under `public/sounds/` (credit them in `credits.json`). None are bundled yet.

## Fonts

Kalpurush (Akkhor52) is included unmodified at `public/fonts/kalpurush.ttf`, with the publisher's licence note in `kalpurush-LICENSE.txt`. That note says the fonts are free for personal use, must not be modified, renamed or resold, and that **commercial use needs the designer's or publisher's permission**. Keep that in mind if the project is monetised.

## Share templates

Built-in designs are drawn in code. Photo templates reuse the scene photographs above plus five extra Pexels photographs (Ferdous 13944508, Hira Dewan 29813495, Alimuart 15854584, tonmoydipu2030 40401973, Radis 25527078), supplied by the project owner. Photographer display names were taken from the file names.
Pictures you add under `public/share-templates/` are yours to license and credit.

## README figures

`docs/assets/*.svg` are original, hand-authored animated SVGs.
