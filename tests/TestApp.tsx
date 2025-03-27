import React from 'react'

import { LocalizationProvider, useLocalization, useTranslate } from '../src'

// Inverted dictionary structure
const dictionary = {
  test: {
    en: 'This is a test',
    es: 'Esto es una prueba'
  },
  hello: {
    en: 'Hello {{name}}',
    es: 'Hola {{name}}'
  },
  nested: {
    section: {
      title: {
        en: 'Nested Section Title',
        es: 'Título de Sección Anidada'
      },
      description: {
        en: 'This is a {{type}} description',
        es: 'Esta es una descripción {{type}}'
      }
    }
  }
}

// Component-specific dictionary
const componentDictionary = {
  additional: {
    en: 'Additional text',
    es: 'Texto adicional',
    fr: 'Texte supplémentaire'
  },
  withParams: {
    en: 'Parameter: {{value}}',
    es: 'Parámetro: {{value}}',
    fr: 'Paramètre: {{value}}'
  }
}

// For demonstrating forced locale
function TestForcedLocale(): React.ReactElement {
  // Force es locale for this component only
  type AppDictionary = typeof dictionary
  const translate = useTranslate<AppDictionary>('es')

  return (
    <div>
      <h2>Forced Locale (es): {translate.test()}</h2>
    </div>
  )
}

// For demonstrating component-specific dictionary
function TestComponentDictionary(): React.ReactElement {
  // Use component-specific dictionary
  type ComponentDict = typeof componentDictionary
  const translate = useTranslate<ComponentDict>(componentDictionary)

  return (
    <div>
      <h2>Component Dictionary: {translate.additional()}</h2>
      <p>With Parameters: {translate.withParams({ value: 'test' })}</p>
    </div>
  )
}

// For demonstrating component dictionary with forced locale
function TestComponentWithLocale(): React.ReactElement {
  // Use component-specific dictionary with forced locale
  type ComponentDict = typeof componentDictionary
  const translate = useTranslate<ComponentDict>(componentDictionary, 'fr')

  return (
    <div>
      <h2>Component Dictionary with Forced Locale (fr): {translate.additional()}</h2>
      <p>With Parameters: {translate.withParams({ value: 'test' })}</p>
    </div>
  )
}

// For demonstrating TypeScript autocomplete with property access
function TestAutoComplete(): React.ReactElement {
  // Use autocomplete through proxy object
  type AppDictionary = typeof dictionary
  const translate = useTranslate<AppDictionary>(dictionary)

  return (
    <div>
      <h2>Autocomplete: {translate.test()}</h2>
      <p>With Params: {translate.hello({ name: 'David' })}</p>
      <p>Nested Properties: {translate.nested.section.title()}</p>
      <p>Nested with Params: {translate.nested.section.description({ type: 'nested' })}</p>
    </div>
  )
}

function TestDisplay(): React.ReactElement {
  const localization = useLocalization()
  type AppDictionary = typeof dictionary
  const translate = useTranslate<AppDictionary>(dictionary)

  const handleToggleLocale = (): void => {
    const newLocale = localization.locale === 'en' ? 'es' : 'en'
    localization.setLocale(newLocale)
  }

  return (
    <div>
      <h1>Current Locale: {localization.locale}</h1>
      <h1>Basic: {translate.test()}</h1>
      <p>Greeting: {translate.hello({ name: 'David' })}</p>
      <button onClick={handleToggleLocale}>Toggle Locale</button>

      <hr />

      <TestForcedLocale />
      <TestComponentDictionary />
      <TestComponentWithLocale />
      <TestAutoComplete />
    </div>
  )
}

export default function TestApp(): React.ReactElement {
  return (
    <LocalizationProvider dictionary={dictionary} defaultLocale="en">
      <TestDisplay />
    </LocalizationProvider>
  )
}
