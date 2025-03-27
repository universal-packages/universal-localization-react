import React from 'react'

import { LocalizationProvider, useLocalization } from '../src'

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

function TestDisplay(): React.ReactElement {
  return <div></div>
}

export default function TestApp(): React.ReactElement {
  return (
    <LocalizationProvider dictionary={dictionary} locale="en">
      <TestDisplay />
    </LocalizationProvider>
  )
}
