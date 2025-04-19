import { Locale, Localization } from '@universal-packages/localization'
import { useContext, useMemo } from 'react'

import { localizationContext } from './context'

/**
 * Hook to access and use localization in a component.
 *
 * @param componentDictionary - Optional dictionary to use for the component additional to the provider's dictionary
 * @param locale - Optional locale to use (overrides provider's locale)
 * @returns Object with translate proxy, current locale, and default locale
 */
export function useLocalization<T extends object = {}, G extends object = {}>(dictionary?: T, locale?: Locale) {
  const ctx = useContext(localizationContext)

  const localization = useMemo(() => {
    return new Localization<G, T>({
      primaryDictionary: ctx.dictionary,
      secondaryDictionary: dictionary,
      defaultLocale: locale || ctx.locale
    })
  }, [dictionary, locale, ctx.dictionary, ctx.locale])

  return {
    translate: localization.translate,
    locale: localization.locale,
    defaultLocale: ctx.defaultLocale
  }
}

/**
 * Hook to access the setLocale function from the LocalizationProvider.
 *
 * @returns Function to set the application locale
 */
export function useSetLocale(): (locale: Locale) => void {
  const ctx = useContext(localizationContext)
  return ctx.setLocale
}
