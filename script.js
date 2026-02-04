/* --- CONFIGURAÇÕES E CONSTANTES --- */
const DIRECOES = {
    facil: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
    medio: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }],
    dificil: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }]
};

const ORDEM_FREQUENCIA = "aeosridmntcuvlpgqbfhãôâçêjéóxúíáàwky";
let poolLetras = [];

/* --- PALAVRAS A IGNORAR (Stopwords) --- */
const PALAVRAS_IGNORADAS = [
    "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "por", "para", "com", "sem", "sob", "sobre", "ante", "até",
    "que", "e", "mas", "ou", "nem", "se", "como", "quando", "muito",
    "está", "estava", "foi", "havia", "tem", "tinha", "pela", "pelo",
    "ela", "ele", "eles", "elas", "isso", "aquilo", "este", "esta", "sua", "seu"
];

/* --- BANCO DE DADOS (10 NÍVEIS) --- */
const NIVEIS = [
    {
        id: 1,
        titulo: "A Floresta Encantada",
        textoPuro: "A floresta antiga estava silenciosa naquela manhã fria de outono. As árvores gigantes balançavam seus galhos lentamente com o vento que soprava do norte. Um pequeno esquilo corria apressado procurando nozes para guardar antes que o inverno chegasse."
    },
    {
        id: 2,
        titulo: "Receita da Vovó",
        textoPuro: "Para fazer o bolo perfeito, minha avó sempre dizia que o segredo é o amor e a paciência. Primeiro, bata a massa com força até ficar bem fofa e homogênea. Depois, coloque no forno quente e espere aquele cheiro delicioso de chocolate invadir a casa toda."
    },
    {
        id: 3,
        titulo: "Viagem ao Fundo do Mar",
        textoPuro: "O submarino amarelo desceu lentamente para as profundezas do oceano azul. Pela janela, vimos um cardume colorido nadando perto de um coral brilhante e cheio de vida. Um grande tubarão passou silencioso ao lado, observando tudo com curiosidade."
    },
    {
        id: 4,
        titulo: "O Detetive Curioso",
        textoPuro: "O detetive pegou sua lupa para investigar as pegadas misteriosas no chão molhado. Ele sabia que o ladrão não poderia ter ido muito longe naquela noite chuvosa e escura. Cada pista encontrada era uma peça importante para resolver aquele enigma difícil."
    },
    {
        id: 5,
        titulo: "Campeonato de Futebol",
        textoPuro: "O estádio estava lotado e a torcida gritava muito alto agitando as bandeiras do time. O atacante correu rápido com a bola, driblou o zagueiro e chutou com força para o gol. Foi o momento mais emocionante da partida final daquele campeonato inesquecível."
    },
    {
        id: 6,
        titulo: "A Biblioteca Mágica",
        textoPuro: "Naquela biblioteca, os livros não ficavam parados nas estantes empoeiradas. À noite, as histórias saíam das páginas e voavam pela sala como pássaros de papel. Quem entrava lá podia viver uma aventura diferente a cada capítulo lido com atenção."
    },
    {
        id: 7,
        titulo: "Acampamento na Serra",
        textoPuro: "Montamos nossa barraca perto de um rio cristalino que descia da montanha alta. À noite, fizemos uma fogueira quente para assar marshmallows e contar histórias de terror. O céu estava tão limpo que podíamos ver a via láctea inteira brilhando sobre nós."
    },
    {
        id: 8,
        titulo: "O Cientista Maluco",
        textoPuro: "No laboratório secreto, o cientista misturou dois líquidos coloridos em um frasco de vidro. De repente, uma fumaça roxa subiu e transformou o rato em um elefante gigante e atrapalhado. Foi uma confusão enorme tentar esconder aquele animal enorme dentro da sala pequena."
    },
    {
        id: 9,
        titulo: "Corrida Espacial",
        textoPuro: "A nave ligou seus motores potentes e a contagem regressiva começou no centro de controle. Em poucos segundos, o foguete subiu rasgando o céu em direção ao planeta vermelho distante. A humanidade assistia admirada aquele passo gigante para o futuro da exploração."
    },
    {
        id: 10,
        titulo: "O Tesouro Pirata",
        textoPuro: "O capitão pirata olhou seu mapa antigo e apontou para a ilha deserta no horizonte. Eles cavaram na areia branca até encontrar um baú pesado cheio de moedas de ouro. Aquele tesouro lendário ficou escondido por séculos esperando bravos aventureiros como eles."
    }
];

/* --- ESTADO DO JOGO --- */
let estado = {
    dificuldade: 'facil',
    nivelAtualObj: null,
    grid: [],
    solucao: [],
    selecao: { ativo: false, inicio: null, celulas: [] },
    palavrasEncontradas: []
};

