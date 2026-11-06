# Obcina — cămară de munte din Bucovina

Magazin online demonstrativ (proiect universitar, predare ~sfârșit de decembrie 2026).
Produse fictive, plăți doar în mod test.

**Citește întâi `docs/PRD.md`** (ce construim) **și `docs/PLAN.md`** (pasul curent, ce urmează).
Brand, ton și stil vizual: `docs/BRAND.md`. Decizii tehnice: `docs/adr/`.

## Comenzi

- `npm run dev` — server local (http://localhost:5180)
- `npm run emulators` — Firestore + Auth locale (proiect `demo-obcina`, UI pe http://127.0.0.1:4000)
- `npm run dev:emulators` — aplicația legată de emulatoare, nu de proiectul real (ADR 0006)
- `npm run check` — lint + typecheck + format + teste (rulează înainte de orice commit)
- `npm run test:watch` / `npm run test:coverage`
- `npm run build` — build de producție
- `npm run test:e2e` — Playwright pe build-ul de producție (Chromium + WebKit, desktop + telefon)
- `npm run images` — imaginile din `public/images/` (WebP), din originalele din `assets/` sau desene provizorii
- `npm run lighthouse` — Lighthouse pe mobil, pică sub praguri; rapoarte în `lighthouse-report/`

## Stack

Vite + React 19 + TypeScript strict + Tailwind v4 · Firebase (Firestore, Auth) ·
Vercel (`api/` = funcții de server) · Stripe Checkout în mod test · Vitest + Testing Library · oxlint + Prettier.

## Structură

- `src/pages/` — o componentă per pagină; `src/routes.tsx` — rutele (layout comun + pagini)
- `src/components/` — componente reutilizabile; `src/components/illustrations/` — desene SVG decorative
- `src/hooks/` — hook-uri React; `src/lib/` — funcții pure fără React (ex. `contrast.ts`)
- `src/data/` — date statice în cod (categoriile rămân aici; produsele merg în Firestore în F2)
- `src/styles/` — teste pe stiluri (contrastul tokenurilor de brand)
- `src/test/` — setup Vitest și `renderWithRouter` pentru componente care au nevoie de router
- `e2e/` — Playwright (`fixtures.ts`: pagină „sănătoasă”, `tabKey`, `isNarrow`)
- `scripts/` — unelte Node (Lighthouse); `api/` — funcții Vercel (din F6)

Testele stau lângă fișierul testat: `Foo.tsx` + `Foo.test.tsx`.

Convenții pentru componente:

- `className` controlează mărimea și poziția; mărimea implicită, dacă există, e înlocuită (nu combinată).
- Desenele sunt `aria-hidden` și stau în `components/illustrations/`.
- `data-label` / `data-stamp` sunt cârlige stabile pentru teste unde nu există un rol ARIA potrivit;
  în rest, testele caută după rol și text.
- Testele unitare acoperă logica și starea; E2E acoperă doar ce cere un browser real (focus,
  vizibilitate, scroll, WebKit, rețea). Nu duplica un caz pe ambele niveluri.

## Reguli ale proiectului

- **Bani în bani, nu în lei:** prețurile sunt numere întregi în bani (`1999` = 19,99 lei). Fără float.
- **Prețul se calculează pe server.** Clientul trimite doar `{ productId, quantity }`.
- **O comandă e `paid` doar din webhook-ul Stripe** cu semnătura verificată.
- **Secretele** (`STRIPE_*`, service account Firebase) doar în `.env.local` și în Vercel. Niciodată cu prefix `VITE_`.
- **Culori doar din tokenurile de brand** (`src/index.css` → `@theme`), fără hex în componente.
- **Texte de interfață în română, cu diacritice.** Cod, nume de variabile și commit-uri în engleză.
- **Accesibilitate:** un singur `h1` per pagină, etichete pe butoane și formulare, focus vizibil.
- **Mobil întâi:** verifică la 375px lățime, fără scroll orizontal.

## Mod de lucru

- **Pași mici:** lucrăm câte un pas din `docs/PLAN.md` (~1 oră). Un pas e gata doar când „Gata când”
  e adevărat, `npm run check` trece și e într-un commit. Bifează pasul în PLAN.md.
- **Un branch pe fază** (`faza-N/nume`), un commit pe pas, PR la final de fază.
- **Fiecare pas folosește agenții din kitul `~/Desktop/claude-code-starter-kit`** (nivel „maxim”, ales de
  Teodor):
  1. `tdd-guide` scrie testele care pică (RED), pornind de la „Gata când” al pasului.
  2. Implementare până trec (GREEN), apoi refactor; verificare vizuală în browser pe 375px și desktop.
  3. `typescript-reviewer` **și** `code-reviewer`, rulați în paralel pe diff-ul pasului.
  4. `security-reviewer` în plus când pasul atinge input de la utilizator, auth, checkout, webhook,
     reguli Firestore, chei sau asistentul AI.
  5. Constatările valide se repară cu un test care le prinde; cele respinse se explică.
- Skill-urile kitului se încarcă când pasul le atinge: `react-testing`, `react-patterns`,
  `frontend-patterns`, `security-review`, `api-design`, `error-handling`, `claude-api`, `eval-harness`.
- **Poarta de testare** la finalul fiecărei faze, după `docs/testing/README.md`: Claude e tester și
  verifică toată aplicația cap-coadă (happy path, limite, adversarial, concurență/haos, rețea,
  securitate OWASP), cu jurnal `[PASS]`/`[FAIL]` din rulări reale și secțiunea „Anticipare riscuri
  & profilaxie”. Fără poartă trecută, nu începem faza următoare.
- **Întrebările de decizie** se pun ca grilă cu variante și o recomandare, nu ca text liber.
- Docker nu se folosește (ADR 0003); testele rulează pe Firebase Emulator Suite.
