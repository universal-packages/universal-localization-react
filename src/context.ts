import { Localization } from '@universal-packages/localization'
import { createContext } from 'react'

const localizationContext = createContext<Localization>(null as any)

localizationContext.displayName = 'LocalizationContext'

export default localizationContext
