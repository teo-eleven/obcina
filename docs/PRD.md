# PRD: Obcina — cămară de munte din Bucovina

**Status:** approved
**Owner:** Teodor Fotciuc
**Date:** 2026-10-30 · predare: ~sfârșit de decembrie 2026

Sursa de adevăr pentru _ce_ construim. _Cum_ arată: [BRAND.md](BRAND.md). _De ce_ așa: [adr/](adr/).
Când o decizie de aici se schimbă, se schimbă întâi în acest fișier.

## Problemă

Proiectul integrator cere un magazin online complet: min. 5 produse, branding, coș funcțional,
simulare de plată, design responsive (60% din notă), demonstrat live la final.

Ca produs: gusturile de munte din Bucovina (dulcețuri, miere, zacuscă, brânzeturi, ceaiuri) se
găsesc greu în afara zonei, iar cine le-a gustat o dată în vacanță nu are de unde să le comande.

## Public țintă

| Segment                    | Ce caută                                      | Ce le arătăm întâi                  |
| -------------------------- | --------------------------------------------- | ----------------------------------- |
| **Tineri din oraș**        | gust autentic, nu de supermarket, preț corect | produse noi, căutare rapidă, filtre |
| **Cumpărători de cadouri** | un cadou gata făcut, frumos, într-un buget    | coșuri cadou, asistentul AI         |
| **Turiști în Bucovina**    | ce au gustat la munte, acum acasă             | povestea locului, categoriile       |

Diaspora nu e un segment țintă (fără livrare internațională).

## Decizii de produs

- **Limba:** doar română, cu diacritice. Fără i18n.
- **Cont obligatoriu** pentru a plasa o comandă. Navigarea și coșul merg și fără cont; la checkout
  se cere autentificare (email/parolă sau Google), iar coșul anonim se păstrează după login.
- **Livrare:** curier simulat, **19,99 lei** (`1999` bani); **gratuit pentru comenzi ≥ 200 lei**
  (`20000` bani, calculat pe subtotalul produselor). Pragul și tariful sunt constante într-un
  singur loc și se calculează pe server.
- **Plată:** Stripe Checkout în mod test ([ADR 0002](adr/0002-stripe-checkout-test-mode.md)).
- **Monedă:** RON; toate sumele în bani, numere întregi.
- **Catalog:** 15–20 produse fictive în 6 categorii (vezi `src/data/categories.ts`), plus 3–4 coșuri cadou.

## Funcționalități

### MVP (cerințele de notare)

1. Catalog cu categorii, pagină de produs (poveste, gramaj, ingrediente, preț, stoc).
2. Coș persistent: adăugare, cantități limitate de stoc, total live, transport calculat.
3. Cont: înregistrare, login, adrese salvate, istoric comenzi.
4. Checkout: adresă → Stripe (test) → pagină de confirmare; comandă `paid` doar din webhook.
5. Stoc care scade la plată.
6. Responsive (375px → desktop), accesibil.

### Extra (toate alese)

7. **Căutare și filtre:** căutare după nume, filtre categorie / preț / „în stoc”, sortare.
8. **Coșuri cadou:** produse compuse; stocul e minimul dintre componente; la plată scad componentele.
9. **Panou de admin:** rol `admin` (Firebase custom claims); CRUD produse, listă comenzi, schimbare status.
10. **Asistent AI de cadouri:** utilizatorul scrie pentru cine e cadoul și bugetul; Claude Haiku
    propune 1–3 combinații **doar din produsele în stoc**. Reguli:
    - apelul se face din `api/` (cheia `ANTHROPIC_API_KEY` doar pe server);
    - răspunsul modelului e validat cu schemă; ID-urile inexistente sau fără stoc se elimină;
      prețurile se recalculează din Firestore, nu se iau din răspunsul modelului;
    - limită de cereri per utilizator și de lungime a mesajului; prompt caching pe catalog;
    - set mic de evaluări (`eval-harness`) înainte de orice schimbare de prompt.

### În afara proiectului

Livrare internațională, facturare reală, cupoane, recenzii, wishlist, notificări prin email,
mai multe limbi, aplicație mobilă.

## Design și conținut

- **Direcție vizuală: „etichetă de borcan”.** Rustic, cald: texturi de hârtie, chenare și
  etichete, ilustrații desenate, titluri serif. Pagina de start din săpt. 1 (minimalistă) se
  restilizează în săpt. 2. Detalii în [BRAND.md](BRAND.md).
- **Imagini, pe roluri, ca să rămână consecvente:**
  - **Generate cu AI** — borcanele și etichetele produselor (un singur stil, aceeași lumină și unghi);
    marcate „imagine generată” în `alt` și în footer.
  - **Unsplash / Pexels** — atmosferă: peisaje din Bucovina, stâne, stupi (hero, povestea). Autorul
    se creditează în `docs/CREDITS.md`.
  - **Ilustrații SVG** — iconițe de categorii, chenare, decoruri, stări goale (coș gol, 404).
- Fără poze sau nume de producători și magazine reale.

## Calendar

Ordinea pașilor, porțile de testare și estimarea de timp (2–3 ore pe zi): [PLAN.md](PLAN.md).

## Riscuri

| Risc                                        | Rezervă                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| Stripe sau rețeaua cade la prezentare       | flag pentru plată simulată locală                                  |
| Asistentul AI dă răspunsuri ciudate la demo | validare strictă + răspuns de rezervă („coșul clasic”)             |
| Cheia Anthropic consumă bani                | Haiku, limită de cereri, plafon de cost setat în consola Anthropic |
| Imaginile AI arată diferit între ele        | un singur prompt-șablon de stil, generate în același lot           |
| Prea multe extra-uri, MVP întârziat         | MVP-ul (săpt. 5) are prioritate; extra-urile se taie de la coadă   |

## Gata când

- [ ] Fluxul produs → coș → login → checkout → plată test 4242 → comandă `paid` în istoric merge pe link-ul live.
- [ ] Cardul 4000 0000 0000 0002 e refuzat, iar comanda rămâne neplătită, cu mesaj clar.
- [ ] Prețurile, transportul și stocul se calculează doar pe server; un preț modificat în browser nu schimbă suma plătită.
- [ ] Min. 15 produse în 6 categorii, plus coșuri cadou.
- [ ] Transportul e 0 lei la 200 lei subtotal și 19,99 lei la 199,99 lei.
- [ ] Adminul poate adăuga un produs care apare imediat în catalog.
- [ ] Asistentul AI nu propune niciodată un produs inexistent sau fără stoc (verificat de evaluări).
- [ ] Lighthouse pe mobil la final (F11): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO ≥ 90
      (pragurile intermediare din PLAN.md); fără scroll orizontal la 375px.
- [ ] `npm run check` și CI trec; acoperire ≥ 80%.
