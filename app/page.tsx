import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FormSection from "./components/FormSection";
import ResultsSection from "./components/ResultsSection";
import Footer from "./components/Footer";
import { GameProvider } from "./context/GameContext";

export default function Home() {
  return (
    <>
      <Navbar />
      <GameProvider>
        <main>
          <HeroSection />
          <FormSection />
          <ResultsSection />
        </main>
      </GameProvider>
      <Footer />
    </>
  );
}
