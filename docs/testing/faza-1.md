# Raport de testare — Faza 1: Schelet și aspect „etichetă de borcan”

**Data:** 2026-11-04 · **Branch:** `faza-1/schelet` · **PR:** [#1](https://github.com/teo-eleven/obcina/pull/1) · **Tester:** Claude

## Rezumat

**Trece.** Un bug găsit (severitate mică, accesibilitate) și reparat în fază, cu test. Zero buguri deschise.
O verificare rămâne la Teodor: o trecere manuală pe Safari real (acoperită automat de WebKit).

## Jurnal de verificări

Fiecare rând vine dintr-o rulare reală pe commit-ul final al fazei.

| Verificare                                   | Rezultat        | Detalii                                                                        |
| -------------------------------------------- | --------------- | ------------------------------------------------------------------------------ |
| Teste unitare + integrare (`/test-coverage`) | [PASS]          | 99 teste; acoperire 100% linii / ramuri / funcții / instrucțiuni               |
| E2E (toate fluxurile)                        | [PASS]          | 104 trecute, 20 sărite intenționat, 0 picate (4 profiluri, vezi mai jos)       |
| `/quality-gate . --strict`                   | [PASS]          | Prettier curat; oxlint 0 diagnostice; `tsc -b --force` pe 4 configurări        |
| Happy path                                   | [PASS]          | start → secțiuni → 404 → înapoi; meniu mobil; skip link                        |
| Limite și date corupte                       | [PASS]          | hash malformat, Unicode/emoji, cale de 2000 caractere, query necunoscut        |
| Adversarial                                  | [PASS]          | `<script>` în cale, markup în hash; mutant XSS introdus intenționat → prins    |
| Concurență și haos                           | [PASS]          | 9 apăsări rapide pe „Meniu”, dublu-clic pe linkuri, Înapoi/Înainte în rafală   |
| Rețea                                        | [PASS]          | resurse întârziate 800 ms; conexiune pierdută după încărcare → navigarea merge |
| Manual — desktop                             | [PASS]          | ordine focus, contur de focus, texte                                           |
| Manual — mobil 375px                         | [PASS]          | fără scroll orizontal; ținte ≥ 44 px                                           |
| Manual — Safari                              | n/a             | rămâne la Teodor (pe iPhone/Mac); WebKit automat trece în E2E                  |
| Doar tastatura                               | [FAIL] → [PASS] | bug #2 (contur de focus întârziat), reparat și re-testat                       |
| Consolă fără erori                           | [PASS]          | impus automat în fiecare test E2E (fixture „healthyPage”)                      |
| Sincronizare UI ↔ Firestore                  | n/a             | nu există încă date (F2)                                                       |
| `security-reviewer` (OWASP)                  | [PASS]          | 0 critice/mari; 2 medii rezolvate (vezi Securitate)                            |
| `npm audit` + CodeQL                         | [PASS]          | prod 0; total 5 moderate dev-only (ADR 0004); CodeQL 0 alerte                  |
| `code-reviewer`                              | [PASS]          | APPROVE; constatările utile aplicate                                           |
| Lighthouse (mobil, mediana din 3)            | [PASS]          | `/` 92 / 100 / 100 / 100 · 404 96 / 100 / 100 / 100 (Perf / A11y / BP / SEO)   |
| CI pe GitHub                                 | [PASS]          | check, e2e, lighthouse, CodeQL — toate verzi pe PR #1                          |

E2E pe profiluri:

| Profil           | Trecute | Sărite | Picate |
| ---------------- | ------- | ------ | ------ |
| desktop-chromium | 23      | 8      | 0      |
| desktop-webkit   | 23      | 8      | 0      |
| mobile-chromium  | 29      | 2      | 0      |
| mobile-webkit    | 29      | 2      | 0      |

Testele sărite sunt intenționate: meniul mobil nu există pe desktop, linkurile inline nu există pe telefon.

**Notă Lighthouse:** Performance pe `/` a fost 98–99 pe 2026-11-03 și 92 azi. Un test A/B în aceleași
condiții (cu și fără singura schimbare CSS din fază) a dat 92/96 în ambele cazuri; diferența vine din
încărcarea Mac-ului (load average 11–15), nu din cod. Pragul (85) rămâne cu marjă.

## Ce am testat manual

- Tab prin toată pagina de start și pagina 404, desktop: ordinea (skip link → logo → meniu → CTA),
  conturul de focus pe fiecare control, măsurat la momentul focusului și după 400 ms.
- Mobil 375 px: pagina de start derulată complet și pagina 404, fără scroll orizontal; măsurarea
  tuturor țintelor de atingere.
- Texte: română corectă, cu diacritice; fără texte de test.

## Bateria adăugată în suită

`e2e/resilience.spec.ts` rămâne în suită și rulează în CI. Două verificări au fost **demonstrate**
cu mutanți (cod stricat intenționat, apoi restaurat): testul de XSS prinde un sink `insertAdjacentHTML`
pe hash (alerta injectată e detectată pe Chromium și WebKit), iar testul de focus pica pe toate
cele 4 profiluri înainte de reparația bugului #2.

Un caz a fost mutat, nu ignorat: o **cale** cu codificare stricată (`/%E0%A4%A`) nu ajunge la aplicație;
`vite preview` răspunde 404 cu pagină goală. E comportament de host, verificat pe Vercel la pasul 6.1.

## Securitate

- **Rezolvat în fază:** acțiunile GitHub fixate pe SHA de commit (nu pe tag-uri care pot fi mutate);
  Dependabot pentru acțiuni și npm; CI pică și la vulnerabilități mari în uneltele de dezvoltare.
- **Curat:** fără secrete în cod, `dist/` sau istoric; fără source maps în build; fără
  `dangerouslySetInnerHTML`; hash-ul ajunge doar în `getElementById`; workflow-urile au
  `contents: read` și folosesc `pull_request` (nu `pull_request_target`).
- **De făcut la 6.1 (deploy pe Vercel)**, trecut în PLAN:
  - antete: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
    `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cameră, microfon,
    locație interzise), `frame-ancestors 'none'`;
  - CSP întâi în Report-Only: `default-src 'self'`, `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data:`, `font-src 'self'`, `connect-src` cu hosturile Firebase, Stripe doar unde
    e nevoie, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`;
  - rewrite SPA pentru deep link-uri, status 404 real pentru căi necunoscute, fără source maps.
- **Mai târziu:** `noindex` pe `/cont` și `/admin` când apar (robots.txt nu protejează nimic);
  rapoartele Lighthouse încărcate ca artefact nu trebuie să audieze pagini cu sesiune.

## Anticipare riscuri & profilaxie

| Risc (peste 6–12 luni)                                                                    | Tip          | Ce am făcut deja / pasul din plan care îl tratează                                                    |
| ----------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| JavaScript-ul crește odată cu catalogul și coșul; TBT e deja ~490 ms pe telefon simulat   | Performanță  | Lighthouse cu prag în CI (pică sub 85); imagini WebP la 2.5; code-splitting pe rute și prag 90 la F11 |
| Dependențe sau acțiuni compromise (supply chain)                                          | Securitate   | acțiuni pe SHA, Dependabot, `npm audit` pe prod (orice) și dev (mari), CodeQL săptămânal              |
| Hostul de producție se comportă altfel decât `vite preview` (deep link, 404, URL stricat) | Dependențe   | testele de host mutate explicit la 6.1, cu criterii în PLAN                                           |
| Scor de performanță instabil pe runner-ele CI comune                                      | Concurență   | mediana din 3 rulări; marjă de 7–14 puncte față de prag; job separat, cu raport la fiecare rulare     |
| Produsele din Firestore vin cu categorii necunoscute                                      | Migrări date | `CategorySlug` tipat (o categorie fără iconiță nu compilează); validare cu schemă la 2.3              |

## Buguri găsite

| Issue                                                                                            | Severitate | Cauza de fond                                    | Testul care îl prinde                                                | Status  |
| ------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------ | -------------------------------------------------------------------- | ------- |
| [#2](https://github.com/teo-eleven/obcina/issues/2) contur de focus întârziat, aproape invizibil | mică       | utilitarul `transition` animă și `outline-color` | `e2e/navigation.spec.ts` › „…shows the brand focus ring immediately” | reparat |

## Amânate (doar severitate mică)

- **Safari real (manual):** comportamentul specific Safari e acoperit automat de WebKit (inclusiv
  regresia meniului), dar o trecere pe un iPhone sau pe Safari pe Mac rămâne de făcut de Teodor:
  Tab până la „Meniu”, Enter, Escape, apoi apasă „Meniu” de două ori cu degetul/mouse-ul.
- **5 vulnerabilități moderate în unelte de dezvoltare** (lighthouse → @sentry → glob/minimatch):
  acceptate în ADR 0004, reevaluare la poarta fiecărei faze și cel târziu la 2026-12-01.
