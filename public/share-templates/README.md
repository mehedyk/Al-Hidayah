# Your own share-card backgrounds

Drop licensed pictures here and list them in `templates.json`; they appear in the Share Studio
next to the built-in templates, with the verse, translations and reference drawn on top.

```json
[
  {
    "id": "my-dunes",
    "name": "Dunes",
    "file": "dunes.jpg",
    "tone": "light",
    "accent": "#f0b45a",
    "credit": "Photo: Jane Doe / Pexels"
  }
]
```

- `file`: a .jpg, .png or .webp in this folder (about 1080 x 1920 or larger; portrait works best).
- `tone`: `light` for dark pictures (white text), `dark` for pale pictures (dark text).
- `accent`: a `#rrggbb` colour for the reference and brand line (optional).
- `credit`: printed small at the bottom of the card (optional, recommended).

Only use pictures whose licence allows this (Pexels, Unsplash and Pixabay licences do; CC0 does).
Avoid pictures showing people, buildings or text, in line with the project content rules (AGENTS.md section 3).
