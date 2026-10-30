# Obcina — ghid de brand

> Proiect universitar. Magazin demonstrativ: produsele, prețurile și plățile sunt fictive.

## Numele

**Obcina** vine de la Obcinele Bucovinei — dealurile lungi și rotunjite, acoperite cu brazi,
dintre Suceava și munții Rarău. Tagline: **„cămară de munte din Bucovina”**.

## Povestea

Cămara bunicii, dar pe internet. Dulcețuri, miere, zacuscă, brânzeturi și ceaiuri făcute în
loturi mici, ca la munte. Fiecare produs are o poveste scurtă: de unde vine și cine l-a făcut
(personaje fictive, nu producători reali).

## Ton

- Cald și simplu, la persoana a II-a („gustă”, „alege”), fără superlative goale.
- Detalii concrete în loc de adjective: gramaj, ingrediente, locul de proveniență.
- Româna corectă, cu diacritice.

## Paletă

| Token       | Hex       | Folosit pentru                |
| ----------- | --------- | ----------------------------- |
| `brad-900`  | `#1f3328` | titluri, footer               |
| `brad-700`  | `#2f4a3a` | butoane principale, header    |
| `brad-500`  | `#4f7259` | accente secundare             |
| `brad-100`  | `#dfe8e0` | fundaluri de secțiuni         |
| `afina-700` | `#5b2a4a` | hover pe acțiuni              |
| `afina-500` | `#8a3f6e` | accent, focus, prețuri reduse |
| `miere-500` | `#d9a441` | evidențieri, badge-uri        |
| `miere-300` | `#ebc97a` | soarele din logo, ilustrații  |
| `lemn-800`  | `#4a3424` | text de bază                  |
| `lemn-600`  | `#6e5038` | text secundar                 |
| `in-100`    | `#f1eadb` | carduri                       |
| `crema-50`  | `#faf6ee` | fundalul paginii              |

Tokenurile sunt definite o singură dată, în `src/index.css` (`@theme`), și se folosesc ca
clase Tailwind (`bg-brad-700`, `text-afina-500` etc.). Nu folosim culori hardcodate în componente.

## Tipografie

- **Fraunces** (serif, variabil) — titluri și logo. Dă aerul de „etichetă de borcan”.
- **Inter** (sans, variabil) — text de bază și interfață.

Fonturile sunt self-hosted prin `@fontsource-variable`, fără cereri către Google Fonts.

## Logo

Trei obcine suprapuse (brad-900, brad-700, brad-500) sub un soare de miere. Componenta
`src/components/Logo.tsx`; varianta pentru tab-ul browserului e `public/favicon.svg`.

## Imagini

Doar poze proprii, cu licență liberă (Unsplash, Pexels) sau generate. Fără poze sau nume
de producători și magazine reale.
