'use client';

import Image from 'next/image';

export default function HeroSection() {
  return (
    <header className="header">
      <div className="hero-section">
        <div className="hero-photo-grid">
          <div className="hero-photo-main">
            <Image 
              src="/foto1.jpg" 
              alt="Robert e Amanda" 
              className="hero-photo"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
          </div>
          <div className="hero-photo-side">
            <div className="hero-photo-item">
              <Image 
                src="/foto2.jpg" 
                alt="Robert e Amanda" 
                className="hero-photo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                priority
              />
            </div>
            <div className="hero-photo-item">
              <Image 
                src="/foto3.jpg" 
                alt="Robert e Amanda" 
                className="hero-photo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
            <div className="hero-photo-item">
              <Image 
                src="/foto4.jpg" 
                alt="Robert e Amanda" 
                className="hero-photo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </div>
          </div>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="couple-name">Robert & Amanda</h1>
          <p className="subtitle">Construindo um Casamento Feliz</p>
        </div>
      </div>
    </header>
  );
}
