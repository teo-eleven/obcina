# 0008. Un PR pe pas, squash merge

Date: 2026-11-10

## Status

Accepted

## Context

În F1 și F2 am lucrat pe un branch pe fază (`faza-N/nume`), cu PR la final de fază și merge commit.
Rezultatul: PR-uri mari (15 commituri în F2), CI rulat pe GitHub abia la final, iar istoricul din
`main` se bifurca la fiecare merge (inclusiv la PR-urile Dependabot). Branch-urile terminate rămâneau
și pe GitHub, pentru că repo-ul nu le ștergea. Teodor a cerut un mod de lucru mai curat și mai
sistematic, cu mai puține branch-uri.

## Decision

- **Un branch scurt și un PR pe fiecare pas din PLAN** (ex. `3.2-transport`), tăiat dintr-un `main` la
  zi. Un singur branch de lucru deschis odată.
- Fiecare PR trece prin aceeași rutină: TDD → review cu agenții → `npm run check` → push → CI verde →
  **squash merge** → branch șters automat → `git pull` pe `main` → pasul următor.
- Repo-ul permite **doar squash merge**; titlul commitului e titlul PR-ului, corpul e lista
  commiturilor. Branch-urile se șterg automat după merge.
- Poarta de testare a fazei e și ea un PR (raportul `docs/testing/faza-N.md` + reparațiile).
- **Cine dă merge:**
  1. PR de pas obișnuit, CI verde, fără constatări critice/mari rămase → Claude, care raportează linkul.
  2. PR de poartă, de infrastructură/setări/flux de lucru, și pașii sensibili (auth, checkout, webhook,
     reguli Firestore, chei, asistentul AI) → doar după acordul lui Teodor.
  3. Teodor poate oricând să dea merge pe GitHub; înainte de pasul următor, Claude verifică `main`.
- **Dependabot lunar**, grupat: un PR cu actualizările npm minore/patch, unul pentru GitHub Actions;
  versiunile majore vin separat.

## Consequences

- `main` e liniar: un commit pe pas, cu numărul PR-ului (`feat: add shipping cost (#12)`).
- CI (inclusiv E2E pe emulator și Lighthouse) rulează pe fiecare pas, deci o regresie se vede imediat.
- Mai multe PR-uri, dar mici; fiecare se citește și se revizuiește în câteva minute.
- Commiturile intermediare din branch (reparații din review) nu ajung în `main`; mesajul lor rămâne
  în corpul commitului de squash.
- Înlocuiește regula „un branch pe fază” din `CLAUDE.md` și `PLAN.md`.
