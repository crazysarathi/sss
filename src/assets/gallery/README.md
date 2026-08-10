# Moments gallery images

Photos shown by the accordion gallery in
`src/components/sections/ProgramSection.tsx`. Titles, tags and captions
live in `src/data/siteData.ts` (`program.items`).

## Adding or replacing a photo

1. Crop/downsize it into this folder with the helper script:

   ```bash
   # just downsize (the panel crops on screen via object-cover):
   python3 scripts/crop-gallery.py photo.jpg src/assets/gallery/league-launch.jpg --width 1200

   # cut a pixel rectangle first (e.g. trim phone UI off a screenshot;
   # box is X Y WIDTH HEIGHT from the top-left corner):
   python3 scripts/crop-gallery.py shot.png src/assets/gallery/press-coverage.jpg --box 0 450 588 375
   ```

2. If it's a new panel, add an entry to `program.items` in siteData and to
   `GALLERY_IMAGES` in ProgramSection.
3. If a face sits awkwardly in the on-screen crop, adjust `GALLERY_FOCUS`
   in ProgramSection (CSS object-position, e.g. `"50% 30%"`).
