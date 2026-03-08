# Tasks — Biblioteca de Seeds (MVP HTML)

## Fase 1: Design System ✅
- [x] Mudar fundo para `#000000` (preto absoluto)
- [x] Adicionar fonte **Outfit** (Google Fonts) para títulos e botões
- [x] Manter **Inter** para prompts e textos de apoio
- [x] Criar variáveis CSS globais: `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--font-title`, `--font-body`
- [x] Revisar contrastes, paddings e espaçamentos gerais

## Fase 2: Categorias e Dados ✅
- [x] Atualizar filtros com as categorias reais:
  - Ilustração
  - Pintura
  - Cinematográfico
  - Fotografia 3D
  - Fotografia Abstrata
  - Fotografia Rêtro
  - Fotografia Estilizada
- [x] Adicionar seeds reais para cada categoria em `main.js` (20 seeds no total)
- [x] Estrutura de dados com: `título`, `categoria`, `prompt completo`, `imagem`

## Fase 3: Componentes Interativos ✅
- [x] Botão Copy muda para "Copied!" com ícone de check após clicar
- [x] Hover na imagem: zoom + overlay com gradiente
- [x] Sidebar fixa à esquerda com lista de categorias
- [x] Filtro ativo com destaque visual na sidebar

## Fase 4: Lightbox ✅
- [x] Clicar na imagem abre overlay fullscreen com blur de fundo
- [x] Prompt completo visível no lightbox
- [x] Botão Copy dentro do lightbox
- [x] Fechar com ESC ou clique fora

## Fase 5: Fator WOW ✅
- [x] Animação de entrada dos cards (fadeUp com stagger)
- [x] Transição suave ao abrir/fechar lightbox (scale + opacity)
- [x] Glassmorphism no botão Copy
- [x] Responsividade completa: sidebar vira scroll horizontal no mobile
- [x] Layout mobile (1 coluna), tablet (2 colunas), desktop (3 colunas)
