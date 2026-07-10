# Aircraft Parts — Illustrated Parts Catalog

A practice quiz for identifying aircraft parts (exterior, engine, cockpit, systems),
with a certification/logbook system to track mastery per section.

## Local development

```
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Deploying

Push this folder to a GitHub repo, then import the repo in Vercel
(vercel.com → Add New Project → pick this repo). Vercel auto-detects
Vite and deploys it — no extra config needed.

## Notes

- Progress and stats are saved in the browser's local storage, so they're
  tied to one browser on one device for now.
