/* --- CONFIGURAÇÕES DO JOGO --- */

// Definição das direções permitidas por dificuldade
// [x, y] -> x: horizontal, y: vertical
const DIRECOES = {
    facil: [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }  // Vertical
    ],
    medio: [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal Descendente
        { x: 1, y: -1 } // Diagonal Ascendente
    ],
    dificil: [
        { x: 1, y: 0 }, { x: -1, y: 0 }, // Horiz (frente/trás)
        { x: 0, y: 1 }, { x: 0, y: -1 }, // Vert (frente/trás)
        { x: 1, y: 1 }, { x: -1, y: -1 }, // Diag 1
        { x: 1, y: -1 }, { x: -1, y: 1 }  // Diag 2
    ]
};

// Sua ordem de frequência de letras
const ORDEM_FREQUENCIA = "aeosridmntcuvlpgqbfhãôâçêjéóxúíáàwky";

// Tabela de pesos para preenchimento (Letras iniciais aparecem muito mais)
// Vamos criar um "pool" (piscina) de letras onde 'a' aparece muitas vezes e 'y' apenas 1.
let poolLetras = [];
function gerarPoolLetras() {
    const totalLetras = ORDEM_FREQUENCIA.length; // 36 caracteres

    // Algoritmo simples de peso:
    // A primeira letra ganha peso 40, a última ganha peso 1.
    for (let i = 0; i < totalLetras; i++) {
        let letra = ORDEM_FREQUENCIA[i];
        let peso = Math.max(1, 40 - i); // Garante que o peso nunca seja zero

        for (let j = 0; j < peso; j++) {
            poolLetras.push(letra);
        }
    }
}
gerarPoolLetras(); // Inicializa o pool

// Função para pegar letra baseada na frequência do português
function getLetraAleatoria() {
    const indice = Math.floor(Math.random() * poolLetras.length);
    return poolLetras[indice].toUpperCase();
}

/* --- ESTADO DO JOGO --- */
let estadoJogo = {
    dificuldade: null,
    nivelAtual: 1,
    palavrasEncontradas: [],
    grid: [],
    selecionando: false, // para controle do mouse/touch
    celulasSelecionadas: []
};

/* --- FUNÇÕES DE NAVEGAÇÃO --- */

function iniciarJogo(dificuldade) {
    estadoJogo.dificuldade = dificuldade;

    // Troca de tela
    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');

    // TODO: Aqui vamos chamar a função que carrega o nível (Próxima etapa)
    console.log(`Iniciando jogo na dificuldade: ${dificuldade}`);
    console.log("Exemplo de letra gerada (frequência):", getLetraAleatoria());
}

function voltarInicio() {
    document.getElementById('tela-jogo').classList.replace('visivel', 'oculto');
    document.getElementById('tela-inicio').classList.replace('oculto', 'visivel');
}