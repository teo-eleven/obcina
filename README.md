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

## Documentație

- [Specificația produsului (PRD)](docs/PRD.md)
- [Ghid de brand](docs/BRAND.md)
- [Decizii de arhitectură](docs/adr/)
- [Instrucțiuni pentru Claude Code](CLAUDE.md)
