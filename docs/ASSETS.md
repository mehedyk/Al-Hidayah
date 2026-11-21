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

## README figures

`docs/assets/*.svg` are original, hand-authored animated SVGs.
