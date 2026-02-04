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

/* --- BANCO DE DADOS: MINI BICHOS --- */
const NIVEIS_RAW = [
    {
        id: 1,
        titulo: "O Mundo dos Besouros",
        textoPuro: "Existem besouros de todos os tipos. A família das joaninhas traz sorte e ajuda no controle biológico. Já os escaravelhos eram sagrados no Egito Antigo. Alguns besouros se fingem de mortos quando ameaçados e outros, como o gigante, possuem mandíbulas muito fortes."
    },
    {
        id: 2,
        titulo: "As Minhocas",
        textoPuro: "As minhocas são anelídeos de corpo cilíndrico que vivem na terra. Elas são muito importantes para o solo, deixando a terra fofa e arejada. Além disso, produzem o húmus, que é um excelente adubo natural para as plantas crescerem fortes."
    },
    {
        id: 3,
        titulo: "Borboletas e Mariposas",
        textoPuro: "As borboletas são coloridas e voam durante o dia, enquanto as mariposas preferem a noite. Ambas são importantes polinizadoras. Ao se alimentar do néctar, elas carregam o pólen que ajuda na reprodução de muitas flores e plantas da natureza."
    },
    {
        id: 4,
        titulo: "O Exército de Formigas",
        textoPuro: "As formigas são insetos muito fortes que podem carregar até cinquenta vezes o seu próprio peso. Elas vivem em sociedades organizadas onde cada uma tem sua tarefa. Usam suas antenas para cheirar e se comunicar com as outras companheiras do formigueiro."
    },
    {
        id: 5,
        titulo: "O Cupim",
        textoPuro: "Os cupins vivem em colônias com rei, rainha e soldados. Eles são conhecidos por comer madeira rapidamente e podem construir ninhos gigantes. Na época de chuva, os cupins alados saem em revoada perto das lâmpadas para tentar fundar novas colônias."
    },
    {
        id: 6,
        titulo: "Tatu de Jardim",
        textoPuro: "O tatuzinho de jardim não é um inseto, mas sim um crustáceo terrestre, parente do camarão. Ele precisa de umidade para viver e tem uma defesa especial: quando se sente ameaçado, ele se enrola todo e vira uma bolinha dura para se proteger."
    },
    {
        id: 7,
        titulo: "Grilos e Gafanhotos",
        textoPuro: "Você sabe a diferença? O grilo tem antenas longas e gosta da noite, fazendo seu som esfregando as asas. Já o gafanhoto tem antenas curtas, prefere o dia e canta esfregando as pernas. A esperança costuma ser verde e parece uma folha."
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

/* --- SISTEMA DE SAVE (LOCALSTORAGE) --- */
function getProgressoSalvo() {
    const key = `puzzle_mini_bichos_${estado.dificuldade}`;
    const salvo = localStorage.getItem(key);
    return salvo ? JSON.parse(salvo) : {};
}

function salvarPalavraEncontrada(idNivel, palavra) {
    const key = `puzzle_mini_bichos_${estado.dificuldade}`;
    let progresso = getProgressoSalvo();

    if (!progresso[idNivel]) progresso[idNivel] = [];

    if (!progresso[idNivel].includes(palavra)) {
        progresso[idNivel].push(palavra);
        localStorage.setItem(key, JSON.stringify(progresso));
    }
}

/* --- ENGINE DINÂMICA --- */
function processarNivelDinamico(nivelBruto) {
    const texto = nivelBruto.textoPuro;
    const frases = texto.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [texto];

    let gruposDeFrases = frases.map((frase) => {
        const palavrasLimpas = frase
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(p => p.length > 3 && !PALAVRAS_IGNORADAS.includes(p.toLowerCase()));
        return { palavras: [...new Set(palavrasLimpas)] };
    }).filter(g => g.palavras.length > 0);

    const palavrasSelecionadas = [];
    const maxPalavras = 8; // Busca até 8 palavras

    let tentativas = 0;
    while (palavrasSelecionadas.length < maxPalavras && tentativas < 40) {
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

    let niveisAnterioresCompletos = true;

    NIVEIS_RAW.forEach((nivelRaw, index) => {
        // Processa levemente para saber total estimado (pode variar se for aleatório, 
        // mas assumimos média de 8 para cálculo visual)
        const achadas = progressoSalvo[nivelRaw.id] || [];
        // Estimativa para barra de progresso do menu
        const porcentagem = Math.min(100, Math.floor((achadas.length / 8) * 100));

        // Lógica de Bloqueio
        let bloqueado = true;
        let motivo = "";

        if (index === 0) {
            bloqueado = false;
        } else {
            // Verifica o anterior
            const idAnterior = NIVEIS_RAW[index - 1].id;
            const achadasAnterior = (progressoSalvo[idAnterior] || []).length;

            // Regra: Precisa de pelo menos 6 palavras (aprox 75% de 8) para liberar o próximo
            if (achadasAnterior >= 6) bloqueado = false;
            else motivo = "Complete o anterior";
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

/* --- CARREGAMENTO DO JOGO --- */

function carregarNivel(idNivel) {
    document.getElementById('tela-niveis').classList.replace('visivel', 'oculto');
    document.getElementById('tela-jogo').classList.replace('oculto', 'visivel');
    document.getElementById('camada-riscos').innerHTML = '';

    const nivelBruto = NIVEIS_RAW.find(n => n.id === idNivel);
    const nivelProcessado = processarNivelDinamico(nivelBruto);

    estado.nivelAtualObj = nivelProcessado;

    // Recupera Save
    const progresso = getProgressoSalvo();
    estado.palavrasEncontradas = progresso[idNivel] || [];

    // UI
    document.getElementById('titulo-historia').innerText = nivelProcessado.titulo;
    document.getElementById('nivel-atual').innerText = nivelProcessado.titulo;

    // Destaques e Listas baseados na Dificuldade
    const containerTexto = document.getElementById('conteudo-texto');
    const containerLista = document.getElementById('lista-palavras');
    containerTexto.innerHTML = nivelProcessado.texto;

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

    // Marca palavras já encontradas (Save)
    setTimeout(restaurarEstadoVisual, 100);

    gerarMatrizGrid(nivelProcessado, estado.dificuldade);
    renderizarGrid();
    atualizarContador();
}

function restaurarEstadoVisual() {
    estado.palavrasEncontradas.forEach(palavra => {
        // Risca Texto
        document.querySelectorAll(`span[data-word='${palavra}']`)
            .forEach(span => span.classList.add('riscada'));

        // Risca Lista (se existir)
        const chip = document.querySelector(`.chip-palavra[data-target='${palavra}']`);
        if (chip) chip.classList.add('encontrada');
    });
}

function renderizarListaPalavras(listaPalavras) {
    const container = document.getElementById('lista-palavras');
    container.innerHTML = '';
    listaPalavras.forEach(palavra => {
        const chip = document.createElement('div');
        chip.className = 'chip-palavra';
        chip.innerText = palavra;
        chip.dataset.target = palavra;
        // Se já foi achada antes, marca
        if (estado.palavrasEncontradas.includes(palavra)) {
            chip.classList.add('encontrada');
        }
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

    // Riscar no grid palavras já encontradas (Save)
    estado.solucao.forEach(sol => {
        if (estado.palavrasEncontradas.includes(sol.palavra)) {
            sol.coordenadas.forEach(coord => {
                const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
                if (el) el.classList.add('encontrada');
            });
            desenharRisco(sol.coordenadas[0], sol.coordenadas[sol.coordenadas.length - 1]);
        }
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
        salvarPalavraEncontrada(estado.nivelAtualObj.id, objSolucao.palavra);
    }

    // Grid e Risco
    const coords = objSolucao.coordenadas;
    coords.forEach(coord => {
        const el = document.querySelector(`.celula[data-r='${coord.r}'][data-c='${coord.c}']`);
        if (el) el.classList.add('encontrada');
    });
    desenharRisco(coords[0], coords[coords.length - 1]);

    // Texto e Lista
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

iniciar();