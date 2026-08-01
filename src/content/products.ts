import type { CommerceProduct } from "@/lib/commerce/types";

export const products: CommerceProduct[] = [
  {
    handle: "rescue-chopper-dog-bed",
    title: "Rescue Chopper Dog Bed",
    description:
      "Give your four-legged copilot a landing zone of their own. The Rescue Chopper combines an unmistakable helicopter silhouette with a soft, tufted sleeping area and raised padded sides for a cozy place to curl up.\n\nFrom its sculpted cockpit and rescue-inspired details to its spacious interior, this is equal parts functional pet bed, playful room accent, and post-mission headquarters.",
    domain: "AIR",
    images: [
      "/products/rescue-chopper-01.jpg",
      "/products/rescue-chopper-02.jpg",
    ],
    variants: [
      { id: "rc-default", title: "Default", sku: "NAP-RC-001", price: 6999, available: true },
    ],
    publishReady: true,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
  },
  {
    handle: "top-dog-jet-bed",
    title: "Top Dog Jet Bed",
    description:
      "Give your pet the ultimate place to land. The Top Dog Jet pairs fighter-jet styling with a deep cushioned center and padded sides, creating a cozy cockpit for naps, lounging, and complete air superiority over the living room.\n\nDetailed wings, cockpit accents, and the signature Top Dog tail make it a bed that looks nearly as impressive parked as it does with your copilot curled up inside.",
    domain: "AIR",
    images: [
      "/products/top-dog-jet-01.jpg",
      "/products/top-dog-jet-02.jpg",
    ],
    variants: [
      { id: "tdj-default", title: "Default", sku: "NAP-TDJ-001", price: 6999, available: true },
    ],
    publishReady: true,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
  },
  {
    handle: "command-tank-dog-bed",
    title: "Command Tank Dog Bed",
    description:
      "Your four-legged commander has officially earned some downtime. The Command Tank combines bold tracked styling with a cushioned center and padded walls for a cozy, secure place to curl up after a long day on patrol.\n\nIt looks mission-ready on the outside and feels made for serious rest where it matters.",
    domain: "LAND",
    images: [
      "/products/command-tank-01.jpg",
      "/products/command-tank-02.jpg",
    ],
    variants: [
      { id: "ct-default", title: "Default", sku: "NAP-CT-001", price: 6999, available: true },
    ],
    publishReady: true,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
  },
  {
    handle: "patrol-boat-dog-bed",
    title: "Patrol Boat Dog Bed",
    description:
      "Give your four-legged captain a comfortable place to drop anchor. The Patrol Boat surrounds a soft tufted sleep area with padded sides, nautical detailing, cabin-style accents, and unmistakable K9 patrol styling.\n\nWhether they are coming in from a long voyage around the backyard or simply ready to drift off, this is their personal port of rest.",
    domain: "SEA",
    images: [
      "/products/patrol-boat-01.jpg",
      "/products/patrol-boat-02.jpg",
    ],
    variants: [
      { id: "pb-default", title: "Default", sku: "NAP-PB-001", price: 6999, available: true },
    ],
    publishReady: true,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
  },
  {
    handle: "command-truck-dog-bed",
    title: "Command Truck Dog Bed",
    description:
      "The Command Truck gives your loyal companion a headquarters of their own. Its bold utility-vehicle shape surrounds a soft tufted interior, while the open side makes climbing aboard simple.\n\nDetailed wheels, windows, headlights, and K9-inspired graphics turn an everyday sleeping spot into a full-scale conversation piece.",
    domain: "LAND",
    images: [
      "/products/command-truck-01.jpg",
      "/products/command-truck-02.jpg",
    ],
    variants: [
      { id: "ctr-default", title: "Default", sku: "NAP-CTR-001", price: 6999, available: true },
    ],
    publishReady: true,
    preorderStatus: "open",
    preorderEstimateWeeks: 8,
  },
];
