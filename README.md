# Atlas Offer Landing Page (Google Ads)

Fast, mobile-first landing page optimized for cold Google Search traffic.

## Pages
- `/index.html` (default market)
- `/pages/duval-jacksonville.html`
- `/pages/pinellas.html`
- `/pages/hillsborough.html`
- `/pages/polk.html`
- `/pages/orange.html`
- `/thank-you.html`
- `/privacy.html`

## Market config
Edit `config/markets.json` to update:
- Headline/subhead per county
- Testimonials
- Phone number (if using call tracking)

## Lead submit
`assets/js/app.js` currently redirects to the thank-you page.
Replace the submit block with your GoHighLevel webhook or endpoint.

## Deploy (GitHub Pages)
1. Push to main
2. Settings → Pages → Deploy from branch → main → root

