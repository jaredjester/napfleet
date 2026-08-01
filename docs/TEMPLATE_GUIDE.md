# NapFleet as a Store Template

This codebase is designed to be forked and customized for other ecommerce stores. Here's how.

## Quick Start (New Store)

1. Fork/clone this repo
2. Update `src/content/napfleet.ts` with your brand copy, products, and navigation
3. Update `src/content/products.ts` with your product catalog
4. Replace `public/products/*.jpg` with your product images
5. Update design tokens in `tailwind.config.ts` and `globals.css`
6. Configure environment variables (see `.env.example`)
7. Run `npm install && npx prisma db push && npx tsx prisma/seed.ts`
8. Run `npm run dev`

## What to Customize

### Brand Identity
- `src/content/napfleet.ts` — brand name, tagline, copy, navigation, FAQ, product content
- `tailwind.config.ts` — color palette, fonts
- `src/app/layout.tsx` — metadata, fonts

### Products
- `src/content/products.ts` — product catalog with handles, variants, prices, metafields
- `public/products/` — product images (named `{handle}-01.jpg`, `{handle}-02.jpg`)

### Design System
- `tailwind.config.ts` — colors, fonts, keyframes
- `src/app/globals.css` — CSS custom properties, base styles

### Pages
- Add/remove sections in `src/app/page.tsx` (homepage)
- Each section is a standalone component in `src/components/home/`

### Providers
- **Commerce**: Implement `CommerceProvider` interface in `src/lib/commerce/`
- **Email**: Implement `EmailProvider` in `src/lib/email/`
- **Tax**: Implement `TaxProvider` in `src/lib/tax/`
- **Shipping**: Implement `ShippingProvider` in `src/lib/shipping/`
- **Newsletter**: Implement `NewsletterProvider` in `src/lib/newsletter/`

Each provider has a mock implementation for development and a real implementation for production. The factory in `index.ts` selects based on environment variables.

### Payment
- Coinflow is the default payment provider
- To swap: implement a new `PaymentProvider` interface and update checkout flows

### Database
- Default: SQLite (local dev) / PostgreSQL (production via Neon)
- Schema in `prisma/schema.prisma`
- Models: Store, Order, OrderItem, CheckoutAttempt, Payment, ProviderEvent, Refund, Dispute, Fulfillment, AuditEvent

### Admin
- Admin auth via iron-session (password-based)
- Set `ADMIN_PASSWORD_HASH` env var (generate with bcrypt)
- To add OAuth: replace `src/lib/auth.ts` with NextAuth.js

## What Comes Pre-Built

- Full product catalog with variants and metafields
- Cart with localStorage persistence and cross-tab sync
- Checkout flow (cart → shipping → payment)
- Coinflow payment integration (card → USDC settlement)
- Webhook handling with signature verification
- Refund processing (full and partial)
- Dispute tracking
- Automated reconciliation
- Admin dashboard with order management
- Email provider abstraction (Resend ready)
- Tax and shipping provider abstractions
- Rate limiting
- SEO (sitemap, robots, JSON-LD ready)
- 33 routes, 13 tests, 0 lint errors

## Files You Should NOT Modify

- `src/lib/db.ts` — Prisma singleton
- `src/lib/cn.ts` — classname utility
- `src/lib/format.ts` — currency formatting
- `src/lib/rate-limit.ts` — rate limiter
- `src/lib/validation/` — catalog, content, policy validators
- `src/context/` — Cart and UI contexts (extend, don't restructure)
