import Faq from "@/components/faq";
import FinalCta from "@/components/final-cta";
import Footer from "@/components/footer";
import Gallery from "@/components/gallery";
import Header from "@/components/header";
import Hero from "@/components/hero";
import LabCta from "@/components/lab-cta";
import Pricing from "@/components/pricing";
import Problem from "@/components/problem";
import Process from "@/components/process";
import Segments from "@/components/segments";
import StickyCta from "@/components/sticky-cta";
import TrustBar from "@/components/trust-bar";
import TrustDetail from "@/components/trust-detail";
import Values from "@/components/values";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <Problem />
        <Values />
        <Segments />
        <Gallery />
        <LabCta />
        <Process />
        <Pricing />
        <TrustDetail />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
