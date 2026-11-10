# Prompturi pentru imaginile produselor (ChatGPT)

Toate imaginile de produs se generează **în aceeași conversație ChatGPT**, cu același șablon de stil,
ca să aibă aceeași lumină, același unghi și același fundal (PRD: riscul „imaginile AI arată diferit
între ele”). Promptul e în engleză, pentru că generatorul îl urmează mai exact; textul de pe etichetă
rămâne în română.

## Pași

1. Deschide o conversație nouă în ChatGPT și trimite **șablonul de stil** de mai jos, o singură dată.
2. Apoi trimite, pe rând, câte un rând din tabel: `Subject: … Label: …`.
3. Salvează fiecare imagine ca `assets/products/<slug>.png` (folderul nu intră în git).
4. Rulează `npm run images`: scriptul o decupează pătrat, o micșorează la 800×800 și o salvează
   ca WebP în `public/images/products/`, în locul desenului provizoriu.
5. Verifică eticheta: dacă diacriticele sau numele ies greșit, regenerează doar acea imagine.

## Șablonul de stil (se trimite o dată)

```text
I will ask you for a series of product photos for a small online pantry shop from Bucovina,
Romania. Every image in this series must share exactly the same style:

- Square 1:1 image, product centred, filling about 60% of the frame, seen slightly from above (15°).
- Background: plain warm cream paper (#faf6ee) with a very faint paper texture; no props, no table
  edge, no other objects unless I name them.
- Soft natural daylight from the upper left, gentle shadow under the product, no harsh reflections.
- Realistic photo style, not a 3D render, not an illustration; shallow depth of field is fine.
- Every product carries a hand-made paper label: cream paper, thin double border, cut corners, with
  the product name in an elegant serif typeface in dark brown ink and the weight below it in italics.
  The label text must be exactly the Romanian text I give, with correct diacritics (ă, â, î, ș, ț).
- Glass jars have a dark green lid covered with a small square of cream linen tied with twine.
- No brand names, no logos, no barcodes, no people, no hands, no extra text anywhere.

Reply "OK" and wait for the first subject.
```

## Câte un rând pe produs

| Slug                       | Subject                                                                                                                                                         | Label                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `dulceata-de-afine`        | a glass jar of dark wild blueberry preserve with whole berries visible through the glass                                                                        | Dulceață de afine — 350 g               |
| `gem-de-zmeura`            | a glass jar of deep red raspberry jam with visible seeds                                                                                                        | Gem de zmeură — 350 g                   |
| `dulceata-de-catina`       | a small glass jar of bright orange sea buckthorn preserve                                                                                                       | Dulceață de cătină — 250 g              |
| `magiun-de-prune`          | a glass jar of thick, almost black plum butter                                                                                                                  | Magiun de prune — 400 g                 |
| `miere-de-tei`             | a glass jar of pale golden linden honey, slightly cloudy                                                                                                        | Miere de tei — 500 g                    |
| `miere-poliflora-de-munte` | a glass jar of amber wildflower honey with a sprig of dried meadow flowers beside it                                                                            | Miere polifloră de munte — 500 g        |
| `miere-de-mana-de-brad`    | a glass jar of very dark, almost black honeydew honey with a small fir sprig beside it                                                                          | Miere de mană de brad — 500 g           |
| `zacusca-cu-ciuperci`      | a glass jar of red-orange vegetable spread with visible pieces of wild mushrooms                                                                                | Zacuscă cu ciuperci de pădure — 300 g   |
| `zacusca-de-vinete`        | a glass jar of smooth red-orange roasted aubergine and pepper spread                                                                                            | Zacuscă de vinete — 300 g               |
| `ghebe-in-saramura`        | a glass jar of small whole honey fungus mushrooms in clear brine with dill sprigs and garlic                                                                    | Ghebe în saramură — 300 g               |
| `branza-de-burduf`         | a block of crumbly white sheep's cheese on a small wooden board (no jar; label on a paper tag tied with twine)                                                  | Brânză de burduf — 500 g                |
| `cascaval-afumat`          | a small round smoked yellow cheese with a golden-brown rind, one wedge cut out, on a wooden board (label on a paper tag)                                        | Cașcaval afumat — 400 g                 |
| `branza-in-coaja-de-brad`  | a cylinder of white sheep's cheese wrapped in a strip of fir bark tied with twine (label on a paper tag)                                                        | Brânză de oaie în coajă de brad — 450 g |
| `ceai-de-sunatoare`        | a kraft paper tea bag with a folded top, a few dried yellow St John's wort flowers in front of it                                                               | Ceai de sunătoare — 50 g                |
| `ceai-de-cimbrisor`        | a kraft paper tea bag with a folded top, a few dried wild thyme sprigs in front of it                                                                           | Ceai de cimbrișor — 40 g                |
| `ceai-seara-pe-obcina`     | a kraft paper tea bag with a folded top, a small heap of dried linden flowers, mint leaves and chamomile in front of it                                         | Amestec „Seară pe obcină” — 60 g        |
| `cos-mic-dejun-la-stana`   | a small wicker basket lined with a white embroidered cloth, holding a jar of linden honey, a block of white cheese and a jar of raspberry jam                   | Coș „Mic dejun la stână”                |
| `cos-iarna-la-rarau`       | a small wicker basket lined with a white embroidered cloth, holding a jar of mushroom spread, a jar of pickled mushrooms, a smoked cheese and a paper tea bag   | Coș „Iarna la Rarău”                    |
| `cos-dulce-de-munte`       | a small wicker basket lined with a white embroidered cloth, holding a jar of blueberry preserve, a jar of orange sea buckthorn preserve and a jar of dark honey | Coș „Dulce de munte”                    |
| `cos-camara-intreaga`      | a large wicker basket lined with a white embroidered cloth, holding three jars, a white cheese, a smoked cheese and a paper tea bag                             | Coș „Cămara întreagă”                   |

## După generare

- Imaginile AI se marchează „imagine generată” în textul alternativ afișat pe site și în footer
  (PRD); se face la randare, în cardul și pagina de produs (pașii 2.8–2.9).
- În `docs/CREDITS.md` apare o singură intrare pentru tot lotul: generator, data, șablonul de aici.
