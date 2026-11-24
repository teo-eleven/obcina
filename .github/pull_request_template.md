## Ce face

<!-- Una-două propoziții: ce s-a schimbat și de ce. Pasul din plan (ex. „3.6 — pagina /cos”). -->

## Cum se testează

<!-- Comenzi, pagini de deschis, cazuri-limită (inclusiv pe mobil, 375 px). -->

## Ce rămâne

<!-- Ce nu intră în acest PR și unde e notat (PLAN, issue). „Nimic” e un răspuns bun. -->

## Capturi

<!-- Doar ecranele schimbate de acest PR, desktop + mobil, în docs/screenshots/<pas>/. Fără capturi dacă nu se schimbă nimic vizibil. -->

## Structura e respectată

- [ ] o componentă per fișier
- [ ] logica fără hooks în `utils/`
- [ ] fiecare folder are `index.ts`
- [ ] componentele shadcn copiate manual, pe Base UI
- [ ] formularele cu React Hook Form + Zod
- [ ] designul urmează moodboard-ul (`docs/BRAND.md`)

## Checklist

- [ ] `npm run check` trece local (lint, typecheck, format, teste)
- [ ] teste adăugate sau actualizate pentru schimbare
- [ ] fără secrete, chei sau `console.log` în diff
- [ ] verificat pe mobil (375 px) și desktop
