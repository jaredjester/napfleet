import type { Metadata } from "next";
import { products } from "@/content/products";
import { getProductContent } from "@/content/napfleet";
import { getStoreConfig } from "@/lib/store-config";
import { ProductDetail } from "@/components/product/ProductDetail";
import { MediaGrid } from "@/components/product/MediaGrid";
import { FleetProfileRail } from "@/components/product/FleetProfileRail";
import { ProductTicker } from "@/components/product/ProductTicker";
import { PreorderProcess } from "@/components/product/PreorderProcess";
import { ProductActionBanner } from "@/components/product/ProductActionBanner";
import { SpecSheet } from "@/components/product/SpecSheet";
import { FleetManifest } from "@/components/product/FleetManifest";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { ReviewCarousel } from "@/components/product/ReviewCarousel";
import { GiftCtaSection } from "@/components/product/GiftCtaSection";

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const config = getStoreConfig();
  const product = await config.getProduct(handle);
  const content = getProductContent(handle);
  if (!product || !content) {
    return { title: "Product Not Found — NapFleet" };
  }
  return {
    title: `${product.title} — NapFleet`,
    description: content.pageTagline,
    openGraph: {
      title: `${product.title} — NapFleet`,
      description: content.pageTagline,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const config = getStoreConfig();
  const product = await config.getProduct(handle);
  return (
    <>
      <ProductDetail handle={handle} />
      <MediaGrid images={product?.images ?? []} productTitle={product?.title ?? "NapFleet Bed"} />
      <FleetProfileRail />
      <ProductTicker />
      <PreorderProcess />
      <ProductActionBanner />
      {product && <SpecSheet product={product} />}
      <FleetManifest currentHandle={handle} />
      <ProductFAQ />
      <ReviewCarousel handle={handle} />
      <GiftCtaSection />
    </>
  );
}
