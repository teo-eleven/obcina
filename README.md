# Obcina

**Cămară de munte din Bucovina** — magazin online demonstrativ pentru proiectul integrator.
Produsele, prețurile și plățile sunt fictive (Stripe în mod test).

## Pornire

Ai nevoie de Node.js 24 (versiunea din `.nvmrc`; cu nvm: `nvm use`).

```bash
npm install
cp .env.example .env.local   # completează valorile Firebase (pasul 2.1)
npm run dev
```

Deschide http://localhost:5180.

## Comenzi

| Comandă                 | Ce face                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `npm run dev`           | server de dezvoltare                                          |
| `npm run emulators`     | emulatoare Firebase locale (Java 21+)                         |
| `npm run seed`          | încarcă produsele în emulator                                 |
| `npm run dev:emulators` | aplicația pe emulatoare, nu pe proiectul real                 |
| `npm run check`         | lint, verificare tipuri, formatare și teste                   |
| `npm run test:rules`    | regulile Firestore, testate în emulator                       |
| `npm run test:coverage` | teste cu raport de acoperire                                  |
| `npm run build`         | build de producție în `dist/`                                 |
| `npm run test:e2e`      | teste end-to-end (Chromium și WebKit), pe emulator (Java 21+) |
| `npm run images`        | imaginile produselor și pozele, în WebP                       |
| `npm run lighthouse`    | audit Lighthouse pe mobil, cu praguri                         |

## Structură

```
src/          aplicația (React): pagini, componente, hook-uri, logică
e2e/          teste end-to-end (Playwright) și configurația lor
firebase/     regulile Firestore și testele lor în emulator
scripts/      unelte Node: seed, imagini, Lighthouse
public/       fișiere servite ca atare (imagini WebP, favicon)
docs/         PRD, plan, brand, decizii (ADR), rapoarte de testare
config/       configurările TypeScript
.github/      CI, CodeQL, Dependabot, șablonul de PR
```

În rădăcină rămân doar fișierele pe care uneltele le caută acolo: `package.json`, `index.html` și
`vite.config.ts` (Vite), `tsconfig.json`, `firebase.json` (Firebase CLI), `.oxlintrc.json` (editoarele îl caută aici), `.nvmrc`,
fișierele `.env`.

## Documentație

- [Specificația produsului (PRD)](docs/PRD.md)
- [Ghid de brand](docs/BRAND.md)
- [Decizii de arhitectură](docs/adr/)
- [Instrucțiuni pentru Claude Code](CLAUDE.md)
