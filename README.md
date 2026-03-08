# Biblioteca de Seeds

Galeria para descobrir e copiar prompts de geração de imagens IA.

---

## O que é

Uma galeria web onde você navega por prompts (seeds) de geração de imagens com IA, filtra por categoria e copia o seed com um clique.

## Funcionalidades

- Galeria em grid com imagens e seeds prontos para usar
- Filtros por categoria: **Cinematic**, **Anime**, **Fantasy**, **Photography**
- Botão de cópia para área de transferência com feedback visual (toast)
- Layout responsivo — funciona em mobile, tablet e desktop
- Tema dark com glassmorphism

## Como usar

Abra o `index.html` diretamente no navegador. Nenhuma dependência ou build necessário.

```bash
# Ou com servidor local
npx serve .
```

## Estrutura do projeto

```
├── index.html       # Interface principal (pt-BR)
├── main.js          # Dados dos seeds, filtros, clipboard
├── style.css        # Tema dark, layout masonry, animações
└── app/             # Versão React (Vite) em desenvolvimento
```

## Formato de um seed

```js
{
  title: 'Neon Cyberpunk City',
  category: 'cinematic',
  seed: '--v 6.0 --style raw --s 250 --seed 84920193'
}
```

## Categorias disponíveis

| Categoria | Exemplos de uso |
|-----------|----------------|
| `cinematic` | Cenas urbanas, sci-fi, iluminação cinematográfica |
| `anime` | Personagens, estilo niji, expressivo |
| `fantasy` | Castelos, florestas, mundos mágicos |
| `photography` | Macro, retrato, estilo raw |

## Roadmap

Veja o arquivo [`roadmap.md`](roadmap.md) para as próximas funcionalidades planejadas.

---

*Feito com HTML, CSS e JavaScript puro.*
