import { Link } from 'react-router'

function EmptyJar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 150" className="mx-auto h-44 w-auto sm:h-52">
      <rect x="30" y="8" width="60" height="18" rx="4" className="fill-lemn-600" />
      <rect x="26" y="22" width="68" height="8" rx="3" className="fill-lemn-800" />
      <path
        d="M34 30 h52 c10 8 14 18 14 30 v62 c0 12 -8 20 -20 20 h-40 c-12 0 -20 -8 -20 -20 v-62 c0 -12 4 -22 14 -30 z"
        className="fill-crema-50 stroke-brad-700"
        strokeWidth="3"
      />
      <rect
        x="30"
        y="66"
        width="60"
        height="44"
        rx="4"
        className="fill-in-100 stroke-lemn-600"
        strokeWidth="2"
      />
      <text
        x="60"
        y="100"
        textAnchor="middle"
        className="fill-afina-500 font-display text-[32px] font-semibold"
      >
        ?
      </text>
      <path d="M40 46 q4 -6 10 -6" className="stroke-brad-100" strokeWidth="4" fill="none" />
    </svg>
  )
}

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <EmptyJar />
      <p className="text-brad-700 mt-8 text-sm font-semibold tracking-widest uppercase">
        Eroare 404
      </p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Borcanul ăsta nu e în cămară</h1>
      <p className="text-lemn-600 mt-4 text-lg">
        Pagina pe care o cauți nu există sau a fost mutată. Hai înapoi, avem destule alte bunătăți.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="bg-brad-700 text-crema-50 hover:bg-afina-700 rounded-full px-6 py-3 font-semibold transition"
        >
          Înapoi în cămară
        </Link>
        <Link
          to={{ pathname: '/', hash: '#categorii' }}
          className="border-brad-700 text-brad-700 hover:border-afina-700 hover:text-afina-700 rounded-full border-2 px-6 py-3 font-semibold transition"
        >
          Vezi categoriile
        </Link>
      </div>
    </div>
  )
}
