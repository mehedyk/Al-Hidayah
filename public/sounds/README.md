# Calm-sound recordings

The calm-sounds mixer plays **real recordings**, never generated audio. Put the files below in this
folder, exactly as named, and each one appears in the mixer by itself (a layer without a file is
simply not shown). No code change is needed.

| File name | What to look for |
| --- | --- |
| `rain.mp3` | steady rainfall, no thunder, no voices |
| `thunderstorm.mp3` | rain with distant thunder |
| `wind.mp3` | a gentle breeze through trees or open land |
| `stream.mp3` | a flowing brook or small river |
| `waves.mp3` | surf on a shore, no people, no boats |
| `birds.mp3` | morning birdsong in woodland |
| `crickets.mp3` | night crickets and a quiet evening |
| `ambience-404.mp3` | **the 404 page**: birds chirping, a light breeze and flowing water together |

## Choosing files

- **Endless** feel: pick recordings made as seamless loops, or at least 3 to 10 minutes long. The
  browser repeats them automatically; a recording that begins and ends abruptly will click at the join.
- Nature only: no music, no instruments, no human voices, no animals other than birds, insects and weather.
- `.mp3`, 128 kbps is plenty. Keep each file under about 6 MB so pages stay light.
- Make sure the licence allows use in a website (the three below do), and record the source in
  `credits.json` (copy `credits.example.json`). Credits are shown in the mixer.

## Where to find licensed recordings

Open the search, **check the licence on each sound's page**, then download.

| Layer | Freesound (filter: CC0) | Pixabay (no attribution) | Mixkit (no attribution) |
| --- | --- | --- | --- |
| Rain | [rain loop](https://freesound.org/search/?q=rain+loop&f=license%3A%22Creative+Commons+0%22) | [rain](https://pixabay.com/sound-effects/search/rain/) | [rain](https://mixkit.co/free-sound-effects/rain/) |
| Thunderstorm | [thunderstorm](https://freesound.org/search/?q=thunderstorm+rain+ambience&f=license%3A%22Creative+Commons+0%22) | [thunderstorm](https://pixabay.com/sound-effects/search/thunderstorm/) | [nature](https://mixkit.co/free-sound-effects/nature/) |
| Wind | [wind loop](https://freesound.org/search/?q=wind+loop&f=license%3A%22Creative+Commons+0%22) | [wind](https://pixabay.com/sound-effects/search/wind/) | [nature](https://mixkit.co/free-sound-effects/nature/) |
| Stream | [stream](https://freesound.org/search/?q=stream+water+loop&f=license%3A%22Creative+Commons+0%22) | [stream](https://pixabay.com/sound-effects/search/stream/) | [forest](https://mixkit.co/free-sound-effects/forest/) |
| Waves | [ocean waves](https://freesound.org/search/?q=ocean+waves+loop&f=license%3A%22Creative+Commons+0%22) | [waves](https://pixabay.com/sound-effects/search/waves/) | [nature](https://mixkit.co/free-sound-effects/nature/) |
| Birds | [birdsong](https://freesound.org/search/?q=birdsong+morning&f=license%3A%22Creative+Commons+0%22) | [birds](https://pixabay.com/sound-effects/search/birds/) | [birds](https://mixkit.co/free-sound-effects/bird/) |
| Crickets | [crickets night](https://freesound.org/search/?q=crickets+night&f=license%3A%22Creative+Commons+0%22) | [crickets](https://pixabay.com/sound-effects/search/crickets/) | [ambience](https://mixkit.co/free-sound-effects/ambience/) |
| 404 ambience | [birds stream breeze](https://freesound.org/search/?q=forest+stream+birds+ambience&f=license%3A%22Creative+Commons+0%22) | [forest ambience](https://pixabay.com/sound-effects/search/forest%20ambience/) | [forest](https://mixkit.co/free-sound-effects/forest/) |

Also useful: [OpenGameArt rain loops](https://opengameart.org/content/rain-loopable) (check each item's licence).

## Credits

Copy `credits.example.json` to `credits.json` and fill in one entry per file you added. Only `title`
is required; `author`, `license` and an `https://` `url` are optional.

## More sound modes

The mixer now knows 15 layers. Each appears only if its file exists, and any of these extensions
works: `.mp3`, `.ogg`, `.m4a`, `.wav`. Accepted names (first match wins):

`rain`, `rainroof` (or `rain-roof`), `thunderstorm` (or `thunder`), `wind`, `desert`, `stream`
(or `water`), `river`, `waterfall`, `waves` (or `oceanwaves`), `seagulls`, `birds`, `forest`,
`crickets`, `frogs`, `fire` (or `campfire`). Credits in `credits.json` can be keyed by the layer
name or by the file name.
