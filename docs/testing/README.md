# Poarta de testare

La finalul fiecărei faze din [PLAN.md](../PLAN.md), Claude ia rolul de **tester** și verifică
**toată aplicația**, nu doar ce s-a adăugat în fază. O fază e închisă doar când poarta trece.

Testele se **rulează**, nu se simulează: fiecare rezultat din jurnal vine dintr-o comandă
sau dintr-o acțiune reală în browser.

## Pregătire

- [ ] Toți pașii fazei sunt în `main` (un PR pe pas, ADR 0008); branch-ul porții e tăiat din `main` la zi,
      `npm run check` trece, CI e verde (inclusiv CodeQL și audit).
- [ ] Emulatorul Firebase pornit cu date proaspete (`npm run seed`), din F2 încolo.
- [ ] Aplicația pornită pe http://localhost:5180.

## 1. Teste automate

- [ ] `/test-coverage` (kit): `npm run test:coverage` — toate trec, acoperire ≥ 80%, fără fișiere
      sub prag.
- [ ] `npm run test:e2e` — **toate** fluxurile E2E, inclusiv cele din fazele anterioare.
      Rulează pe emulator (Java 21+): îl pornește singur sau îl refolosește pe cel deschis și face seed.
- [ ] `/quality-gate . --strict` (kit): formatare, lint, tipuri, fără avertismente.

## 2. Bateria de teste pe categorii

Pentru tot ce există până la faza curentă. Fiecare categorie are cel puțin un test automat
care rămâne în suită; ce nu se poate automatiza se încearcă manual și se notează în jurnal.

| Categorie                  | Ce încercăm                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Happy path**             | fiecare flux, de la cap la coadă, ca un client obișnuit                                                    |
| **Limite și date corupte** | câmpuri goale, valori extreme, Unicode ciudat (diacritice, emoji), localStorage corupt, URL malformat      |
| **Adversarial**            | prețuri modificate din browser, ID-uri ale altui utilizator (IDOR), XSS în texte, reguli Firestore ocolite |
| **Concurență și haos**     | dublu-clic, două taburi deschise, cereri simultane, același eveniment trimis de 3 ori (idempotență)        |
| **Rețea**                  | rețea lentă, oprită în mijlocul fluxului, timeout, răspuns invalid de la server                            |

Unitar vs. E2E: logica și starea se testează unitar (Vitest); E2E (Playwright) doar ce cere un
browser real. Un caz nu se scrie pe ambele niveluri.

Ce se aplică depinde de fază (F1 nu are încă date sau server); categoriile care nu au încă
obiect se marchează „n/a” în jurnal, cu motivul.

## 3. Testare manuală în browser (ca un client)

Pe **desktop** și pe **mobil (375px)**:

- [ ] Fiecare pagină și fiecare flux din fazele terminate, de la cap la coadă.
- [ ] Doar tastatura: Tab prin toată pagina, focus vizibil, fără capcane de focus.
- [ ] Consola browserului fără erori sau avertismente ale aplicației.
- [ ] Sincronizări: datele din UI coincid cu cele din Firestore (coș, stoc, comenzi).
- [ ] Texte: română corectă, cu diacritice, fără „lorem ipsum” sau texte de test.
- [ ] Safari (manual, pe Mac sau iPhone) pentru fluxurile cu focus și formulare.

## 4. Securitate

- [ ] `security-reviewer` pe tot diff-ul fazei (`git diff main...HEAD`), cu verificare OWASP Top 10
      pe ce s-a adăugat (control acces, injecții, configurare, autentificare).
- [ ] `npm audit` fără vulnerabilități mari; CodeQL fără alerte noi.
- [ ] `overrides` din `package.json` încă necesare (ADR 0005): `npm ls @grpc/grpc-js`; dacă
      `@firebase/firestore` cere singur `>= 1.13.6`, override-ul se scoate.
- [ ] Nicio cheie secretă în cod, în bundle (`dist/`) sau în istoricul git.
- [ ] Regulile Firestore testate pentru ce s-a adăugat (din F2 încolo): `npm run test:rules` verde și
      jobul `rules` verde în CI; fiecare colecție nouă are teste pentru vizitator, utilizator și admin.

## 5. Calitate

- [ ] `code-reviewer` pe tot diff-ul fazei.
- [ ] `npm run lighthouse` (mobil, mediana din 3 rulări) peste pragurile din PLAN.md; rapoarte în
      `lighthouse-report/`.
- [ ] Fără scroll orizontal la 375px pe nicio pagină.

## 6. Anticipare riscuri & profilaxie

În raport, 2–4 riscuri care pot apărea pe măsură ce aplicația crește (performanță, securitate,
concurență, dependențe, migrări de date) și, pentru fiecare, ce am făcut **deja** în cod ca să le
prevenim sau în ce pas din plan le tratăm.

## 7. Raport și buguri

- Raportul se scrie în `docs/testing/faza-N.md` după [template.md](template.md), cu jurnalul
  `[PASS]` / `[FAIL]` al fiecărei verificări.
- Fiecare bug devine un **GitHub Issue** cu eticheta `bug` și `faza-N`: pași de reproducere,
  rezultat așteptat vs. obținut, captură de ecran, severitate.
- Bugurile se repară în aceeași fază: **cauza de fond**, un test care îl prinde, ce alte module
  pot fi afectate, apoi se re-rulează poarta (zero regresii).
- Poarta trece doar cu **zero buguri deschise** de severitate critică sau mare. Cele mici se pot
  amâna doar dacă sunt notate explicit în raport.
