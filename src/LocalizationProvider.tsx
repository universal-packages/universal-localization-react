import React from 'react'

import { localizationContext } from './context'
import { Locale, LocalizationProviderProps } from './types'

// Store the last locale to persist between rerenders
let LAST_LOCALE: Locale

export function LocalizationProvider(props: LocalizationProviderProps): React.ReactElement {
  const defaultLocale = props.locale || 'en'
  const [locale, setLocale] = React.useState<Locale>(defaultLocale)

  // Create context value
  const contextValue = React.useMemo(
    () => ({
      dictionary: props.dictionary,
      locale,
      defaultLocale,
      setLocale: (newLocale: Locale) => {
        LAST_LOCALE = newLocale
        setLocale(newLocale)
      }
    }),
    [props.dictionary, locale, defaultLocale]
  )

  // When the provider reloads, restore the previous locale if it exists
  React.useEffect(() => {
    if (LAST_LOCALE && LAST_LOCALE !== locale) {
      setLocale(LAST_LOCALE)
    }
  }, [])

  return <localizationContext.Provider value={contextValue}>{props.children}</localizationContext.Provider>
}
