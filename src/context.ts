import React from 'react'

import { LocalizationContext, Locale } from './types'

// Create a default context value
const defaultContext: LocalizationContext = {
  locale: 'en' as Locale,
  defaultLocale: 'en' as Locale,
  setLocale: () => {}
}

export default React.createContext<LocalizationContext>(defaultContext)
