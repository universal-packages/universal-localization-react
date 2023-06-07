import { useContext } from 'react'

import Localization from './Localization'
import localizationContext from './context'

export function useLocalization(): Localization {
  const localization = useContext(localizationContext)

  if (!localization) throw new Error('Localization provider not found in tree')

  return localization
}
