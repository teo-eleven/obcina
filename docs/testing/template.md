# Raport de testare — Faza N: <nume>

**Data:** YYYY-MM-DD · **Branch:** `faza-N/...` · **Commit:** `abc1234`

## Rezumat

<!-- Trece / Nu trece, într-o propoziție. -->

## Jurnal de verificări

Fiecare rând vine dintr-o rulare reală (comandă sau acțiune în browser).

| Verificare                                   | Rezultat              | Detalii                |
| -------------------------------------------- | --------------------- | ---------------------- |
| Teste unitare + integrare (`/test-coverage`) | [PASS] / [FAIL]       | N teste, X% acoperire  |
| E2E (toate fluxurile)                        | [PASS] / [FAIL]       | N scenarii             |
| `/quality-gate --strict`                     | [PASS] / [FAIL]       |                        |
| Happy path                                   | [PASS] / [FAIL]       |                        |
| Limite și date corupte                       | [PASS] / [FAIL] / n/a |                        |
| Adversarial                                  | [PASS] / [FAIL] / n/a |                        |
| Concurență și haos                           | [PASS] / [FAIL] / n/a |                        |
| Rețea                                        | [PASS] / [FAIL] / n/a |                        |
| Manual — desktop                             | [PASS] / [FAIL]       |                        |
| Manual — mobil 375px                         | [PASS] / [FAIL]       |                        |
| Manual — Safari                              | [PASS] / [FAIL]       |                        |
| Doar tastatura                               | [PASS] / [FAIL]       |                        |
| Consolă fără erori                           | [PASS] / [FAIL]       |                        |
| Sincronizare UI ↔ Firestore                  | [PASS] / [FAIL] / n/a |                        |
| `security-reviewer` (OWASP)                  | [PASS] / [FAIL]       |                        |
| `npm audit` + CodeQL                         | [PASS] / [FAIL]       |                        |
| `code-reviewer`                              | [PASS] / [FAIL]       |                        |
| Lighthouse (mobil)                           | [PASS] / [FAIL]       | Perf / A11y / BP / SEO |

## Ce am testat manual

<!-- Fluxurile parcurse și cazurile-limită încercate. -->

## Anticipare riscuri & profilaxie

| Risc (peste 6–12 luni) | Tip | Ce am făcut deja / pasul din plan care îl tratează |
| ---------------------- | --- | -------------------------------------------------- |

## Buguri găsite

| Issue | Severitate | Cauza de fond | Testul care îl prinde | Status |
| ----- | ---------- | ------------- | --------------------- | ------ |

## Amânate (doar severitate mică)

<!-- Ce rămâne și de ce. -->
