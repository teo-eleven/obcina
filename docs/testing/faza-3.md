# Raport de testare — Faza 3: Coș

**Data:** 2026-11-24 · **Branch:** `poarta-f3` · **Tester:** Claude

## Rezumat

**Trece**, fără buguri deschise. Toată suita automată e verde; bateria adversarială (16 verificări în
browser real) trece. Două decizii luate la poartă (Teodor): optimizarea performanței se face **acum**,
ca pas nou 3.8, înainte de F4; din fazele finale **nu se taie nimic**, Teodor lucrează mai mult.

Două probleme de mediu găsite și rezolvate în timpul porții (nu sunt buguri ale aplicației): portul
8080 ocupat de altă aplicație locală (emulatorul mutat pe 8180, PR #19) și graful local `graphify`,
pe care Prettier îl verifica (adăugat în `.gitignore`).

## Jurnal de verificări

Fiecare rând vine dintr-o rulare reală pe `main` după pasul 3.7.

| Verificare                                   | Rezultat | Detalii                                                                                                             |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| Teste unitare + integrare (`/test-coverage`) | [PASS]   | 978 teste în 50 de fișiere; acoperire 100% instrucțiuni / ramuri / funcții / linii                                  |
| Reguli Firestore                             | [PASS]   | 64 teste în emulator (8180); nicio colecție nouă în F3 (coșul trăiește în browser până la F5)                       |
| E2E (toate fluxurile)                        | [PASS]   | 167 trecute, 21 sărite (intenționat), 0 picate, 4 profiluri; vezi „Lecție de mediu” mai jos                         |
| `/quality-gate . --strict`                   | [PASS]   | oxlint 0 diagnostice; Prettier curat; `tsc -b --force` curat                                                        |
| Happy path                                   | [PASS]   | raft → „Adaugă în coș” → sertar → „Vezi coșul” → `/cos` → + / cantitate scrisă → „Scoate” → reîncărcare (E2E)       |
| Limite și date corupte                       | [PASS]   | `localStorage`: non-JSON, 2 MB (refuzat fără parsare, limita de 8 KB), `__proto__`; câmp: emoji, ăîș, 999999, −5, 0 |
| Adversarial                                  | [PASS]   | preț strecurat în coș ignorat (prețul vine din catalog); script în id refuzat de `parseCart`; niciun dialog         |
| Concurență și haos                           | [PASS]   | 8 clicuri rapide pe un produs cu stoc 3 → 3; două taburi: adăugat într-unul, apare în celălalt; scos → urmează      |
| Rețea                                        | [PASS]   | Firestore oprit pe `/cos` → eroare + „Încearcă din nou” → coșul revine; sertarul: descărcare eșuată → mesaj         |
| Manual — desktop                             | [PASS]   | header, sertar, `/cos` (corectare automată pe date reale), pagini de produs                                         |
| Manual — mobil 375px                         | [PASS]   | fără scroll orizontal pe `/`, raft, produs, `/cos`, 404 (verificat automat)                                         |
| Manual — Safari                              | n/a      | Safari real neverificat manual; WebKit (desktop + telefon) rulează toată suita E2E, inclusiv focusul                |
| Doar tastatura                               | [PASS]   | sertar: focus prins, Escape, focus înapoi pe buton (E2E); `/cos`: focus după „Scoate” (unit); limita de stoc        |
| Consolă fără erori                           | [PASS]   | impus în fiecare test E2E; o singură excepție îngustă: WebKit la reîncărcare (canalul Firestore, vezi 3.7)          |
| Sincronizare UI ↔ Firestore                  | [PASS]   | prețuri și stoc din catalog; produsul epuizat din emulator scos automat din coș, cu mesaj                           |
| `security-reviewer` (OWASP)                  | [PASS]   | 0 critice / mari; 2 medii deja programate la 6.1 (vezi Securitate)                                                  |
| `npm audit` + CodeQL                         | [PASS]   | producție 0; 16 moderate doar în unelte (ADR 0004, 0006); override gRPC încă necesar (Firestore cere `~1.9.0`)      |
| `code-reviewer`                              | [PASS]   | rulat pe fiecare pas al fazei (3.1–3.6); la poartă nu, după regula de economie (un singur agent pe PR)              |
| Lighthouse (mobil, mediana din 3)            | [PASS]   | `/` 91 · 404 96 · raft 89 · produs 89 (CI: 87 / 87); A11y 100, BP 96–100, SEO 100 — marjă mică, vezi riscul 1       |

### Lecție de mediu (nu bug)

Prima rulare E2E a dat 17 eșecuri, toate în teste care citesc catalogul: rulasem în paralel testele
regulilor Firestore pe **același** emulator, iar `@firebase/rules-unit-testing` golește baza. Cu
suita rulată singură: 167 trecute, 0 picate. Regula de acum: `test:rules` și E2E nu rulează în paralel
pe același emulator (în CI sunt joburi separate, fiecare cu emulatorul lui).

## Ce am testat manual

- Pe emulator: un coș cu un produs epuizat (brânză în coajă de brad) și cătina la tot stocul →
  `/cos` scoate brânza într-o singură scriere și spune „Am actualizat coșul”; cătina arată limita.
- În câmpul de cantitate: „40” pentru mierea de tei (stoc 25) → 25 și „Mai sunt doar 25 buc.”.
- Sertarul din tastatură: Enter pe „Coș 3”, focus pe „Închide”, „Scoate” anunțat, Escape.

## Bateria adăugată în suită

- `e2e/cart.spec.ts`: clic pe card fără navigare, focus la limită (dovedit că pică cu `disabled`),
  sertarul din tastatură, călătoria completă cu reîncărcare (dovedit că pică fără salvare).
- Scriptul adversarial al porții (`localStorage` falsificat, două taburi, clicuri rapide, câmp,
  rețea, 375 px) e păstrat pentru porțile următoare.

## Securitate

- **Curat:** coșul ține doar `{ productId, quantity }`; prețul, numele și stocul vin din catalog.
  `parseCart` limitează intrarea nesigură (8 KB, 500 de intrări, 50 de linii, 99 / linie, slug valid),
  fără prototype pollution (Map). Nicio cale de XSS (fără `innerHTML`; linkurile din slug-uri validate).
  Logurile nu conțin datele coșului. Dependența nouă `@base-ui/react` 1.9.0: fixată, fără scripturi
  de instalare, audit 0.
- **Programat la 6.1 (MEDIUM):** antete de securitate și CSP (`vercel.json`); App Check + alertă de
  buget (citirile publice din Firestore).
- **Garantat la 6.3 / 6.4 (notat în PLAN):** serverul acceptă doar `{ productId, quantity }[]`,
  revalidat cu zod (slug, 1..99, ≤ 50 linii, dedup, limită de mărime); prețuri și transport doar din
  Firestore prin Admin SDK; stocul verificat și scăzut într-o tranzacție; cheie de idempotență,
  limitare de rată, CORS restrâns; corpul cererilor nu se loghează.

### Riscuri acceptate

1. Datele coșului sunt în browser și pot fi editate; serverul nu le va crede niciodată (F6).
2. Citirile din Firestore sunt publice până la App Check (6.1); listele sunt limitate la 100.
3. 16 vulnerabilități moderate în unelte de dezvoltare; producția are 0.

## Anticipare riscuri & profilaxie

| Risc (peste 6–12 luni)                                                      | Tip         | Ce am făcut deja / pasul din plan care îl tratează                                                  |
| --------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| Paginile cu date coboară sub pragul Lighthouse pe măsură ce adăugăm funcții | Performanță | pas nou **3.8** (decis la poartă): Firestore Lite + `zod/mini`, înainte de F4; `check:bundle` în CI |
| Clientul trimite un coș falsificat la checkout                              | Securitate  | coșul ține doar id + cantitate; garanțiile serverului notate la 6.3 / 6.4                           |
| Coșul anonim și cel din cont se ciocnesc la login                           | Concurență  | `cartStore.replace` (o singură scriere, validată) e gata pentru îmbinarea de la 5.4                 |
| Un test care golește emulatorul strică altul rulat în paralel               | Teste       | regula notată mai sus; CI rulează `rules` și `e2e` în joburi separate                               |

## Buguri găsite

Niciun bug deschis. Bugurile găsite în timpul pașilor au fost reparate atunci, fiecare cu un test
(review-urile pașilor 3.1–3.6): `NaN` în subtotal pentru o linie stricată (3.1), store nesincronizat
fără abonați și `localStorage.clear()` ignorat (3.3), focus pierdut la ultimul clic (3.4), descărcarea
eșuată a sertarului dărâma pagina (3.5), chei duplicate în mesaje și mesaj înlocuit (3.6), Enter + blur
ștergea mesajul din câmp (3.6), coș cu peste 30 de produse diferite (citiri în loturi, 3.5).

## Amânate (doar severitate mică)

- Lista din sertar trece scurt prin „Se încarcă…” când altă filă adaugă un produs cât e deschis (rar,
  date corecte).
- Bug #5 (dublu-clic pe WebKit mobil emulat, din F2) rămâne deschis, neschimbat.
