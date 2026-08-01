# NapFleet Architecture

## Overview

Production-grade Next.js 14 ecommerce storefront with provider-based architecture. Every external service sits behind a typed interface, making the codebase a reusable template for other stores.

## Provider Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NapFleet Storefront                   │
├─────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                            │
│  ├── Layout (Header, Footer, Announcement)              │
│  ├── Product (Cards, Gallery, Detail)                   │
│  ├── Cart (Drawer, Context)                             │
│  ├── Checkout (Review → Shipping → Payment)             │
│  └── Admin (Dashboard, Login)                           │
├─────────────────────────────────────────────────────────┤
│  Provider Boundary (Typed Interfaces)                   │
│  ├── CommerceProvider  → mock | shopify                 │
│  ├── EmailProvider     → mock | resend                  │
│  ├── NewsletterProvider → mock | mailchimp              │
│  ├── TaxProvider       → mock | taxjar                  │
│  ├── ShippingProvider  → mock | shippo                  │
│  └── PaymentProvider   → coinflow                       │
├─────────────────────────────────────────────────────────┤
│  Data Layer                                            │
│  ├── Prisma ORM (PostgreSQL / SQLite)                   │
│  ├── Cart (React Context + localStorage)                │
│  └── Content (static TypeScript files)                  │
├─────────────────────────────────────────────────────────┤
│  External Services                                      │
│  ├── Coinflow (card processing, USDC settlement)        │
│  ├── Resend (transactional email)                       │
│  ├── Vercel (hosting, serverless functions)             │
│  └── Neon (PostgreSQL)                                  │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Server-Authoritative Pricing
The browser never submits prices. All amounts are calculated server-side from the catalog. The checkout Prepare endpoint validates every item against the product database and rejects client-tampered payloads.

### Fail-Closed Payment
If Coinflow is unavailable, checkout returns 503 — never a test-mode fallback in production. Environment validation runs at module load and blocks deployment of misconfigured production instances.

### Idempotent Mutations
Every money-moving operation (orders, refunds, webhook events) is protected by unique database constraints on idempotency keys. Duplicate webhook events and double-clicked checkout submissions cannot create duplicate orders or payments.

### Immutable Order Snapshots
Order items capture product title, variant, SKU, price, and preorder estimate at purchase time. Editing a product later does not change historical orders.

### Provider Swapping
To replace a provider (e.g., mock tax → TaxJar), implement the interface in a new file and update the factory in `src/lib/{provider}/index.ts`. No component or API route changes needed.

## Route Map

| Route | Type | Auth | Purpose |
|-------|------|------|---------|
| `/` | Static | Public | Homepage |
| `/shop-the-fleet` | Static | Public | Collection |
| `/products/[handle]` | SSG | Public | Product detail (5 pages) |
| `/size-guide` | Static | Public | Size comparison |
| `/our-story` | Static | Public | Brand story |
| `/faq` | Static | Public | FAQ accordion |
| `/contact` | Static | Public | Contact form |
| `/search` | Static | Public | Product search |
| `/checkout` | Static | Public | Checkout flow |
| `/checkout/processing` | Static | Public | Post-payment |
| `/admin` | Static | Admin | Dashboard |
| `/admin/login` | Static | Public | Admin auth |
| `/api/checkout/prepare` | Dynamic | Public | Checkout prep |
| `/api/orders/[number]/status` | Dynamic | Public | Order status |
| `/api/webhooks/coinflow` | Dynamic | Public | Coinflow webhook |
| `/api/contact` | Dynamic | Public | Contact form POST |
| `/api/newsletter` | Dynamic | Public | Newsletter POST |
| `/api/admin/login` | Dynamic | Public | Admin auth |
| `/api/admin/orders` | Dynamic | Admin | Order list |
| `/api/admin/orders/[id]/refund` | Dynamic | Admin | Process refund |
| `/api/cron/coinflow-reconcile` | Dynamic | Cron | Reconciliation |
