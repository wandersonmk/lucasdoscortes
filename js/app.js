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

  /* ---------- Entrada discreta dos blocos ao rolar ---------- */
  const blocos = document.querySelectorAll('[data-revelar]');
  const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
})();
