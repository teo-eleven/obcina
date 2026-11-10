import { EmptyJar } from './illustrations/EmptyJar'
import { PRIMARY_BUTTON } from './LoadError'

// Shown by the router on a first visit straight to a lazy page, while its code downloads.
export function AppLoading() {
  return (
    <output className="text-lemn-600 flex min-h-dvh items-center justify-center">
      Se deschide cămara…
    </output>
  )
}

// Shown when a page can't be loaded at all (usually its code chunk: offline, or a newer deploy).
export function RouteError() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <EmptyJar className="mx-auto h-44 w-auto" />
      <h1 className="mt-8 text-3xl font-semibold">Pagina nu s-a putut deschide</h1>
      <p className="text-lemn-600 mt-4 text-lg">
        Poate s-a întrerupt conexiunea sau am pus între timp o versiune nouă a magazinului.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={`${PRIMARY_BUTTON} mt-8`}
      >
        Reîncarcă pagina
      </button>
    </div>
  )
}
