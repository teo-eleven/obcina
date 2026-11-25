import { COMMON_TEXT } from '../constants'
// Shown by the router on a first visit straight to a lazy page, while its code downloads.
export function AppLoading() {
  return (
    <output className="text-lemn-600 flex min-h-dvh items-center justify-center">
      {COMMON_TEXT.appLoading}
    </output>
  )
}
