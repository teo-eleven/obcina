# Poarta de testare

La finalul fiecărei faze din [PLAN.md](../PLAN.md), Claude ia rolul de **tester** și verifică
**toată aplicația**, nu doar ce s-a adăugat în fază. O fază e închisă doar când poarta trece.

## Pregătire

- [ ] Branch-ul fazei e la zi, `npm run check` trece, CI e verde.
- [ ] Emulatorul Firebase pornit cu date proaspete (`npm run seed`), din F2 încolo.
- [ ] Aplicația pornită pe http://localhost:5180.

## 1. Teste automate

- [ ] `npm run test:coverage` — toate trec, acoperire ≥ 80%.
- [ ] `npm run test:e2e` — **toate** fluxurile E2E, inclusiv cele din fazele anterioare.

## 2. Testare manuală în browser (ca un client)

Pe **desktop** și pe **mobil (375px)**:

- [ ] Fiecare pagină și fiecare flux din fazele terminate, de la cap la coadă.
- [ ] Cazuri-limită: câmpuri goale, valori prea mari, dublu-click, refresh în mijlocul unui flux,
      buton Înapoi, rețea lentă/oprită, utilizator delogat în mijlocul fluxului.
- [ ] Doar tastatura: Tab prin toată pagina, focus vizibil, fără capcane de focus.
- [ ] Consola browserului fără erori sau avertismente ale aplicației.
- [ ] Sincronizări: datele din UI coincid cu cele din Firestore (coș, stoc, comenzi).
- [ ] Texte: română corectă, cu diacritice, fără „lorem ipsum” sau texte de test.

## 3. Securitate

- [ ] `security-reviewer` pe tot diff-ul fazei (`git diff main...HEAD`).
- [ ] Nicio cheie secretă în cod, în bundle (`dist/`) sau în istoricul git.
- [ ] Regulile Firestore testate pentru ce s-a adăugat (din F2 încolo).

## 4. Calitate

- [ ] `npm run audit` (Lighthouse, mobil) peste pragurile din PLAN.md.
- [ ] Fără scroll orizontal la 375px pe nicio pagină.

## 5. Raport și buguri

- Raportul se scrie în `docs/testing/faza-N.md` după [template.md](template.md).
- Fiecare bug devine un **GitHub Issue** cu eticheta `bug` și `faza-N`: pași de reproducere,
  rezultat așteptat vs. obținut, captură de ecran, severitate.
- Bugurile se repară în aceeași fază (cu un test care îl prinde), apoi se re-rulează poarta.
- Poarta trece doar cu **zero buguri deschise** de severitate critică sau mare. Cele mici se pot
  amâna doar dacă sunt notate explicit în raport.
