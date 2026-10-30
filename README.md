# Obcina

**Cămară de munte din Bucovina** — magazin online demonstrativ pentru proiectul integrator.
Produsele, prețurile și plățile sunt fictive (Stripe în mod test).

## Pornire

Ai nevoie de Node.js 20 sau mai nou.

```bash
npm install
cp .env.example .env.local   # completează valorile (din săpt. 2)
npm run dev
```

Deschide http://localhost:5173.

## Comenzi

| Comandă                 | Ce face                                     |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | server de dezvoltare                        |
| `npm run check`         | lint, verificare tipuri, formatare și teste |
| `npm run test:coverage` | teste cu raport de acoperire                |
| `npm run build`         | build de producție în `dist/`               |

## Documentație

- [Ghid de brand](docs/BRAND.md)
- [Decizii de arhitectură](docs/adr/)
- [Instrucțiuni pentru Claude Code](CLAUDE.md)
