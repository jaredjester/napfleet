/**
 * NapFleet content layer
 *
 * All approved branded copy lives here. Commerce facts come from the provider.
 * Unconfirmed fields come from metafields/CMS. This file is the single source
 * of truth for editorial content across the site.
 */

export const BRAND = {
  name: "NapFleet",
  formalName: "NapFleet Pet Co.",
  tagline: "Big adventures. Better naps.",
  promise: "Not just a dog bed. Their dream ride.",
  primaryCta: "Shop the Fleet",
} as const;

export const ANNOUNCEMENT = {
  bar1: "PREORDERS OPEN \u2022 ESTIMATED SHIPPING IN 8 WEEKS",
  statusLabel: "FLEET STATUS",
  statusCenter: "PREORDERS OPEN",
  statusRight: "EST. SHIPPING IN 8 WEEKS",
} as const;

export const TICKER_STATEMENTS = [
  "BIG ADVENTURES. BETTER NAPS.",
  "NOT JUST A DOG BED. THEIR DREAM RIDE.",
  "SKY, LAND, OR SEA\u2014EVERY MISSION DESERVES A SOFT LANDING.",
  "FROM TAKEOFF TO LIGHTS-OUT.",
] as const;

export const NAV_LINKS = [
  { label: "Shop the Fleet", href: "/shop-the-fleet" },
  { label: "Size Guide", href: "/size-guide" },
  { label: "Our Story", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
] as const;

export const HOME = {
  hero: {
    eyebrow: "ADVENTURE BEDS FOR FOUR-LEGGED DREAMERS",
    heading: "THEIR DREAM RIDE HAS ARRIVED.",
    copy: "Meet NapFleet: bold, vehicle-shaped dog beds with soft, padded sleep spaces for serious snoozers and pets with personality.",
    stampLine: "From takeoff to lights-out.",
    sideLabel: "Not just a dog bed. Their dream ride.",
  },
  benefitStrip: "SOFT TUFTED COMFORT \u00B7 COZY RAISED SIDES \u00B7 UNFORGETTABLE 3D DESIGNS",
  collectionIntro: {
    eyebrow: "THE NAPFLEET COLLECTION",
    heading: "CHOOSE THEIR RIDE",
    copy: "Sky, land, or sea\u2014every mission deserves a soft landing. Find the NapFleet bed that matches your pup\u2019s personality, then prepare for the most photogenic nap of their life.",
  },
  fleetInfoRail: {
    eyebrow: "FLEET SPECS",
    heading: "BUILT FOR BIG NAPS",
    items: [
      { value: "5", label: "DREAM RIDES" },
      { value: "SKY \u00B7 LAND \u00B7 SEA", label: "DOMAINS" },
      { value: "SOFT TUFTED", label: "COMFORT" },
      { value: "COZY RAISED", label: "SIDES" },
    ],
  },
  whyNapFleet: {
    eyebrow: "THE NAPFLEET STANDARD",
    heading: "SERIOUS COMFORT. ZERO BORING.",
    copy: "Most dog beds are designed to disappear into the room. NapFleet beds are designed to become your dog\u2019s favorite place to land\u2014and the most talked-about piece in your home.\n\nEach vehicle-inspired design surrounds a soft sleeping area with padded sides, creating a cozy place for curling up, resting their head, and dreaming up the next mission.",
    benefits: [
      {
        heading: "Comfort they can sink into",
        copy: "Soft, tufted cushioning gives your pup a welcoming place to curl up and recharge.",
      },
      {
        heading: "A tucked-in feeling",
        copy: "Raised padded sides create the cozy, nest-like environment many pets naturally prefer.",
      },
      {
        heading: "A bed worth showing off",
        copy: "Every NapFleet design doubles as playful room d\u00E9cor and an instant conversation starter.",
      },
    ],
  },
  giftSection: {
    eyebrow: "PROMOTION APPROVED",
    heading: "FOR THE DOG WHO ALREADY HAS EVERYTHING.",
    copy: "Part pet bed. Part adventure. Entirely impossible to ignore.\n\nGive it for a birthday, gotcha day, holiday morning, or simply because your dog has clearly earned a promotion.",
  },
  preorderSection: {
    eyebrow: "FLEET RESERVATIONS",
    heading: "RESERVE THEIR RIDE",
    copy: "The current NapFleet collection is available for preorder and typically ships within eight weeks. We\u2019ll keep you updated along the way and send tracking as soon as your pup\u2019s new ride is on the move.",
    microcopy: "Order updates by email \u00B7 Tracking provided when shipped",
  },
  aboutSection: {
    eyebrow: "OUR STORY",
    heading: "ORDINARY BEDS DO THE JOB. DREAM RIDES MAKE MEMORIES.",
    copy: "NapFleet began with one simple belief: the things made for our dogs should have as much personality as they do.\n\nWe turn iconic vehicles into soft, playful sleeping spaces that make pets comfortable and their humans smile. From rescue choppers and fighter jets to tanks, trucks, and patrol boats, every design is created to make nap time feel like an adventure.\n\nBecause they are not just sleeping. They are refueling.",
  },
  emailSignup: {
    eyebrow: "FLEET COMMUNICATIONS",
    heading: "JOIN THE FLEET",
    copy: "Get first access to new rides, restocks, launch offers, and highly important nap reports.",
    placeholder: "Enter your email",
    button: "REPORT FOR UPDATES",
  },
} as const;

export const FOOTER = {
  links: [
    { label: "Shop the Fleet", href: "/shop-the-fleet" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Our Story", href: "/our-story" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export const PRODUCT = {
  rescueChopper: {
    pageTagline: "Ready for rescue. Cleared for rest.",
    cardTagline: "Ready for rescue. Cleared for rest.",
    highlights: [
      "Sculpted helicopter-inspired design",
      "Soft, tufted sleeping area",
      "Raised padded sides for a tucked-in feeling",
      "Bold rescue and K9-inspired detailing",
      "A memorable gift for dog owners, aviation fans, and pet parents who refuse to buy boring",
    ],
    cta: "RESERVE THE CHOPPER",
    sleepAreaDesign: "Soft tufted area \u00B7 Raised padded sides",
  },
  topDogJet: {
    pageTagline: "First-class comfort for your favorite wingman.",
    cardTagline: "First-class comfort for your favorite wingman.",
    highlights: [
      "Fighter-jet-inspired design",
      "Deep cushioned sleeping center",
      "Padded sides for a cozy cockpit feeling",
      "Detailed wings and cockpit accents",
      "Signature Top Dog tail design",
    ],
    cta: "CLEAR THEM FOR TAKEOFF",
    sleepAreaDesign: "Deep cushioned center \u00B7 Padded sides",
  },
  commandTank: {
    pageTagline: "The toughest-looking soft spot in the house.",
    cardTagline: "Tough look. Cozy center.",
    highlights: [
      "Bold tracked tank-inspired design",
      "Cushioned sleeping center",
      "Raised padded walls",
      "Cozy place to curl up",
      "Mission-ready statement design",
    ],
    cta: "REPORT FOR NAP DUTY",
    sleepAreaDesign: "Cushioned center \u00B7 Padded walls",
  },
  patrolBoat: {
    pageTagline: "All paws on deck\u2014then lights out.",
    cardTagline: "Drop anchor. Drift off.",
    highlights: [
      "Patrol-boat-inspired design",
      "Soft tufted sleeping area",
      "Raised padded sides",
      "Nautical and cabin-style details",
      "K9 patrol styling",
    ],
    cta: "CLAIM THE CAPTAIN\u2019S QUARTERS",
    sleepAreaDesign: "Soft tufted area \u00B7 Padded sides",
  },
  commandTruck: {
    pageTagline: "Built for brave naps.",
    cardTagline: "Built for brave naps.",
    highlights: [
      "Utility-truck-inspired design",
      "Soft tufted interior",
      "Open side for simple entry",
      "Detailed wheels, windows, and headlights",
      "K9-inspired graphics",
    ],
    cta: "RESERVE THE COMMAND TRUCK",
    sleepAreaDesign: "Soft tufted interior \u00B7 Open-side entry",
  },
} as const;

export type ProductContent = (typeof PRODUCT)[keyof typeof PRODUCT];

export function getProductContent(handle: string): ProductContent | null {
  switch (handle) {
    case "rescue-chopper-dog-bed":
      return PRODUCT.rescueChopper;
    case "top-dog-jet-bed":
      return PRODUCT.topDogJet;
    case "command-tank-dog-bed":
      return PRODUCT.commandTank;
    case "patrol-boat-dog-bed":
      return PRODUCT.patrolBoat;
    case "command-truck-dog-bed":
      return PRODUCT.commandTruck;
    default:
      return null;
  }
}

export const FAQ_QUESTIONS = [
  {
    question: "How long will my preorder take?",
    answer:
      "The current NapFleet collection typically ships within approximately eight weeks. We\u2019ll keep you updated by email and provide tracking when your order ships.",
  },
  {
    question: "How do I choose the correct size?",
    answer:
      "Review the confirmed overall dimensions, interior sleeping area, and recommended pet guidance listed on each product page before ordering. You can also visit our Size Guide to compare measurements across all five designs.",
  },
  {
    question: "What are NapFleet beds made from?",
    answer: null, // Requires confirmed materials data
  },
  {
    question: "How should I clean the bed?",
    answer: null, // Requires confirmed care data
  },
  {
    question: "Does the product require assembly?",
    answer: null, // Requires confirmed assembly data
  },
  {
    question: "What arrives in the box?",
    answer: null, // Requires confirmed box contents data
  },
  {
    question: "When will I receive tracking?",
    answer:
      "We\u2019ll send tracking to the email used at checkout as soon as your NapFleet order ships.",
  },
  {
    question: "Is my preorder eligible for return?",
    answer: null, // Requires confirmed return eligibility data
  },
];

export const PREORDER_PROCESS = {
  eyebrow: "PREORDER PROTOCOL",
  heading: "FROM RESERVATION TO RENDEZVOUS",
  copy: "Three clear steps from choosing their ride to receiving tracking.",
  steps: [
    {
      number: "01",
      heading: "CHOOSE",
      copy: "Pick the NapFleet design that matches your pup\u2019s personality and confirm the product\u2019s sizing information.",
    },
    {
      number: "02",
      heading: "RESERVE",
      copy: "Place your preorder. The current collection is estimated to ship in approximately eight weeks.",
    },
    {
      number: "03",
      heading: "TRACK",
      copy: "We\u2019ll send updates by email and provide tracking as soon as your pup\u2019s new ride is on the move.",
    },
  ],
} as const;

export const FULFILLMENT_TIMELINE = {
  steps: [
    { label: "RESERVED", description: "Your preorder is confirmed." },
    { label: "RIDE PREPARATION", description: "Estimated shipping in approximately eight weeks." },
    { label: "TRACKING SENT", description: "You\u2019ll receive an email when your order ships." },
  ],
} as const;

export const QUICK_QUESTIONS = [
  {
    question: "How long will my preorder take?",
    answer:
      "The current NapFleet collection typically ships within approximately eight weeks. We\u2019ll send order updates by email and provide tracking when your bed ships.",
  },
  {
    question: "How do I choose the right size?",
    answer: null, // Shown only when sizing fields are complete
  },
  {
    question: "What arrives in the box?",
    answer: null, // Shown only when boxContents and assemblyRequired are complete
  },
];

export const PRODUCT_TICKER_TAGS = [
  "#NAPFLEET",
  "#BIGADVENTURESBETTERNAPS",
  "#FOURLEGGEDDREAMERS",
  "#DOGBED",
  "#PETDECOR",
  "#DREAMRIDE",
];

export const GIFT_CTA = {
  heading: "FOR THE DOG WHO ALREADY HAS EVERYTHING.",
  copy: "Part pet bed. Part adventure. Entirely impossible to ignore.",
} as const;
