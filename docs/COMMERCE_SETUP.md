# Shopify Commerce Setup

## Overview

NapFleet uses a commerce provider abstraction layer. The default development provider is a mock implementation. For production, connect to Shopify via the Storefront API.

## Prerequisites

1. A Shopify store with the following:
   - Storefront API access enabled
   - Products created for all 5 NapFleet designs
   - A collection with handle `shop-the-fleet`
   - Metafield definitions for extended product data

## Environment Variables

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
```

## Shopify Metafields

Create these metafield definitions in Shopify Admin → Settings → Custom Data:

| Namespace | Key | Type |
|-----------|-----|------|
| napfleet | domain | Single line text |
| napfleet | publish_ready | Boolean |
| napfleet | preorder_status | Single line text |
| napfleet | preorder_estimate_weeks | Integer |
| napfleet | overall_length | Single line text |
| napfleet | overall_width | Single line text |
| napfleet | overall_height | Single line text |
| napfleet | interior_sleeping_length | Single line text |
| napfleet | interior_sleeping_width | Single line text |
| napfleet | recommended_pet_length | Single line text |
| napfleet | recommended_pet_weight | Single line text |
| napfleet | entry_height | Single line text |
| napfleet | product_weight | Single line text |
| napfleet | materials | Single line text |
| napfleet | filling | Single line text |
| napfleet | care_instructions | Single line text |
| napfleet | box_contents | Single line text |
| napfleet | assembly_required | Single line text |
| napfleet | return_eligibility | Single line text |
| napfleet | sleep_area_design | Single line text |

## Product Setup

Each product needs:

1. Correct handle matching the app routes (e.g., `rescue-chopper-dog-bed`)
2. At least one variant with price $69.99
3. All required metafields filled
4. Product images uploaded
5. `publish_ready` metafield set to `true`

Until all required fields are complete, the product will not appear on the public storefront.

## Implementation

Implement the `CommerceProvider` interface from `src/lib/commerce/types.ts` using the Shopify Storefront API. Create at `src/lib/commerce/shopify.ts`.

## External Tasks

These tasks require Shopify admin access and cannot be completed in code:

- [ ] Configure checkout branding (logo, colors)
- [ ] Set up shipping rates and zones
- [ ] Configure taxes
- [ ] Set up order confirmation emails
- [ ] Register webhooks for inventory and product updates
- [ ] Configure customer accounts (if needed)
- [ ] Set up domain and SSL