/* --- PROCESSADOR DE TEXTO (Engine) --- */
function processarNivelDinamico(nivelBruto) {
    const texto = nivelBruto.textoPuro;

    // 1. Divide o texto em frases
    const frases = texto.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [texto];

    // 2. Extrai candidatos por frase
    let gruposDeFrases = frases.map((frase, index) => {
        const palavrasLimpas = frase
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(p => p.length > 3 && !PALAVRAS_IGNORADAS.includes(p.toLowerCase()));

        return {
            palavras: [...new Set(palavrasLimpas)]
        };
    }).filter(g => g.palavras.length > 0);

    // 3. Seleção Distribuída
    const palavrasSelecionadas = [];
    const maxPalavras = 10; // Aumentado para 10 conforme solicitado

    let tentativas = 0;
    while (palavrasSelecionadas.length < maxPalavras && tentativas < 30) {
        gruposDeFrases.sort(() => 0.5 - Math.random());

        for (let grupo of gruposDeFrases) {
            if (palavrasSelecionadas.length >= maxPalavras) break;

            if (grupo.palavras.length > 0) {
                const randIndex = Math.floor(Math.random() * grupo.palavras.length);
                const palavra = grupo.palavras[randIndex].toUpperCase();

                if (!palavrasSelecionadas.includes(palavra)) {
                    palavrasSelecionadas.push(palavra);
                }
                grupo.palavras.splice(randIndex, 1);
            }
        }
        tentativas++;
    }

    // 4. Injeção no HTML
    let textoProcessado = texto;
    palavrasSelecionadas.forEach(palavra => {
        const regex = new RegExp(`\\b${palavra}\\b`, 'gi');
        textoProcessado = textoProcessado.replace(regex, (match) => {
            return `<span data-word='${palavra}'>${match}</span>`;
        });
    });

    const maiorPalavra = Math.max(...palavrasSelecionadas.map(p => p.length));
    const tamanhoGrid = Math.max(12, maiorPalavra + 2);

    return {
        id: nivelBruto.id,
        titulo: nivelBruto.titulo,
        texto: textoProcessado,
        palavras: palavrasSelecionadas,
        tamanho: tamanhoGrid
    };
}

/* --- FUNÇÕES AUXILIARES --- */
function gerarPoolLetras() {
    if (poolLetras.length > 0) return;
    const total = ORDEM_FREQUENCIA.length;
    for (let i = 0; i < total; i++) {
        let peso = Math.max(1, 40 - i);
        for (let j = 0; j < peso; j++) poolLetras.push(ORDEM_FREQUENCIA[i]);
    }
}

function getLetraAleatoria() {
    return poolLetras[Math.floor(Math.random() * poolLetras.length)].toUpperCase();
}

/* --- MOTOR DO JOGO --- */

function iniciarJogo(dificuldade) {
    estado.dificuldade = dificuldade; // Salva a dificuldade no estado
    gerarPoolLetras();

    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');

    const containerTexto = document.getElementById('conteudo-texto');

    // ATUALIZAÇÃO: Fácil e Médio têm destaque no texto. Difícil não.
    if (dificuldade === 'facil' || dificuldade === 'medio') {
        containerTexto.classList.add('modo-facil');
    } else {
        containerTexto.classList.remove('modo-facil');
    }

    carregarNivel(1, dificuldade);
}

function carregarNivel(idNivel, dificuldade) {
    document.getElementById('camada-riscos').innerHTML = '';

    const nivelBruto = NIVEIS.find(n => n.id === idNivel);
    if (!nivelBruto) return;

    // Processa o texto na hora
    const nivelProcessado = processarNivelDinamico(nivelBruto);

    estado.nivelAtualObj = nivelProcessado;
    estado.palavrasEncontradas = [];

    // UI Updates
    document.getElementById('titulo-historia').innerText = nivelProcessado.titulo;
    document.getElementById('conteudo-texto').innerHTML = nivelProcessado.texto;

    // ATUALIZAÇÃO: Lista de palavras (Chips) aparece apenas no FÁCIL
    const containerLista = document.getElementById('lista-palavras');
    if (dificuldade === 'facil') {
        renderizarListaPalavras(nivelProcessado.palavras);
    } else {
        containerLista.innerHTML = ''; // Limpa a lista para Médio e Difícil
    }

    gerarMatrizGrid(nivelProcessado, dificuldade);
    renderizarGrid();

    // Atualiza progresso inicial (caso tenha removido o contador, essa função lida com segurança)
    atualizarContador();
}

// Nova função para mostrar a lista de palavras
function renderizarListaPalavras(listaPalavras) {
    const container = document.getElementById('lista-palavras');
    container.innerHTML = ''; // Limpa anterior

    listaPalavras.forEach(palavra => {
        const chip = document.createElement('div');
        chip.className = 'chip-palavra';
        chip.innerText = palavra;
        chip.dataset.target = palavra;
        container.appendChild(chip);
    });
}

