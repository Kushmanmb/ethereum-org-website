import { getLocale, getTranslations } from "next-intl/server"

import { LinkBox, LinkOverlay } from "@/components/ui/link-box"

const OwnershipBanner = async () => {
  const locale = getLocale()
  const t = await getTranslations({ locale, namespace: "page-index" })

  return (
    <LinkBox className="w-full bg-gradient-to-r from-primary-action to-primary-hover px-4 py-3 text-center text-white md:p-4 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 md:flex-row md:gap-8">
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-xl font-extrabold uppercase !leading-none md:text-2xl">
            {t("page-index-ownership-banner-title")}
          </p>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-white md:text-base">
          {t("page-index-ownership-banner-description")}{" "}
          <LinkOverlay
            href="/ethereum-history-founder-and-ownership"
            className="whitespace-nowrap font-semibold text-white underline hover:text-white/80"
          >
            {t("page-index-ownership-banner-read-more")}
          </LinkOverlay>
        </p>
      </div>
    </LinkBox>
  )
}

export default OwnershipBanner
