import { createContext } from 'react'

import Localization from './Localization'

const localizationContext = createContext<Localization>(null as any)

localizationContext.displayName = 'LocalizationContext'

export default localizationContext
