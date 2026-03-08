# Tasks — Biblioteca de Seeds (MVP HTML)

## Fase 1: Design System
- [ ] Mudar fundo para `#000000` (preto absoluto)
- [ ] Adicionar fonte **Outfit** (Google Fonts) para títulos e botões
- [ ] Manter **Inter** para prompts e textos de apoio
- [ ] Criar variáveis CSS globais: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--font-title`, `--font-body`
- [ ] Revisar contrastes, paddings e espaçamentos gerais

## Fase 2: Categorias e Dados
- [ ] Atualizar filtros com as categorias reais:
  - Ilustração
  - Pintura
  - Cinematográfico
  - Fotografia 3D
  - Fotografia Abstrata
  - Fotografia Rêtro
  - Fotografia Estilizada
- [ ] Adicionar seeds reais para cada categoria em `main.js`
- [ ] Estrutura de dados com: `título`, `categoria`, `prompt completo`, `imagem`

## Fase 3: Componentes Interativos
- [ ] Botão "Copy" muda para "Copied ✅" após clicar (feedback visual)
- [ ] Hover na imagem: leve zoom + overlay escuro
- [ ] Sidebar fixa à esquerda com lista de categorias (navegação por scroll)
- [ ] Filtro ativo com destaque visual na sidebar

## Fase 4: Lightbox (Visualização Imersiva)
- [ ] Ao clicar na imagem, abrir em tela cheia (overlay)
- [ ] Mostrar prompt completo no lightbox
- [ ] Botão "Copy" dentro do lightbox
- [ ] Fechar com ESC ou clique fora

## Fase 5: Fator WOW
- [ ] Transições suaves entre filtros (fade in dos cards)
- [ ] Animação de entrada dos cards ao carregar
- [ ] Refinamentos finais: sombras, glassmorphism no botão, bordas sutis
- [ ] Testar responsividade mobile / tablet
