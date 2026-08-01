# Deployment Checklist

## Pre-Launch Verification

### Code Quality
- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] Content lint passes (no prohibited terms or claims)
- [ ] No TypeScript errors

### Commerce
- [ ] Production commerce provider configured and tested
- [ ] All 5 products created and published
- [ ] Collection `shop-the-fleet` contains published products
- [ ] Metafields complete for all products
- [ ] Checkout URL works end-to-end
- [ ] Cart operations tested (add, update, remove, clear)

### Content
- [ ] All product images uploaded (minimum 4 per product)
- [ ] All required product fields complete
- [ ] All policies finalized and marked ready
- [ ] FAQ answers confirmed for all visible questions
- [ ] No placeholder or lorem ipsum text in production

### Brand
- [ ] "NapFleet" used everywhere (not "NapFleet Pet Co." except in formal areas)
- [ ] No ™ or ® symbols next to NapFleet
- [ ] Copyright year is correct
- [ ] No source-site branding remains
- [ ] No unsupported claims (orthopedic, waterproof, etc.)

### Design
- [ ] All pages responsive at 1440, 1280, 1024, 768, 430, 390, 360
- [ ] No horizontal overflow on mobile
- [ ] No content hidden behind sticky UI
- [ ] Touch targets minimum 44px
- [ ] Design tokens used consistently

### Accessibility
- [ ] WCAG 2.2 AA contrast ratios met
- [ ] All images have descriptive alt text
- [ ] All forms have proper labels and error associations
- [ ] Keyboard navigation works throughout
- [ ] Focus states visible
- [ ] Reduced motion respected
- [ ] Screen reader testing completed

### SEO
- [ ] sitemap.ts includes only published content
- [ ] robots.ts configured
- [ ] Metadata present for all pages
- [ ] Open Graph tags use real product media
- [ ] Canonical URLs set
- [ ] Structured data valid (Product, Organization, Breadcrumb, FAQ where applicable)
- [ ] No fake aggregate ratings or review counts in structured data

### Performance
- [ ] Lighthouse score acceptable for image-heavy ecommerce
- [ ] Images use modern formats (WebP/AVIF)
- [ ] Largest Contentful Paint optimized
- [ ] No Cumulative Layout Shift
- [ ] Videos have poster images and deferred loading
- [ ] No source maps in production

### Legal
- [ ] Privacy policy complete
- [ ] Terms and conditions complete
- [ ] Return policy complete
- [ ] Shipping/preorder policy complete
- [ ] Copyright notice correct
- [ ] Consent checkboxes not pre-checked

### Infrastructure
- [ ] Domain configured with SSL
- [ ] Environment variables set in production
- [ ] Webhooks registered for inventory updates
- [ ] Monitoring/error tracking configured
- [ ] Backup procedures documented

## External Tasks (Cannot Be Done in Code)

These require business owner action:

- [ ] Finalize and publish all legal policies
- [ ] Configure Shopify checkout branding
- [ ] Set up shipping rates and zones
- [ ] Configure taxes in Shopify
- [ ] Set up order confirmation emails
- [ ] Register domain (NapFleetPets.com, ShopNapFleet.com, or GetNapFleet.com)
- [ ] Complete trademark clearance for NapFleet name
- [ ] Provide business address for legal pages
- [ ] Determine jurisdiction for terms
- [ ] Configure customer accounts (if desired)
- [ ] Set up newsletter provider (if desired)
- [ ] Set up contact form delivery email
