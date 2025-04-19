import { Locale } from '@universal-packages/localization'
import React from 'react'

import { LocalizationContext } from './types'

// Create a default context value
const defaultContext: LocalizationContext = {
  locale: 'en' as Locale,
  defaultLocale: 'en' as Locale,
  setLocale: () => {}
}

export const localizationContext = React.createContext<LocalizationContext>(defaultContext)
