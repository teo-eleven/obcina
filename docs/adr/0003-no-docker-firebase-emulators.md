# 0003. Fără Docker; Firebase Emulator Suite pentru dezvoltare și teste

Date: 2026-11-02

## Status

Accepted

## Context

Ne-am întrebat dacă merită Docker. Aplicația nu rulează în containere nicăieri: frontend-ul și
`api/` sunt pe Vercel (serverless), datele pe Firebase (serviciu gestionat). Pentru teste avem
nevoie de o bază de date și un Auth izolate de proiectul real, cu date resetabile.
Docker Desktop nu e instalat; Java 21 este.

## Decision

- **Nu folosim Docker.** Nu ar rula nimic din ce ajunge în producție.
- **Firebase Emulator Suite** (Firestore + Auth), prin `firebase-tools` ca dependență de dezvoltare,
  pentru dezvoltare locală, teste de reguli, E2E și porțile de testare. Folosește Java-ul existent.
- **Stripe CLI** (Homebrew) pentru a trimite webhook-urile de test pe local.
- În CI, emulatoarele rulează direct pe runner-ul Ubuntu (are Java).

## Consequences

- Un singur lucru mai puțin de instalat și de întreținut; fără consum de RAM de la Docker Desktop.
- Testele nu ating niciodată proiectul Firebase real.
- Dacă vreodată mutăm `api/` pe un server propriu, reevaluăm Docker atunci.
