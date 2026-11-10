import { CategoryIcon, Label, OnceLink, Ornament } from '../../components'
import { STRETCHED_CARD, STRETCHED_LINK, CATEGORIES } from '../../constants'

export function CategoryGrid() {
  return (
    <section id="categorii" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <Ornament />
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Ce găsești în <i className="text-afina-700 font-medium">cămară</i>
        </h2>
        <p className="text-lemn-600 mt-3">De la dulceață la ceai, totul umplut în Bucovina.</p>
      </div>
      <ul aria-label="Categorii" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <li key={category.slug} className={STRETCHED_CARD}>
            <Label className="h-full">
              <div className="flex items-start gap-4">
                <CategoryIcon slug={category.slug} />
                <div>
                  <h3 className="text-xl font-semibold">
                    <OnceLink to={`/categorie/${category.slug}`} className={STRETCHED_LINK}>
                      {category.name}
                    </OnceLink>
                  </h3>
                  <p className="text-lemn-600 mt-2">{category.description}</p>
                </div>
              </div>
            </Label>
          </li>
        ))}
      </ul>
    </section>
  )
}
