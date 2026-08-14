import HeroSection from "./HeroSection";
import TypewriterSection from "./TypewriterSection";
import FeaturesZigzag from "./FeaturesZigzag";
import IntegrationsSection from "./IntegrationsSection";
import AffiliateSection from "./AffiliateSection";
import TestimonialsSection from "./TestimonialsSection";
import PricingSection from "./PricingSection";
import FAQSection from "./FAQSection";
import CTASection from "./CTASection";

export default function FeaturesSection() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <TypewriterSection />
      <FeaturesZigzag />
      <IntegrationsSection />
      <AffiliateSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
