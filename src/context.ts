import { createContext } from 'react'

import { LocalizationContext } from './types'

const localizationContext = createContext<LocalizationContext>(null as any)

localizationContext.displayName = 'LocalizationContext'

export default localizationContext
