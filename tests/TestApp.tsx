import React from 'react'

import { LocalizationDictionary, LocalizationProvider, useLocalization, useTranslate } from '../src'

const dictionary: LocalizationDictionary = {
  en: {
    test: 'This is a test',
    hello: 'Hello {{name}}'
  },
  'es-MX': {
    test: 'Esto es una prueba',
    hello: 'Hola {{name}}'
  }
}

function TestDisplay(): React.ReactElement {
  const localization = useLocalization()
  const translate = useTranslate()

  const handleClick = (): void => {
    localization.setLocale('es')
  }

  return (
    <div>
      <h1>Title: {translate('test')}</h1>
      <p>Greating: {translate('hello', { name: 'David' })}</p>
      <button onClick={handleClick}>Change</button>
    </div>
  )
}

export default function TestApp(): React.ReactElement {
  return (
    <LocalizationProvider dictionary={dictionary}>
      <TestDisplay></TestDisplay>
    </LocalizationProvider>
  )
}
