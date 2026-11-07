import { Link } from 'react-router'
import { CategoryIcon } from '../components/CategoryIcon'
import { LindenLeaf } from '../components/illustrations/LindenLeaf'
import { PantryShelf } from '../components/illustrations/PantryShelf'
import { Label } from '../components/Label'
import { Ornament } from '../components/Ornament'
import { Stamp } from '../components/Stamp'
import { STRETCHED_CARD, STRETCHED_LINK } from '../components/stretchedLink'
import { CATEGORIES } from '../data/categories'

function Hero() {
  return (
    <section className="bg-brad-100 paper relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-40 sm:pt-20 sm:pb-52 md:grid-cols-[1.15fr_1fr]">
        <div>
          <Stamp tone="brad">Din Bucovina, în cămara ta</Stamp>
          <h1 className="mt-6 max-w-2xl text-4xl leading-tight font-semibold sm:text-6xl">
            Gusturi de munte, puse la borcan{' '}
            <i className="text-afina-700 font-medium">ca pe vremuri</i>.
          </h1>
          <p className="text-lemn-600 mt-5 max-w-xl text-lg">
            Dulcețuri, miere, zacuscă, brânzeturi și ceaiuri din loturi mici, de pe obcinele dintre
            Suceava și Rarău.
          </p>
          <a
            href="#categorii"
            className="bg-brad-700 text-crema-50 hover:bg-afina-700 mt-8 inline-block rounded-full px-6 py-3 font-semibold transition"
          >
            Vezi ce avem în cămară
          </a>
        </div>
        <PantryShelf className="mx-auto w-full max-w-xs md:max-w-md" />
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-32 w-full sm:h-44"
      >
        <path
          d="M0 120 C240 40 480 40 720 110 C960 50 1200 50 1440 100 V220 H0 Z"
          className="fill-brad-500"
        />
        <path
          d="M0 160 C200 100 420 100 640 150 C880 100 1160 110 1440 150 V220 H0 Z"
          className="fill-brad-700"
        />
        <path
          d="M0 195 C260 160 520 160 780 190 C1000 170 1240 170 1440 185 V220 H0 Z"
          className="fill-crema-50"
        />
      </svg>
    </section>
  )
}

function CategoryGrid() {
  return (
    <section id="categorii" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <Ornament />
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Ce găsești în <i className="text-afina-700 font-medium">cămară</i>
        </h2>
        <p className="text-lemn-600 mt-3">De la dulceață la ceai, totul umplut în Bucovina.</p>
      </div>
      <ul aria-label="Categorii" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <li key={category.slug} className={STRETCHED_CARD}>
            <Label className="h-full">
              <div className="flex items-start gap-4">
                <CategoryIcon slug={category.slug} />
                <div>
                  <h3 className="text-xl font-semibold">
                    <Link to={`/categorie/${category.slug}`} className={STRETCHED_LINK}>
                      {category.name}
                    </Link>
                  </h3>
                  <p className="text-lemn-600 mt-2">{category.description}</p>
                </div>
              </div>
            </Label>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Story() {
  return (
    <section id="povestea" className="bg-in-100 paper scroll-mt-20">
      <figure className="mx-auto max-w-4xl px-4 pt-16">
        {/* Below the fold, so lazy; width/height reserve the space, srcset lets phones skip the 1200 px file. */}
        <img
          src="/images/atmosfera/poiana-negrii-1200.webp"
          srcSet="/images/atmosfera/poiana-negrii-640.webp 640w, /images/atmosfera/poiana-negrii-800.webp 800w, /images/atmosfera/poiana-negrii-1200.webp 1200w"
          sizes="(min-width: 56rem) 54rem, calc(100vw - 2rem)"
          width={1200}
          height={598}
          loading="lazy"
          decoding="async"
          alt="Fânețe cu căpițe de fân, case de lemn și brazi la Poiana Negrii, în Bucovina"
          className="chamfer h-auto w-full [--chamfer:14px]"
        />
        <figcaption className="text-lemn-600 mt-2 text-right text-sm">
          Foto:{' '}
          <a
            href="https://unsplash.com/@sinzianamihalache"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
          >
            Sinziana Mihalache
          </a>{' '}
          / Unsplash
        </figcaption>
      </figure>
      <div className="mx-auto grid max-w-4xl items-center gap-8 px-4 pt-8 pb-16 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Povestea <i className="text-afina-700 font-medium">noastră</i>
          </h2>
          <p className="mt-4 text-lg">
            Obcinele sunt dealurile lungi și rotunjite ale Bucovinei, acoperite cu brazi. Între ele
            sunt sate unde încă se fierbe dulceață în ceaun și se pune zacuscă pentru iarnă. Obcina
            adună câte puțin din cămara lor și ți-l aduce acasă.
          </p>
          <Stamp className="mt-6">Făcut în Bucovina</Stamp>
        </div>
        <LindenLeaf className="mx-auto w-28 md:w-36" />
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <Story />
    </>
  )
}
