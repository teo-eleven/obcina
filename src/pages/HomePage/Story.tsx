import { HOME_TEXT } from '../../constants'
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
          alt={HOME_TEXT.storyImageAlt}
          className="chamfer h-auto w-full [--chamfer:14px]"
        />
        <figcaption className="text-lemn-600 mt-2 text-right text-sm">
          {HOME_TEXT.storyPhotoCredit}{' '}
          <a
            href="https://unsplash.com/@sinzianamihalache"
            className="underline underline-offset-2"
            rel="noopener noreferrer"
          >
            {HOME_TEXT.storyPhotographer}
          </a>{' '}
          {HOME_TEXT.storyPhotoSource}
        </figcaption>
      </figure>
      <div className="mx-auto grid max-w-4xl items-center gap-8 px-4 pt-8 pb-16 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {HOME_TEXT.storyHeading}{' '}
            <i className="text-afina-700 font-medium">{HOME_TEXT.storyHeadingAccent}</i>
          </h2>
          <p className="mt-4 text-lg">{HOME_TEXT.storyBody}</p>
          <Stamp className="mt-6">{HOME_TEXT.storyStamp}</Stamp>
        </div>
        <LindenLeaf className="mx-auto w-28 md:w-36" />
      </div>
    </section>
  )
}
