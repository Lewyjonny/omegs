# Omegs — web frontend

Marketing site and customer frontend for Omegs, a residential and commercial cleaning company with an iOS/Android app.

Built with React 18, Vite, TypeScript, Tailwind CSS, React Router and Lucide React.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:5173
```

| Script            | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Type-check (`tsc -b`) and build      |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Serve the production build locally   |

## Environment

| Variable                        | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project URL — enables real Supabase Auth              |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — browser-safe                 |
| `VITE_APP_STORE_URL`            | App Store listing; buttons show "Coming soon" while empty      |
| `VITE_GOOGLE_PLAY_URL`          | Google Play listing; buttons show "Coming soon" while empty    |

Never put a Supabase secret/service-role key or email-provider API key in a `VITE_` variable — everything prefixed with `VITE_` ships to the browser.

## Routes

`/`, `/services`, `/services/:serviceId`, `/about`, `/contact`, `/download`, `/login`, `/signup`, `/forgot-password`, `/privacy`, `/terms`, `/book` (protected), `/account` (protected), and a custom 404.

## Project structure

```
src/
  components/   shared UI (ui/, layout/, home/ sections, cards, accordion, phone mockup)
  config/       site-wide brand, contact and app-store settings
  data/         service catalogue and page content
  hooks/        useAuth, usePageMeta
  layouts/      MainLayout, AuthLayout
  lib/          supabase client, validation, formatting
  pages/        route components (lazy-loaded)
  services/     auth, booking and contact service layers
  types/        shared TypeScript types
```

## Demo vs. production behaviour

- **Auth** — uses Supabase Auth when the Supabase variables are set; otherwise a clearly labelled browser-only demo mode.
- **Bookings** — stored in the browser (`src/services/booking.ts`). Replace with an API / Supabase table before launch.
- **Contact form** — validated but not delivered (`src/services/contact.ts`). Connect to a backend (e.g. a Supabase Edge Function + email provider).
- **Pricing** — `startingPrice: null` shows "Price on request"; set real prices in `src/data/services.ts`.
- **Testimonials** — labelled samples; replace with verified reviews.
- **Legal pages, contact details, social links** — placeholders in `src/pages/LegalPage.tsx` and `src/config/site.ts`.
