# Reguli de lucru — Obcina

Regulile proiectului, scurte. Detaliile tehnice (comenzi, structură, ce verifică Claude) sunt în
[CLAUDE.md](CLAUDE.md); planul pas cu pas în [docs/PLAN.md](docs/PLAN.md).

## 1. Un pas = un branch = un PR mic

- Branch scurt din `main` la zi, numit după pasul din plan: `3.8-performanta`, `chore-…`, `docs-…`.
- Commit-uri mici: `feat: …`, `fix: …`, `refactor: …`, `test: …`, `docs: …`, `chore: …` (în engleză).
- Merge doar după CI verde (lint, typecheck, format, teste, reguli, E2E, Lighthouse) și review;
  doar squash merge; branch-ul se șterge automat ([ADR 0008](docs/adr/0008-one-pr-per-step-squash-merge.md)).

## 2. Structura codului

- **O componentă per fișier.** Subcomponentele unei singure pagini stau în folderul paginii.
- **Logica fără hooks stă în `utils/`**, niciodată în fișiere `.tsx`.
- Foldere pe tipuri, fiecare cu `index.ts`: `components/`, `hooks/`, `utils/`, `schemas/`, `types/`,
  `constants/`, `services/` (Firebase), `stores/`. Între foldere importăm prin `index.ts`, în același
  folder direct. Totul e păzit de `src/test/codeOrganisation.test.ts`.
- Fișiere mici (~200 de linii), funcții mici (~50 de linii).

## 3. Stil și design

- Tailwind doar cu tokenurile de brand (`src/styles/index.css`), fără culori hex în componente.
- Cod în engleză; textele pentru cumpărător în română, cu diacritice, **toate în `src/constants/`**
  (`commonText`, `homeText`, `catalogText`, `cartText`), niciodată scrise direct în componente sau în
  logică (păzit de `codeOrganisation.test.ts`).
- Componentele shadcn se copiază **manual**, pe Base UI ([ADR 0009](docs/adr/0009-base-ui-shadcn-copied-by-hand.md)).
- Formularele: React Hook Form + Zod. Parolele nu apar niciodată în loguri.
- Designul urmează direcția din [docs/BRAND.md](docs/BRAND.md) („etichetă de borcan”).

## 4. Pull request

- Descriere scurtă: **ce face, cum se testează, ce rămâne** (șablonul o cere).
- **Capturi doar cu ecranele schimbate** (desktop + mobil), în `docs/screenshots/<pas>/`.

## 5. Ce NU intră în repo

- `.env`, `.env.*` (doar `.env.example`), secrete, chei Stripe sau Firebase Admin.
- Notițe locale, ciorne de PR, planuri personale, demo-uri video, backup-uri.
- Configurări personale (`.claude/`, editor) și ce generează uneltele (`dist/`, rapoarte, `graphify-out/`).
