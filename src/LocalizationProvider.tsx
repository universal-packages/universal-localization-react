import { Locale } from '@universal-packages/localization'
import React from 'react'

import { localizationContext } from './context'
import { LocalizationProviderProps } from './types'

// Store the last locale to persist between rerenders in development mode
let LAST_LOCALE: Locale

export function LocalizationProvider(props: LocalizationProviderProps): React.ReactElement {
  const defaultLocale = props.locale || 'en'
  const [locale, setLocale] = React.useState<Locale>(defaultLocale)

  const contextValue = React.useMemo(
    () => ({
      dictionary: props.dictionary,
      locale,
      defaultLocale,
      setLocale: (newLocale: Locale) => {
        if (process.env.NODE_ENV === 'development') LAST_LOCALE = newLocale
        setLocale(newLocale)
      }
    }),
    [props.dictionary, locale, defaultLocale]
  )

  // When the provider reloads the locale is lost, so we restore it for development purposes
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (LAST_LOCALE && LAST_LOCALE !== locale) {
        setLocale(LAST_LOCALE)
      }
    }
  }, [])

  return <localizationContext.Provider value={contextValue}>{props.children}</localizationContext.Provider>
}
