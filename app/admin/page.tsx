'use client';

import { useState, useEffect, useRef } from 'react';
import { Gift, formatPrice, getCategoryName, INITIAL_GIFTS } from '@/lib/gifts';
import { getGifts, setGifts, subscribeToGifts, getPixKey, setPixKey, subscribeToPixKey, getQRCode, setQRCode, subscribeToQRCode, updateGift, deleteGift as deleteGiftFromFirebase } from '@/lib/firebaseService';
import Link from 'next/link';
import './admin.css';

export default function AdminPage() {
  const [gifts, setGifts] = useState<Gift[]>(INITIAL_GIFTS);
  const [pixKey, setPixKeyState] = useState('');
  const [qrcodePreview, setQrcodePreview] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'casa',
    icon: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false); // Ref para ter valor atualizado imediatamente

  // Formata valor monetário no padrão brasileiro (ex: 20.000,00)
  const formatCurrencyBRL = (value: string): string => {
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) return '';
    const number = parseInt(onlyDigits, 10);
    return (number / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Converte string formatada (20.000,00) para número (20000)
  const parseCurrencyBRL = (value: string): number => {
    if (!value) return 0;
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) return 0;
    return parseInt(onlyDigits, 10) / 100;
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribeGifts: (() => void) | null = null;
    let unsubscribePixKey: (() => void) | null = null;
    let unsubscribeQRCode: (() => void) | null = null;

    // Carrega dados iniciais
    const loadData = async () => {
      try {
        const loadedGifts = await getGifts();
        if (isMounted && Array.isArray(loadedGifts)) {
          setGifts(loadedGifts);
        }

        const loadedPixKey = await getPixKey();
        if (isMounted) {
          setPixKeyState(loadedPixKey || '');
        }

        const loadedQRCode = await getQRCode();
        if (isMounted) {
          setQrcodePreview(loadedQRCode || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    loadData();

    // Função para criar listeners
    const setupListeners = () => {
      if (!isMounted) return;

      // Cancela listeners anteriores se existirem
      if (unsubscribeGifts) unsubscribeGifts();
      if (unsubscribePixKey) unsubscribePixKey();
      if (unsubscribeQRCode) unsubscribeQRCode();

      unsubscribeGifts = subscribeToGifts((updatedGifts) => {
        if (isMounted && !isSavingRef.current && Array.isArray(updatedGifts) && updatedGifts.length > 0) {
          setGifts(updatedGifts);
        }
      });

      unsubscribePixKey = subscribeToPixKey((key) => {
        // Usa ref para ter valor atualizado imediatamente
        if (isMounted && !isSavingRef.current) {
          setPixKeyState(key || '');
        }
      });

      unsubscribeQRCode = subscribeToQRCode((qrcode) => {
        if (isMounted) {
          setQrcodePreview(qrcode || '');
        }
      });
    };

    // Escuta mudanças em tempo real (com delay para evitar conflitos)
    setTimeout(setupListeners, 500);

    // Cleanup
    return () => {
      isMounted = false;
      if (unsubscribeGifts) unsubscribeGifts();
      if (unsubscribePixKey) unsubscribePixKey();
      if (unsubscribeQRCode) unsubscribeQRCode();
    };
  }, []); // Remove isSaving da dependência - vamos gerenciar listeners manualmente

  const saveGifts = async (updatedGifts: Gift[]) => {
    try {
      // Desabilita listeners ANTES de qualquer coisa (usa ref para valor imediato)
      isSavingRef.current = true;
      setIsSaving(true);
      
      // Garante que é um array válido
      const giftsToSave = Array.isArray(updatedGifts) ? updatedGifts : [];
      
      // Log do presente específico que está sendo editado
      if (editingGift) {
        const giftToEdit = giftsToSave.find(g => g.id === editingGift.id);
        if (giftToEdit) {
          console.log('Presente a ser salvo (ID ' + editingGift.id + '):', {
            id: giftToEdit.id,
            name: giftToEdit.name,
            price: giftToEdit.price,
            category: giftToEdit.category
          });
        } else {
          console.error('ERRO: Presente ID ' + editingGift.id + ' não encontrado na lista a ser salva!');
        }
      }
      
      // Salva no Firebase
      await setGifts(giftsToSave);

      // Atualiza o estado local imediatamente com os dados que salvamos
      setGifts(giftsToSave);
      
      // Reabilita listeners após um delay maior
      setTimeout(() => {
        isSavingRef.current = false;
        setIsSaving(false);
      }, 2000);
    } catch (error: any) {
      isSavingRef.current = false; // Reabilita listeners em caso de erro
      setIsSaving(false);
      console.error('❌ Erro ao salvar presentes:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      
      // Mensagem mais específica para erro de permissão
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Permissão negada')) {
        alert('ERRO: Permissão negada pelo Firebase. Por favor, configure as regras do Firebase Realtime Database conforme o arquivo FIREBASE_SETUP.md');
      } else {
        alert(`Erro ao salvar presentes: ${errorMessage}. Verifique o console para mais detalhes.`);
      }
      throw error;
    }
  };

  const savePixKey = async () => {
    const trimmedKey = pixKey.trim();
    if (!trimmedKey) {
      alert('Por favor, digite uma chave PIX válida!');
      return;
    }
    try {
      setIsSaving(true); // Desabilita listeners temporariamente
      console.log('Salvando chave PIX...', trimmedKey);
      // Usa função do Firebase para salvar no banco
      await setPixKey(trimmedKey);
      console.log('Chave PIX salva com sucesso no Firebase');
      
      // Atualiza o estado local imediatamente
      setPixKeyState(trimmedKey);
      
      alert('Chave PIX salva com sucesso!');
      
      // Reabilita listeners após um pequeno delay
      setTimeout(() => {
        isSavingRef.current = false;
        setIsSaving(false);
      }, 1000);
    } catch (error: any) {
      isSavingRef.current = false; // Reabilita listeners em caso de erro
      setIsSaving(false);
      console.error('Erro ao salvar chave PIX:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      
      // Mensagem mais específica para erro de permissão
      if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('Permissão negada')) {
        alert('ERRO: Permissão negada pelo Firebase. Por favor, configure as regras do Firebase Realtime Database conforme o arquivo FIREBASE_SETUP.md');
      } else {
        alert(`Erro ao salvar chave PIX: ${errorMessage}. Verifique o console para mais detalhes.`);
      }
      throw error;
    }
  };

  const handleQRCodeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;
      try {
        await setQRCode(imageData);
        setQrcodePreview(imageData);
        alert('QR Code salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar QR Code:', error);
        alert('Erro ao salvar QR Code. Tente novamente.');
      }
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingGift(null);
    setFormData({ name: '', price: '', category: 'casa', icon: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (gift: Gift) => {
    setEditingGift(gift);
    setFormData({
      name: gift.name,
      price: gift.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      category: gift.category,
      icon: gift.icon,
      description: gift.description || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim() || !formData.icon.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const price = parseCurrencyBRL(formData.price);
    if (isNaN(price) || price < 0) {
      alert('Por favor, digite um valor válido!');
      return;
    }
    
    try {
      const currentEditingGift = editingGift; // Guarda referência
      
      if (currentEditingGift) {
        // ===== EDITAR PRESENTE EXISTENTE =====
        console.log('=== EDITANDO PRESENTE (updateGift) ===');
        console.log('ID do presente:', currentEditingGift.id);
        console.log('Dados atuais:', currentEditingGift);
        console.log('Dados do formulário:', formData);

        const updatedGift: Gift = {
          ...currentEditingGift,
          name: formData.name.trim(),
          price,
          category: formData.category,
          icon: formData.icon.trim(),
          description: formData.description.trim(),
          customPrice: formData.category === 'surpresa'
        };

        console.log('Presente atualizado (antes de salvar):', updatedGift);

        // Salva apenas este presente no Firebase
        await updateGift(updatedGift);

        // Atualiza estado local
        setGifts(prev =>
          prev.map(g => (g.id === updatedGift.id ? updatedGift : g))
        );

        console.log('Presente atualizado localmente após updateGift');
      } else {
        // ===== ADICIONAR NOVO PRESENTE =====
        const newId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) + 1 : 1;
        const newGift: Gift = {
          id: newId,
          name: formData.name.trim(),
          price,
          category: formData.category,
          icon: formData.icon.trim(),
          description: formData.description.trim(),
          taken: false,
          takenBy: '',
          takenDate: '',
          customPrice: formData.category === 'surpresa'
        };

        console.log('=== ADICIONANDO NOVO PRESENTE (updateGift) ===', newGift);

        await updateGift(newGift);
        setGifts(prev => [...prev, newGift]);
      }
      
      // Fechar modal e resetar form apenas após sucesso
      setShowModal(false);
      setFormData({ name: '', price: '', category: 'casa', icon: '', description: '' });
      setEditingGift(null);
      
      alert(currentEditingGift ? 'Presente editado com sucesso!' : 'Presente adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar presente:', error);
      alert(`Erro ao salvar presente: ${error?.message || 'Erro desconhecido'}. Verifique o console.`);
      // Modal permanece aberto em caso de erro
    }
  };

  const deleteGift = async (giftId: number) => {
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;

    if (gift.taken) {
      alert('Não é possível deletar um presente que já foi escolhido!');
      return;
    }

    if (!confirm(`Tem certeza que deseja deletar "${gift.name}"?`)) return;

    try {
      // Remove do Firebase
      await deleteGiftFromFirebase(giftId);
      // Atualiza estado local
      setGifts(prev => prev.filter(g => g.id !== giftId));
      alert('Presente deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar presente:', error);
      alert('Erro ao deletar presente. Tente novamente.');
    }
  };

  const resetAllGifts = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá resetar TODOS os presentes escolhidos. Tem certeza?')) return;
    if (!confirm('Confirme novamente: Deseja REALMENTE limpar todos os registros?')) return;

    try {
      // Desabilita listeners temporariamente para evitar conflito durante o reset
      isSavingRef.current = true;
      setIsSaving(true);

      // Carrega a lista mais recente do Firebase (já vem deduplicada por ID em getGifts)
      const currentGifts = await getGifts();

      // Cria versão resetada de todos os presentes (somente campos de escolha)
      const resetGifts = currentGifts.map(g => ({
        ...g,
        taken: false,
        takenBy: '',
        takenDate: ''
      }));

      // Atualiza cada presente individualmente no Firebase (mesmo padrão da edição)
      await Promise.all(resetGifts.map(g => updateGift(g)));

      // Atualiza estado local com a lista resetada e sem duplicados
      setGifts(resetGifts);

      alert('Todos os presentes foram resetados!');
    } catch (error) {
      console.error('Erro ao resetar presentes:', error);
      alert('Erro ao resetar presentes. Tente novamente.');
    } finally {
      // Reabilita listeners após o reset
      setTimeout(() => {
        isSavingRef.current = false;
        setIsSaving(false);
      }, 500);
    }
  };

  const takenGifts = gifts.filter(g => g.taken);
  const totalAmount = takenGifts.reduce((sum, g) => sum + g.price, 0);
  const availableGifts = gifts.filter(g => !g.taken).length;
  const uniqueGuests = [...new Set(takenGifts.map(g => g.takenBy))].length;

  return (
    <div>
      <header className="admin-header">
        <div className="container">
          <h1>💍 Painel Administrativo</h1>
          <p className="subtitle">Robert & Amanda</p>
        </div>
      </header>

      <div className="admin-container">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-info">
              <h3>Presentes Escolhidos</h3>
              <p className="stat-value">{takenGifts.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Valor Total Arrecadado</h3>
              <p className="stat-value">{formatPrice(totalAmount)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Presentes Disponíveis</h3>
              <p className="stat-value">{availableGifts}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total de Convidados</h3>
              <p className="stat-value">{uniqueGuests}</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2>📋 Presentes Escolhidos</h2>
          <div className="table-responsive">
            <table className="gifts-table">
              <thead>
                <tr>
                  <th>Presente</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Presenteado por</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {takenGifts.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state">Nenhum presente escolhido ainda</td></tr>
                ) : (
                  takenGifts.map(gift => (
                    <tr key={gift.id}>
                      <td><strong>{gift.icon} {gift.name}</strong></td>
                      <td><span className="category-badge">{getCategoryName(gift.category)}</span></td>
                      <td><strong>{formatPrice(gift.price)}</strong></td>
                      <td>{gift.takenBy}</td>
                      <td>{gift.takenDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2>📦 Gerenciar Presentes</h2>
          <button className="btn-add" onClick={openAddModal}>+ Adicionar Novo Presente</button>
          <div className="table-responsive">
            <table className="gifts-table">
              <thead>
                <tr>
                  <th>Presente</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {gifts.map(gift => (
                  <tr key={gift.id}>
                    <td><strong>{gift.icon} {gift.name}</strong></td>
                    <td><span className="category-badge">{getCategoryName(gift.category)}</span></td>
                    <td><strong>{formatPrice(gift.price)}</strong></td>
                    <td>
                      {gift.taken ? (
                        <span style={{ color: '#dc3545' }}>Presenteado</span>
                      ) : (
                        <span style={{ color: '#4CAF50' }}>Disponível</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(gift)}>Editar</button>
                      <button className="btn-delete" onClick={() => deleteGift(gift.id)}>Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2>⚙️ Configurações</h2>
          <div className="config-section">
            <div className="config-item">
              <label htmlFor="pixKeyConfig">Chave PIX:</label>
              <input 
                type="text" 
                id="pixKeyConfig" 
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Digite a chave PIX" 
              />
              <button className="btn-save" onClick={savePixKey}>Salvar Chave PIX</button>
            </div>
            <div className="config-item">
              <label htmlFor="qrcodeUpload">QR Code PIX:</label>
              <input 
                type="file" 
                id="qrcodeUpload" 
                accept="image/*" 
                onChange={handleQRCodeUpload} 
              />
              {qrcodePreview && (
                <div className="qrcode-preview">
                  <img src={qrcodePreview} alt="QR Code Preview" />
                </div>
              )}
            </div>
            <div className="config-item">
              <button className="btn-danger" onClick={resetAllGifts}>Resetar Todos os Presentes</button>
              <p className="warning-text">⚠️ Esta ação irá limpar todos os registros de presentes escolhidos</p>
            </div>
          </div>
        </div>

        <div className="actions">
          <Link href="/" className="btn-back">← Voltar ao Site</Link>
        </div>
      </div>

      {showModal && (
        <div className="modal" style={{ display: 'block' }} onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            <h2>{editingGift ? 'Editar Presente' : 'Adicionar Presente'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="giftName">Nome do Presente:</label>
                <input 
                  type="text" 
                  id="giftName" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="giftDescription">Descrição (opcional):</label>
                <textarea
                  id="giftDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Escreva uma breve descrição do presente"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="giftPrice">Valor (R$):</label>
                <input 
                  type="text" 
                  id="giftPrice" 
                  value={formData.price}
                  inputMode="decimal"
                  onChange={(e) => {
                    const formatted = formatCurrencyBRL(e.target.value);
                    setFormData({ ...formData, price: formatted });
                  }}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="giftCategory">Categoria:</label>
                <select 
                  id="giftCategory" 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="casa">Casa</option>
                  <option value="cozinha">Cozinha</option>
                  <option value="lua-de-mel">Lua de Mel</option>
                  <option value="diversao">Diversão</option>
                  <option value="surpresa">Surpresa</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="giftIcon">Ícone (emoji):</label>
                <input 
                  type="text" 
                  id="giftIcon" 
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🎁" 
                  maxLength={2} 
                  required 
                />
              </div>
              <button type="submit" className="btn-save">Salvar Presente</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
