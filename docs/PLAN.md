# Plan de implementare — pași mici

Ce construim: [PRD.md](PRD.md). Acest fișier spune **în ce ordine**. Îl actualizăm la fiecare pas terminat.

## Ritm

- **2–3 ore pe zi, zile flexibile.** Planul numără pași, nu zile din calendar.
- **Un pas ≈ 1 oră** → 2 pași pe zi de lucru. Un pas e terminat doar când „Gata când” e adevărat,
  `npm run check` trece și pasul e într-un commit.
- **Un branch pe fază** (`faza-N/nume`), câte un commit pe pas. La final de fază: testare → PR → merge în `main`.
- Predare: ~sfârșit de decembrie. Dacă rămânem în urmă, tăiem de la coadă (F10, apoi F9), niciodată din MVP (F1–F7).

## Poarta de testare (la finalul fiecărei faze)

Nu începem faza următoare până când faza curentă nu trece poarta. Procedura completă:
[testing/README.md](testing/README.md). Pe scurt:

1. **Teste automate + E2E** — toată suita și Playwright pe toate fluxurile de până acum, nu doar pe cele noi.
2. **Testare manuală în browser** — Claude folosește aplicația ca un client, pe desktop și mobil (375px).
3. **Review de securitate** — `security-reviewer` pe tot ce s-a schimbat în fază.
4. **Audit Lighthouse + accesibilitate** — pe mobil, cu pragurile de mai jos.
5. **Raport** în `docs/testing/faza-N.md`; fiecare bug devine un GitHub Issue.
6. Bugurile se repară **în aceeași fază**, apoi se re-testează. Abia apoi PR și merge.

Praguri Lighthouse (mobil): Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90, Performance ≥ 85
(≥ 90 la F11).

---

## F0 — Fundație ✅

Setup Vite + React + TS + Tailwind, branding, pagina de start, CI, PRD, repo GitHub.

## F1 — Schelet și aspect „etichetă de borcan”

| #      | Pas                                                           | Gata când                                         |
| ------ | ------------------------------------------------------------- | ------------------------------------------------- |
| 1.1 ✅ | React Router + layout comun (header, footer, skip link)       | `/` și o rută de test folosesc același layout     |
| 1.2 ✅ | Pagină 404 ilustrată                                          | o rută inexistentă arată 404, cu link înapoi      |
| 1.3 ✅ | Textură de hârtie + chenar de etichetă (componentă `Label`)   | vizibile pe pagina de start, contrast AA păstrat  |
| 1.4    | Iconițe SVG desenate pentru cele 6 categorii                  | fiecare categorie are iconiță, `aria-hidden`      |
| 1.5    | Restilizare pagina de start în stilul nou                     | arată ca în BRAND.md pe 375px și desktop          |
| 1.6    | Meniu mobil (hamburger accesibil)                             | se deschide/închide cu tastatura, focus gestionat |
| 1.7    | Playwright instalat + primul E2E (navigare, 404, meniu mobil) | `npm run test:e2e` trece local și în CI           |
| 1.8    | Lighthouse CI configurat (`npm run audit`)                    | raport generat, praguri aplicate                  |
| 🧪     | **Poarta de testare F1**                                      | raport `faza-1.md`, zero buguri deschise          |

## F2 — Catalog

| #    | Pas                                                                       | Gata când                                                            |
| ---- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 2.1  | Proiect Firebase + config web în `.env.local`                             | aplicația se conectează, fără chei în cod                            |
| 2.2  | Firebase Emulator Suite (Firestore + Auth) local                          | `npm run emulators` pornește; datele de test nu ating proiectul real |
| 2.3  | Tipul `Product` + validare cu schemă (zod)                                | teste: produs invalid respins, preț întreg în bani                   |
| 2.4  | Conținut: 15–20 produse (texte, gramaj, ingrediente, prețuri)             | fișier seed revizuit, ton conform BRAND.md                           |
| 2.5  | Imagini: prompt-șablon AI pentru borcane + poze Unsplash pentru atmosferă | imagini optimizate (WebP), creditate în CREDITS.md                   |
| 2.6  | Script de seed în emulator                                                | `npm run seed` încarcă produsele, idempotent                         |
| 2.7  | Pagina de categorie (listă produse din Firestore)                         | stări: încărcare, gol, eroare; testate                               |
| 2.8  | Card de produs în stil etichetă (preț formatat RON, badge stoc)           | `formatPrice(1999)` → „19,99 lei”, testat                            |
| 2.9  | Pagina de produs (`/produs/:slug`)                                        | slug inexistent → 404                                                |
| 2.10 | Reguli Firestore: produse doar citire publică                             | testate în emulator: scrierea din client e respinsă                  |
| 2.11 | E2E: start → categorie → produs                                           | trece în CI cu emulatorul                                            |
| 🧪   | **Poarta de testare F2**                                                  | raport `faza-2.md`, zero buguri deschise                             |

