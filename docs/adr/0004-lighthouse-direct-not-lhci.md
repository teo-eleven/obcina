# 0004. Lighthouse direct, nu Lighthouse CI (`@lhci/cli`)

Date: 2026-11-03

## Status

Accepted

## Context

Pasul 1.8 cere un audit Lighthouse cu praguri (mobil: Performance ≥ 85, Accessibility ≥ 95,
Best Practices ≥ 90, SEO ≥ 90), rulat local și în CI. Varianta obișnuită e `@lhci/cli`.
Instalat, `@lhci/cli` 0.16.0 aduce **15 vulnerabilități** în dependențele de dezvoltare (8 mari,
prin `proxy-agent` → `get-uri` → `basic-ftp`), iar `npm audit fix` propune un downgrade la 0.13.
Pachetul `lighthouse` 13.6.0 singur aduce **5 moderate** (ReDoS în `glob`/`minimatch`, prin
`@sentry/node`) și nicio vulnerabilitate mare.

## Decision

- Folosim `lighthouse` + `chrome-launcher` direct, din `scripts/lighthouse.mjs` (~100 de linii):
  pornește `vite preview` pe build-ul de producție, auditează `/` și o pagină 404, ia mediana a
  3 rulări per pagină (ca Lighthouse CI), scrie rapoarte HTML în `lighthouse-report/` și iese cu
  codul 1 sub praguri.
- Chrome: `CHROME_PATH` dacă e setat, altfel Chromium-ul instalat de Playwright (local; în CI, job-ul
  `lighthouse` își instalează și își păstrează în cache doar Chromium). Executabilul se verifică
  înainte de pornire, ca o lipsă să dea un mesaj clar, nu un crash.
- Cele 5 vulnerabilități moderate rămase sunt **acceptate**, pentru că:
  - sunt doar în `devDependencies` (`lighthouse`, `chrome-launcher`) și nu ajung în build-ul livrat;
  - auditul rulează doar pe adresa noastră locală (`vite preview` pe :4190), nu pe input de la
    utilizatori sau pe site-uri externe;
  - CI blochează doar pe dependențele de producție (`npm audit --omit=dev --audit-level=high`), care
    sunt la 0; moderatele din uneltele de dezvoltare nu blochează build-ul.
- **Reevaluare:** la poarta de testare a fiecărei faze (`npm audit` complet în raport) și cel târziu
  la 2026-12-01; mai devreme dacă `lighthouse` scapă de `@sentry/node`/`glob` vulnerabile.

## Scoruri de bază (2026-11-03, mediana din 3 rulări, mobil)

| Pagină | Performance | Accessibility | Best Practices | SEO |
| ------ | ----------- | ------------- | -------------- | --- |
| `/`    | 98          | 100           | 100            | 100 |
| 404    | 98          | 100           | 100            | 100 |

Pragul de Performance (85) are marjă de 13 puncte față de bază, ca variația runner-elor din CI să
nu producă eșecuri aleatoare.

## Consequences

- Nu avem serverul/istoricul Lighthouse CI (comparații între build-uri); nu ne trebuie acum.
- Scriptul e al nostru de întreținut; dacă API-ul `lighthouse` se schimbă, îl actualizăm.
- Lighthouse rulează într-un job CI separat, în paralel cu E2E, cu raportul încărcat ca artefact la
  fiecare rulare.
