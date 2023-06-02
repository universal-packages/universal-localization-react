import React from 'react'

import { useLocalization } from './useLocalization'

export function useTranslate(): (subject: string, locales?: Record<string, any>) => string {
  const localization = useLocalization()
  const [_localeChanges, setLocaleChanges] = React.useState(0)

  const translate = React.useCallback(
    (subject: string, locales?: Record<string, any>): string => {
      return localization.translate(subject, locales)
    },
    [localization]
  )

  React.useEffect(() => {
    const listener = () => setLocaleChanges((prev) => prev + 1)

    localization.on('locale', listener)

    return (): any => localization.removeListener('locale', listener)
  }, [localization])

  return translate
}