function gerarMatrizGrid(nivel, dificuldade) {
    const tam = nivel.tamanho;
    let grid = Array(tam).fill(null).map(() => Array(tam).fill(''));
    estado.solucao = [];

    const palavrasOrdenadas = [...nivel.palavras].sort((a, b) => b.length - a.length);
    const direcoesValidas = DIRECOES[dificuldade];

    // Balanceamento Sorte vs Cruzamento
    const fatorCruzamento = 0.5;

    palavrasOrdenadas.forEach((palavra, index) => {
        let colocado = false;
        const tentarCruzar = Math.random() < fatorCruzamento;

        if (index > 0 && tentarCruzar) {
            colocado = tentarColocarCruzado(grid, palavra, direcoesValidas, tam);
        }

        if (!colocado) {
            let tentativas = 0;
            while (!colocado && tentativas < 200) {
                const r = Math.floor(Math.random() * tam);
                const c = Math.floor(Math.random() * tam);
                const dir = direcoesValidas[Math.floor(Math.random() * direcoesValidas.length)];

                if (podeColocar(grid, palavra, r, c, dir, tam)) {
                    colocarPalavra(grid, palavra, r, c, dir);
                    colocado = true;
                }
                tentativas++;
            }
        }
    });

    for (let r = 0; r < tam; r++) {
        for (let c = 0; c < tam; c++) {
            if (grid[r][c] === '') grid[r][c] = getLetraAleatoria();
        }
    }
    estado.grid = grid;
}

