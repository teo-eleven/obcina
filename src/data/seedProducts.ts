import type { Product } from '../lib/product'

// The catalogue the seed script (plan step 2.6) loads into Firestore. Producers, families and
// stocks are fictional (docs/BRAND.md); places are real Bucovina places. Prices are integer bani.
// Two stocks are deliberately edge cases: cătină runs low (3) and the brad-bark cheese is sold out.
// Each gift basket costs a little less than its products bought separately (checked in tests).

export const SEED_PRODUCTS: readonly Product[] = [
  // Dulcețuri și gemuri
  {
    kind: 'product',
    slug: 'dulceata-de-afine',
    name: 'Dulceață de afine',
    description:
      'Afinele le culege familia Hrițcu în iulie, pe versanții Obcinei Mari, și le fierbe în aceeași zi, la foc mic, cu puțin zahăr. Boabele rămân întregi. Pune o linguriță pe clătite sau în iaurt.',
    priceBani: 3200,
    image: {
      src: '/images/products/dulceata-de-afine.webp',
      alt: 'Borcan de dulceață de afine cu etichetă de hârtie',
    },
    category: 'dulceturi',
    weightGrams: 350,
    ingredients: ['afine de munte (70%)', 'zahăr', 'zeamă de lămâie'],
    stock: 14,
  },
  {
    kind: 'product',
    slug: 'gem-de-zmeura',
    name: 'Gem de zmeură',
    description:
      'Zmeură din grădinile de la Vama, zdrobită și fiartă până se leagă, fără pectină adăugată. Are semințe, cum trebuie să aibă. Merge pe pâine prăjită cu unt sau între foile de prăjitură.',
    priceBani: 2900,
    image: {
      src: '/images/products/gem-de-zmeura.webp',
      alt: 'Borcan de gem de zmeură lângă o felie de pâine',
    },
    category: 'dulceturi',
    weightGrams: 350,
    ingredients: ['zmeură (65%)', 'zahăr', 'zeamă de lămâie'],
    stock: 18,
  },
  {
    kind: 'product',
    slug: 'dulceata-de-catina',
    name: 'Dulceață de cătină',
    description:
      'Cătina crește pe malurile râului, la Fundu Moldovei, și se culege greu, printre spini. Doamna Ilinca o fierbe cu miere în loc de zahăr. Gustul e acrișor și intens; încearc-o lângă o brânză tare.',
    priceBani: 3400,
    image: {
      src: '/images/products/dulceata-de-catina.webp',
      alt: 'Borcan mic de dulceață portocalie de cătină',
    },
    category: 'dulceturi',
    weightGrams: 250,
    ingredients: ['cătină (60%)', 'miere polifloră (40%)'],
    stock: 3,
  },
  {
    kind: 'product',
    slug: 'magiun-de-prune',
    name: 'Magiun de prune',
    description:
      'Prune brumării din livada de la Ciocănești, fierte în ceaun aproape o zi întreagă, fără zahăr. Prunele se îndulcesc singure cât fierb. Îl întinzi pe pâine sau îl pui în plăcinte.',
    priceBani: 2700,
    image: {
      src: '/images/products/magiun-de-prune.webp',
      alt: 'Borcan de magiun de prune închis la culoare',
    },
    category: 'dulceturi',
    weightGrams: 400,
    ingredients: ['prune brumării (100%)'],
    stock: 20,
  },

  // Miere
  {
    kind: 'product',
    slug: 'miere-de-tei',
    name: 'Miere de tei',
    description:
      'Stupina familiei Hrițcu stă la marginea unei păduri de tei de pe Obcina Mare. Mierea se scoate în iulie, se strecoară și se pune în borcane fără încălzire. Se cristalizează după câteva luni; e semn bun. Dacă vrei s-o ai lichidă, ține borcanul câteva minute în apă caldă.',
    priceBani: 4200,
    image: {
      src: '/images/products/miere-de-tei.webp',
      alt: 'Borcan de miere de tei aurie cu o lingură de lemn',
    },
    category: 'miere',
    weightGrams: 500,
    ingredients: ['miere de tei (100%)'],
    stock: 25,
  },
  {
    kind: 'product',
    slug: 'miere-poliflora-de-munte',
    name: 'Miere polifloră de munte',
    description:
      'Albinele domnului Toader urcă vara pe pajiștile de la Rarău, printre cimbrișor, trifoi și zmeur. Fiecare an are alt gust, după ce a înflorit mai mult. Pune o lingură în ceaiul de seară.',
    priceBani: 3900,
    image: {
      src: '/images/products/miere-poliflora-de-munte.webp',
      alt: 'Borcan de miere polifloră cu flori de câmp uscate',
    },
    category: 'miere',
    weightGrams: 500,
    ingredients: ['miere polifloră de munte (100%)'],
    stock: 22,
  },
  {
    kind: 'product',
    slug: 'miere-de-mana-de-brad',
    name: 'Miere de mană de brad',
    description:
      'Mierea de mană nu vine din flori, ci din picăturile dulci lăsate pe acele de brad de insectele care se hrănesc cu seva lui, în verile calde. E aproape neagră, mai puțin dulce decât mierea de flori și cu gust de rășină. Iese rar și puțină, de aceea o găsești doar în loturi mici.',
    priceBani: 5800,
    image: {
      src: '/images/products/miere-de-mana-de-brad.webp',
      alt: 'Borcan de miere de mană închisă la culoare lângă o crenguță de brad',
    },
    category: 'miere',
    weightGrams: 500,
    ingredients: ['miere de mană de brad (100%)'],
    stock: 6,
  },

  // Zacuscă și conserve
  {
    kind: 'product',
    slug: 'zacusca-cu-ciuperci',
    name: 'Zacuscă cu ciuperci de pădure',
    description:
      'Ardei copți pe plită, vinete și ceapă, plus hribi și gălbiori culeși toamna din pădurile de la Moldovița. Se fierbe încet, cu ulei de floarea-soarelui. Pe o felie de pâine caldă e o cină întreagă.',
    priceBani: 2400,
    image: {
      src: '/images/products/zacusca-cu-ciuperci.webp',
      alt: 'Borcan de zacuscă cu bucăți de ciuperci',
    },
    category: 'conserve',
    weightGrams: 300,
    ingredients: [
      'ardei copți',
      'vinete coapte',
      'ciuperci de pădure (15%)',
      'ceapă',
      'ulei de floarea-soarelui',
      'pastă de tomate',
      'sare',
      'piper',
      'foi de dafin',
    ],
    stock: 16,
  },
  {
    kind: 'product',
    slug: 'zacusca-de-vinete',
    name: 'Zacuscă de vinete',
    description:
      'Rețeta de toamnă a doamnei Ilinca: vinete coapte pe jar, ardei copți și ceapă călită, fierte împreună până se leagă. Fără conservanți, cu sare și multă răbdare. Bună rece, pe pâine sau lângă cartofi copți.',
    priceBani: 2200,
    image: {
      src: '/images/products/zacusca-de-vinete.webp',
      alt: 'Borcan de zacuscă de vinete cu capac în carouri',
    },
    category: 'conserve',
    weightGrams: 300,
    ingredients: [
      'vinete coapte (40%)',
      'ardei copți',
      'ceapă',
      'ulei de floarea-soarelui',
      'pastă de tomate',
      'sare',
      'piper',
    ],
    stock: 19,
  },
  {
    kind: 'product',
    slug: 'ghebe-in-saramura',
    name: 'Ghebe în saramură',
    description:
      'Ghebele cresc în tufe pe cioturile de fag din pădurile de lângă Putna. Se fierb bine și se pun în saramură cu usturoi și mărar, ca pentru iarnă. Le scurgi, le stropești cu ulei și le mănânci cu mămăliguță.',
    priceBani: 3400,
    image: {
      src: '/images/products/ghebe-in-saramura.webp',
      alt: 'Borcan cu ghebe întregi în saramură și crenguțe de mărar',
    },
    category: 'conserve',
    weightGrams: 300,
    ingredients: [
      'ghebe (65%)',
      'apă',
      'sare',
      'oțet de mere',
      'usturoi',
      'mărar',
      'boabe de piper',
    ],
    stock: 8,
  },

  // Brânzeturi
  {
    kind: 'product',
    slug: 'branza-de-burduf',
    name: 'Brânză de burduf',
    description:
      'De la stâna lui baciu Vasile, de pe Obcina Feredeului: caș de oaie frământat cu sare și maturat câteva săptămâni. E sărată și cremoasă. Las-o la temperatura camerei o jumătate de oră înainte s-o servești.',
    priceBani: 4900,
    image: {
      src: '/images/products/branza-de-burduf.webp',
      alt: 'Bucată de brânză de burduf albă pe un fund de lemn',
    },
    category: 'branzeturi',
    weightGrams: 500,
    ingredients: ['lapte de oaie', 'sare', 'cheag'],
    stock: 10,
  },
  {
    kind: 'product',
    slug: 'cascaval-afumat',
    name: 'Cașcaval afumat',
    description:
      'Cașcaval de vacă de la Breaza, opărit și afumat la rece cu lemn de fag, două zile. Coaja e aurie, miezul elastic. Îl tai felii subțiri pentru gustare sau îl topești peste mămăligă.',
    priceBani: 4600,
    image: {
      src: '/images/products/cascaval-afumat.webp',
      alt: 'Roată de cașcaval afumat cu coajă aurie, tăiată în două',
    },
    category: 'branzeturi',
    weightGrams: 400,
    ingredients: ['lapte de vacă', 'sare', 'cheag', 'fermenți lactici'],
    stock: 12,
  },
  {
    kind: 'product',
    slug: 'branza-in-coaja-de-brad',
    name: 'Brânză de oaie în coajă de brad',
    description:
      'Brânza de oaie se presează în cilindri de coajă de brad și se maturează acolo, așa că prinde aroma de rășină. Baciu Vasile face doar câteva bucăți pe vară; când se termină, așteaptă vara viitoare cu noi.',
    priceBani: 5200,
    image: {
      src: '/images/products/branza-in-coaja-de-brad.webp',
      alt: 'Brânză de oaie într-un cilindru de coajă de brad',
    },
    category: 'branzeturi',
    weightGrams: 450,
    ingredients: ['lapte de oaie', 'sare', 'cheag'],
    stock: 0,
  },

  // Ceaiuri de munte
  {
    kind: 'product',
    slug: 'ceai-de-sunatoare',
    name: 'Ceai de sunătoare',
    description:
      'Sunătoarea se culege pe la Sânziene, când e în plină floare, pe pajiștile de lângă Câmpulung Moldovenesc, și se usucă la umbră, în pod. Pune o linguriță într-o cană cu apă fierbinte și las-o zece minute.',
    priceBani: 1600,
    image: {
      src: '/images/products/ceai-de-sunatoare.webp',
      alt: 'Pungă de hârtie cu flori galbene de sunătoare uscate',
    },
    category: 'ceaiuri',
    weightGrams: 50,
    ingredients: ['vârfuri înflorite de sunătoare uscate (100%)'],
    stock: 30,
  },
  {
    kind: 'product',
    slug: 'ceai-de-cimbrisor',
    name: 'Ceai de cimbrișor',
    description:
      'Cimbrișorul sălbatic crește pe stâncile însorite de la Rarău și miroase a pajiște încălzită de soare. Toarnă apă fierbinte peste o linguriță, lasă-l cinci minute și îndulcește-l cu miere, în serile reci și umede.',
    priceBani: 1500,
    image: {
      src: '/images/products/ceai-de-cimbrisor.webp',
      alt: 'Pungă de hârtie cu tulpini de cimbrișor uscat',
    },
    category: 'ceaiuri',
    weightGrams: 40,
    ingredients: ['cimbrișor de munte uscat (100%)'],
    stock: 28,
  },
  {
    kind: 'product',
    slug: 'ceai-seara-pe-obcina',
    name: 'Amestec „Seară pe obcină”',
    description:
      'Flori de tei, mentă și mușețel, amestecate de doamna Ilinca după rețeta ei de seară. E blând și ușor dulce, fără să mai pui nimic. Lasă-l la infuzat cinci minute, cu capac.',
    priceBani: 1900,
    image: {
      src: '/images/products/ceai-seara-pe-obcina.webp',
      alt: 'Pungă de hârtie cu amestec de flori de tei, mentă și mușețel',
    },
    category: 'ceaiuri',
    weightGrams: 60,
    ingredients: ['flori de tei (40%)', 'frunze de mentă (35%)', 'flori de mușețel (25%)'],
    stock: 24,
  },

  // Coșuri cadou
  {
    kind: 'gift-basket',
    slug: 'cos-mic-dejun-la-stana',
    name: 'Coș „Mic dejun la stână”',
    description:
      'Tot ce-ți trebuie pentru o dimineață lungă: miere de tei, brânză de burduf și gem de zmeură, în coș de nuiele cu ștergar. Adaugi doar pâinea caldă.',
    priceBani: 10900,
    image: {
      src: '/images/products/cos-mic-dejun-la-stana.webp',
      alt: 'Coș de nuiele cu miere, brânză și gem pe un ștergar',
    },
    category: 'cosuri-cadou',
    components: [
      { slug: 'miere-de-tei', quantity: 1 },
      { slug: 'branza-de-burduf', quantity: 1 },
      { slug: 'gem-de-zmeura', quantity: 1 },
    ],
  },
  {
    kind: 'gift-basket',
    slug: 'cos-iarna-la-rarau',
    name: 'Coș „Iarna la Rarău”',
    description:
      'Pentru serile de iarnă: zacuscă cu ciuperci de pădure, ghebe în saramură, cașcaval afumat și ceai de cimbrișor. E o cină de munte, cu tot cu ceaiul de după.',
    priceBani: 10900,
    image: {
      src: '/images/products/cos-iarna-la-rarau.webp',
      alt: 'Coș cu borcane de zacuscă și ghebe, cașcaval afumat și ceai',
    },
    category: 'cosuri-cadou',
    components: [
      { slug: 'zacusca-cu-ciuperci', quantity: 1 },
      { slug: 'ghebe-in-saramura', quantity: 1 },
      { slug: 'cascaval-afumat', quantity: 1 },
      { slug: 'ceai-de-cimbrisor', quantity: 1 },
    ],
  },
  {
    kind: 'gift-basket',
    slug: 'cos-dulce-de-munte',
    name: 'Coș „Dulce de munte”',
    description:
      'Trei borcane pentru cine iubește gusturile intense: dulceață de afine, dulceață de cătină și miere de mană de brad. Fiecare are alt gust, de la acrișor la rășinos.',
    priceBani: 11400,
    image: {
      src: '/images/products/cos-dulce-de-munte.webp',
      alt: 'Coș cu trei borcane de dulceață și miere',
    },
    category: 'cosuri-cadou',
    components: [
      { slug: 'dulceata-de-afine', quantity: 1 },
      { slug: 'dulceata-de-catina', quantity: 1 },
      { slug: 'miere-de-mana-de-brad', quantity: 1 },
    ],
  },
  {
    kind: 'gift-basket',
    slug: 'cos-camara-intreaga',
    name: 'Coș „Cămara întreagă”',
    description:
      'Câte ceva din fiecare raft: dulceață de afine, miere de tei, zacuscă cu ciuperci, brânză de burduf, cașcaval afumat și ceaiul „Seară pe obcină”. Pentru cine vrea să guste toată Bucovina deodată.',
    priceBani: 20500,
    image: {
      src: '/images/products/cos-camara-intreaga.webp',
      alt: 'Coș mare de nuiele cu borcane, brânzeturi și ceai',
    },
    category: 'cosuri-cadou',
    components: [
      { slug: 'dulceata-de-afine', quantity: 1 },
      { slug: 'miere-de-tei', quantity: 1 },
      { slug: 'zacusca-cu-ciuperci', quantity: 1 },
      { slug: 'branza-de-burduf', quantity: 1 },
      { slug: 'cascaval-afumat', quantity: 1 },
      { slug: 'ceai-seara-pe-obcina', quantity: 1 },
    ],
  },
]
