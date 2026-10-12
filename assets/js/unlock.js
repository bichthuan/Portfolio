/* Password gate for protected case studies.
   The page ships only ciphertext (AES-256-GCM, key from PBKDF2-SHA256).
   Nothing readable is in the HTML until the right password decrypts it. */
(() => {
  const d = document;
  const main = d.querySelector('[data-protected]');
  const payloadEl = d.getElementById('protected-payload');
  if (!main || !payloadEl) return;

  const payload = JSON.parse(payloadEl.textContent);
  const STORE = 'mei-unlock';
  const form = d.getElementById('gate-form');
  const input = d.getElementById('gate-password');
  const btn = d.getElementById('gate-submit');
  const err = d.getElementById('gate-error');
  const toggle = d.getElementById('gate-toggle');
  const gate = d.querySelector('.gate');

  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const store = {
    get() { try { return sessionStorage.getItem(STORE); } catch { return null; } },
    set(v) { try { sessionStorage.setItem(STORE, v); } catch { /* storage blocked: ignore */ } },
    clear() { try { sessionStorage.removeItem(STORE); } catch { /* ignore */ } },
  };

  async function decrypt(password) {
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.ct));
    return new TextDecoder().decode(plain);
  }

  function reveal(html, focus) {
    main.innerHTML = html;
    main.removeAttribute('data-protected');
    window.scrollTo(0, 0);
    if (window.MeiSite) window.MeiSite.initContent();
    if (focus) {
      const h = d.getElementById('cs-title');
      if (h) h.focus({ preventScroll: true });
    }
  }

  async function attempt(password, fromStore) {
    try {
      const html = await decrypt(password);
      store.set(password);
      reveal(html, !fromStore);
      return true;
    } catch {
      if (fromStore) store.clear();
      return false;
    }
  }

  // Already unlocked in this tab? Open straight away.
  const saved = store.get();
  if (saved) attempt(saved, true);

  if (toggle) toggle.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    input.focus();
  });

  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); err.textContent = ''; });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const pw = input.value.trim();
    if (!pw) { err.textContent = 'Enter the password to continue.'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    if (!window.crypto || !crypto.subtle) { err.textContent = 'This browser can’t unlock the page. Try a recent Chrome, Safari or Firefox.'; return; }
    btn.disabled = true; btn.textContent = 'Unlocking…';
    const ok = await attempt(pw, false);
    if (!ok) {
      btn.disabled = false; btn.textContent = 'Unlock';
      err.textContent = 'That password didn’t work. Check it and try again.';
      input.setAttribute('aria-invalid', 'true');
      gate.classList.remove('is-shake'); void gate.offsetWidth; gate.classList.add('is-shake');
      input.select();
    }
  });
})();
