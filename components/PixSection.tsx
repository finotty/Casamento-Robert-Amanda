'use client';

import { useState, useEffect } from 'react';
import { getPixKey, subscribeToPixKey } from '@/lib/firebaseService';

export default function PixSection() {
  const [pixKey, setPixKey] = useState('Configure no painel admin');

  useEffect(() => {
    // Carrega chave PIX inicial
    const loadPixKey = async () => {
      const key = await getPixKey();
      if (key) {
        setPixKey(key);
      }
    };

    loadPixKey();

    // Escuta mudanças em tempo real
    const unsubscribe = subscribeToPixKey((key) => {
      if (key) {
        setPixKey(key);
      } else {
        setPixKey('Configure no painel admin');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const copyPixKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey).then(() => {
        alert('Chave PIX copiada!');
      });
    } else {
      alert('Não foi possível copiar a chave PIX');
    }
  };

  return (
    <section className="pix-section">
      <div className="container">
        <div className="pix-card">
          <h2>💳 Como Presentear</h2>
          <ol className="pix-instructions">
            <li>Escolha o presente desejado clicando em &quot;Presentear&quot;</li>
            <li>Preencha seu nome</li>
            <li>Copie a chave PIX e realize o pagamento no valor correspondente</li>
            <li>Envie o comprovante para confirmarmos seu presente</li>
          </ol>
          <div className="pix-key">
            <p><strong>Chave PIX:</strong></p>
            <p className="key-value">{pixKey}</p>
            {pixKey !== 'Configure no painel admin' && (
              <button className="copy-btn" onClick={copyPixKey}>Copiar Chave</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