function tentarColocarCruzado(grid, palavraNova, direcoes, tam) {
    const direcoesEmbaralhadas = [...direcoes].sort(() => 0.5 - Math.random());
    for (let solucaoExistente of estado.solucao) {
        for (let i = 0; i < palavraNova.length; i++) {
            const letraNova = palavraNova[i];
            for (let j = 0; j < solucaoExistente.palavra.length; j++) {
                if (solucaoExistente.palavra[j] === letraNova) {
                    const pontoCruzamento = solucaoExistente.coordenadas[j];
                    for (let dir of direcoesEmbaralhadas) {
                        const rInicio = pontoCruzamento.r - (dir.y * i);
                        const cInicio = pontoCruzamento.c - (dir.x * i);
                        if (podeColocar(grid, palavraNova, rInicio, cInicio, dir, tam)) {
                            colocarPalavra(grid, palavraNova, rInicio, cInicio, dir);
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function podeColocar(grid, palavra, r, c, dir, tam) {
    for (let i = 0; i < palavra.length; i++) {
        let nr = r + (dir.y * i);
        let nc = c + (dir.x * i);
        if (nr < 0 || nr >= tam || nc < 0 || nc >= tam) return false;
        if (grid[nr][nc] !== '' && grid[nr][nc] !== palavra[i]) return false;
    }
    return true;
}

function colocarPalavra(grid, palavra, r, c, dir) {
    let coordenadas = [];
    for (let i = 0; i < palavra.length; i++) {
        let nr = r + (dir.y * i);
        let nc = c + (dir.x * i);
        grid[nr][nc] = palavra[i];
        coordenadas.push({ r: nr, c: nc });
    }
    estado.solucao.push({ palavra, coordenadas });
}

/* --- RENDERIZAÇÃO E INTERAÇÃO --- */
function renderizarGrid() {
    const container = document.getElementById('grid-cacapalavras');
    container.innerHTML = '';
    const tam = estado.grid.length;
    container.style.gridTemplateColumns = `repeat(${tam}, 35px)`;

    estado.grid.forEach((linha, r) => {
        linha.forEach((letra, c) => {
            const div = document.createElement('div');
            div.className = 'celula';
            div.innerText = letra;
            div.dataset.r = r;
            div.dataset.c = c;
            div.addEventListener('mousedown', iniciarSelecao);
            div.addEventListener('mouseover', atualizarSelecao);
            div.addEventListener('mouseup', finalizarSelecao);
            container.appendChild(div);
        });
    });
    document.body.addEventListener('mouseup', () => {
        if (estado.selecao.ativo) finalizarSelecao();
    });
}

function iniciarSelecao(e) {
    estado.selecao.ativo = true;
    const r = parseInt(e.target.dataset.r);
    const c = parseInt(e.target.dataset.c);
    estado.selecao.inicio = { r, c };
    atualizarVisualSelecao([estado.selecao.inicio]);
}

function atualizarSelecao(e) {
    if (!estado.selecao.ativo) return;
    const rAtual = parseInt(e.target.dataset.r);
    const cAtual = parseInt(e.target.dataset.c);
    const rInicio = estado.selecao.inicio.r;
    const cInicio = estado.selecao.inicio.c;
    const dr = rAtual - rInicio;
    const dc = cAtual - cInicio;

    const ehHorizontal = dr === 0;
    const ehVertical = dc === 0;
    const ehDiagonal = Math.abs(dr) === Math.abs(dc);

    if (ehHorizontal || ehVertical || ehDiagonal) {
        const celulas = [];
        const passos = Math.max(Math.abs(dr), Math.abs(dc));
        const passoR = dr === 0 ? 0 : dr / passos;
        const passoC = dc === 0 ? 0 : dc / passos;
        for (let i = 0; i <= passos; i++) {
            celulas.push({
                r: rInicio + (i * passoR),
                c: cInicio + (i * passoC)
            });
        }
        estado.selecao.celulas = celulas;
        atualizarVisualSelecao(celulas);
    }
}

function finalizarSelecao() {
    estado.selecao.ativo = false;
    verificarPalavra();
    limparVisualSelecao();
}

function atualizarVisualSelecao(coords) {
    document.querySelectorAll('.celula.selecionada').forEach(el => el.classList.remove('selecionada'));
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('selecionada');
    });
}

function limparVisualSelecao() {
    document.querySelectorAll('.celula.selecionada').forEach(el => el.classList.remove('selecionada'));
}

/* --- VERIFICAÇÃO --- */
function verificarPalavra() {
    const palavraFormada = estado.selecao.celulas.map(coord => estado.grid[coord.r][coord.c]).join('');
    const match = estado.solucao.find(s =>
        s.palavra === palavraFormada || s.palavra === palavraFormada.split('').reverse().join('')
    );

    if (match && !estado.palavrasEncontradas.includes(match.palavra)) {
        marcarPalavraEncontrada(match);
    }
}

function marcarPalavraEncontrada(objSolucao) {
    estado.palavrasEncontradas.push(objSolucao.palavra);

    // 1. Grid
    const coords = objSolucao.coordenadas;
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('encontrada');
    });
    desenharRisco(coords[0], coords[coords.length - 1]);

    // 2. Texto (Risca todas as ocorrências)
    const spansTexto = document.querySelectorAll(`span[data-word='${objSolucao.palavra}']`);
    spansTexto.forEach(span => {
        span.classList.add('riscada');
    });

    // 3. Etiqueta (Se existir)
    const chip = document.querySelector(`.chip-palavra[data-target='${objSolucao.palavra}']`);
    if (chip) chip.classList.add('encontrada');

    atualizarContador(); // Chama atualização segura
    verificarFimNivel();
}

function desenharRisco(coordInicio, coordFim) {
    const elInicio = document.querySelector(`.celula[data-r='${coordInicio.r}'][data-c='${coordInicio.c}']`);
    const elFim = document.querySelector(`.celula[data-r='${coordFim.r}'][data-c='${coordFim.c}']`);
    if (!elInicio || !elFim) return;

    const container = document.getElementById('grid-cacapalavras');
    const rectContainer = container.getBoundingClientRect();
    const rectInicio = elInicio.getBoundingClientRect();
    const rectFim = elFim.getBoundingClientRect();

    const x1 = rectInicio.left - rectContainer.left + (rectInicio.width / 2);
    const y1 = rectInicio.top - rectContainer.top + (rectInicio.height / 2);
    const x2 = rectFim.left - rectContainer.left + (rectFim.width / 2);
    const y2 = rectFim.top - rectContainer.top + (rectFim.height / 2);

    const comprimento = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angulo = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    const risco = document.createElement('div');
    risco.className = 'risco-palavra';
    risco.style.width = `${comprimento + 35}px`;
    risco.style.left = `${(x1 + x2) / 2}px`;
    risco.style.top = `${(y1 + y2) / 2}px`;
    risco.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;
    document.getElementById('camada-riscos').appendChild(risco);
}

function atualizarContador() {
    // ATUALIZAÇÃO DE SEGURANÇA: Verifica se os elementos existem antes de tentar atualizar
    // já que você removeu o contador do HTML.
    const total = estado.nivelAtualObj.palavras.length;
    const achadas = estado.palavrasEncontradas.length;

    const elContador = document.getElementById('contador-palavras');
    if (elContador) {
        elContador.innerText = `${achadas}/${total}`;
    }

    const elBarra = document.getElementById('barra-progresso');
    if (elBarra) {
        const porcentagem = (achadas / total) * 100;
        elBarra.style.width = `${porcentagem}%`;
    }
}

function verificarFimNivel() {
    if (estado.palavrasEncontradas.length === estado.nivelAtualObj.palavras.length) {
        setTimeout(() => {
            document.getElementById('modal-vitoria').classList.remove('oculto');
        }, 500);
    }
}

function voltarInicio() { location.reload(); }
function proximoNivel() {
    alert("Próximo nível em breve!");
    document.getElementById('modal-vitoria').classList.add('oculto');
}