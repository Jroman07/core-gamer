import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FormSection from "./components/FormSection";
import ResultsSection from "./components/ResultsSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FormSection />
        <ResultsSection />
      </main>
      <Footer />
    </>
  );
}
