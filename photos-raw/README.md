# photos-raw

Drop the generated photos here, named exactly like the shots in `docs/shot-list.json`
(for example `hero.jpg`, `coach-boxing.png`). Any of jpg, png, webp, avif.

When the site is set up, `npm run photos` will crop each photo to its shot's ratio,
compress it into `public/photos/` and update the photo manifest, the same way as in `svetoten-cafe`.
Until then the files just wait here.