## F3 — Coș

| #   | Pas                                                              | Gata când                                                        |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| 3.1 | Logica coșului, funcții pure (add / remove / setQty / total)     | TDD, 100% acoperire pe modul, imutabil                           |
| 3.2 | Calcul transport (19,99 lei, gratuit ≥ 200 lei)                  | teste la 199,99 și 200,00 lei                                    |
| 3.3 | Store de coș + persistență localStorage                          | supraviețuiește refresh-ului; date corupte → coș gol, fără crash |
| 3.4 | Buton „Adaugă în coș” + limită de stoc                           | nu poți depăși stocul; mesaj clar                                |
| 3.5 | Sertar de coș (mini-coș) în header, cu numărul de produse        | accesibil cu tastatura, anunță schimbările                       |
| 3.6 | Pagina `/cos` (cantități, eliminare, subtotal, transport, total) | stare de coș gol ilustrată                                       |
| 3.7 | E2E: adaugă, modifică, șterge, refresh                           | trece în CI                                                      |
| 🧪  | **Poarta de testare F3**                                         | raport `faza-3.md`, zero buguri deschise                         |

## F4 — Căutare și filtre

| #   | Pas                                                                | Gata când                                    |
| --- | ------------------------------------------------------------------ | -------------------------------------------- |
| 4.1 | Căutare după nume (fără diacritice: „dulceata” găsește „dulceață”) | testat cu și fără diacritice                 |
| 4.2 | Filtre: categorie, interval de preț, „în stoc”                     | se combină corect; teste                     |
| 4.3 | Sortare (preț, nume, noutăți)                                      | teste                                        |
| 4.4 | Starea filtrelor în URL                                            | link-ul copiat redeschide aceleași rezultate |
| 4.5 | E2E: caută, filtrează, sortează, distribuie link                   | trece în CI                                  |
| 🧪  | **Poarta de testare F4**                                           | raport `faza-4.md`, zero buguri deschise     |

## F5 — Cont

| #   | Pas                                                              | Gata când                                     |
| --- | ---------------------------------------------------------------- | --------------------------------------------- |
| 5.1 | Înregistrare + login email/parolă (Firebase Auth, în emulator)   | erori traduse în română                       |
| 5.2 | Login cu Google                                                  | funcționează pe proiectul real și în emulator |
| 5.3 | Rute protejate (`/cont`, checkout) cu redirect înapoi după login | testat                                        |
| 5.4 | Sincronizare coș anonim → cont la login                          | cantitățile se îmbină, stocul respectat       |
| 5.5 | Adrese de livrare salvate (validare formular)                    | reguli: fiecare își vede doar adresele lui    |
| 5.6 | E2E: înregistrare, login, coș sincronizat, adresă                | trece în CI                                   |
| 🧪  | **Poarta de testare F5**                                         | raport `faza-5.md`, zero buguri deschise      |

## F6 — Checkout și plată

| #   | Pas                                                          | Gata când                                |
| --- | ------------------------------------------------------------ | ---------------------------------------- |
| 6.1 | Proiect Vercel + deploy de preview din GitHub                | link live pentru fiecare PR              |
| 6.2 | Funcțiile `api/` + tsconfig + `firebase-admin`               | `api/health` răspunde; type-check în CI  |
| 6.3 | Calcul comandă pe server (prețuri + transport din Firestore) | TDD; prețurile din client sunt ignorate  |
| 6.4 | `api/checkout`: comandă `pending` + sesiune Stripe (test)    | redirect la Stripe cu suma corectă       |
| 6.5 | Pagina de checkout (adresă, sumar, buton „Plătește”)         | validare, stare de încărcare, erori      |
| 6.6 | Paginile de succes și anulare                                | succes nu marchează comanda plătită      |
| 🧪  | **Poarta de testare F6**                                     | raport `faza-6.md`, zero buguri deschise |

## F7 — Comenzi → **MVP complet**

