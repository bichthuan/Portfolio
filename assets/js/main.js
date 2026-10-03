/* Thuan (Mei) Nguyen — Portfolio interactions. Vanilla JS, no dependencies. */
(() => {
  const doc = document.documentElement;
  doc.classList.remove('js-off');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Nav: solid on scroll, hide on scroll down, show on scroll up ---------- */
  const nav = $('.nav');
  if (nav) {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 24);
      if (!nav.classList.contains('is-open')) {
        nav.classList.toggle('is-hidden', y > 400 && y > lastY + 4);
        if (y < lastY - 4) nav.classList.remove('is-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const menuBtn = $('.nav__menu-btn', nav);
    if (menuBtn) {
      const close = () => { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); };
      menuBtn.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
      });
      $$('.nav__links a', nav).forEach(a => a.addEventListener('click', close));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    }
  }

  /* ---------- Hero intro + thread that untangles (complex → simple) ---------- */
  const intro = $('.intro');
  if (intro) requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('is-ready')));

  const thread = $('.hero__thread');
  if (thread) {
    const path = $('path', thread);
    const dot = $('circle', thread);
    const W = 1000, H = 120, mid = H / 2, N = 220;
    // Tangled: a prolate cycloid with drifting amplitude → loops and knots
    const tangled = [], straight = [];
    const loops = 6.5, a = 1, span = Math.PI * 2 * loops;
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * span;
      const b = 2.1 + Math.sin(t * 0.37) * 0.9;
      const x = a * t - b * Math.sin(t);
      const y = -b * Math.cos(t) + Math.sin(t * 2.3) * 0.5;
      tangled.push([x, y]);
    }
    const xs = tangled.map(p => p[0]), ys = tangled.map(p => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys.map(Math.abs));
    const tang = tangled.map(([x, y]) => [((x - minX) / (maxX - minX)) * W, mid + (y / maxY) * (H * 0.46)]);
    for (let i = 0; i <= N; i++) straight.push([(i / N) * W, mid]);

    const draw = k => {
      let d = '';
      for (let i = 0; i <= N; i++) {
        // stagger: left side straightens first, like pulling a thread
        const local = Math.min(1, Math.max(0, k * 1.6 - (i / N) * 0.6));
        const e = local < .5 ? 4 * local ** 3 : 1 - (-2 * local + 2) ** 3 / 2;
        const x = tang[i][0] + (straight[i][0] - tang[i][0]) * e;
        const y = tang[i][1] + (straight[i][1] - tang[i][1]) * e;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
        if (i === N) { dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); }
      }
      path.setAttribute('d', d);
    };

    if (reduce) { draw(1); }
    else {
      draw(0);
      const dur = 2200, delay = 900;
      let start;
      const tick = ts => {
        if (!start) start = ts;
        const k = Math.min(1, Math.max(0, (ts - start - delay) / dur));
        draw(k);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  /* ---------- Reveal on scroll (also triggers keyword highlights + bars) ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  $$('.reveal, [data-observe]').forEach(el => io.observe(el));

  /* ---------- Count-up numbers ---------- */
  const fmt = (v, dec) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target; countIO.unobserve(el);
      const to = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduce) { el.textContent = fmt(to, dec); return; }
      const dur = 1400; let t0;
      const step = ts => {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(to * e, dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Before / After simplification demo ---------- */
  $$('[data-demo]').forEach(demo => {
    const data = {
      before: {
        caption: '<b>Before:</b> product-first. Merchants picked products, then places, then prices.',
        flows: [
          ['Default profile', 'All products', 'Worldwide', 'Rule + cost'],
          ['Custom profile', 'Select products', 'Worldwide', 'Rule + cost'],
          ['Default profile', 'All products', 'Custom zone', 'Select countries', 'Rule + cost'],
          ['Custom profile', 'Select products', 'Custom zone', 'Select countries', 'Rule + cost'],
        ],
      },
      after: {
        caption: '<b>After:</b> location-first. Start from where you ship. Group products only when prices differ.',
        flows: [
          ['Default zone', 'All products', 'Rule + cost'],
          ['Default zone', 'Product groups', 'Rule + cost'],
          ['Custom zone', 'Select countries', 'Product groups', 'Rule + cost'],
        ],
      },
    };
    const flowsEl = $('.flows', demo), capEl = $('.demo__caption', demo);
    const pathsEl = $('[data-paths]', demo), stepsEl = $('[data-steps]', demo);
    const btns = $$('.seg button', demo), pill = $('.seg__pill', demo);
    const render = key => {
      const d = data[key];
      capEl.innerHTML = d.caption;
      flowsEl.innerHTML = d.flows.map((f, r) =>
        `<div class="flow" style="animation-delay:${r * 70}ms"><span class="flow__tag">Case ${r + 1}</span>` +
        f.map((n, i) => `${i ? '<span class="join" aria-hidden="true"></span>' : ''}<span class="node${i === 0 ? ' node--key' : ''}${i === f.length - 1 ? ' node--end' : ''}">${n}</span>`).join('') +
        `</div>`).join('');
      pathsEl.textContent = d.flows.length;
      stepsEl.textContent = d.flows.reduce((s, f) => s + f.length, 0);
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === key)));
      const active = btns.find(b => b.dataset.key === key);
      pill.style.width = active.offsetWidth + 'px';
      pill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
    };
    btns.forEach(b => b.addEventListener('click', () => render(b.dataset.key)));
    render(demo.dataset.demo || 'before');
    window.addEventListener('resize', () => {
      const active = btns.find(b => b.getAttribute('aria-pressed') === 'true');
      pill.style.width = active.offsetWidth + 'px';
      pill.style.transform = `translateX(${active.offsetLeft - 4}px)`;
    });
    // Auto-flip once to "after" when it first comes into view, so the point lands without a click
    if (!reduce) {
      const flip = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { setTimeout(() => render('after'), 1600); flip.disconnect(); }
      }), { threshold: 0.6 });
      flip.observe(demo);
    }
  });

  /* ---------- Work list: cursor-following preview ---------- */
  const preview = $('.preview');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (preview && fine) {
    const imgs = $$('img', preview);
    let x = 0, y = 0, cx = 0, cy = 0, raf;
    const loop = () => {
      cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
      preview.style.left = cx + 'px'; preview.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    $$('.work__link').forEach(link => {
      link.addEventListener('mouseenter', e => {
        x = cx = e.clientX; y = cy = e.clientY;
        imgs.forEach(i => i.classList.toggle('is-active', i.dataset.key === link.dataset.key));
        preview.classList.add('is-on');
        cancelAnimationFrame(raf); loop();
      });
      link.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
      link.addEventListener('mouseleave', () => { preview.classList.remove('is-on'); setTimeout(() => cancelAnimationFrame(raf), 400); });
    });
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('is-on');
    clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Email copied to clipboard'); }
    catch { showToast(btn.dataset.copy); }
  }));

  /* ---------- Footer: wordmark reveal + local time ---------- */
  const footer = $('.footer');
  if (footer) {
    $$('.footer__mark span', footer).forEach((s, i) => { s.style.transitionDelay = (i * 45) + 'ms'; });
    // Fit the wordmark exactly to the container width
    const mark = $('.footer__mark', footer), markWrap = $('.footer__mark-wrap', footer);
    const fit = () => {
      if (!mark || !markWrap) return;
      mark.style.fontSize = '100px';
      const ratio = markWrap.clientWidth / mark.scrollWidth;
      mark.style.fontSize = (100 * ratio * 0.995) + 'px';
    };
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('resize', fit);
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { footer.classList.add('is-in'); o.disconnect(); }
    }), { threshold: 0.25 }).observe(footer);
    const clock = $('[data-clock]', footer);
    if (clock) {
      const tick = () => {
        clock.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()) + ' in Ho Chi Minh City';
      };
      tick(); setInterval(tick, 30000);
    }
  }
  $$('[data-top]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }));

  /* ---------- Case study: reading progress + table of contents scroll-spy ---------- */
  const progress = $('.progress');
  if (progress) {
    const article = $('[data-article]') || document.body;
    const upd = () => {
      const r = article.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      progress.style.transform = `scaleX(${p})`;
    };
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }
  const tocLinks = $$('.toc a');
  if (tocLinks.length) {
    const map = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('is-active'));
          const a = map.get(e.target.id); if (a) a.classList.add('is-active');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Lightbox for detailed diagrams ---------- */
  const zoomables = $$('img.zoomable');
  if (zoomables.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Enlarged image');
    lb.innerHTML = '<button class="lightbox__close" aria-label="Close enlarged image">✕</button><img alt="">';
    document.body.appendChild(lb);
    const lbImg = $('img', lb), closeBtn = $('button', lb);
    let opener = null;
    const close = () => { lb.classList.remove('is-on'); document.body.style.overflow = ''; if (opener) opener.focus(); };
    zoomables.forEach(img => {
      img.setAttribute('tabindex', '0'); img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.alt || 'Image') + '. Open larger view');
      const open = () => { opener = img; lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt; lb.classList.add('is-on'); document.body.style.overflow = 'hidden'; closeBtn.focus(); };
      img.addEventListener('click', open);
      img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    lb.addEventListener('click', e => { if (e.target === lb || e.target === closeBtn) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-on')) close(); });
  }
})();
