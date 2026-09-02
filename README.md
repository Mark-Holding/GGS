# Gloucester Garden Services — website

A fast, mobile-first, single-page website built to turn visitors into quote requests.
Plain HTML, CSS and JavaScript — no build step, no framework. Upload the folder to any
static host (Netlify, Cloudflare Pages, GitHub Pages, cPanel…) and it works.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole site, plus the **business settings** block near the top |
| `assets/css/styles.css` | Styling. Brand colours are the CSS variables at the top |
| `assets/js/main.js` | Menu, form handling, sticky mobile buttons, scroll animations |
| `assets/img/` | Logo (transparent PNG), icons, social-share image |
| `site.webmanifest`, `robots.txt`, `sitemap.xml` | SEO / browser housekeeping |
| `netlify.toml` | Optional: caching headers if you host on Netlify |

## Before you launch — 5 minute checklist

1. **Contact details.** Open `index.html` and edit the `window.GGS_CONFIG` block near the top:
   phone number, WhatsApp number, email and opening hours. The whole site updates from there.
   The phone number currently in the file (`07700 900123`) is a placeholder, not a real number.
   Also update the phone number and email in the `LocalBusiness` JSON block just below it
   (Google reads that one directly).
2. **Domain.** Search-and-replace `www.gloucestergardenservices.co.uk` with your real domain
   (in `index.html`, `robots.txt` and `sitemap.xml`).
3. **Quote form delivery.** Choose one `formMode` in the settings block:
   - `"mailto"` (default): opens the visitor's email app with the request pre-filled. Works
     anywhere, no setup, but relies on the visitor having an email app configured.
   - `"formspree"`: sign up free at formspree.io, create a form, and paste its endpoint URL
     into `formEndpoint`. Requests arrive in your inbox with no email app needed. **Recommended.**
   - `"netlify"`: if you host on Netlify, forms are captured automatically and appear in the
     Netlify dashboard (enable notifications to get them by email).
4. **Reviews.** The three reviews in the *Kind words* section are sample text to show the layout.
   Replace them with genuine customer reviews before going live, and add your Google reviews
   link to `googleReviewUrl` if you have one.
5. **Photos (optional but recommended).** Real before-and-after photos convert well. The
   `.why-frame` block in the *Why us* section is a natural place for a hero photo — replace the
   logo `<img>` there with a photo of your work, or add a gallery section.

## Measuring conversions

When a quote form is submitted the site fires:
- Google Analytics 4: event `generate_lead` (if `gtag` is on the page)
- Google Tag Manager: `dataLayer` event `quote_request`
- Meta Pixel: `Lead` event (if `fbq` is on the page)

Paste your GA4 / GTM snippet into the `<head>` of `index.html` and mark `generate_lead` as a
conversion in GA4. Call and WhatsApp taps can be tracked with GTM click triggers on links whose
`href` starts with `tel:` or `https://wa.me/`.

## Editing content

Everything is plain HTML with comments marking each section (`HERO`, `SERVICES`, `WHY US`,
`HOW IT WORKS`, `REVIEWS`, `AREAS`, `FAQ`, `QUOTE`). Change wording directly. To add a service,
copy one `<article class="service-card">` block and add the matching `<option>` to both
`<select>` lists so the pre-fill links keep working.

## Local preview

Any static server works, for example:

```
python3 -m http.server 8000
```

then open http://localhost:8000.
