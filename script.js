/* --- CONFIGURAÇÃO DE TEMA --- */
// Tenta carregar o tema salvo no navegador; se não existir, usa o 1 (Mini Bichos) por padrão
let TEMA_ATUAL = parseInt(localStorage.getItem('puzzle_tema_selecionado')) || 1;

/* --- CONFIGURAÇÕES E CONSTANTES --- */
const DIRECOES = {
    facil: [{ x: 1, y: 0 }, { x: 0, y: 1 }],
    medio: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }],
    dificil: [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }]
};

const ORDEM_FREQUENCIA = "aeosridmntcuvlpgqbfhãôâçêjéóxúíáàwky";
let poolLetras = [];

const PALAVRAS_IGNORADAS = [
    "o", "a", "os", "as", "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "por", "para", "com", "sem", "sob", "sobre", "ante", "até",
    "que", "e", "mas", "ou", "nem", "se", "como", "quando", "muito",
    "está", "estava", "foi", "havia", "tem", "tinha", "pela", "pelo",
    "ela", "ele", "eles", "elas", "isso", "aquilo", "este", "esta", "sua", "seu"
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

/* --- SISTEMA DE SAVE (LOCALSTORAGE) --- */
function getProgressoSalvo() {
    const key = `puzzle_tema_${TEMA_ATUAL}_${estado.dificuldade}`;
    const salvo = localStorage.getItem(key);
    return salvo ? JSON.parse(salvo) : {};
}

function salvarPalavraEncontrada(idNivel, palavra) {
    const key = `puzzle_tema_${TEMA_ATUAL}_${estado.dificuldade}`;
    let progresso = getProgressoSalvo();

    if (!progresso[idNivel]) progresso[idNivel] = [];

    if (!progresso[idNivel].includes(palavra)) {
        progresso[idNivel].push(palavra);
        localStorage.setItem(key, JSON.stringify(progresso));
    }
}

/* --- ENGINE DINÂMICA (SEM DUPLICATAS) --- */
/* --- ENGINE DINÂMICA (COM PALAVRAS OBRIGATÓRIAS) --- */
function processarNivelDinamico(nivelBruto) {
    const texto = nivelBruto.textoPuro;
    const frases = texto.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [texto];

    const palavrasSelecionadas = [];
    const maxPalavras = 8;
    const palavrasSet = new Set();

    // 1. FORÇAR NOME DO ANIMAL (Palavras-chave do Título)
    // Extrai palavras do título ignorando as pequenas (o, a, de)
    const palavrasDoTitulo = nivelBruto.titulo
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(p => p.length > 3 && !PALAVRAS_IGNORADAS.includes(p.toLowerCase()));

    palavrasDoTitulo.forEach(palavra => {
        const pUpper = palavra.toUpperCase();
        // Verifica se essa palavra do título realmente existe dentro do texto da história
        const regexVerificaNoTexto = new RegExp(`\\b${palavra}\\b`, 'i');

        if (regexVerificaNoTexto.test(texto) && !palavrasSet.has(pUpper)) {
            palavrasSet.add(pUpper);
            palavrasSelecionadas.push(pUpper);
        }
    });

    // 2. Extrai candidatos do resto do texto para preencher as vagas restantes
    let gruposDeFrases = frases.map((frase) => {
        const palavrasLimpas = frase
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(p => p.length > 3 && !PALAVRAS_IGNORADAS.includes(p.toLowerCase()));

        return { palavras: [...new Set(palavrasLimpas)] };
    }).filter(g => g.palavras.length > 0);

    let tentativas = 0;
    while (palavrasSelecionadas.length < maxPalavras && tentativas < 50) {
        gruposDeFrases.sort(() => 0.5 - Math.random());

        for (let grupo of gruposDeFrases) {
            if (palavrasSet.size >= maxPalavras) break;

            if (grupo.palavras.length > 0) {
                const randIndex = Math.floor(Math.random() * grupo.palavras.length);
                const palavraOriginal = grupo.palavras[randIndex];
                const palavraUpper = palavraOriginal.toUpperCase();

                if (!palavrasSet.has(palavraUpper)) {
                    palavrasSet.add(palavraUpper);
                    palavrasSelecionadas.push(palavraUpper);
                    grupo.palavras.splice(randIndex, 1);
                }
            }
        }
        tentativas++;
    }

    // 3. Injeção no HTML
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
        imagem: nivelBruto.imagem,
        texto: textoProcessado,
        palavras: palavrasSelecionadas,
        tamanho: tamanhoGrid
    };
}

