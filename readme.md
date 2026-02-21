# 🧩 PuzzleEdu - Engine de Jogos Educacionais

Uma plataforma web leve e flexível para criar jogos de caça-palavras narrativos. O objetivo é unir o incentivo à leitura com a mecânica clássica de puzzles, permitindo múltiplas "aventuras" temáticas.

## 📋 Funcionalidades Principais

- **Múltiplos Temas (Aventuras):** Sistema dinâmico que permite trocar o tema do jogo (ex: "Mini Bichos", "Desertos") instantaneamente via menu.
- **Narrativa Ilustrada:**
  - Cada nível possui um texto educativo contextualizado.
  - Suporte a imagens de capa para a aventura e ilustrações específicas para cada nível.
- **Sistema de Progresso Inteligente:**
  - **Desbloqueio:** O próximo nível é liberado ao encontrar palavras suficientes no nível anterior.
  - **Save Local:** O progresso de cada tema e dificuldade é salvo independentemente no navegador (LocalStorage).
- **Engine Dinâmica:**
  - O jogo é gerado automaticamente a partir de arquivos JSON externos.
  - Algoritmo que prioriza palavras-chave do título (ex: nome do animal) no grid.

## ⚙️ Regras de Dificuldade

O sistema ajusta a complexidade da geração do grid com base na seleção do usuário:

| Dificuldade | Direções Permitidas | Visibilidade da Lista | Destaque no Texto |
|:-----------:|:-------------------:|:---------------------:|:-----------------:|
| **Fácil** | Horizontal, Vertical | ✅ Visível | ✅ Sim |
| **Médio** | Horiz, Vert, Diagonal | ❌ Oculta | ✅ Sim |
| **Difícil** | Horiz, Vert, Diag, Invertidas | ❌ Oculta | ❌ Não |

## 🛠️ Estrutura do Projeto

O projeto é uma SPA (Single Page Application) modular, sem dependências de build.

```text
/
├── assets/              # Imagens organizadas por tema (1, 2...)
├── niveis/              # Dados JSON de cada aventura (1, 2...)
├── index.html           # Estrutura DOM
├── style.css            # Estilização e Responsividade
├── script.js            # Engine do jogo e gerenciador de estado
└── README.md            # Documentação

```

## 🚀 Como Rodar

1. Clone este repositório.
2. Abra o arquivo `index.html` em qualquer navegador moderno.
* **Nota:** Para carregar os arquivos JSON corretamente, recomenda-se usar o **Live Server** do VS Code ou hospedar no GitHub Pages (devido a políticas de segurança CORS dos navegadores).



## 📝 Histórico de Desenvolvimento (Roadmap)

* [x] Estrutura Visual (HTML/CSS)
* [x] Configuração de Dificuldade e Frequência de Letras
* [x] Engine Dinâmica (Gera o jogo a partir de texto puro)
* [x] Conteúdo Educativo: "Mini Bichos" e "Bichos dos Desertos"
* [x] Interface Rica: Capas, imagens por nível e seletor de temas
* [x] Sistema de Save (LocalStorage) com suporte a múltiplos temas
* [x] Menu de Capítulos com Sistema de Bloqueio (Cadeados)
* [x] Refatoração: Arquitetura baseada em JSON externo e Assets locais
