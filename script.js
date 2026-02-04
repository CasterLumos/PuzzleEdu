/* --- CONFIGURAÇÕES E CONSTANTES --- */
const DIRECOES = {
    facil: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
    medio: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }],
    dificil: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }]
};

const ORDEM_FREQUENCIA = "aeosridmntcuvlpgqbfhãôâçêjéóxúíáàwky";
let poolLetras = [];

/* --- BANCO DE DADOS DE NÍVEIS (Exemplo Inicial) --- */
const NIVEIS = [
    {
        id: 1,
        titulo: "O Café da Manhã",
        // Note o data-word: ele liga a palavra do texto à verificação do jogo
        texto: "Joana acordou cedo. Na mesa havia <span data-word='PAO'>pão</span> quentinho e <span data-word='LEITE'>leite</span> fresco. Ela adora comer <span data-word='FRUTA'>fruta</span> pela manhã.",
        palavras: ["PAO", "LEITE", "FRUTA"],
        tamanho: 10 // Grid 10x10
    },
    {
        id: 2,
        titulo: "O Jardim",
        texto: "No jardim, a <span data-word='FLOR'>flor</span> vermelha se destaca. A <span data-word='GRAMA'>grama</span> está verde e o <span data-word='SOL'>sol</span> brilha forte.",
        palavras: ["FLOR", "GRAMA", "SOL"],
        tamanho: 12
    }
    // Adicionaremos mais níveis depois
];

/* --- ESTADO DO JOGO --- */
let estado = {
    nivelAtualObj: null,
    grid: [], // Matriz de letras
    solucao: [], // Onde estão as palavras {palavra, celulas: []}
    selecao: {
        ativo: false,
        inicio: null, // {r, c}
        fim: null,    // {r, c}
        celulas: []   // Array de coordenadas visualmente selecionadas
    },
    palavrasEncontradas: []
};

/* --- FUNÇÕES AUXILIARES (Frequência de Letras) --- */
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

    // Configura UI
    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');

    const containerTexto = document.getElementById('conteudo-texto');
    if (dificuldade === 'facil') {
        containerTexto.classList.add('modo-facil');
    } else {
        containerTexto.classList.remove('modo-facil');
    }

    // Carrega o nível 1 (padrão por enquanto)
    carregarNivel(1, dificuldade);
}

function carregarNivel(idNivel, dificuldade) {
    document.getElementById('camada-riscos').innerHTML = '';
    const nivel = NIVEIS.find(n => n.id === idNivel);
    estado.nivelAtualObj = nivel;
    estado.palavrasEncontradas = [];

    // Atualiza Texto Lateral
    document.getElementById('titulo-historia').innerText = nivel.titulo;
    document.getElementById('conteudo-texto').innerHTML = nivel.texto;
    atualizarContador();

    // Gera o Grid
    gerarMatrizGrid(nivel, difficulty = dificuldade);
    renderizarGrid();
}

function gerarMatrizGrid(nivel, dificuldade) {
    const tam = nivel.tamanho;
    // 1. Cria matriz vazia
    let grid = Array(tam).fill(null).map(() => Array(tam).fill(''));
    estado.solucao = [];

    // 2. Ordena palavras da maior para menor (facilita encaixe)
    const palavrasOrdenadas = [...nivel.palavras].sort((a, b) => b.length - a.length);

    // 3. Tenta posicionar cada palavra
    const direcoesValidas = DIRECOES[dificuldade];

    palavrasOrdenadas.forEach(palavra => {
        let colocado = false;
        let tentativas = 0;

        while (!colocado && tentativas < 100) {
            // Posição e direção aleatória
            const r = Math.floor(Math.random() * tam);
            const c = Math.floor(Math.random() * tam);
            const dir = direcoesValidas[Math.floor(Math.random() * direcoesValidas.length)];

            if (podeColocar(grid, palavra, r, c, dir, tam)) {
                colocarPalavra(grid, palavra, r, c, dir);
                colocado = true;
            }
            tentativas++;
        }

        if (!colocado) console.error(`Não foi possível encaixar: ${palavra}`);
    });

    // 4. Preenche vazios
    for (let r = 0; r < tam; r++) {
        for (let c = 0; c < tam; c++) {
            if (grid[r][c] === '') grid[r][c] = getLetraAleatoria();
        }
    }

    estado.grid = grid;
}

function podeColocar(grid, palavra, r, c, dir, tam) {
    // Verifica limites e colisão
    for (let i = 0; i < palavra.length; i++) {
        let nr = r + (dir.y * i);
        let nc = c + (dir.x * i);

        // Saiu do grid?
        if (nr < 0 || nr >= tam || nc < 0 || nc >= tam) return false;

        // Colisão com letra diferente?
        // (Se a célula não está vazia E a letra é diferente, é colisão ruim)
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
    // Salva na solução para validação futura
    estado.solucao.push({ palavra, coordenadas });
}

/* --- RENDERIZAÇÃO E INTERAÇÃO --- */

function renderizarGrid() {
    const container = document.getElementById('grid-cacapalavras');
    container.innerHTML = '';
    const tam = estado.grid.length;

    // Configura CSS Grid dinâmico
    container.style.gridTemplateColumns = `repeat(${tam}, 35px)`;

    estado.grid.forEach((linha, r) => {
        linha.forEach((letra, c) => {
            const div = document.createElement('div');
            div.className = 'celula';
            div.innerText = letra;
            div.dataset.r = r;
            div.dataset.c = c;

            // Eventos de Mouse
            div.addEventListener('mousedown', iniciarSelecao);
            div.addEventListener('mouseover', atualizarSelecao);
            div.addEventListener('mouseup', finalizarSelecao);

            container.appendChild(div);
        });
    });

    // Evento global para soltar o mouse fora do grid
    document.body.addEventListener('mouseup', () => {
        if (estado.selecao.ativo) finalizarSelecao();
    });
}

// Lógica de Seleção (Bresenham simplificado para linhas retas)
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

    // Calcula vetor
    const dr = rAtual - rInicio;
    const dc = cAtual - cInicio;

    // Valida se é uma linha reta (horizontal, vertical ou diagonal perfeita)
    const ehHorizontal = dr === 0;
    const ehVertical = dc === 0;
    const ehDiagonal = Math.abs(dr) === Math.abs(dc);

    if (ehHorizontal || ehVertical || ehDiagonal) {
        // Calcula células entre inicio e fim
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
    // Limpa anteriores
    document.querySelectorAll('.celula.selecionada').forEach(el => el.classList.remove('selecionada'));

    // Pinta novos
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('selecionada');
    });
}

