# 0007. Seed-ul scrie cu Admin SDK și rulează cu `tsx`

Date: 2026-11-06

## Status

Accepted

## Context

Pasul 2.6 cere `npm run seed`: produsele din `src/data/seedProducts.ts` (acum `src/constants/seedProducts.ts`) încărcate în emulator,
idempotent, fiecare validat cu `productSchema`. Două lucruri nu mergeau „din cutie”:

- **Scrierea:** regulile Firestore refuză orice scriere din client (și vor rămâne așa pentru
  produse). SDK-ul de client nu poate scrie catalogul.
- **Rularea:** scriptul importă `productSchema` (valoare), care importă `../data/categories` (acum `../constants`) fără
  extensie, ca tot codul din `src/`. Node 24 rulează TypeScript direct (type stripping), dar nu
  completează extensii, așa că un import de valoare fără `.ts` pică. `scripts/images.ts` merge cu
  Node simplu doar pentru că importă din `src/` numai tipuri.

## Decision

- **`firebase-admin` 14.5.0** (fixat exact), ca dependență de dezvoltare. E SDK-ul de server, care
  trece de reguli; la pasul 6.2 se mută în `dependencies`, pentru funcțiile din `api/`.
- **`tsx` 4.23.15** (fixat exact) rulează `scripts/seed.ts` și rezolvă importurile fără extensie.
  Aduce `esbuild`, al cărui script de instalare e refuzat în `allowScripts`: binarul gata compilat
  vine din pachetele opționale `@esbuild/*`, iar scriptul doar îl verifică.
- **Doar emulatorul.** Admin SDK ignoră regulile, așa că seed-ul are două protecții:
  1. fixează singur `FIRESTORE_EMULATOR_HOST` (nu moștenește valoarea din shell) și folosește
     proiectul offline `demo-obcina`;
  2. `assertEmulatorOnly` (testat) refuză să pornească dacă proiectul nu e `demo-`, dacă
     `GOOGLE_APPLICATION_CREDENTIALS` e setat sau dacă `GCLOUD_PROJECT` / `GOOGLE_CLOUD_PROJECT`
     numesc un proiect real.
- Logica e pură și testată în `src/lib/catalog.ts` (acum `src/utils/catalog.ts`): `validateCatalog` (schema, slug-uri unice,
  componentele coșurilor există și sunt produse simple, catalog gol refuzat) și `planSync` (ce se
  scrie, ce se șterge). Scriptul face un singur batch, deci o eroare nu lasă baza pe jumătate.

## Consequences

- Verificat pe 2026-11-06: 20 de produse; a doua rulare dă o bază identică; un document vechi e
  șters; banii sunt salvați ca întregi; fără emulator, seed-ul iese cu codul 1 și un mesaj clar.
- Popularea proiectului real nu e acoperită aici; se decide la deploy (F6), cu credențiale și un
  flag explicit, nu prin acest script.
- Vulnerabilitățile moderate din uneltele de dezvoltare rămân 16 (ADR 0006); se reevaluează la
  poarta fazei.