/* --- NAVEGAÇÃO E MENU --- */

function iniciar() {
    gerarPoolLetras();
}

function escolherDificuldade(dif) {
    estado.dificuldade = dif;
    document.getElementById('tela-inicio').classList.replace('visivel', 'oculto');
    document.getElementById('tela-niveis').classList.replace('oculto', 'visivel');
    renderizarMenuNiveis();
}

function voltarParaInicio() {
    document.getElementById('tela-niveis').classList.replace('visivel', 'oculto');
    document.getElementById('tela-inicio').classList.replace('oculto', 'visivel');
}

function voltarParaMenuNiveis() {
    document.getElementById('tela-jogo').classList.replace('visivel', 'oculto');
    document.getElementById('tela-niveis').classList.replace('oculto', 'visivel');
    document.getElementById('modal-vitoria').classList.add('oculto');
    renderizarMenuNiveis();
}

function renderizarMenuNiveis() {
    const container = document.getElementById('grid-niveis');
    container.innerHTML = '';
    const progressoSalvo = getProgressoSalvo();

    NIVEIS_RAW.forEach((nivelRaw, index) => {
        // Cálculo de progresso para o MENU (baseado no histórico salvo)
        const achadas = progressoSalvo[nivelRaw.id] || [];
        const porcentagem = Math.min(100, Math.floor((achadas.length / 8) * 100));

        let bloqueado = true;
        if (index === 0) {
            bloqueado = false;
        } else {
            const idAnterior = NIVEIS_RAW[index - 1].id;
            const achadasAnterior = (progressoSalvo[idAnterior] || []).length;
            // Regra: Precisa de aprox 6 palavras para liberar o próximo
            if (achadasAnterior >= 6) bloqueado = false;
        }

        const card = document.createElement('div');
        card.className = `card-nivel ${bloqueado ? 'bloqueado' : ''} ${porcentagem >= 90 ? 'concluido' : ''}`;

        let html = `<h3>${index + 1}. ${nivelRaw.titulo}</h3>`;

        if (bloqueado) {
            html += `<div class="icon-cadeado">🔒</div>`;
            html += `<p style="font-size:0.8rem">Bloqueado</p>`;
        } else {
            html += `<p class="progresso-texto">${achadas.length} palavras encontradas</p>`;
            card.onclick = () => carregarNivel(nivelRaw.id);
        }

        card.innerHTML = html;
        container.appendChild(card);
    });
}

/* --- CARREGAMENTO DO JOGO (MODO REPLAY) --- */

function carregarNivel(idNivel) {
    document.getElementById('tela-niveis').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');
    document.getElementById('camada-riscos').innerHTML = '';

    const nivelBruto = NIVEIS_RAW.find(n => n.id === idNivel);
    const nivelProcessado = processarNivelDinamico(nivelBruto);

    estado.nivelAtualObj = nivelProcessado;

    // --- ALTERAÇÃO IMPORTANTE: RESET DE SESSÃO ---
    // Começamos o nível zerado para o jogador poder jogar novamente.
    // O progresso histórico continua no localStorage, mas não é carregado visualmente.
    estado.palavrasEncontradas = [];

    // Imagem
    const imgNivel = document.getElementById('imagem-nivel');
    if (nivelProcessado.imagem) {
        imgNivel.src = nivelProcessado.imagem;
        imgNivel.classList.remove('oculto');
    } else {
        imgNivel.classList.add('oculto');
    }

    // Textos
    document.getElementById('titulo-historia').innerText = nivelProcessado.titulo;
    document.getElementById('nivel-atual').innerText = nivelProcessado.titulo;

    const containerTexto = document.getElementById('conteudo-texto');
    const containerLista = document.getElementById('lista-palavras');
    containerTexto.innerHTML = nivelProcessado.texto;

    // Regras de Dificuldade
    if (estado.dificuldade === 'facil' || estado.dificuldade === 'medio') {
        containerTexto.classList.add('modo-facil');
    } else {
        containerTexto.classList.remove('modo-facil');
    }

    if (estado.dificuldade === 'facil') {
        renderizarListaPalavras(nivelProcessado.palavras);
    } else {
        containerLista.innerHTML = '';
    }

    // NOTA: Removemos o restaurarEstadoVisual() para que o jogo comece limpo.

    gerarMatrizGrid(nivelProcessado, estado.dificuldade);
    renderizarGrid();
    atualizarContador();
}

