/* =========================================================
   Lucas dos Cortes · Demonstração do platinado
   Uma mecha que clareia sozinha (do castanho ao amarelo bem claro),
   recebe o matizador e fica branca, acompanhando as três etapas
   do texto ao lado. Sem botões: é só olhar.
   ========================================================= */
(() => {
  'use strict';

  const visual = document.querySelector('[data-timelapse]');
  if (!visual) return;

  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Cores ---------- */
  const hexParaRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgbParaHex = (c) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
  const misturar = (a, b, t) => {
    const A = hexParaRgb(a);
    const B = hexParaRgb(b);
    return rgbParaHex(A.map((v, i) => v + (B[i] - v) * t));
  };
  const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  /* Cor do fio em cada altura de tom durante a descoloração */
  const NIVEIS = [null, '#16110f', '#2a1914', '#461d15', '#6e2a18', '#9a4019', '#c2601f', '#d98a32', '#e7b14b', '#f0d27d', '#f6e7b8'];
  const PLATINADO = '#f1f3f7';
  const fundoDoNivel = (n) => {
    if (n <= 2) return 'cabelo natural';
    if (n <= 4) return 'fundo vermelho';
    if (n <= 6) return 'fundo laranja';
    if (n <= 8) return 'fundo amarelo';
    return 'fundo amarelo-claro';
  };
  const corNoNivel = (nivel) => {
    const i = Math.min(9, Math.floor(nivel));
    return misturar(NIVEIS[i], NIVEIS[i + 1], nivel - i);
  };

  /* ---------- Desenho da mecha ---------- */
  const svg = visual.querySelector('[data-mecha]');
  (() => {
    let semente = 11;
    const aleatorio = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646;
    const gFios = svg.querySelector('[data-fios]');
    const gTextura = svg.querySelector('[data-textura]');
    const gMascara = svg.querySelector('[data-mascara]');
    const gSoltos = document.createElementNS(NS, 'g');
    gSoltos.setAttribute('class', 'mecha__soltos');
    svg.insertBefore(gSoltos, gFios);

    const caminho = (d, attrs, destino) => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      Object.entries(attrs).forEach(([k, v]) => p.setAttribute(k, v));
      destino.appendChild(p);
    };

    const TOTAL = 96;
    for (let i = 0; i < TOTAL; i++) {
      const lado = i / (TOTAL - 1) - 0.5;
      const x0 = 150 + lado * 124 + (aleatorio() - 0.5) * 1.5;
      const x1 = x0 + (aleatorio() - 0.5) * 5;
      const xm = 150 + lado * 146 + (aleatorio() - 0.5) * 6;
      const xf = 150 + lado * 104 + (aleatorio() - 0.5) * 10;
      const yf = 416 + (1 - Math.abs(lado) * 2) * 18 + (aleatorio() - 0.5) * 18;
      const d = `M${x0.toFixed(1)} 62C${x1.toFixed(1)} 170 ${xm.toFixed(1)} 285 ${xf.toFixed(1)} ${yf.toFixed(1)}`;
      const largura = (4.2 + aleatorio() * 1.8).toFixed(2);
      caminho(d, { 'stroke-width': largura }, gFios);
      caminho(d, { 'stroke-width': largura, stroke: '#fff', fill: 'none', 'stroke-linecap': 'round' }, gMascara);
      const escuro = aleatorio() < 0.56;
      caminho(
        d,
        {
          stroke: escuro ? '#000' : '#fff',
          'stroke-opacity': (escuro ? 0.14 + aleatorio() * 0.22 : 0.07 + aleatorio() * 0.16).toFixed(2),
          'stroke-width': (escuro ? 0.8 + aleatorio() * 1.4 : 0.6 + aleatorio() * 0.9).toFixed(2),
          fill: 'none',
          'stroke-linecap': 'round',
        },
        gTextura
      );
    }

    [
      'M84 238C70 290 66 340 74 392',
      'M80 300C66 336 62 372 70 410',
      'M216 232C232 282 236 334 228 384',
      'M220 296C236 330 240 368 232 404',
      'M128 420C124 434 118 446 110 456',
      'M172 424C178 438 186 448 194 455',
      'M150 432C150 444 148 452 146 462',
    ].forEach((d) => caminho(d, { 'stroke-width': (0.9 + aleatorio() * 0.6).toFixed(2), opacity: '0.85' }, gSoltos));
  })();

  /* ---------- Neve do "nevou" ---------- */
  const canvas = visual.querySelector('[data-neve]');
  const ctx = canvas.getContext('2d');
  let flocos = [];
  let largura = 0;
  let altura = 0;
  const medir = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    largura = canvas.clientWidth;
    altura = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(largura * dpr));
    canvas.height = Math.max(1, Math.round(altura * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  medir();
  if ('ResizeObserver' in window) new ResizeObserver(medir).observe(canvas);

  const nevar = () => {
    for (let i = 0; i < 60; i++) {
      const r = 1.1 + Math.random() * 1.9;
      flocos.push({
        x: Math.random() * largura,
        y: -10 - Math.random() * altura * 0.9,
        r,
        v: 45 + Math.random() * 45,
        a: 0.5 + Math.random() * 0.45,
        fase: Math.random() * Math.PI * 2,
        balanco: 6 + Math.random() * 12,
      });
    }
  };

  const desenharNeve = (dt) => {
    ctx.clearRect(0, 0, largura, altura);
    if (!flocos.length) return;
    ctx.fillStyle = '#eef2ff';
    flocos = flocos.filter((f) => {
      f.y += f.v * dt;
      f.fase += 1.2 * dt;
      if (f.y - f.r > altura) return false;
      const fim = Math.min(1, Math.max(0, (altura - f.y) / (altura * 0.2)));
      ctx.globalAlpha = f.a * fim;
      ctx.beginPath();
      ctx.arc(f.x + Math.sin(f.fase) * f.balanco, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;
  };

  /* ---------- Linha do tempo da demonstração ---------- */
  const legenda = visual.querySelector('[data-legenda]');
  const cobertura = visual.querySelector('[data-progresso]');
  const listaEtapas = document.querySelector('[data-etapas]');
  const etapas = listaEtapas ? [...listaEtapas.children] : [];

  const pintar = (cor) => visual.style.setProperty('--fio', cor);
  const escrever = (texto) => {
    if (legenda.textContent !== texto) legenda.textContent = texto;
  };
  const marcarEtapa = (i) => etapas.forEach((li, k) => li.classList.toggle('ativo', k === i));
  const progresso = (p) => (cobertura.style.width = `${((1 - p) * 100).toFixed(2)}%`);

  if (reduzMovimento) {
    pintar(PLATINADO);
    escrever('Nevou: platinado perfeito');
    progresso(1);
    return;
  }

  const FASES = [
    { nome: 'clarear', duracao: 4800 },
    { nome: 'matizar', duracao: 1500 },
    { nome: 'nevou', duracao: 3600 },
    { nome: 'voltar', duracao: 1000 },
  ];
  const CICLO = FASES.reduce((s, f) => s + f.duracao, 0);

  let visivel = false;
  let rodando = false;
  let inicio = 0;
  let anterior = 0;
  let faseAnterior = '';

  const quadro = (agora) => {
    const dt = Math.min(0.05, (agora - anterior) / 1000);
    anterior = agora;
    let t = agora - inicio;

    // No fim de cada volta: recomeça se a mecha ainda estiver na tela, senão para.
    if (t >= CICLO) {
      if (!visivel) {
        rodando = false;
        listaEtapas.classList.remove('animando');
        marcarEtapa(-1);
        ctx.clearRect(0, 0, largura, altura);
        return;
      }
      inicio = agora;
      t = 0;
    }

    let resto = t;
    let fase = FASES[0];
    for (const f of FASES) {
      fase = f;
      if (resto < f.duracao) break;
      resto -= f.duracao;
    }
    const local = Math.min(1, resto / fase.duracao);

    if (fase.nome === 'clarear') {
      const nivel = 2 + 8 * suave(local);
      pintar(corNoNivel(nivel));
      const n = Math.min(10, Math.max(2, Math.round(nivel)));
      escrever(`Nível ${n} · ${fundoDoNivel(n)}`);
      progresso(0.7 * local);
      marcarEtapa(0);
    } else if (fase.nome === 'matizar') {
      pintar(misturar(NIVEIS[10], PLATINADO, suave(local)));
      escrever('Matizando com violeta');
      progresso(0.7 + 0.18 * local);
      marcarEtapa(1);
    } else if (fase.nome === 'nevou') {
      if (faseAnterior !== 'nevou') nevar();
      pintar(PLATINADO);
      escrever('Nevou: platinado perfeito');
      progresso(0.88 + 0.12 * Math.min(1, local * 4));
      marcarEtapa(2);
    } else {
      pintar(misturar(PLATINADO, NIVEIS[2], suave(local)));
      escrever('Nível 2 · cabelo natural');
      progresso(1 - local);
      marcarEtapa(-1);
    }
    faseAnterior = fase.nome;

    desenharNeve(dt);
    requestAnimationFrame(quadro);
  };

  const iniciar = () => {
    if (rodando) return;
    rodando = true;
    listaEtapas.classList.add('animando');
    inicio = anterior = performance.now();
    faseAnterior = '';
    requestAnimationFrame(quadro);
  };

  pintar(NIVEIS[2]);
  progresso(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entrada]) => {
        visivel = entrada.isIntersecting;
        if (visivel) iniciar();
      },
      { threshold: 0.35 }
    ).observe(visual);
  } else {
    visivel = true;
    iniciar();
  }
})();
