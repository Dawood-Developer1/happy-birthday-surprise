# NEXORA Birthday Surprise v1.0

NEXORA Birthday Surprise is a backend-free, mobile-first interactive digital gift. It uses a small vanilla JavaScript scene controller, CSS illustrations and local SVG assets, so a personalized version can be shipped without a database, authentication or unreliable image URLs.

## Run locally

Use Node.js 18 or newer. From the project folder, run:

```bash
npm start
```

Then open `http://localhost:3000`. The server binds to `0.0.0.0` and honors `PORT` for hosts that provide one.

## Personalize one customer version

Open `js/config.js` and edit `window.birthdayConfig`. The main fields are:

```js
recipientName: 'Maya',
senderName: 'Someone who adores you',
birthdayMessage: 'You make ordinary days feel like little celebrations.',
theme: 'blush',
photos: [
  { src: 'assets/images/memory-01.svg', caption: 'A day worth keeping' }
],
enableMusic: true,
enableGallery: true,
enableGift: true
```

The `theme` can be `blush`, `lavender` or `sky`. You can update the palette inside `themeColors` or add another palette using the same `accent`, `accentDeep` and `glow` keys. `messageIntro`, `giftMessage` and `finalMessage` control the emotional copy shown in the later scenes. Set a section flag in `sections` to `false` when a version should skip that scene.

## Replace photos

Drop customer images into `assets/images/`, then update each `src` in `js/config.js`. SVG, PNG, JPG and WebP work with the included server. Keep alt-friendly captions in the `caption` field. The gallery falls back to the included local SVG placeholders if the configured list is empty.

## Interaction notes

The readiness scene keeps the NO option playful but never blocks the recipient: it changes its label and moves a bounded distance on each click. The cake candles are individually tappable. The sound control uses small Web Audio tones instead of an external music file, so it works offline and remains opt-in. The gift box reveals content and unlocks the virtual hug before the final celebration.

## Deploy to Vercel

This is a static-friendly Node project. You can deploy it as a Node app with the included `server.mjs`, or configure Vercel to serve the files directly. A minimal `vercel.json` can route all paths to `index.html` if you add client-side routes later:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

For the current single-page experience, no rewrite is required. Set the project framework to “Other” and use `npm start` only if deploying the Node server; otherwise publish the repository root as static output.

## Deploy to Netlify

Set the publish directory to `.` for a static deployment. If using Netlify's Node runtime instead, use `npm start` as the start command. The current experience only needs the root files and `assets/`, `css/` and `js/` directories.

## Project structure

- `index.html` contains the seven connected scenes and semantic controls.
- `css/style.css` contains the responsive design system, CSS penguin, gift, cake, gallery and animation choreography.
- `js/config.js` is the single customer-personalization surface.
- `js/app.js` controls scene transitions, config binding, gallery navigation, candle interactions, virtual gift, hug and optional sound.
- `assets/` contains the NEXORA mark and local placeholder illustrations.
- `server.mjs` provides a dependency-free local preview server.
- `manus-routes.json` declares the root route for managed preview.