function renderizarListaPalavras(listaPalavras) {
    const container = document.getElementById('lista-palavras');
    container.innerHTML = '';
    listaPalavras.forEach(palavra => {
        const chip = document.createElement('div');
        chip.className = 'chip-palavra';
        chip.innerText = palavra;
        chip.dataset.target = palavra;
        container.appendChild(chip);
    });
}

/* --- GRID E LÓGICA --- */

function gerarMatrizGrid(nivel, dificuldade) {
    const tam = nivel.tamanho;
    let grid = Array(tam).fill(null).map(() => Array(tam).fill(''));
    estado.solucao = [];

    const palavrasOrdenadas = [...nivel.palavras].sort((a, b) => b.length - a.length);
    const direcoesValidas = DIRECOES[dificuldade];
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

/* --- INTERAÇÃO E RENDERIZAÇÃO --- */

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
            celulas.push({ r: rInicio + (i * passoR), c: cInicio + (i * passoC) });
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

/* --- VITÓRIA E UI --- */

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
    if (!estado.palavrasEncontradas.includes(objSolucao.palavra)) {
        estado.palavrasEncontradas.push(objSolucao.palavra);
        // Salva no banco de dados, mas não interfere no jogo atual se for replay
        salvarPalavraEncontrada(estado.nivelAtualObj.id, objSolucao.palavra);
    }

    const coords = objSolucao.coordenadas;
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('encontrada');
    });
    desenharRisco(coords[0], coords[coords.length - 1]);

    document.querySelectorAll(`span[data-word='${objSolucao.palavra}']`)
        .forEach(span => span.classList.add('riscada'));

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

    const elContador = document.getElementById('contador-palavras');
    if (elContador) elContador.innerText = `${achadas}/${total}`;

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

/* --- TROCA DE TEMA MANUAL --- */
function mudarTema() {
    const select = document.getElementById('escolha-tema');
    TEMA_ATUAL = parseInt(select.value);

    // NOVO: Salva a escolha no navegador para não perder ao dar F5
    localStorage.setItem('puzzle_tema_selecionado', TEMA_ATUAL);

    carregarDadosEIniciar();
}

/* --- INICIALIZAÇÃO E CARREGAMENTO DE DADOS --- */

async function carregarDadosEIniciar() {
    try {
        const selectTema = document.getElementById('escolha-tema');
        if (selectTema) {
            selectTema.value = TEMA_ATUAL;
        }
        // 1. Atualiza a imagem da Capa Dinamicamente no HTML
        const imgCapa = document.querySelector('.capa-jogo');
        if (imgCapa) {
            imgCapa.src = `assets/${TEMA_ATUAL}/1.png`;
        }

        // 2. Busca o JSON correto baseado na pasta do tema
        const resposta = await fetch(`niveis/${TEMA_ATUAL}/niveis.json`);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status} - O arquivo não foi encontrado na pasta niveis/${TEMA_ATUAL}/`);
        }

        const dadosCarregados = await resposta.json();

        // 3. Verifica o formato do JSON e preenche as variáveis
        // Aceita tanto o formato novo (com tituloJogo) quanto o antigo (só array)
        if (Array.isArray(dadosCarregados)) {
            NIVEIS_RAW = dadosCarregados;
        } else {
            NIVEIS_RAW = dadosCarregados.niveis;

            // Atualiza o título na tela inicial
            const h1Titulo = document.getElementById('titulo-geral-jogo');
            if (h1Titulo && dadosCarregados.tituloJogo) {
                h1Titulo.innerText = dadosCarregados.tituloJogo;
                document.title = `${dadosCarregados.tituloJogo} - Puzzle Educacional`; // Muda o título da aba do navegador também!
            }
        }

        iniciar();

    } catch (erro) {
        console.error("Erro completo:", erro);
        alert("Erro técnico: " + erro.message);
    }
}

carregarDadosEIniciar();