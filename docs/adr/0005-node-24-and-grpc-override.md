# 0005. Node 24 și `@grpc/grpc-js` forțat la versiunea reparată

Date: 2026-11-06

## Status

Accepted

## Context

La pasul 2.1 am instalat `firebase` 13.1.0 (fixat exact; 13.2.0 avea doar 4 zile). Două probleme:

- **Node:** pachetele `@firebase/*` din 13.x declară `engines: node >= 24.12.0`. Proiectul era pe
  Node 22 (`.nvmrc`, `engines >= 22.22.0`), iar CI-ul citește `.nvmrc`. Browserul nu e afectat,
  dar scripturile Node din F2 (seed la 2.6, teste pe emulator) ar rula pe o versiune nesuportată.
- **Audit:** `@firebase/firestore` 4.19.0 cere `@grpc/grpc-js ~1.9.0` (1.9.16), cu două
  vulnerabilități mari (GHSA-m9gg-hp2v-232j, GHSA-f596-whhp-79r4, reparate în 1.13.6). Ambele țin
  de partea de _server_ gRPC, iar `grpc-js` intră doar în varianta Firestore pentru Node, nu în
  build-ul pentru browser. CI-ul blochează totuși orice vulnerabilitate de producție.

## Decision

- Trecem pe **Node 24** (LTS): `.nvmrc` = 24, `engines: node >= 24.12.0`.
- Forțăm **`@grpc/grpc-js` 1.13.7** cu `overrides` în `package.json`. Am verificat că Firestore
  pentru Node merge cu ea: o citire pe proiectul real a ajuns la server și a primit
  `permission-denied` (regulile sunt închise), nu o eroare de transport.
- Dependabot ignoră versiunile majore de `@types/node`: tipurile urmează Node din `.nvmrc` și se
  actualizează împreună, de mână.

## Consequences

- `npm audit --omit=dev` = 0; gate-ul din CI rămâne neschimbat.
- Override-ul se scoate când `@firebase/firestore` cere singur `@grpc/grpc-js >= 1.13.6`; se verifică
  la poarta fiecărei faze (`npm ls @grpc/grpc-js`).
- Proiectul Vercel trebuie setat tot pe Node 24 (pasul 6.1), ca funcțiile din `api/` să ruleze pe
  aceeași versiune ca CI-ul.
- Dacă Firestore în Node se comportă ciudat (seed, emulator), primul suspect e override-ul.
