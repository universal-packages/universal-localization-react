import { useContext, useMemo } from 'react'

import Localization from './Localization'
import localizationContext from './context'
import { Dictionary, Locale, TranslationProxy } from './types'

/**
 * Hook to access and use localization in a component.
 * 
 * @param primaryDictionary - Optional dictionary to use as primary (overrides provider's dictionary)
 * @param secondaryDictionary - Optional dictionary to merge with primary
 * @param locale - Optional locale to use (overrides provider's locale)
 * @returns Object with translate proxy, current locale, and default locale
 */
export function useLocalization<T = any, S = {}>(
  primaryDictionary?: Dictionary<T>,
  secondaryDictionary?: Dictionary<S>,
  locale?: Locale
): {
  translate: TranslationProxy<T, S>
  locale: Locale
  defaultLocale: Locale
} {
  const ctx = useContext(localizationContext)
  
  // Use provided locale or fall back to context locale
  const currentLocale = locale || ctx.locale
  
  // Create localization instance with provided dictionaries or context dictionary
  const localization = useMemo(() => {
    // If primary dictionary is provided, use it
    if (primaryDictionary) {
      return new Localization<T, S>({
        primaryDictionary,
        secondaryDictionary,
        defaultLocale: currentLocale
      })
    }
    
    // Otherwise use the context dictionary if available
    if (ctx.dictionary) {
      return new Localization<any>({
        primaryDictionary: ctx.dictionary,
        defaultLocale: currentLocale
      })
    }
    
    // Fallback to empty dictionary - this ensures consistent behavior
    // even when no dictionary is provided at all
    return new Localization<{}>({
      primaryDictionary: {},
      defaultLocale: currentLocale
    })
  }, [primaryDictionary, secondaryDictionary, currentLocale, ctx.dictionary])
  
  return {
    translate: localization.translate as TranslationProxy<T, S>,
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

