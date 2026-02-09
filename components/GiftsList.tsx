'use client';

import { useState, useEffect } from 'react';
import { Gift, formatPrice, getCategoryName, INITIAL_GIFTS } from '@/lib/gifts';
import { getGifts, subscribeToGifts, getPixKey, getQRCode, subscribeToPixKey, subscribeToQRCode, updateGift } from '@/lib/firebaseService';

export default function GiftsList() {
  const [gifts, setGifts] = useState<Gift[]>(INITIAL_GIFTS);
  const [currentFilter, setCurrentFilter] = useState('todos');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [guestName, setGuestName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', pixKey: '', qrcode: '' });

  useEffect(() => {
    // Carrega dados iniciais
    const loadData = async () => {
      const loadedGifts = await getGifts();
      setGifts(loadedGifts);

      const pixKey = await getPixKey();
      const qrcode = await getQRCode();
      setPaymentData(prev => ({ ...prev, pixKey: pixKey || '', qrcode: qrcode || '' }));
    };

    loadData();

    // Escuta mudanças em tempo real
    const unsubscribeGifts = subscribeToGifts((updatedGifts) => {
      if (Array.isArray(updatedGifts) && updatedGifts.length > 0) {
        setGifts(updatedGifts);
      }
    });

    const unsubscribePixKey = subscribeToPixKey((pixKey) => {
      setPaymentData(prev => ({ ...prev, pixKey: pixKey || '' }));
    });

    const unsubscribeQRCode = subscribeToQRCode((qrcode) => {
      setPaymentData(prev => ({ ...prev, qrcode: qrcode || '' }));
    });

    // Cleanup
    return () => {
      unsubscribeGifts();
      unsubscribePixKey();
      unsubscribeQRCode();
    };
  }, []);

  // Ordena presentes: PIX surpresa sempre primeiro, depois os demais
  const sortedGifts = [...gifts].sort((a, b) => {
    // Se um é surpresa e outro não, surpresa vem primeiro
    if (a.customPrice && !b.customPrice) return -1;
    if (!a.customPrice && b.customPrice) return 1;
    // Se ambos são surpresa ou ambos não são, mantém ordem original (por ID)
    return a.id - b.id;
  });

  const filteredGifts = currentFilter === 'todos' 
    ? sortedGifts 
    : sortedGifts.filter(gift => gift.category === currentFilter);

  const openModal = (gift: Gift) => {
    // PIX surpresa sempre pode ser usado, outros presentes não podem se já foram escolhidos
    if (!gift.customPrice && gift.taken) return;
    setSelectedGift(gift);
    setGuestName('');
    setCustomPrice('');
  };

  const closeModal = () => {
    setSelectedGift(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGift) return;

    let finalPrice = selectedGift.price;
    if (selectedGift.customPrice && customPrice) {
      finalPrice = parseFloat(customPrice);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        alert('Por favor, digite um valor válido!');
        return;
      }
    }

    try {
      // PIX surpresa não é marcado como "taken" - pode ser usado múltiplas vezes
      let updatedGift: Gift;
      
      if (selectedGift.customPrice) {
        // Para PIX surpresa, não marca como taken, mantém estado original
        updatedGift = { 
          ...selectedGift, 
          taken: false, 
          takenBy: '', 
          takenDate: '', 
          price: selectedGift.price // Mantém o preço original do presente
        };
      } else {
        // Para outros presentes, marca como taken normalmente
        updatedGift = { 
          ...selectedGift, 
          taken: true, 
          takenBy: guestName, 
          takenDate: new Date().toLocaleString('pt-BR'), 
          price: finalPrice 
        };
      }

      // Salva no Firebase usando updateGift (igual ao admin)
      await updateGift(updatedGift);

      // Atualiza estado local
      setGifts(prev => prev.map(g => (g.id === updatedGift.id ? updatedGift : g)));

      setPaymentData(prev => ({ ...prev, amount: formatPrice(finalPrice) }));
      closeModal();
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Erro ao salvar presente:', error);
      alert('Erro ao salvar presente. Tente novamente.');
    }
  };

  const copyPixKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(paymentData.pixKey).then(() => {
        alert('Chave PIX copiada!');
      });
    }
  };

  return (
    <>
      <section className="filters">
        <div className="container">
          <button 
            className={`filter-btn ${currentFilter === 'todos' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('todos')}
          >
            Todos
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'casa' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('casa')}
          >
            Casa
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'cozinha' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('cozinha')}
          >
            Cozinha
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'lua-de-mel' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('lua-de-mel')}
          >
            Lua de Mel
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'diversao' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('diversao')}
          >
            Diversão
          </button>
          <button 
            className={`filter-btn ${currentFilter === 'surpresa' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('surpresa')}
          >
            Surpresa
          </button>
        </div>
      </section>

      <section className="gifts">
        <div className="container">
          <div className="gifts-grid">
            {filteredGifts.map(gift => {
              // PIX surpresa nunca mostra como "taken"
              const isSurprise = gift.customPrice;
              const isTaken = !isSurprise && gift.taken;
              
              return (
                <div 
                  key={gift.id} 
                  className={`gift-card ${isTaken ? 'taken' : ''} ${gift.category === 'surpresa' ? 'highlight' : ''}`}
                >
                  <div className="gift-icon">{gift.icon}</div>
                  <h3 className="gift-name">{gift.name}</h3>
                  {gift.description && (
                    <p className="gift-description">
                      {gift.description}
                    </p>
                  )}
                  <p className="gift-category">{getCategoryName(gift.category)}</p>
                  <p className="gift-price">{formatPrice(gift.price)}</p>
                  <button 
                    className="gift-btn" 
                    disabled={isTaken}
                    onClick={() => openModal(gift)}
                  >
                    {isTaken ? 'Já presenteado' : 'Presentear'}
                  </button>
                  {isTaken && <p className="taken-badge">✓ Presenteado por {gift.takenBy}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {selectedGift && (
        <div className="modal" style={{ display: 'block' }} onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>{selectedGift.name}</h2>
            {selectedGift.customPrice ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '1rem', color: '#555', display: 'block', marginBottom: '10px' }}>
                  Digite o valor que deseja contribuir:
                </label>
                <input 
                  type="number" 
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  min="1" 
                  step="0.01" 
                  placeholder="R$ 0,00"
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #e0e0e0', 
                    borderRadius: '8px', 
                    fontSize: '1.2rem' 
                  }}
                />
              </div>
            ) : (
              <p style={{ fontSize: '1.5rem', color: '#D4AF37', fontWeight: 700, marginBottom: '30px' }}>
                {formatPrice(selectedGift.price)}
              </p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="guestName">Seu nome:</label>
                <input 
                  type="text" 
                  id="guestName" 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="submit-btn">Confirmar Presente</button>
            </form>

            {/* Opção para falar com o casal e combinar o presente físico */}
            <button
              type="button"
              className="submit-btn"
              style={{ marginTop: '10px', backgroundColor: '#25D366' }}
              onClick={() => {
                const message = `Parabens ao casal! quero presentear vocês com ${selectedGift.name}`;
                const encoded = encodeURIComponent(message);
                window.open(`https://wa.me/5521989299533?text=${encoded}`, '_blank');
              }}
            >
              Falar com o casal
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal" style={{ display: 'block' }} onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <span className="close-payment" onClick={() => setShowPaymentModal(false)}>&times;</span>
            <h2>Realize o Pagamento</h2>
            <div className="payment-info">
              {paymentData.qrcode && (
                <div className="qrcode-container">
                  <img src={paymentData.qrcode} alt="QR Code PIX" className="qrcode-image" />
                </div>
              )}
              <div className="pix-info">
                <p><strong>Chave PIX:</strong></p>
                <div className="pix-copy-container">
                  <p className="key-value">{paymentData.pixKey}</p>
                  <button className="copy-btn-small" onClick={copyPixKey}>Copiar</button>
                </div>
                <p className="payment-amount"><strong>Valor:</strong> <span>{paymentData.amount}</span></p>
              </div>
            </div>
            <button className="done-btn" onClick={() => setShowPaymentModal(false)}>Feito</button>
          </div>
        </div>
      )}

      {/* Botão flutuante do WhatsApp para conversar sobre os presentes */}
      <a
        href="https://wa.me/5521989299533"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Conversar no WhatsApp"
      >
        <span className="whatsapp-float-icon">✉️</span>
      </a>
    </>
  );
}
