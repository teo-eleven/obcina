# Raport de testare — Faza 2: Catalog

**Data:** 2026-11-09 · **Branch:** `faza-2/catalog` · **Tester:** Claude

## Rezumat

**Trece**, cu un bug mic amânat explicit. Poarta a găsit un bug (#5, severitate mică), reparat parțial
și documentat ca risc acceptat, plus două defecte ale testelor, reparate. Zero buguri critice sau
mari. CI-ul pe GitHub, cu joburile noi (`rules`, `e2e` pe emulator), e verde (PR #6).

## Jurnal de verificări

Fiecare rând vine dintr-o rulare reală pe codul final al porții.

| Verificare                                   | Rezultat | Detalii                                                                                            |
| -------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| Teste unitare + integrare (`/test-coverage`) | [PASS]   | 525 teste; acoperire 100% instrucțiuni / ramuri / funcții / linii                                  |
| Reguli Firestore (`npm run test:rules`)      | [PASS]   | 64 teste în emulator: vizitator, utilizator, admin; 4 reguli prea permisive prinse (mutanți)       |
| E2E (toate fluxurile)                        | [PASS]   | 151 trecute, 21 sărite (20 intenționat, 1 `fixme` pentru #5), 0 picate, 4 profiluri, pe emulator   |
| `/quality-gate . --strict`                   | [PASS]   | Prettier curat; oxlint 0 diagnostice; `tsc -b --force` pe 6 configurări                            |
| Happy path                                   | [PASS]   | acasă → raft → produs → înapoi; raft de coșuri → coș → produs din coș (linkuri reale)              |
| Limite și date corupte                       | [PASS]   | slug invalid (`..`, `__name__`, `%2F`, spații) → 404 fără cerere; raft gol; document invalid sărit |
| Adversarial                                  | [PASS]   | markup/script în slug de produs și de categorie → 404, nimic executat; scrieri din client refuzate |
| Concurență și haos                           | [PASS]   | schimbare rapidă de raft (răspuns întârziat ignorat); dublu-clic pe produs → bug #5 (vezi mai jos) |
| Rețea                                        | [PASS]   | Firestore indisponibil → eroare + „Încearcă din nou” → produse; rețea lentă → stare de încărcare   |
| Manual — desktop                             | [PASS]   | toate rafturile și produsele, coșuri, 404                                                          |
| Manual — mobil 375px                         | [PASS]   | fără scroll orizontal pe acasă, raft, coș, produs epuizat, 404                                     |
| Manual — Safari                              | n/a      | fără formulare noi; WebKit (desktop + telefon) rulează toată suita E2E                             |
| Doar tastatura                               | [PASS]   | contur de focus imediat pe fiecare control: acasă, 404, raft, coș (16 teste E2E)                   |
| Consolă fără erori                           | [PASS]   | impus automat în fiecare test E2E; trecerea manuală prin 26 de pagini: 0 erori                     |
| Sincronizare UI ↔ Firestore                  | [PASS]   | 20 produse × (nume, titlu, preț, gramaj, stoc) și 6 rafturi × număr de produse, identice cu baza   |
| `security-reviewer` (OWASP)                  | [PASS]   | 0 critice/mari; 2 medii programate la 6.1 (vezi Securitate)                                        |
| `npm audit` + CodeQL                         | [PASS]   | producție 0; total 16 moderate, doar în unelte (ADR 0004, 0006); CodeQL după push                  |
| `code-reviewer`                              | [PASS]   | APPROVE; constatările medii aplicate în poartă (vezi mai jos)                                      |
| Lighthouse (mobil, mediana din 3)            | [PASS]   | `/` 92 · 404 96 · `/categorie/miere` 90 · `/produs/miere-de-tei` 89–90 (vezi nota)                 |
| CI pe GitHub                                 | [PASS]   | PR #6: check, `rules`, `e2e` pe emulator (6 min), lighthouse, CodeQL, toate verzi                  |

**Notă Lighthouse.** O primă rulare, cu Mac-ul încărcat (load average ~8), a dat 84 pe pagina de produs,
sub pragul de 85. Două rulări cu load ~3–4 au dat 90 și 89. Diferența vine din mașină, dar marja e mică:
pagina de produs descarcă fragmentul cu Firebase și zod (170 KB gzip) și apoi citește din Firestore, în
serie. Vezi riscul 1. Best Practices 96 pe raft și produs: auditul rulează fără emulator, așa că pagina
scrie o eroare de citire în consolă; pe site-ul cu reguli publicate eroarea nu apare.

## Ce am testat manual

- Toate cele 6 rafturi și cele 20 de produse, comparate automat cu documentele din emulator (citite
  direct, cu drepturi de admin): nume, titlu de tab, preț formatat, gramaj, insignă de stoc, număr de
  produse pe raft.
- Telefon 375 px: acasă, raftul de coșuri, coșul cu 6 produse, produsul epuizat, 404; fără scroll orizontal.
- Navigarea doar cu tastatura pe raft și pe coș; „← Înapoi la …”, linkurile din coș.

## Bateria adăugată în suită

- `e2e/catalog-resilience.spec.ts`: Firestore indisponibil cu revenire, rețea lentă (răspuns ținut până
  se vede starea de încărcare, nu un timp fix), URL-uri ostile, dublu-clic pe produs.
- `e2e/navigation.spec.ts`: conturul de focus verificat și pe un raft și pe pagina unui coș; un test
  păstrează mișcarea implicită, ca saltul lin la secțiune să fie verificat în browsere reale.
- `e2e/fixtures.ts`: orice `alert`/`confirm`/`prompt` pică testul (vezi „Defecte ale testelor”).
- Lighthouse audiază și pagina de produs.

## Securitate

- **Curat:** nicio cheie secretă în cod, în `dist/` sau în istoricul git; în build e doar config-ul web
  Firebase, public prin design. Slug-urile din URL se validează înainte de orice citire; datele trec prin
  schemă; randare React (escapată); imaginile doar din `/images/products/*.webp`.
- **Reguli:** citire publică doar pentru produse, liste doar cu `limit ≤ 100`, nicio scriere din browser,
  orice altceva refuzat implicit (64 de teste).
- **Emulator vs. proiect real:** proiect `demo-obcina`, gardă de producție pentru `VITE_USE_EMULATORS`,
  seed cu `assertEmulatorOnly`.
- **Override `@grpc/grpc-js` (ADR 0005):** încă necesar; Firestore cere tot `~1.9.0`.
- **Programat la 6.1:** antete de securitate și CSP, restricția cheii web la domeniile noastre, App
  Check, alertă de buget, publicarea regulilor pe proiectul real (cu acordul lui Teodor).

### Riscuri acceptate

1. Catalogul e public la citire (prin design); stocul se vede. Listele sunt limitate la 100.
2. Costul citirilor repetate e limitat doar de regula `limit` până la App Check și alerta de buget (6.1).
3. Cheia web Firebase e publică; restricția ei vine la 6.1.
4. 16 vulnerabilități moderate, doar în unelte de dezvoltare (firebase-tools, lighthouse); producția are 0.
5. Override-ul gRPC e o soluție fixată, reverificată la fiecare poartă.
6. Build-ul `--mode emulators` e doar pentru local și E2E; garda de producție îl refuză pe Vercel.

## Anticipare riscuri & profilaxie

| Risc (peste 6–12 luni)                                                                  | Tip         | Ce am făcut deja / pasul din plan care îl tratează                                                                                                            |
| --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paginile cu date (raft, produs) coboară sub pragul de performanță pe măsură ce cresc    | Performanță | ruta leneșă ține Firebase în afara paginii principale; prima linie de imagini eager; Lighthouse în CI pe raft și produs; Firestore Lite și `zod/mini` la 11.2 |
| Citiri abuzive sau un bot care umflă costurile Firestore                                | Securitate  | `limit ≤ 100` în reguli; App Check, alertă de buget și restricția cheii la 6.1                                                                                |
| Producția se comportă altfel decât emulatorul (config real, reguli publicate)           | Dependențe  | E2E pe emulator cu același cod; la 6.1 deploy de preview verificat cap-coadă și reguli reverificate pe proiectul real                                         |
| Datele raftului vin după afișare: Înapoi nu revine la poziție, iar stările se înmulțesc | Arhitectură | `useRemoteData` unic, cu stări testate; loadere de rută la 4.4 (atunci și restaurarea poziției)                                                               |

## Buguri găsite

| Issue                                               | Severitate | Cauza de fond                                                                                                                                            | Testul care îl prinde                                                                                       | Status                  |
| --------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| [#5](https://github.com/teo-eleven/obcina/issues/5) | mică       | React Router adaugă o intrare în istoric și pentru pagina curentă; pe WebKit mobil un dublu-clic rapid mai lasă rar una în plus, din motiv neidentificat | `OnceLink.test.tsx`; `catalog-resilience.spec.ts` › „double-clicking a product…” (`fixme` pe mobile-webkit) | reparat parțial; amânat |

### Găsite în timpul pașilor fazei (reparate atunci, cu teste)

- **2.7:** offline, raftul arăta „gol” în loc de eroare (`getDocs` răspundea din cache-ul gol) →
  `getDocsFromServer`; acum și testul E2E de rețea.
- **2.9:** pe telefon, un produs deschis de jos din raft pornea derulat (derularea lină globală era
  întreruptă de un reflow) → derulare lină doar pentru linkurile cu `#`.
- **2.11:** dublu-clic pe un link spre secțiune ajungea uneori pe un raft (`ScrollRestoration` sărea la
  secțiune înainte de afișare) → `useScrollOnNavigation`; 32/32 după reparație.

### Defecte ale testelor, reparate în poartă

- Detectarea scripturilor injectate (`failOnDialog`) arunca dintr-un handler de eveniment, ceea ce nu
  pica testul. Mutată în fixture-ul de sănătate; un test temporar cu `alert` a picat, cum trebuie.
- După scoaterea adaptorului `useCategoryProducts`, schimbarea raftului nu mai era testată; test nou,
  verificat cu un mutant (cheie constantă).

### Constatări din review aplicate în poartă

`OnceLink` (și pe linkul înapoi și pe componentele coșului; lasă în pace Ctrl/Cmd/clic de mijloc),
`LoadError` și `ProductImage` comune, `PRODUCT_IMAGE_SIZE` într-un singur loc, adaptorul
`useCategoryProducts` scos, comentariul din CI trimite la ADR 0004 și 0006.

## Amânate (doar severitate mică)

- **#5, restul:** pe WebKit mobil emulat, aproximativ 1 din 30–60 de dublu-clicuri sintetice lasă o
  intrare în plus în istoric (un Înapoi în plus). Dispare când pagina e instrumentată, deci cauza exactă
  nu e prinsă; pe iPhone real dublu-tap-ul înseamnă de obicei zoom. Testul rămâne în suită, `fixme` doar
  pe acel profil; issue-ul rămâne deschis.
- **Înapoi pe raft revine la început**, nu la poziția de plecare: cere loadere de rută (4.4).
- **16 vulnerabilități moderate în unelte de dezvoltare:** reevaluare la poarta F3.
