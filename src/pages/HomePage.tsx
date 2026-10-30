import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { CATEGORIES } from '../data/categories'

function Hero() {
  return (
    <section className="bg-brad-100 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-40 sm:pt-24 sm:pb-52">
        <p className="text-brad-700 text-sm font-semibold tracking-widest uppercase">
          Din Bucovina, în cămara ta
        </p>
        <h1 className="mt-3 max-w-2xl text-4xl leading-tight font-semibold sm:text-6xl">
          Gusturi de munte, puse la borcan ca pe vremuri.
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
      <h2 className="text-3xl font-semibold">Ce găsești în cămară</h2>
      <ul aria-label="Categorii" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <li key={category.slug} className="border-in-100 rounded-2xl border bg-white/60 p-6">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <p className="text-lemn-600 mt-2">{category.description}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Story() {
  return (
    <section id="povestea" className="bg-in-100 scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-3xl font-semibold">Povestea noastră</h2>
        <p className="mt-4 text-lg">
          Obcinele sunt dealurile lungi și rotunjite ale Bucovinei, acoperite cu brazi. Între ele
          sunt sate unde încă se fierbe dulceață în ceaun și se pune zacuscă pentru iarnă. Obcina
          adună câte puțin din cămara lor și ți-l aduce acasă.
        </p>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <>
      <a
        href="#continut"
        className="bg-brad-700 text-crema-50 sr-only z-20 rounded-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2"
      >
        Sari la conținut
      </a>
      <SiteHeader />
      <main id="continut">
        <Hero />
        <CategoryGrid />
        <Story />
      </main>
      <SiteFooter />
    </>
  )
}
