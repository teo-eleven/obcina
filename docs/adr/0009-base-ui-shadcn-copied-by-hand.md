# 0009. Primitive de interfață: Base UI, componente shadcn copiate manual

Date: 2026-11-11

## Status

Accepted

## Context

Sertarul de coș (pasul 3.5) e primul element care are nevoie de comportamentul unui dialog: focus
prins înăuntru, închidere cu Escape și cu clic în afară, focusul întors pe butonul care l-a deschis,
roluri ARIA corecte. Scris de mână, e ușor de greșit și greu de testat complet. Teodor a cerut ca
primitivele de interfață să fie componente shadcn copiate manual, construite pe Base UI (nu Radix),
și ca regula „o componentă pe fișier” să rămână fără excepții.

Pagina de start are o marjă mică la Lighthouse (performanță 90–92), iar `npm run check:bundle` cere
ca Firebase și zod să nu ajungă în codul încărcat prima dată.

## Decision

- **`@base-ui/react`** (fixat la versiunea exactă, ca restul dependențelor de producție critice) dă
  comportamentul accesibil; aspectul îl dăm noi, doar cu tokenurile de brand.
- **Componentele shadcn se copiază manual**, nu cu CLI-ul shadcn: sursa e citită, adaptată la Base UI
  și la tokenurile noastre, și pusă în `src/components/ui/<primitivă>/`, **câte un fișier pe piesă**
  (`Sheet.tsx`, `SheetContent.tsx`, `SheetTitle.tsx`…), cu `index.ts`. Copiem doar piesele folosite.
- **Ce are nevoie de Base UI și de date se încarcă la prima folosire.** Butonul coșului din header e
  un buton simplu; sertarul (Base UI + citirea produselor din Firestore) se descarcă la primul clic.

## Consequences

- Comportamentul de dialog e testat de autorii Base UI; noi testăm doar ce adăugăm (conținut, texte,
  întoarcerea focusului pe butonul nostru).
- Fiecare primitivă nouă (Dialog, Select, Tooltip…) urmează același model: copiată manual, un fișier pe
  piesă, doar tokenuri de brand. Testul de structură o păzește ca pe orice altă componentă.
- Prima deschidere a sertarului așteaptă descărcarea fragmentului lui (câteva sute de ms pe o rețea
  lentă); butonul arată că se încarcă, iar deschiderile următoare sunt instant.
- O dependență nouă de producție: intră în auditul din CI și în actualizările lunare Dependabot.
- **Căutarea din header (4.1, 2026-11-25) urmează același model:** Autocomplete din Base UI are ~60 KB
  gzip, deci header-ul arată întâi o căsuță simplă (Enter caută deja), iar autocomplete-ul se descarcă
  la primul hover sau focus și o înlocuiește, cu textul și focusul păstrate (testat E2E în
  `e2e/search.spec.ts`). Prima încărcare crește doar cu ~3 KB gzip. Ales de Teodor în locul unui
  combobox scris de mână (care cerea o excepție de lint) sau al lui Base UI în fragmentul principal.
