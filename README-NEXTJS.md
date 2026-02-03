# Construindo um Casamento Feliz - Next.js

Site de lista de presentes de casamento com contribuição via PIX, desenvolvido com Next.js 15, React 19 e TypeScript.

## Tecnologias

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS Modules

## Estrutura do Projeto

```
casamentoFeliz/
├── app/
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página principal
│   ├── globals.css         # Estilos globais
│   ├── admin/
│   │   └── page.tsx        # Painel administrativo
│   └── api/
│       ├── gifts/
│       │   └── route.ts    # API de presentes
│       └── config/
│           └── route.ts    # API de configurações
├── components/
│   ├── HeroSection.tsx     # Hero com fotos do casal
│   └── GiftsList.tsx       # Lista de presentes
├── lib/
│   └── gifts.ts            # Tipos e funções utilitárias
├── public/
│   ├── foto1.jpg
│   ├── foto2.jpg
│   ├── foto3.jpg
│   └── foto4.jpg
└── package.json
```

## Como Executar

### Desenvolvimento

```bash
npm run dev
```

Acesse:
- Site principal: http://localhost:3000
- Painel admin: http://localhost:3000/admin

### Build para Produção

```bash
npm run build
npm start
```

## Funcionalidades

### Site Principal (`/`)
- Hero section com grid de 4 fotos do casal
- Lista de presentes com filtros por categoria
- Card PIX Surpresa em destaque
- Modal para escolher presente
- Modal de pagamento com QR Code PIX
- Design 100% responsivo

### Painel Administrativo (`/admin`)
- Estatísticas em tempo real:
  - Presentes escolhidos
  - Valor total arrecadado
  - Presentes disponíveis
  - Total de convidados
- CRUD completo de presentes:
  - Adicionar novos presentes
  - Editar presentes existentes
  - Deletar presentes disponíveis
- Configurações:
  - Chave PIX
  - Upload de QR Code
  - Reset de presentes

## Armazenamento

Os dados são salvos no `localStorage` do navegador:
- `weddingGifts`: Lista de presentes
- `pixKey`: Chave PIX
- `qrcodeImage`: Imagem do QR Code (base64)

## Migração do Projeto Original

O projeto foi migrado de HTML/CSS/JS vanilla para Next.js mantendo:
- Toda a funcionalidade original
- Design e estilos idênticos
- Mesma experiência do usuário
- Melhorias:
  - TypeScript para type-safety
  - Componentização React
  - Server e Client Components
  - Roteamento Next.js
  - Otimização de imagens

## Deploy

O projeto pode ser deployado em:
- Vercel (recomendado)
- Netlify
- Qualquer plataforma que suporte Next.js

```bash
npm run build
```

## Observações

- Para usar em produção, considere implementar um backend real
- O localStorage é limitado a ~5-10MB
- As imagens estão configuradas com `unoptimized: true` no next.config.js
