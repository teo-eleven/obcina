import { Link } from 'react-router'
import { EmptyJar } from '../../components'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <title>Pagină negăsită — Obcina</title>
      <EmptyJar className="mx-auto h-44 w-auto sm:h-52" />
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
