import HeroSection from '@/components/HeroSection';
import GiftsList from '@/components/GiftsList';
import PixSection from '@/components/PixSection';

export default function Home() {
  return (
    <>
      <HeroSection />

      <section className="welcome">
        <div className="container">
          <div className="welcome-content">
            <p className="welcome-text">
              Ficamos muito felizes em ter você fazendo parte desse momento especial. Escolha um presente com carinho 💛
            </p>
          </div>
        </div>
      </section>

      <GiftsList />

      <PixSection />

      <footer className="footer">
        <div className="container">
          <p>Obrigado por fazer parte da nossa história 💛</p>
        </div>
      </footer>
    </>
  );
}