function limparVisualSelecao() {
    document.querySelectorAll('.celula.selecionada').forEach(el => el.classList.remove('selecionada'));
}

/* --- VERIFICAÇÃO DE VITÓRIA --- */

function verificarPalavra() {
    // Transforma seleção em string
    const palavraFormada = estado.selecao.celulas.map(coord => {
        return estado.grid[coord.r][coord.c];
    }).join('');

    // Tenta encontrar match normal ou invertido
    const match = estado.solucao.find(s =>
        s.palavra === palavraFormada ||
        s.palavra === palavraFormada.split('').reverse().join('')
    );

    if (match && !estado.palavrasEncontradas.includes(match.palavra)) {
        marcarPalavraEncontrada(match);
    }
}

// ... (código anterior permanece igual)

function iniciarJogo(dificuldade) {
    gerarPoolLetras();

    // Troca de tela
    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');

    // Lógica para o MODO FÁCIL (Visual no Texto)
    const containerTexto = document.getElementById('conteudo-texto');
    if (dificuldade === 'facil') {
        containerTexto.classList.add('modo-facil');
    } else {
        containerTexto.classList.remove('modo-facil');
    }

    // Carrega o nível 1
    carregarNivel(1, dificuldade);
}

// ... (outras funções permanecem iguais até chegar na marcarPalavraEncontrada)

function marcarPalavraEncontrada(objSolucao) {
    estado.palavrasEncontradas.push(objSolucao.palavra);

    const coords = objSolucao.coordenadas;

    // 1. Marca as células apenas para mudar a cor da letra
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('encontrada');
    });

    // 2. DESENHA O RISCO ÚNICO SOBRE A PALAVRA
    const inicio = coords[0]; // Primeira letra
    const fim = coords[coords.length - 1]; // Última letra
    desenharRisco(inicio, fim);

    // 3. Risca no Texto
    const spanTexto = document.querySelector(`span[data-word='${objSolucao.palavra}']`);
    if (spanTexto) spanTexto.classList.add('riscada');

    atualizarContador();
    verificarFimNivel();
}

// --- NOVA FUNÇÃO MATEMÁTICA ---
function desenharRisco(coordInicio, coordFim) {
    const elInicio = document.querySelector(`.celula[data-r='${coordInicio.r}'][data-c='${coordInicio.c}']`);
    const elFim = document.querySelector(`.celula[data-r='${coordFim.r}'][data-c='${coordFim.c}']`);

    if (!elInicio || !elFim) return;

    // Pega as posições centrais das células relativas ao container
    const container = document.getElementById('grid-cacapalavras');
    const rectContainer = container.getBoundingClientRect();
    const rectInicio = elInicio.getBoundingClientRect();
    const rectFim = elFim.getBoundingClientRect();

    // Centro da célula inicial
    const x1 = rectInicio.left - rectContainer.left + (rectInicio.width / 2);
    const y1 = rectInicio.top - rectContainer.top + (rectInicio.height / 2);

    // Centro da célula final
    const x2 = rectFim.left - rectContainer.left + (rectFim.width / 2);
    const y2 = rectFim.top - rectContainer.top + (rectFim.height / 2);

    // Cálculos de Geometria
    const comprimento = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angulo = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    // Cria o elemento visual
    const risco = document.createElement('div');
    risco.className = 'risco-palavra';

    // Configura tamanho e posição
    // Largura = distância + 1 célula inteira (para cobrir as pontas)
    risco.style.width = `${comprimento + 35}px`;

    // Posiciona no ponto médio entre inicio e fim
    risco.style.left = `${(x1 + x2) / 2}px`;
    risco.style.top = `${(y1 + y2) / 2}px`;

    // Aplica rotação e centralização
    risco.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

    document.getElementById('camada-riscos').appendChild(risco);
}

function atualizarContador() {
    const total = estado.nivelAtualObj.palavras.length;
    const achadas = estado.palavrasEncontradas.length;
    document.getElementById('contador-palavras').innerText = `${achadas}/${total}`;

    // Atualiza barra de progresso
    const porcentagem = (achadas / total) * 100;
    document.getElementById('barra-progresso').style.width = `${porcentagem}%`;
}

function verificarFimNivel() {
    const total = estado.nivelAtualObj.palavras.length;
    const achadas = estado.palavrasEncontradas.length;

    if (achadas === total) {
        setTimeout(() => {
            document.getElementById('modal-vitoria').classList.remove('oculto');
        }, 500);
    }
}

// Função placeholder para botões
function voltarInicio() {
    location.reload(); // Por enquanto, recarrega a página
}

function proximoNivel() {
    alert("Próximo nível será implementado na Etapa 3!");
    document.getElementById('modal-vitoria').classList.add('oculto');
}