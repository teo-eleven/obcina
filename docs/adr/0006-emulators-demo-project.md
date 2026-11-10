# 0006. Emulatoarele rulează sub proiectul demo `demo-obcina`

Date: 2026-11-06

## Status

Accepted (detaliază ADR 0003)

## Context

Pasul 2.2 cere ca datele de test să nu atingă proiectul real (`obcina-4f2a1`). Emulatoarele pot
rula sub orice ID de proiect; dacă folosesc ID-ul real, o greșeală de configurare (emulator oprit,
conectare uitată) trimite scrierile de test în producție.

## Decision

- Emulatoarele pornesc cu `--project demo-obcina`. Firebase tratează orice proiect `demo-` ca
  offline: nu are credențiale, iar orice serviciu neemulat refuză cererea.
- Modul emulator se alege cu `VITE_USE_EMULATORS=true`, din `.env.emulators` (`npm run dev:emulators`).
  Fișierul e în git: conține doar steagul, fără chei. În acest mod aplicația
  folosește `EMULATOR_CONFIG` (proiectul demo) și ignoră complet valorile din `.env.local`.
- Un build cu `MODE === 'production'` (cel de pe Vercel) refuză steagul cu o eroare clară: altfel
  fiecare vizitator ar fi trimis la propriul 127.0.0.1, cu erori de rețea greu de înțeles. Nu
  folosim „doar în dev”, pentru că la 2.11 E2E rulează pe un build `--mode emulators`.
- `firestore.rules` e închis pentru tot, ca proiectul real; regulile adevărate vin la 2.10.
- Porturile (Firestore 8080, Auth 9099, UI 4000) sunt în `firebase.json` și în
  `src/lib/firebaseConfig.ts`; `emulatorSetup.test.ts` pică dacă se despart.
- `firebase-tools` 15.34.1, fixat exact, ca dependență de dezvoltare. Aduce 12 vulnerabilități
  **moderate** noi (total 16 în dev: `@opentelemetry/core`, `glob`, `minimatch`, `uuid`), zero mari.
  Le acceptăm: rulează doar local, pe 127.0.0.1, fără input de la utilizatori; gate-urile din CI
  (producție 0, dev fără mari) trec. Reevaluare la fiecare poartă, odată cu ADR 0004.
- Scripturile de instalare ale `protobufjs`, `re2` și `@firebase/util` sunt refuzate explicit în
  `package.json` (`allowScripts`), ca blocarea să fie la fel pe orice mașină. Nu ne trebuie:
  emulatoarele pornesc fără ele, iar `re2` vine cu binarul gata compilat.

## Consequences

- Verificat pe 2026-11-06: din browser, toate cererile merg la `127.0.0.1:8080` sub
  `projects/demo-obcina`, niciuna la Google.
- Datele din emulator dispar la oprire; seed-ul de la 2.6 le reface.
- CI-ul poate rula E2E pe emulator fără niciun secret (2.11).
