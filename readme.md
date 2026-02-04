# 🧩 PuzzleEdu - Sistema Educacional

Um jogo de caça-palavras narrativo desenvolvido com tecnologias web padrão (HTML5, CSS3, JavaScript Vanilla). O objetivo é unir o incentivo à leitura com a mecânica clássica de puzzles.

## 📋 Funcionalidades Principais

- **Narrativa Integrada:** Ao lado de cada quebra-cabeça, há uma história onde as palavras a serem encontradas estão contextualizadas.
- **Sistema de Progresso:**
  - **Desbloqueio:** O próximo nível é liberado ao encontrar **75%** das palavras do nível atual.
  - **Nível Final:** Um nível especial só aparece se o jogador completar **100%** de todos os níveis anteriores.
- **Feedback Visual:** As palavras são riscadas no texto da história automaticamente ao serem encontradas no grid.

## ⚙️ Regras de Dificuldade

O sistema ajusta a complexidade da geração do grid com base na seleção do usuário:

| Dificuldade | Direções Permitidas | Palavras Invertidas |
|:-----------:|:-------------------:|:-------------------:|
| **Fácil** | Horizontal, Vertical | Não |
| **Médio** | Horizontal, Vertical, Diagonal | Não |
| **Difícil** | Horizontal, Vertical, Diagonal | Sim |

## 🧮 Algoritmo de Preenchimento (Frequência PT-BR)

Para aumentar o desafio e a naturalidade do jogo, os espaços vazios do grid **não são preenchidos aleatoriamente**.

Utilizamos um algoritmo de "Pool Ponderado" baseado na frequência das letras na língua portuguesa.
- **Ordem de Frequência:** `aeosridmntcuvlpgqbfhãôâçêjéóxúíáàwky`
- **Lógica:** A letra "A" tem ~40x mais chance de aparecer como preenchimento do que a letra "Y". Isso camufla as palavras reais, pois o grid visualmente se assemelha a palavras portuguesas reais.

## 🛠️ Estrutura do Projeto

O projeto é uma SPA (Single Page Application) leve, sem dependências de build (como Webpack ou React).

```text
/
├── index.html   # Estrutura DOM (Telas de Início e Jogo)
├── style.css    # Estilização, Grid Layout e Responsividade
├── script.js    # Lógica do jogo, geração de grid e estado
└── README.md    # Documentação

```

## 🚀 Como Rodar

1. Clone este repositório.
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Não é necessário servidor local (Live Server é opcional, mas recomendado).

## 📝 Próximos Passos (Roadmap)

* [x] Estrutura Visual (HTML/CSS)
* [x] Configuração de Dificuldade e Frequência de Letras
* [x] Implementação do Gerador de Grid (Posicionamento de palavras)
* [x] Interação de arrastar/selecionar (Mouse e Touch)
* [x] Engine Dinâmica (Gera o jogo a partir de texto puro)
* [x] Lista visual de palavras a encontrar (Chips)
* [ ] Banco de Dados de Histórias (JSON)
* [ ] Sistema de Save (LocalStorage) e Desbloqueio de Níveis
