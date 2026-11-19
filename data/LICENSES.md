# Data licenses and attribution

Al-Hidayah ships source text unmodified and with attribution. The exact response bytes, retrieval date, edition identifiers, and SHA-256 fingerprints are recorded in `data/sources.lock.json`; the fingerprints are repeated in `data/checksums.json`.

Terms below were checked by the implementation agent on **2026-11-19**. Automated license review is not legal advice. Human release sign-off is still required, and any uncertain row below is a release blocker rather than permission to assume a license.

## Qur'an Arabic — Uthmani

- **Used for:** Arabic scripture in the two owner-approved reminders.
- **Delivered by:** AlQuran Cloud, edition `quran-uthmani`, full-edition API response.
- **Upstream text:** Tanzil Uthmani text, as identified by the edition metadata.
- **Source:** https://api.alquran.cloud/v1/quran/quran-uthmani
- **Pinned version:** SHA-256 `0df03e1d6da4fc8138208fec1688f2b416f0dd4ebbd514179f3e5e0fbaf4195f`; retrieved 2026-11-19.
- **Published terms:** AlQuran Cloud's Terms & Conditions permit users to “use, store and show the text freely,” require keeping it exactly as it is, and require source credit when republishing.
- **Terms reviewed at:** https://alquran.cloud/terms-and-conditions
- **Attribution shipped:** AlQuran Cloud and Tanzil are named in the About page and this file.
- **Verification:** Published terms reviewed; human release sign-off pending. No character is normalized, trimmed, corrected, or retyped.

## Qur'an English — Saheeh International

- **Used for:** English translation selected by the project owner.
- **Delivered by:** AlQuran Cloud, edition `en.sahih`, full-edition API response.
- **Source:** https://api.alquran.cloud/v1/quran/en.sahih
- **Pinned version:** SHA-256 `496ff9f8f5cafa6619c6605e0f3d7a30138cabad9a71976c3f8308c082a96454`; retrieved 2026-11-19.
- **Published terms:** AlQuran Cloud states that translation copyright remains with the translator and requires credit to the translator by name when republishing.
- **Terms reviewed at:** https://alquran.cloud/terms-and-conditions
- **Attribution shipped:** “Saheeh International” is attached to every generated record and displayed on the About page.
- **Verification:** Published terms reviewed; human release sign-off pending. Source punctuation and wording are preserved verbatim.

## Qur'an Bangla — Muhiuddin Khan

- **Used for:** Bangla translation paired by surah and ayah number.
- **Delivered by:** AlQuran Cloud, edition `bn.bengali`, identified in its metadata as Muhiuddin Khan.
- **Source:** https://api.alquran.cloud/v1/quran/bn.bengali
- **Pinned version:** SHA-256 `1f77ff20c1b1fcbef24fbab1265257fe34dc035934a876ccd11221272333218a`; retrieved 2026-11-19.
- **Published terms:** AlQuran Cloud states that translation copyright remains with the translator and requires credit to the translator by name when republishing.
- **Terms reviewed at:** https://alquran.cloud/terms-and-conditions
- **Attribution shipped:** “Muhiuddin Khan” is attached to every generated record and displayed on the About page.
- **Verification:** Published terms reviewed; human release sign-off pending. Source punctuation and wording are preserved verbatim.

## AlAdhan Prayer Times API

- **Used for:** Live prayer times only; never for scripture or religious judgements.
- **Source and documentation:** https://aladhan.com/prayer-times-api
- **Pinned version:** Not applicable to live responses. Successful responses are cached locally with their fetch date.
- **Published terms:** The API documentation checked on 2026-11-19 did not state a license, attribution requirement, rate limit, or general terms of use.
- **Attribution shipped:** AlAdhan is named in the README and prayer-time interface.
- **Verification:** **Owner review required before public release.** The absence of published terms on this documentation page is recorded explicitly; no permission is inferred.

## Hadith datasets

No Hadith dataset has been fetched, generated, or shipped. Sahih al-Bukhari and Sahih Muslim remain unavailable until a separate task pins their sources, records their licenses, validates complete references, and names a qualified human reviewer. No license clearance is claimed here.

## Artwork and fonts

The responsive mosque artwork was generated originally for this project and contains no writing or scripture. Owner-supplied design mockups remain in `docs/design/`. Self-hosted font packages retain their SIL Open Font License terms; package and font attribution must accompany any distributed font files.