| #   | Pas                                                      | Gata când                                                       |
| --- | -------------------------------------------------------- | --------------------------------------------------------------- |
| 7.1 | `api/webhook`: verificare semnătură Stripe               | semnătură invalidă → 400, testat                                |
| 7.2 | Comanda devine `paid` + stocul scade într-o tranzacție   | idempotent: același eveniment de 2 ori nu scade stocul de 2 ori |
| 7.3 | Plată refuzată (4000 0000 0000 0002) și comenzi expirate | comanda rămâne neplătită, stocul neatins                        |
| 7.4 | Istoric comenzi în `/cont` + detaliu comandă             | utilizatorul își vede doar comenzile lui                        |
| 7.5 | Reguli Firestore complete + teste de reguli              | toate cazurile din PRD acoperite                                |
| 7.6 | E2E complet: produs → coș → login → plată 4242 → istoric | trece în CI cu Stripe în mod test                               |
| 🧪  | **Poarta de testare F7 (MVP)**                           | raport `faza-7.md`; toate condițiile MVP din PRD bifate         |

## F8 — Coșuri cadou

| #   | Pas                                                   | Gata când                                                    |
| --- | ----------------------------------------------------- | ------------------------------------------------------------ |
| 8.1 | Model de produs compus + stoc = minimul componentelor | TDD                                                          |
| 8.2 | 3–4 coșuri cadou în seed + pagina lor                 | afișează ce conține fiecare coș                              |
| 8.3 | Webhook: la plată scad componentele                   | testat, inclusiv coș + produs separat din aceeași componentă |
| 🧪  | **Poarta de testare F8**                              | raport `faza-8.md`, zero buguri deschise                     |

## F9 — Panou de admin

| #   | Pas                                                 | Gata când                                |
| --- | --------------------------------------------------- | ---------------------------------------- |
| 9.1 | Rol `admin` (custom claims) + script de acordare    | doar adminul vede `/admin`               |
| 9.2 | Listă + editare produse (preț, stoc, texte)         | validare cu aceeași schemă ca pe server  |
| 9.3 | Adăugare produs nou cu imagine                      | apare imediat în catalog                 |
| 9.4 | Listă comenzi + schimbare status (trimisă, livrată) | reguli: doar adminul scrie statusul      |
| 🧪  | **Poarta de testare F9**                            | raport `faza-9.md`, zero buguri deschise |

## F10 — Asistent AI de cadouri

| #    | Pas                                                                         | Gata când                               |
| ---- | --------------------------------------------------------------------------- | --------------------------------------- |
| 10.1 | Set de evaluări (10–15 cereri + ce e corect) — înainte de prompt            | `npm run eval` rulează                  |
| 10.2 | `api/assistant`: Claude Haiku + prompt caching pe catalog                   | cheia doar pe server                    |
| 10.3 | Validare strictă a răspunsului (schemă, ID-uri în stoc, preț din Firestore) | răspuns invalid → coș clasic de rezervă |
| 10.4 | Limită de cereri și de lungime                                              | abuzul e respins cu mesaj clar          |
| 10.5 | Interfața asistentului + „Adaugă tot în coș”                                | accesibilă, stare de încărcare          |
| 🧪   | **Poarta de testare F10**                                                   | raport `faza-10.md`; evaluările trec    |

## F11 — Finisare și demo

| #    | Pas                                                                         | Gata când                                                        |
| ---- | --------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 11.1 | Stări de eroare și de încărcare peste tot, erori de rețea                   | nicio pagină albă                                                |
| 11.2 | SEO de bază (titluri, meta, Open Graph) pe fiecare pagină; 404 cu `noindex` | Lighthouse SEO ≥ 90                                              |
| 11.3 | Flag pentru plată simulată (rezervă pentru demo)                            | comutabil fără redeploy de cod                                   |
| 11.4 | Date curate pe producție + cont demo                                        | seed de producție verificat                                      |
| 11.5 | Scenariul de demo (5 minute) + repetiție                                    | parcurs cap-coadă pe link-ul live                                |
| 🧪   | **Poarta finală: testare cap-coadă a întregii aplicații**                   | raport `faza-11.md`; toate condițiile „Gata când” din PRD bifate |

---

## Estimare

66 de pași (~1 oră fiecare) + 11 porți de testare (~2–3 ore fiecare) ≈ 95 de ore. La 2–3 ore pe
zi și ~5 zile de lucru pe săptămână (~12 ore):

- **MVP (F1–F7):** ~66 de ore → ~5–6 săptămâni → mijlocul lui decembrie.
- **Tot planul (F1–F11):** ~95 de ore → ~8 săptămâni → sfârșitul lui decembrie, la limită.

Planul e strâns. Dacă după F3 suntem în urmă, decidem atunci ce tăiem din F8–F10.
