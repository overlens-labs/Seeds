# Roadmap Completo: App de Biblioteca de Seeds

Este documento detalha o planejamento, arquitetura e o cronograma para a construção do seu aplicativo de biblioteca de seeds, inspirado na referência enviada.

## 1. Análise da Referência e UX/UI

A referência ([Cinematic by Tatiana Tsiguleva](https://ciguleva.framer.website/cinematic#cinematic)) possui um design focado no alto contraste e no minimalismo editorial, deixando as imagens brilharem.

### O que vamos incorporar (Ajustado):
- **Layout com Menu Lateral (Sidebar):** Teremos um *sidebar* fixo à esquerda para listar todas as categorias (ex: All, Cinematic, 3D, Anime), permitindo navegação instantânea e contínua pelo aplicativo, em sintonia com a referência `/#all`.
- **Layout de Cartões à Direita:** A área principal (à direita da sidebar) exibirá os cartões de categorias e as imagens fluidas correspondentes ao filtro ativo.
- **Carrosséis Horizontais:** Para navegar entre imagens sem poluir a página verticalmente dentro de cada categoria.
- **Dark Mode Absoluto:** O app será totalmente **preto** (`#000000`), criando um ambiente imersivo onde as imagens coloridas saltam aos olhos.
- **Tipografia Premium:** 
  - **Títulos e Botões Redondos:** Utilizaremos a fonte **OUTFIT** em letras maiúsculas (Hipercase/Uppercase) para dar um ar moderno e ousado.
  - **Texto de Apoio (Prompts, descrições):** Utilizaremos a fonte **INTER** para garantir máxima legibilidade técnica.
- **Feedback Imediato:** O botão "Copy" muda para "Copied ✅" ao ser clicado.

### Como vamos torná-lo mais "Interativo e Intuitivo":
- **Micro-interações de Hover:** Ao passar o mouse sobre a imagem, daremos um leve *zoom* para trazer maior dinamismo visual que a tela não possui naturalmente.
- **Lightbox (Tela Cheia Imersiva):** Ao clicar em uma imagem, ela se abrirá em sobreposição, facilitando a visualização dos microdetalhes do *seed*.
- **Sistema de Tags Clicáveis:** Variáveis do prompt (como `--ar 16:9`) poderão ser transformadas em botões filtráveis futuramente.

## 2. Arquitetura e Stack Tecnológico (Web App Premium)

Para suportar um aplicativo altamente visual, interativo e repleto de imagens:

- **Core Framework:** ReactJS gerenciado via Vite (oferece rapidez absurda de carregamento no ambiente local).
- **Estilização:** Arquitetura CSS Vanilla super moderna. Utilizaremos variáveis globais, design fluido e uma estrutura preparada para adicionar animações requintadas sem depender de bibliotecas pesadas de fora.
- **Gerenciamento de Clique e Cópia:** Uso fluido da Native Clipboard API do navegador.

## 3. Fases de Desenvolvimento (Roadmap Passo a Passo)

### Fase 1: Fundação e "Design System"
Nesta fase, iniciarei criando a base técnica e estética.
* Construir a estrutura base executando o esqueleto Vite + React numa nova pasta.
* Desenvolver a folha de estilo global (`index.css`) com as paletas de cor, tipografia e reset de estilos seguindo as melhores práticas visuais da atualidade.

### Fase 2: Componentes Interativos e "Cópia"
Nesta fase entraremos na parte viva da interface.
* Criar e isolar o Componente `AppButton` com o estado animado autônomo.
* Desenvolver o Componente `GalleryCarousel` para exibição na horizontal sem quebra de tela.

### Fase 3: Estrutura Principal de Apresentação
* Desenvolver os "Cards de Seed", onde juntamos as informações do prompt e a galeria.
* Criar os mockups/dados iniciais de imagens e textos baseados nas suas necessidades.

### Fase 4: O "Fator WOW"
* Animações finais: transições suaves entre menus, abertura fluida do modo detalhe.
* Integração final para navegação em tela toda, refinamentos de UI (padding, margens, sombras e efeitos 'glassmorphism').

## 4. Plano de Verificação (Verification Plan)

- **Testes Manuais Iniciais:** Disponibilizarei o servidor de desenvolvimento e solicitarei que você entre e sinta as transições para medir se atingimos a sensação premium.
- **Teste Cópia de Dados:** Confirmaremos que, ao clicar, o prompt real vai para sua área de transferência para pronto uso (testado no Chrome).
