import { HeroSection } from "@/components/home/HeroSection";
import { BenefitStrip } from "@/components/home/BenefitStrip";
import { CollectionIntroSection } from "@/components/home/CollectionIntroSection";
import { FleetInfoRailSection } from "@/components/home/FleetInfoRailSection";
import { WhyNapFleetSection } from "@/components/home/WhyNapFleetSection";
import { GiftSection } from "@/components/home/GiftSection";
import { PreorderSection } from "@/components/home/PreorderSection";
import { AboutSection } from "@/components/home/AboutSection";
import { EmailSignupSection } from "@/components/home/EmailSignupSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitStrip />
      <CollectionIntroSection />
      <FleetInfoRailSection />
      <WhyNapFleetSection />
      <GiftSection />
      <PreorderSection />
      <AboutSection />
      <EmailSignupSection />
    </>
  );
}
