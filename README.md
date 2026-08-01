# NapFleet — Vehicle-Shaped Dog Beds

**Big adventures. Better naps.**

A headless ecommerce storefront built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Vehicle-shaped dog beds for four-legged dreamers.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Framework**: Next.js 14 with App Router (React Server Components by default)
- **Language**: TypeScript in strict mode
- **Styling**: Tailwind CSS with CSS custom properties for design tokens
- **Fonts**: Barlow Condensed (display) + Inter (body) via next/font
- **Validation**: Zod for environment and content validation
- **Commerce**: Provider abstraction layer (mock for dev, Shopify Storefront API for production)

### Commerce Provider

The app uses a typed `CommerceProvider` interface in `src/lib/commerce/types.ts`.

- **Development**: `src/lib/commerce/mock.ts`
- **Production**: Implement the interface with Shopify Storefront API

### Content Layer

All approved copy lives in `src/content/napfleet.ts`. Commerce facts come from the provider.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run verify` | Run full verification suite |

## Design Tokens

| Token | Hex |
|-------|-----|
| Fleet Charcoal | `#181B17` |
| Deep Olive | `#535C45` |
| Field Olive | `#6B7358` |
| Flight Cream | `#F4F0E6` |
| Warm White | `#FFFDF7` |
| Field Khaki | `#B8AE91` |
| Signal Orange | `#D95F36` |
| Muted Sky Blue | `#8FB8CE` |
| Text Gray | `#6D7069` |

## Documentation

- [Commerce Setup](docs/COMMERCE_SETUP.md)
- [Content Readiness](docs/CONTENT_READINESS.md)
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)

## License

Private — All Rights Reserved
