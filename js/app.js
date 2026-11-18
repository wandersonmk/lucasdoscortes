/* =========================================================
   Lucas dos Cortes · Curso de Platinado Perfeito
   ========================================================= */
(() => {
  'use strict';

  /* ===== CONFIGURAÇÃO =====
     Link do checkout da Hotmart (só com a oferta, sem rastreios do Instagram).
     Preço e parcelas aparecem em vários lugares da página: troque aqui. */
  const CHECKOUT = 'https://pay.hotmart.com/C101919090K?off=qxpu7j8x';
  const PRECO_A_VISTA = 29.99;
  const PARCELAS = { vezes: 6, valor: 5.63 };

  /* WhatsApp para dúvidas: 55 + DDD + número, só os números. */
  const WHATSAPP = '5511955786747';
  const MENSAGEM_WHATSAPP = 'Olá, Lucas! Vim pelo site e tenho uma dúvida sobre o Curso de Platinado Perfeito.';

  /* Aviso "fulano comprou o curso", no canto de baixo da tela.
     Coloque aqui SÓ compras que aconteceram de verdade, tiradas do relatório
     de vendas da Hotmart: primeiro nome, cidade, UF e data e hora da compra.
     O aviso mostra há quanto tempo foi a compra ("há 20 minutos", "ontem"...),
     cada compra aparece uma vez por visita e compras com mais de 30 dias
     não aparecem. Lista vazia = nenhum aviso no site publicado.
     Formato:
       { nome: 'Primeiro nome', cidade: 'Cidade', uf: 'UF', quando: 'AAAA-MM-DD HH:MM' },
  */
  const COMPRAS_REAIS = [
  ];

  /* Tempos do aviso: o primeiro aparece depois de alguns segundos na página,
     fica na tela enquanto a barrinha diminui e o próximo só vem depois de
     uma pausa (sorteada entre o mínimo e o máximo), se a pessoa ainda
     estiver com a página aberta. */
  const AVISO = { primeiro: 9000, duracao: 6500, pausa: [25000, 45000], diasMaximos: 30 };

  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const comMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reais = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- Botões de compra ----------
     Se a página for aberta com rastreio de anúncio (utm_..., src, sck),
     ele segue junto para o checkout da Hotmart. */
  const linkCompra = new URL(CHECKOUT);
  new URLSearchParams(window.location.search).forEach((valor, chave) => {
    if (/^utm_/i.test(chave) || chave === 'src' || chave === 'sck') linkCompra.searchParams.set(chave, valor);
  });
  document.querySelectorAll('[data-comprar]').forEach((a) => (a.href = linkCompra.toString()));

  /* ---------- Preço ---------- */
  document.querySelectorAll('[data-preco]').forEach((el) => (el.textContent = reais(PRECO_A_VISTA)));
  document.querySelectorAll('[data-parcelas]').forEach((el) => (el.textContent = `${PARCELAS.vezes}x de ${reais(PARCELAS.valor)}`));

  /* ---------- WhatsApp (só nas dúvidas) ---------- */
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM_WHATSAPP)}`;
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-ano]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Entrada dos blocos ao rolar ---------- */
  const blocos = document.querySelectorAll('[data-revelar]');
  if ('IntersectionObserver' in window && !reduzMovimento) {
    const observador = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    blocos.forEach((el) => observador.observe(el));
  } else {
    blocos.forEach((el) => el.classList.add('visivel'));
  }

  /* ---------- Perguntas: uma aberta por vez ---------- */
  const perguntas = document.querySelectorAll('.faq details');
  perguntas.forEach((item) =>
    item.addEventListener('toggle', () => {
      if (item.open) perguntas.forEach((outra) => outra !== item && (outra.open = false));
    })
  );

  /* ---------- "Role para ver mais" e "voltar ao topo" ---------- */
  const hero = document.querySelector('.hero');
  const indicador = document.querySelector('.rolar');
  const voltarTopo = document.querySelector('.topo-voltar');
  const aoRolar = () => {
    const y = window.scrollY;
    if (indicador) indicador.classList.toggle('sumiu', y > 40);
    if (voltarTopo) voltarTopo.classList.toggle('visivel', y > hero.offsetHeight * 0.6);
  };
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  /* ---------- Efeitos dos cards (computador) ---------- */
  if (comMouse && !reduzMovimento) {
    // Luz que acompanha o mouse nos cards claros
    document.querySelectorAll('.cartao').forEach((cartao) => {
      cartao.addEventListener('pointermove', (e) => {
        const r = cartao.getBoundingClientRect();
        cartao.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
        cartao.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
      });
      cartao.addEventListener('pointerleave', () => {
        cartao.style.removeProperty('--mx');
        cartao.style.removeProperty('--my');
      });
    });

    // Inclinação 3D suave nas fotos e na mecha, com reflexo de luz
    document.querySelectorAll('[data-inclinar]').forEach((el) => {
      const atual = { x: 0, y: 0 };
      const alvo = { x: 0, y: 0 };
      let rodando = false;
      const passo = () => {
        atual.x += (alvo.x - atual.x) * 0.14;
        atual.y += (alvo.y - atual.y) * 0.14;
        el.style.setProperty('--rx', `${atual.x.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${atual.y.toFixed(2)}deg`);
        if (Math.abs(alvo.x - atual.x) > 0.02 || Math.abs(alvo.y - atual.y) > 0.02) requestAnimationFrame(passo);
        else rodando = false;
      };
      const animar = () => {
        if (rodando) return;
        rodando = true;
        requestAnimationFrame(passo);
      };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        alvo.x = -py * 7;
        alvo.y = px * 7;
        el.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
        el.classList.add('inclinando');
        animar();
      });
      el.addEventListener('pointerleave', () => {
        alvo.x = 0;
        alvo.y = 0;
        el.classList.remove('inclinando');
        animar();
      });
    });
  }

  /* ---------- Aviso de compra ---------- */
  const aviso = document.querySelector('[data-aviso-compra]');
  if (aviso) {
    const agora = Date.now();
    const MINUTO = 60000;
    const DIA = 1440 * MINUTO;

    const compras = COMPRAS_REAIS.map((c) => ({ ...c, data: new Date(String(c.quando || '').trim().replace(' ', 'T')) }))
      .filter((c) => c.nome && !Number.isNaN(c.data.getTime()) && c.data.getTime() <= agora && agora - c.data.getTime() <= AVISO.diasMaximos * DIA)
      .sort((a, b) => b.data - a.data);

    /* PRÉVIA: só no seu computador (localhost), para você ver o visual do aviso
       enquanto a lista de compras reais estiver vazia. No site publicado ela
       nunca aparece. */
    const ehPrevia = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) && compras.length === 0;
    const fila = ehPrevia
      ? [
          { nome: 'Rafael', cidade: 'Itu', uf: 'SP', data: new Date(agora - 8 * MINUTO), previa: true },
          { nome: 'Bruno', cidade: 'Sorocaba', uf: 'SP', data: new Date(agora - 47 * MINUTO), previa: true },
          { nome: 'Diego', cidade: 'Campinas', uf: 'SP', data: new Date(agora - 3 * 60 * MINUTO), previa: true },
        ]
      : compras;
    const tempos = ehPrevia ? { ...AVISO, primeiro: 3500, pausa: [9000, 13000] } : AVISO;

    const quandoFoi = (data) => {
      const minutos = Math.max(0, Math.round((Date.now() - data.getTime()) / MINUTO));
      if (minutos < 10) return 'agora há pouco';
      if (minutos < 60) return `há ${minutos} minutos`;
      const horas = Math.round(minutos / 60);
      if (horas < 24) return horas === 1 ? 'há 1 hora' : `há ${horas} horas`;
      const dias = Math.round(horas / 24);
      return dias === 1 ? 'ontem' : `há ${dias} dias`;
    };

    const campo = (nome) => aviso.querySelector(`[data-aviso-${nome}]`);
    let cronometro = 0;
    let restante = 0;
    let inicio = 0;
    let encerrado = false;

    const deslocarVoltarTopo = (altura) => document.documentElement.style.setProperty('--aviso-desloc', `${altura}px`);

    const contar = () => {
      inicio = performance.now();
      cronometro = setTimeout(esconder, restante);
    };

    const mostrar = (compra) => {
      const nome = compra.nome.trim();
      campo('inicial').textContent = nome.charAt(0).toUpperCase();
      campo('nome').textContent = nome;
      campo('local').textContent = compra.cidade ? `, de ${compra.cidade}${compra.uf ? ` (${compra.uf})` : ''}` : '';
      campo('quando').textContent = quandoFoi(compra.data) + (compra.previa ? ' · prévia local' : '');
      aviso.style.setProperty('--aviso-duracao', `${tempos.duracao}ms`);
      aviso.hidden = false;
      void aviso.offsetWidth; // reinicia a barrinha
      aviso.classList.add('mostrar');
      deslocarVoltarTopo(aviso.offsetHeight + 12);
      restante = tempos.duracao;
      contar();
    };

    function esconder() {
      clearTimeout(cronometro);
      aviso.classList.remove('mostrar');
      deslocarVoltarTopo(0);
      setTimeout(() => {
        if (!aviso.classList.contains('mostrar')) aviso.hidden = true;
      }, 500);
      agendar();
    }

    const agendar = () => {
      if (encerrado || !fila.length) return;
      const [minimo, maximo] = tempos.pausa;
      setTimeout(tentar, minimo + Math.random() * (maximo - minimo));
    };

    // Só mostra se a pessoa ainda estiver com a página aberta na tela
    function tentar() {
      if (encerrado || !fila.length) return;
      if (document.visibilityState !== 'visible') {
        const aoVoltar = () => {
          if (document.visibilityState !== 'visible') return;
          document.removeEventListener('visibilitychange', aoVoltar);
          setTimeout(tentar, 3000);
        };
        document.addEventListener('visibilitychange', aoVoltar);
        return;
      }
      mostrar(fila.shift());
    }

    // Com o mouse em cima, o tempo para (a barrinha também)
    aviso.addEventListener('mouseenter', () => {
      if (!aviso.classList.contains('mostrar')) return;
      clearTimeout(cronometro);
      restante = Math.max(600, restante - (performance.now() - inicio));
    });
    aviso.addEventListener('mouseleave', () => {
      if (aviso.classList.contains('mostrar')) contar();
    });

    // Quem fecha um aviso não recebe outros nesta visita
    campo('fechar').addEventListener('click', () => {
      encerrado = true;
      esconder();
    });

    if (fila.length) setTimeout(tentar, tempos.primeiro);
  }
})();
