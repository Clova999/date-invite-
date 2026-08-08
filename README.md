# Date invite

A small mobile first web app. She opens it, gets asked out, then curates the
plan and sends her picks back to you. No backend, everything runs in the
browser.

## Run it

```bash
npm install
npm run dev      # local dev server, open the printed URL on your phone too
npm run build    # static files land in dist/
npm run preview  # serve the built files
```

The build in `dist/` is plain static output, so it drops onto Netlify, Vercel,
GitHub Pages or any static host as is.

## Editing the content

Everything she reads lives in **`src/config.js`**, as named exports. You never
need to touch a component.

| Export           | What it does                                                     |
| ---------------- | ---------------------------------------------------------------- |
| `whatsappNumber` | Where her picks get sent. Digits only with the country code, no plus sign and no spaces, for example `27821234567`. While it still holds the `27XXXXXXXXX` placeholder the app treats it as unset and WhatsApp opens with the message ready but asks her which chat. |
| `askMedia`       | Optional image or GIF above the headline on the ask screen.       |
| `askHeadline`    | The question itself.                                              |
| `askCaptions`    | Rotates one per press of "Absolutely not". Add as many as you like. |
| `welcomeIntro`   | The short intro on the welcome screen.                            |
| `activities`     | Array of `{ name, media, teaser }`. Only `name` is required.      |
| `restaurants`    | Array of `{ name, media, teaser, area }`. Only `name` is required. |

Both arrays render at whatever length you leave them, so add a fifth activity
or drop one and the screens just follow. `teaser` and `area` are optional on
either list: leave them out and the card is just the picture and the name.
Picks are stored by `name`, so renaming an entry after she has answered drops
that one pick.

## Adding images and GIFs

1. Drop the file into **`public/media/`**.
2. Reference it by filename only in `src/config.js`:

```js
{
  name: "Arcade",
  media: "arcade.jpg",
  teaser: "",
}
```

The current config expects these nine files in `public/media/`:

```
ask.gif            arcade.jpg     art-gallery.jpg   shooting-range.jpg
mystery.jpg        date-night.jpg burgers.jpg       mexican.jpg
korean.jpg
```

Any of them that are not there yet simply fall back to the text only card, so
you can add them one at a time and the app keeps working throughout.

Static images and animated GIFs both work, and so do `.mp4` and `.webm` files,
which play muted and looped with no controls. Media loads lazily behind a soft
placeholder and is cropped to a fixed banner shape, so mixed sizes still line
up in a list.

Leave `media` as `''` and that card falls back to a clean text only layout in
the accent colour. A filename that does not exist falls back the same way, so a
typo never breaks a screen.

## Changing the look

One accent colour drives the whole app. It lives at the top of
`src/index.css`:

```css
@theme {
  --color-accent: #e0614a;
  ...
}
```

## How the ask screen behaves

- "Yes" advances. "Absolutely not" does not.
- Every press of "Absolutely not" multiplies the Yes button by 1.35, with a
  spring transition.
- The Yes button is clamped so it can never exceed 85 percent of viewport width
  or 55 percent of viewport height, whichever it reaches first, and it is also
  held inside its own area of the screen so it is never clipped, never pushed
  off screen and never covered. The clamp is recomputed on resize and on
  orientation change.
- The Yes label grows with the button but stops at 40px so it stays readable.
- "Absolutely not" shrinks by 0.85 per press with a hard floor of 44 by 44 CSS
  pixels, and drifts towards the corner. It stays tappable forever.
- With `prefers-reduced-motion` set, the button still grows but without the
  bounce or the drift.

## Her answers

Progress is kept in `localStorage` under `date-invite.v2`, so a refresh does not
wipe anything and the ask screen never replays once she has said yes. To reset
everything for testing, clear that key in devtools or run:

```js
localStorage.removeItem('date-invite.v2')
```

## What she sends back

The summary screen shows the recap on screen. The Send button builds a plain
text version with two ways out: copy to clipboard, or open WhatsApp with the
message already written. The count of "Absolutely not" presses rides along at
the bottom as a small joke.
