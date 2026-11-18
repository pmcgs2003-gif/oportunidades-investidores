/* Pedro & Ana — menu, galeria e formulário. */
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbwj1Sc9jBLNYj59ZHf8kmzD-LFolBwf22ziMJOV2O1AQLl-WLXs3jQuSwCrFx_oKbhKww/exec";
const WHATSAPP = "351933668720";

(function(){
  const $ = id => document.getElementById(id);

  // cabeçalho com linha ao descer
  const head = document.querySelector('.site-head');
  const onScroll = () => head && head.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // menu no telemóvel
  const mb = document.querySelector('.menu-btn');
  if (mb) {
    mb.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      mb.setAttribute('aria-expanded', open);
      mb.textContent = open ? 'Fechar' : 'Menu';
    });
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open'); mb.setAttribute('aria-expanded', false); mb.textContent = 'Menu';
    }));
  }

  // galeria em ecrã inteiro
  const shots = [...document.querySelectorAll('.gallery button')];
  if (shots.length) {
    let i = 0, box = null;
    const show = n => { i = (n + shots.length) % shots.length; const im = shots[i].querySelector('img'); box.querySelector('img').src = im.dataset.full || im.src; box.querySelector('img').alt = im.alt; };
    const close = () => { box.remove(); box = null; document.body.style.overflow = ''; shots[i].focus(); };
    shots.forEach((b, n) => b.addEventListener('click', () => {
      box = document.createElement('div'); box.className = 'lightbox'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Fotografias');
      box.innerHTML = '<img alt=""><button class="lb-btn lb-close" aria-label="Fechar">✕</button><button class="lb-btn lb-prev" aria-label="Anterior">←</button><button class="lb-btn lb-next" aria-label="Seguinte">→</button>';
      document.body.appendChild(box); document.body.style.overflow = 'hidden'; show(n);
      box.querySelector('.lb-close').onclick = close;
      box.querySelector('.lb-prev').onclick = () => show(i - 1);
      box.querySelector('.lb-next').onclick = () => show(i + 1);
      box.addEventListener('click', e => { if (e.target === box) close(); });
      box.querySelector('.lb-close').focus();
    }));
    document.addEventListener('keydown', e => {
      if (!box) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  // formulário
  const f = $('lead'); if (!f) return;
  const q = new URLSearchParams(location.search);
  const perfil = (q.get('perfil') || '').toLowerCase();
  const pre = {ativo:'f-ativo', passivo:'f-passivo'}[perfil]; if (pre && $(pre)) $(pre).checked = true;
  const interesse = (q.get('interesse') || '').replace(/[^\p{L}\p{N} \-]/gu,'').slice(0,40);
  if (interesse && $('f-interesse')) { $('f-interesse').textContent = 'Sobre: ' + interesse; $('f-interesse').hidden = false; }

  const done = $('done');
  const setErr = (id, msg) => { $(id).textContent = msg || ''; };
  let lastMsg = '';
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const d = {
      nome: $('f-nome').value.trim(), telefone: $('f-tel').value.trim(), email: $('f-email').value.trim(),
      perfil: (f.querySelector('input[name=perfil]:checked') || {}).value || '',
      zonas: [...f.querySelectorAll('input[name=zonas]:checked')].map(x => x.value),
      orcamento: $('f-orc').value, rgpd: $('f-rgpd').checked
    };
    let ok = true;
    setErr('e-nome', d.nome ? '' : 'Escreva o seu nome.'); ok = ok && !!d.nome;
    const telOk = d.telefone.replace(/\D/g,'').length >= 9; setErr('e-tel', telOk ? '' : 'Escreva um telefone com pelo menos 9 dígitos.'); ok = ok && telOk;
    const emOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email); setErr('e-email', emOk ? '' : 'Escreva um email válido, por exemplo nome@dominio.pt.'); ok = ok && emOk;
    setErr('e-perfil', d.perfil ? '' : 'Escolha um perfil.'); ok = ok && !!d.perfil;
    setErr('e-rgpd', d.rgpd ? '' : 'Para o podermos contactar, assinale a autorização.'); ok = ok && d.rgpd;
    if (!ok) { const fe = f.querySelector('.err:not(:empty)'); if (fe) fe.scrollIntoView({block:'center', behavior:'smooth'}); return; }
    const origem = 'Página oportunidades' + (interesse ? ' · ' + interesse : '');
    lastMsg = ['Olá Pedro, gostava de receber oportunidades de investimento.' + (interesse ? ' Interesse: ' + interesse + '.' : ''),
      'Nome: ' + d.nome, 'Telefone: ' + d.telefone, 'Email: ' + d.email, 'Perfil: ' + d.perfil,
      'Zonas: ' + (d.zonas.join(', ') || '—'), 'Orçamento: ' + (d.orcamento || '—')].join('\n');
    $('wa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lastMsg);
    const btn = f.querySelector('button[type=submit]'); const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'A enviar…';
    let saved = false;
    try {
      const body = new URLSearchParams({nome:d.nome, telefone:d.telefone, email:d.email, perfil:d.perfil, zonas:d.zonas.join(', '), orcamento:d.orcamento, rgpd:'sim', origem, pagina:location.pathname});
      await fetch(FORM_ENDPOINT, {method:'POST', mode:'no-cors', body});
      saved = true;
    } catch (err) { saved = false; }
    btn.disabled = false; btn.innerHTML = label;
    if (!saved) {
      $('done-title').textContent = 'Não conseguimos enviar. Envie pelo WhatsApp.';
      $('done-text').textContent = 'A ligação falhou. Abra o WhatsApp com a mensagem já escrita e carregue em enviar.';
    }
    f.hidden = true; done.hidden = false; done.scrollIntoView({block:'center', behavior:'smooth'});
  });
  $('copy').addEventListener('click', () => {
    navigator.clipboard.writeText(lastMsg).then(() => { $('copy-msg').textContent = 'Mensagem copiada.'; }).catch(() => { $('copy-msg').textContent = lastMsg; });
  });
})();
