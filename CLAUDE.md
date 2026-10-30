# Obcina — cămară de munte din Bucovina

Magazin online demonstrativ (proiect universitar, predare ~sfârșit de decembrie 2026).
Produse fictive, plăți doar în mod test. Brand și ton: `docs/BRAND.md`. Decizii: `docs/adr/`.

## Comenzi

- `npm run dev` — server local (http://localhost:5173)
- `npm run check` — lint + typecheck + format + teste (rulează înainte de orice commit)
- `npm run test:watch` / `npm run test:coverage`
- `npm run build` — build de producție

## Stack

Vite + React 19 + TypeScript strict + Tailwind v4 · Firebase (Firestore, Auth) ·
Vercel (`api/` = funcții de server) · Stripe Checkout în mod test · Vitest + Testing Library · oxlint + Prettier.

## Structură

- `src/pages/` — o componentă per pagină
- `src/components/` — componente reutilizabile
- `src/data/` — date statice (până la mutarea în Firestore)
- `src/test/setup.ts` — setup Vitest
- `api/` — funcții Vercel (din săpt. 5)

Testele stau lângă fișierul testat: `Foo.tsx` + `Foo.test.tsx`.

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

Un branch per etapă din plan (`week-N/descriere`), PR la final. Pentru fiecare funcționalitate:
`/plan` → teste întâi (`tdd-guide`) → implementare → `/code-review` + `typescript-reviewer` →
`security-reviewer` pentru auth, checkout, webhook și reguli Firestore.
