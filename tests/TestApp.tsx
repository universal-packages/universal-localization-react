import React from 'react'

import { LocalizationProvider, useLocalization, useSetLocale } from '../src'

export const dictionary = {
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

export function TestDisplay() {
  const localization = useLocalization(componentDictionary)
  const setLocale = useSetLocale()

  return <div data-testid="test-app"></div>
}

export default function TestApp() {
  return (
    <LocalizationProvider dictionary={dictionary}>
      <TestDisplay />
    </LocalizationProvider>
  )
}
