import { database } from './firebase';
import { ref, set, get, onValue, off, remove } from 'firebase/database';
import { Gift, INITIAL_GIFTS } from './gifts';

// Referências do Firebase
const GIFTS_REF = 'weddingGifts';
const PIX_KEY_REF = 'pixKey';
const QRCODE_REF = 'qrcodeImage';

// ========== PRESENTES ==========

/**
 * Busca a lista de presentes do Firebase
 */
export async function getGifts(): Promise<Gift[]> {
  try {
    const snapshot = await get(ref(database, GIFTS_REF));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const gifts = Array.isArray(data) ? data : (Object.values(data) as Gift[]);

      // Dedup por ID (evita duplicar "PIX surpresa" e remove inconsistências legadas)
      const byId: Record<number, Gift> = {};
      for (const g of gifts) {
        if (g && typeof g.id === 'number') {
          byId[g.id] = g;
        }
      }
      const unique = Object.values(byId);

      // Ordena: PIX surpresa (customPrice: true) sempre primeiro, depois os demais por ID
      return unique.sort((a, b) => {
        if (a.customPrice && !b.customPrice) return -1;
        if (!a.customPrice && b.customPrice) return 1;
        return a.id - b.id;
      });
    } else {
      // Se não existir, inicializa com os presentes padrão
      await setGifts(INITIAL_GIFTS);
      return INITIAL_GIFTS;
    }
  } catch (error) {
    console.error('Erro ao buscar presentes:', error);
    return INITIAL_GIFTS;
  }
}

/**
 * Salva a lista COMPLETA de presentes no Firebase (usado para reset / delete em massa)
 */
export async function setGifts(gifts: Gift[]): Promise<void> {
  try {
    if (!Array.isArray(gifts)) {
      throw new Error('Presentes devem ser um array');
    }

    // Normaliza estrutura
    const validatedGifts = gifts.map(gift => ({
      id: gift.id,
      name: gift.name || '',
      price: typeof gift.price === 'number' ? gift.price : 0,
      category: gift.category || 'casa',
      icon: gift.icon || '',
      description: gift.description || '',
      taken: gift.taken || false,
      takenBy: gift.takenBy || '',
      takenDate: gift.takenDate || '',
      customPrice: gift.customPrice || false
    }));

    // Converte array para objeto indexado por ID (padrão recomendado no Realtime DB)
    const giftsObject: { [key: number]: Gift } = {};
    validatedGifts.forEach(gift => {
      giftsObject[gift.id] = gift;
    });

    const giftsRef = ref(database, GIFTS_REF);
    await set(giftsRef, giftsObject);
  } catch (error) {
    console.error('Erro ao salvar lista completa de presentes:', error);
    throw error;
  }
}

/**
 * Atualiza UM presente específico no Firebase (usado para editar/criar)
 */
export async function updateGift(gift: Gift): Promise<void> {
  try {
    const normalized: Gift = {
      id: gift.id,
      name: gift.name || '',
      price: typeof gift.price === 'number' ? gift.price : 0,
      category: gift.category || 'casa',
      icon: gift.icon || '',
      description: gift.description || '',
      taken: gift.taken || false,
      takenBy: gift.takenBy || '',
      takenDate: gift.takenDate || '',
      customPrice: gift.customPrice || false
    };

    const giftRef = ref(database, `${GIFTS_REF}/${normalized.id}`);
    await set(giftRef, normalized);
  } catch (error) {
    console.error('Erro ao atualizar presente:', error);
    throw error;
  }
}

/**
 * Deleta UM presente específico no Firebase
 */
export async function deleteGift(giftId: number): Promise<void> {
  try {
    const giftRef = ref(database, `${GIFTS_REF}/${giftId}`);
    await remove(giftRef);
  } catch (error) {
    console.error('Erro ao deletar presente:', error);
    throw error;
  }
}

/**
 * Escuta mudanças na lista de presentes em tempo real
 */
export function subscribeToGifts(callback: (gifts: Gift[]) => void): () => void {
  const giftsRef = ref(database, GIFTS_REF);
  let isSubscribed = true;
  
  const unsubscribe = onValue(giftsRef, (snapshot) => {
    if (!isSubscribed) return;
    
    try {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const gifts = Array.isArray(data) ? data : (Object.values(data) as Gift[]);
        // Ordena: PIX surpresa (customPrice: true) sempre primeiro, depois os demais por ID
        const byId: Record<number, Gift> = {};
        for (const g of gifts) {
          if (g && typeof g.id === 'number') {
            byId[g.id] = g;
          }
        }
        const unique = Object.values(byId);

        const sortedGifts = unique.sort((a, b) => {
          if (a.customPrice && !b.customPrice) return -1;
          if (!a.customPrice && b.customPrice) return 1;
          return a.id - b.id;
        });
        callback(sortedGifts);
      } else {
        callback(INITIAL_GIFTS);
      }
    } catch (error) {
      console.error('Erro ao processar dados dos presentes:', error);
      callback(INITIAL_GIFTS);
    }
  }, (error) => {
    if (isSubscribed) {
      console.error('Erro ao escutar presentes:', error);
      callback(INITIAL_GIFTS);
    }
  });

  // Retorna função para cancelar a inscrição
  return () => {
    isSubscribed = false;
    try {
      off(giftsRef);
    } catch (error) {
      console.error('Erro ao cancelar inscrição de presentes:', error);
    }
  };
}

