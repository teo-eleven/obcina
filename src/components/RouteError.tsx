import { EmptyJar } from './illustrations'
import { COMMON_TEXT, PRIMARY_BUTTON } from '../constants'

// Shown when a page can't be loaded at all (usually its code chunk: offline, or a newer deploy).
export function RouteError() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <EmptyJar className="mx-auto h-44 w-auto" />
      <h1 className="mt-8 text-3xl font-semibold">{COMMON_TEXT.routeErrorTitle}</h1>
      <p className="text-lemn-600 mt-4 text-lg">{COMMON_TEXT.routeErrorBody}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className={`${PRIMARY_BUTTON} mt-8`}
      >
        {COMMON_TEXT.reload}
      </button>
    </div>
  )
}
