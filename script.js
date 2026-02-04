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
    "ela", "ele", "eles", "elas", "isso", "aquilo", "este", "esta"
];

/* --- BANCO DE DADOS (TEXTO PURO) --- */
const NIVEIS = [
    {
        id: 1,
        titulo: "O Café da Manhã",
        textoPuro: "Joana acordou cedo. Na mesa havia pão quentinho e leite fresco. Ela adora comer fruta pela manhã com alegria."
    },
    {
        id: 2,
        titulo: "O Jardim",
        textoPuro: "No jardim, a flor vermelha se destaca muito. A grama está verde e o sol brilha forte e radiante no céu azul."
    },
    {
        id: 3,
        titulo: "A Escola",
        textoPuro: "Na escola, peguei meu livro pesado e meu lápis novo para começar a aula de hoje com muita atenção."
    },
    {
        id: 4,
        titulo: "A Praia",
        textoPuro: "Fui à praia ver o mar azul. Brinquei na areia fofa e pulei cada onda gigante com muita coragem e diversão."
    },
    {
        id: 5,
        titulo: "O Espaço",
        textoPuro: "O astronauta viu a Lua brilhante e uma estrela cadente de dentro da sua nave espacial viajando pelo universo infinito."
    },
    {
        id: 6,
        titulo: "O Sítio",
        textoPuro: "No sítio do vovô vi uma vaca malhada e um pato nadando feliz no lago calmo perto da grande árvore."
    },
    {
        id: 7,
        titulo: "Aniversário",
        textoPuro: "No meu aniversário teve um bolo delicioso de chocolate com vela colorida e uma grande festa com todos os amigos."
    },
    {
        id: 8,
        titulo: "Música",
        textoPuro: "A música tem um som que encanta a todos. Aprendi cada nota nova no meu canto diário com muita dedicação."
    },
    {
        id: 9,
        titulo: "Esportes",
        textoPuro: "Chutei a bola com força no campo e fiz um lindo gol para o meu time vencer o campeonato final."
    },
    {
        id: 10,
        titulo: "O Mestre",
        textoPuro: "Você se tornou um sábio inteligente por estar lendo tanto livro bom. Este é o fim da jornada de conhecimento!"
    }
];

/* --- ESTADO DO JOGO --- */
let estado = {
    nivelAtualObj: null,
    grid: [],
    solucao: [],
    selecao: { ativo: false, inicio: null, celulas: [] },
    palavrasEncontradas: []
};

/* --- PROCESSADOR DE TEXTO (Engine) --- */
function processarNivelDinamico(nivelBruto) {
    const texto = nivelBruto.textoPuro;

    // 1. Limpa pontuação
    const palavrasCandidatas = texto
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(p => p.length > 3 && !PALAVRAS_IGNORADAS.includes(p.toLowerCase()));

    // 2. Seleciona 5 palavras (ou o máximo possível se tiver menos)
    const unicas = [...new Set(palavrasCandidatas)];
    // AQUI MUDAMOS PARA 5
    const quantidadeParaEscolher = Math.min(unicas.length, 5);

    // Sorteia
    const escolhidas = unicas.sort(() => 0.5 - Math.random()).slice(0, quantidadeParaEscolher);

    // 3. Monta HTML e Lista
    let textoProcessado = texto;
    const palavrasFinais = [];

    escolhidas.forEach(palavra => {
        const palavraUpper = palavra.toUpperCase();
        palavrasFinais.push(palavraUpper);

        // Substitui apenas a primeira ocorrência (case insensitive)
        const regex = new RegExp(`\\b${palavra}\\b`, 'i');
        textoProcessado = textoProcessado.replace(regex, (match) => {
            return `<span data-word='${palavraUpper}'>${match}</span>`;
        });
    });

    // 4. Calcula tamanho do grid
    const maiorPalavra = Math.max(...palavrasFinais.map(p => p.length));
    const tamanhoGrid = Math.max(10, maiorPalavra + 2);

    return {
        id: nivelBruto.id,
        titulo: nivelBruto.titulo,
        texto: textoProcessado,
        palavras: palavrasFinais,
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
    gerarPoolLetras();
    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');

    const containerTexto = document.getElementById('conteudo-texto');
    if (dificuldade === 'facil') {
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

    // GERA A LISTA DE CHIPS (PALAVRAS A ENCONTRAR)
    renderizarListaPalavras(nivelProcessado.palavras);

    atualizarContador();
    gerarMatrizGrid(nivelProcessado, difficulty = dificuldade);
    renderizarGrid();
}

// Nova função para mostrar a lista de palavras
function renderizarListaPalavras(listaPalavras) {
    const container = document.getElementById('lista-palavras');
    container.innerHTML = ''; // Limpa anterior

    listaPalavras.forEach(palavra => {
        const chip = document.createElement('div');
        chip.className = 'chip-palavra';
        chip.innerText = palavra;
        chip.dataset.target = palavra; // Para achar fácil depois
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
        if (!colocado) console.warn(`Falha ao encaixar: ${palavra}`);
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

    // 2. Texto
    const spanTexto = document.querySelector(`span[data-word='${objSolucao.palavra}']`);
    if (spanTexto) spanTexto.classList.add('riscada');

    // 3. ATUALIZA A ETIQUETA (LISTA VISUAL)
    const chip = document.querySelector(`.chip-palavra[data-target='${objSolucao.palavra}']`);
    if (chip) chip.classList.add('encontrada');

    atualizarContador();
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
    const total = estado.nivelAtualObj.palavras.length;
    const achadas = estado.palavrasEncontradas.length;
    document.getElementById('contador-palavras').innerText = `${achadas}/${total}`;
    const porcentagem = (achadas / total) * 100;
    document.getElementById('barra-progresso').style.width = `${porcentagem}%`;
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