import { PantryShelf, Stamp } from '../../components'

export function Hero() {
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
