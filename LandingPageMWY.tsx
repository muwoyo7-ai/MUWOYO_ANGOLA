import { Navigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TypewriterSection from "@/components/home/TypewriterSection";
import FeaturesZigzag from "@/components/home/FeaturesZigzag";
import IntegrationsSection from "@/components/home/IntegrationsSection";
import SetupSection from "@/components/home/SetupSection";
import FreeMessagesBonus from "@/components/home/FreeMessagesBonus";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AIAgentDescription from "@/components/home/AIAgentDescription";
import { MessagePacks } from "@/components/home/MessagePacks";
import CommunitySection from "@/components/home/CommunitySection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

const LandingPageMWY = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useRole();

  if (!authLoading && !!user && !roleLoading) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "sub_admin") return <Navigate to="/gestor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TypewriterSection />
        <FeaturesZigzag />
        <IntegrationsSection />
        <TestimonialsSection />
        <AIAgentDescription />
        <SetupSection />
        <FreeMessagesBonus />
        <MessagePacks />
        <CommunitySection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPageMWY;
