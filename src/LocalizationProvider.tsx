import { EmittedEvent } from '@universal-packages/event-emitter'
import React from 'react'

import Localization from './Localization'
import context from './context'
import { Locale, LocalizationProviderProps } from './types'

let LAST_LOCALE: Locale

export default function LocalizationProvider(props: LocalizationProviderProps): React.ReactElement {
  const localization = React.useMemo(() => new Localization(props.dictionary, props.defaultLocale), [props.dictionary, props.defaultLocale])

  React.useEffect(() => {
    const changedListener = (event: EmittedEvent) => {
      LAST_LOCALE = event.payload.locale
    }

    localization.on('locale', changedListener)

    // When the react reloads because of a change on the dictionary, the locale is reset to the default locale
    // and the one set previously is lost. This is a workaround to keep the locale between reloads.
    if (LAST_LOCALE && LAST_LOCALE !== localization.locale) {
      localization.setLocale(LAST_LOCALE)
    }

    return () => {
      localization.off('locale', changedListener)
    }
  }, [localization])

  return <context.Provider value={localization}>{props.children}</context.Provider>
}
