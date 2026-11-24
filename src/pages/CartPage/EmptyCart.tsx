import { Link } from 'react-router'
import { EmptyJar } from '../../components'
import { PRIMARY_BUTTON } from '../../constants'

/** The empty cart: an empty jar and the way back to the shelves. */
export function EmptyCart() {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <EmptyJar className="h-40 w-auto" />
      <p className="mt-6 text-lg">Coșul e gol deocamdată.</p>
      <Link to={{ pathname: '/', hash: '#categorii' }} className={`${PRIMARY_BUTTON} mt-6`}>
        Vezi ce avem în cămară
      </Link>
    </div>
  )
}
