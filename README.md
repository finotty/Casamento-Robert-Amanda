# Construindo um Casamento Feliz - Robert & Amanda

Site de lista de presentes de casamento com contribuição via PIX.

## Arquivos do Projeto

- `index.html` - Página principal do site para convidados
- `style.css` - Estilos do site principal
- `script.js` - Funcionalidades do site principal
- `admin.html` - Painel administrativo para o casal
- `admin-style.css` - Estilos do painel administrativo
- `admin-script.js` - Funcionalidades do painel administrativo

## Como Usar

### Para Convidados
1. Abra o arquivo `index.html` em um navegador
2. Navegue pelos presentes usando os filtros de categoria
3. Clique em "Presentear" no presente desejado
4. Preencha seu nome
5. Copie a chave PIX e realize o pagamento
6. Envie o comprovante para o casal

### Para o Casal (Administração)
1. Abra o arquivo `admin.html` em um navegador
2. Configure a chave PIX na seção "Configurações"
3. Acompanhe os presentes escolhidos e valores arrecadados
4. Veja o histórico completo de contribuições

## Funcionalidades

### Site Principal
- Lista de presentes organizada por categorias
- Filtros: Todos, Casa, Cozinha, Lua de Mel, Diversão, Surpresa
- Sistema de bloqueio: cada presente pode ser escolhido apenas uma vez
- PIX surpresa com valor livre
- Design responsivo para mobile e desktop
- Armazenamento local dos dados

### Painel Administrativo
- Estatísticas em tempo real:
  - Total de presentes escolhidos
  - Valor total arrecadado
  - Presentes disponíveis
  - Número de convidados contribuintes
- Lista detalhada de presentes escolhidos
- Gerenciamento da chave PIX
- Função de reset dos presentes

## Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- LocalStorage para persistência de dados
- Google Fonts (Lato e Roboto)

## Paleta de Cores

- Branco: #FFFFFF
- Bege/Off-white: #f5f5f0
- Dourado: #D4AF37
- Cinza: #666, #555, #333

## Observações

- Os dados são salvos localmente no navegador (localStorage)
- Para usar em produção, recomenda-se implementar um backend
- A chave PIX deve ser configurada no painel administrativo
