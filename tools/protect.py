#!/usr/bin/env python3
"""Encrypt a private case study into a password-protected page.

Usage:
  pip3 install cryptography
  python3 tools/protect.py                      # prompts for the password
  PORTFOLIO_PASSWORD=... python3 tools/protect.py

Reads   private/<slug>.html  (plaintext, git-ignored)
Writes  work/<slug>.html     (only ciphertext, safe to commit)
for every page listed in PAGES. All pages share one password.

The page shell (head, nav, footer) is taken from work/trueprofit.html so the
protected page always matches the rest of the site.
"""
import base64, getpass, json, os, re, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = os.path.join(ROOT, 'work', 'trueprofit.html')
ITER = 600_000

PAGES = {
    'research-os': {
        'title': 'Research OS: AI-assisted research, from signal to decision — Mei Nguyen',
        'desc': 'A password-protected case study about an AI-assisted research workflow at Optimizely. Under NDA.',
        'kicker': 'Case study 01 · Research OS · Optimizely',
        'lead': 'An AI-assisted research workflow, from scattered signals to evidence-backed product decisions. I designed the model and coded the MVP.',
        'subject': 'Research%20OS%20case%20study%20access',
    },
    'virtual-teammates': {
        'title': 'Virtual Teammates: governing AI agents across Opal and Admin Center — Mei Nguyen',
        'desc': 'A password-protected case study about modelling AI agents across Opal, the API and Admin Center. Under NDA.',
        'kicker': 'Case study 08 · Virtual Teammates · Optimizely',
        'lead': 'One AI teammate, three systems: how a new AI agent flows across Opal, the API and Admin Center, and how admins see it.',
        'subject': 'Virtual%20Teammates%20case%20study%20access',
    },
    'usage-billing-visibility': {
        'title': 'Usage & Billing visibility: Opal credit management V1 — Mei Nguyen',
        'desc': 'A password-protected case study about team credit budgets and threshold warnings in Admin Center and Opal. Under NDA.',
        'kicker': 'Case study 04 · Usage &amp; Billing visibility · Optimizely',
        'lead': 'Opal credit management V1: team budgets, threshold warnings and usage tracking, with UX metrics defined upfront.',
        'subject': 'Usage%20and%20Billing%20case%20study%20access',
    },
    'self-service-revenue': {
        'title': 'Self-service revenue: a product-led growth strategy — Mei Nguyen',
        'desc': 'A password-protected case study about a phased path from Sales-gated upgrades to self-service. Under NDA.',
        'kicker': 'Case study 06 · Self-service revenue · Optimizely',
        'lead': 'A product-led growth strategy: self-service for SMB and mid-market, intent data for enterprise, Sales refocused.',
        'subject': 'Self-service%20revenue%20case%20study%20access',
    },
    'admin-center-blueprint': {
        'title': 'Admin Center Experience Blueprint: access was 81% of tickets — Mei Nguyen',
        'desc': 'A password-protected case study: an experience blueprint for Optimizely Admin Center linking each access pain to evidence, a release and a metric. Under NDA.',
        'kicker': 'Case study 07 · Admin Center Blueprint · Optimizely',
        'lead': 'Access was 81% of support tickets. An experience blueprint linking each access pain to evidence, a release and a metric across Configure, Manage and Govern.',
        'subject': 'Admin%20Center%20case%20study%20access',
    },
}

GATE = '''
    <section class="gate wrap" aria-labelledby="gate-title">
      <a class="back" href="index.html"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M12 7H2M6 3 2 7l4 4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>All work</a>
      <p class="cs-kicker">{kicker} <span class="lock-tag" style="transform:none">Protected</span></p>
      <h1 class="gate__title" id="gate-title">This case is under NDA. <span class="muted">Enter the password to read it.</span></h1>
      <p class="gate__lead">{lead}</p>
      <form class="gate__form" id="gate-form" novalidate>
        <label for="gate-password">Password</label>
        <div class="gate__row">
          <div class="gate__field">
            <input class="gate__input" id="gate-password" name="password" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" required aria-describedby="gate-error gate-note">
            <button class="gate__toggle" id="gate-toggle" type="button" aria-pressed="false" aria-label="Show password">Show</button>
          </div>
          <button class="btn btn--primary gate__btn" id="gate-submit" type="submit">Unlock</button>
        </div>
        <p class="gate__error" id="gate-error" role="alert"></p>
      </form>
      <p class="gate__note" id="gate-note">Don’t have the password? Email <a href="mailto:bichthuan.des@gmail.com?subject={subject}">bichthuan.des@gmail.com</a> and I’ll send it.</p>
    </section>
'''

def b64(b): return base64.b64encode(b).decode()

def build(slug, cfg, pw, shell):
    src = os.path.join(ROOT, 'private', f'{slug}.html')
    out = os.path.join(ROOT, 'work', f'{slug}.html')
    plain = open(src, encoding='utf-8').read().encode()
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode())
    ct = AESGCM(key).encrypt(iv, plain, None)
    payload = json.dumps({'v': 1, 'iter': ITER, 'salt': b64(salt), 'iv': b64(iv), 'ct': b64(ct)})

    head, rest = shell.split('<main id="main" data-article>', 1)
    _, tail = rest.split('</main>', 1)
    head = re.sub(r'<title>.*?</title>', lambda m: f"<title>{cfg['title'].replace('&', '&amp;')}</title>", head)
    head = head.replace('<link rel="stylesheet" href="../assets/css/main.css">',
        '<link rel="stylesheet" href="../assets/css/main.css">\n  <link rel="stylesheet" href="../assets/css/cases.css">')
    head = re.sub(r'<meta name="description" content=".*?">', f"<meta name=\"description\" content=\"{cfg['desc']}\">\n  <meta name=\"robots\" content=\"noindex\">", head)
    tail = tail.replace('<a href="trueprofit.html" aria-current="page">', '<a href="trueprofit.html">')
    tail = tail.replace(f'<a href="{slug}.html">', f'<a href="{slug}.html" aria-current="page">', 1)
    tail = tail.replace('<script src="../assets/js/main.js" defer></script>',
        f'<script type="application/json" id="protected-payload">{payload}</script>\n'
        '  <script src="../assets/js/main.js" defer></script>\n'
        '  <script src="../assets/js/unlock.js" defer></script>')
    gate = GATE.replace('{kicker}', cfg['kicker']).replace('{lead}', cfg['lead']).replace('{subject}', cfg['subject'])
    html = head + '<main id="main" data-article data-protected>' + gate + '  </main>' + tail
    open(out, 'w', encoding='utf-8').write(html)
    print(f'Wrote {os.path.relpath(out, ROOT)} ({len(ct):,} bytes of ciphertext)')

def main():
    pw = os.environ.get('PORTFOLIO_PASSWORD') or getpass.getpass('Password: ')
    if len(pw) < 8:
        sys.exit('Use a password with at least 8 characters.')
    shell = open(SHELL, encoding='utf-8').read()
    for slug, cfg in PAGES.items():
        build(slug, cfg, pw, shell)

if __name__ == '__main__':
    main()