// ========== CHAVE PIX ==========

/**
 * Busca a chave PIX do Firebase
 */
export async function getPixKey(): Promise<string> {
  try {
    const snapshot = await get(ref(database, PIX_KEY_REF));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return '';
  } catch (error) {
    console.error('Erro ao buscar chave PIX:', error);
    return '';
  }
}

/**
 * Salva a chave PIX no Firebase
 */
export async function setPixKey(pixKey: string): Promise<void> {
  try {
    if (typeof pixKey !== 'string') {
      throw new Error('Chave PIX deve ser uma string');
    }
    
    const trimmedKey = pixKey.trim();
    if (!trimmedKey) {
      throw new Error('Chave PIX não pode estar vazia');
    }
    
    console.log('Salvando chave PIX no Firebase:', trimmedKey);
    const pixKeyRef = ref(database, PIX_KEY_REF);
    
    // Salva no Firebase
    await set(pixKeyRef, trimmedKey);
    
    // Aguarda um pouco para garantir que o Firebase processou
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verifica se foi salvo corretamente
    const verifySnapshot = await get(pixKeyRef);
    if (!verifySnapshot.exists()) {
      throw new Error('Falha ao verificar salvamento: chave PIX não encontrada após salvar');
    }
    
    const savedKey = verifySnapshot.val();
    if (savedKey !== trimmedKey) {
      console.warn('Aviso: Chave PIX salva pode ser diferente da esperada');
    }
    console.log('Chave PIX salva verificada:', savedKey);
    console.log('Chave PIX salva com sucesso no Firebase');
  } catch (error: any) {
    console.error('Erro ao salvar chave PIX:', error);
    console.error('Detalhes do erro:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    
    // Se for erro de permissão, mostra mensagem específica
    if (error?.code === 'PERMISSION_DENIED') {
      throw new Error('Permissão negada. Verifique as regras do Firebase Realtime Database.');
    }
    
    throw error;
  }
}

/**
 * Escuta mudanças na chave PIX em tempo real
 */
export function subscribeToPixKey(callback: (pixKey: string) => void): () => void {
  const pixKeyRef = ref(database, PIX_KEY_REF);
  let isSubscribed = true;
  
  const unsubscribe = onValue(pixKeyRef, (snapshot) => {
    if (!isSubscribed) return;
    
    try {
      if (snapshot.exists()) {
        const key = snapshot.val();
        callback(typeof key === 'string' ? key : '');
      } else {
        callback('');
      }
    } catch (error) {
      console.error('Erro ao processar chave PIX:', error);
      callback('');
    }
  }, (error) => {
    if (isSubscribed) {
      console.error('Erro ao escutar chave PIX:', error);
      callback('');
    }
  });

  // Retorna função para cancelar a inscrição
  return () => {
    isSubscribed = false;
    try {
      off(pixKeyRef);
    } catch (error) {
      console.error('Erro ao cancelar inscrição de chave PIX:', error);
    }
  };
}

// ========== QR CODE ==========

/**
 * Busca a imagem do QR Code do Firebase
 */
export async function getQRCode(): Promise<string> {
  try {
    const snapshot = await get(ref(database, QRCODE_REF));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return '';
  } catch (error) {
    console.error('Erro ao buscar QR Code:', error);
    return '';
  }
}

/**
 * Salva a imagem do QR Code no Firebase
 */
export async function setQRCode(qrcode: string): Promise<void> {
  try {
    await set(ref(database, QRCODE_REF), qrcode);
  } catch (error) {
    console.error('Erro ao salvar QR Code:', error);
    throw error;
  }
}

/**
 * Escuta mudanças no QR Code em tempo real
 */
export function subscribeToQRCode(callback: (qrcode: string) => void): () => void {
  const qrcodeRef = ref(database, QRCODE_REF);
  
  onValue(qrcodeRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback('');
    }
  }, (error) => {
    console.error('Erro ao escutar QR Code:', error);
    callback('');
  });

  // Retorna função para cancelar a inscrição
  return () => {
    off(qrcodeRef);
  };
}
