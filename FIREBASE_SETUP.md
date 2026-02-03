# Configuração do Firebase Realtime Database

## ⚠️ IMPORTANTE: Este passo é OBRIGATÓRIO!

**Se você não configurar as regras, os dados NÃO serão salvos no Firebase!**

## Regras de Segurança

Para que o projeto funcione corretamente, você precisa configurar as regras de segurança do Firebase Realtime Database.

### Passos:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto `gastos-8557b`
3. Vá em **Realtime Database** no menu lateral
4. Clique na aba **Regras** (Rules)
5. **SUBSTITUA TODO O CONTEÚDO** pelas seguintes regras:

```json
{
  "rules": {
    "weddingGifts": {
      ".read": true,
      ".write": true
    },
    "pixKey": {
      ".read": true,
      ".write": true
    },
    "qrcodeImage": {
      ".read": true,
      ".write": true
    },
    "test": {
      ".read": true,
      ".write": true
    }
  }
}
```

6. Clique em **Publicar** (Publish)
7. Aguarde alguns segundos para as regras serem aplicadas
8. Recarregue a página do admin e tente novamente

### Nota de Segurança

⚠️ **ATENÇÃO**: Estas regras permitem leitura e escrita para qualquer pessoa. Para produção, considere implementar autenticação.

Para uma versão mais segura (com autenticação), use:

```json
{
  "rules": {
    "weddingGifts": {
      ".read": true,
      ".write": "auth != null"
    },
    "pixKey": {
      ".read": true,
      ".write": "auth != null"
    },
    "qrcodeImage": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## Verificação

Após configurar as regras, teste:
1. Salvar um presente no painel admin
2. Salvar a chave PIX
3. Verificar se os dados aparecem no Firebase Console
