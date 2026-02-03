// Script de teste para verificar conexão e permissões do Firebase
import { database } from './firebase';
import { ref, set, get } from 'firebase/database';

export async function testFirebaseConnection() {
  console.log('=== TESTE DE CONEXÃO FIREBASE ===');
  
  try {
    // Teste 1: Tentar ler
    console.log('Teste 1: Lendo dados...');
    const testRef = ref(database, 'test');
    const snapshot = await get(testRef);
    console.log('✓ Leitura OK');
    
    // Teste 2: Tentar escrever
    console.log('Teste 2: Escrevendo dados de teste...');
    await set(testRef, { timestamp: Date.now(), message: 'teste' });
    console.log('✓ Escrita OK');
    
    // Teste 3: Verificar se foi salvo
    console.log('Teste 3: Verificando se foi salvo...');
    const verifySnapshot = await get(testRef);
    if (verifySnapshot.exists()) {
      console.log('✓ Dados salvos e verificados:', verifySnapshot.val());
    } else {
      console.error('✗ Dados não foram salvos!');
    }
    
    // Teste 4: Limpar dados de teste
    await set(testRef, null);
    console.log('✓ Dados de teste removidos');
    
    console.log('=== TODOS OS TESTES PASSARAM ===');
    return true;
  } catch (error: any) {
    console.error('=== ERRO NO TESTE ===');
    console.error('Código:', error?.code);
    console.error('Mensagem:', error?.message);
    
    if (error?.code === 'PERMISSION_DENIED') {
      console.error('❌ PERMISSÃO NEGADA!');
      console.error('Configure as regras do Firebase Realtime Database:');
      console.error('1. Acesse: https://console.firebase.google.com/');
      console.error('2. Selecione o projeto: gastos-8557b');
      console.error('3. Vá em Realtime Database > Regras');
      console.error('4. Cole as regras do arquivo FIREBASE_SETUP.md');
    }
    
    return false;
  }
}
