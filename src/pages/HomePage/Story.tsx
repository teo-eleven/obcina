import { LindenLeaf, Stamp } from '../../components'

export function Story() {
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
