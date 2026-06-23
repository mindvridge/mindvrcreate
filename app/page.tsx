import Faq from "@/components/faq";
import Footer from "@/components/footer";
import Gallery from "@/components/gallery";
import Header from "@/components/header";
import Hero from "@/components/hero";
import LabCta from "@/components/lab-cta";
import Pricing from "@/components/pricing";
import { TEST_LAB_ENABLED } from "@/lib/features";
import Problem from "@/components/problem";
import Process from "@/components/process";
import RealtimeAvatar from "@/components/realtime-avatar";
import TwoTypes from "@/components/two-types";
import Segments from "@/components/segments";
import StickyCta from "@/components/sticky-cta";
import TrustDetail from "@/components/trust-detail";
import Values from "@/components/values";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TwoTypes />
        <RealtimeAvatar />
        <Gallery />
        <Problem />
        <Values />
        <Segments />
        {TEST_LAB_ENABLED && <LabCta />}
        <Process />
        <Pricing />
        <TrustDetail />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
