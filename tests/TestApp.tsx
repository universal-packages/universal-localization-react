import React from 'react'

import { LocalizationProvider, useLocalization, useSetLocale, Locale } from '../src'

// Define types for the dictionaries
type AppDictionary = {
  test: Record<string, string>
  hello: Record<string, string>
  nested: {
    section: {
      title: Record<string, string>
      description: Record<string, string>
    }
  }
}

type ComponentDictionary = {
  additional: Record<string, string>
  withParams: Record<string, string>
}

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

// Secondary dictionary for testing merge functionality
export const secondaryDictionary = {
  goodbye: {
    en: 'Goodbye',
    es: 'Adiós',
    fr: 'Au revoir'
  }
}

interface TestDisplayProps {
  primaryDictionary?: any
  secondaryDictionary?: any
  overrideLocale?: Locale
  contextDictionaryOnly?: boolean
  testId?: string
}

export function TestDisplay({ 
  primaryDictionary, 
  secondaryDictionary, 
  overrideLocale,
  contextDictionaryOnly = false,
  testId = 'main'
}: TestDisplayProps): React.ReactElement {
  // Use type assertions for dictionaries to avoid TypeScript errors with dynamic properties
  const typedPrimary = primaryDictionary as typeof dictionary;
  const typedSecondary = secondaryDictionary as typeof secondaryDictionary;

  // Get translations according to the test parameters
  const { translate, locale, defaultLocale } = contextDictionaryOnly
    ? useLocalization<AppDictionary>(undefined, undefined, overrideLocale)
    : useLocalization<any, any>(primaryDictionary, secondaryDictionary, overrideLocale);
  
  // Get locale setter
  const setLocale = useSetLocale()
  
  return (
    <div data-testid={testId}>
      <h1 data-testid={`${testId}-heading`}>
        {typedPrimary?.test ? translate.test() : 'No test key'}
      </h1>
      
      {typedPrimary?.hello && (
        <p data-testid={`${testId}-hello`}>{translate.hello({ name: 'World' })}</p>
      )}
      
      {typedPrimary?.nested?.section && (
        <>
          <p data-testid={`${testId}-title`}>{(translate as any).nested.section.title()}</p>
          <p data-testid={`${testId}-description`}>
            {(translate as any).nested.section.description({ type: 'nested' })}
          </p>
        </>
      )}
      
      {typedSecondary?.goodbye && (
        <p data-testid={`${testId}-goodbye`}>{(translate as any).goodbye()}</p>
      )}
      
      <div>
        <button 
          data-testid={`${testId}-en-button`} 
          onClick={() => setLocale('en')}
        >
          English
        </button>
        <button 
          data-testid={`${testId}-es-button`} 
          onClick={() => setLocale('es')}
        >
          Spanish
        </button>
        <button 
          data-testid={`${testId}-fr-button`} 
          onClick={() => setLocale('fr')}
        >
          French
        </button>
      </div>
      
      <div data-testid={`${testId}-locale-info`}>
        <p data-testid={`${testId}-current-locale`}>Current locale: {locale}</p>
        <p data-testid={`${testId}-default-locale`}>Default locale: {defaultLocale}</p>
      </div>
    </div>
  )
}

interface TestAppProps {
  initialLocale?: Locale
  provideDictionary?: boolean
  useSecondaryDictionary?: boolean
  useLocaleDictionary?: boolean
  overrideComponentLocale?: Locale
}

export default function TestApp({
  initialLocale = 'en',
  provideDictionary = true,
  useSecondaryDictionary = false,
  useLocaleDictionary = false,
  overrideComponentLocale
}: TestAppProps): React.ReactElement {
  return (
    <LocalizationProvider 
      dictionary={provideDictionary ? dictionary : undefined} 
      locale={initialLocale}
    >
      {/* Test provider dictionary */}
      {provideDictionary && (
        <TestDisplay 
          primaryDictionary={dictionary}
          contextDictionaryOnly={true}
          testId="provider-only"
        />
      )}
      
      {/* Test component dictionary override */}
      <TestDisplay 
        primaryDictionary={useLocaleDictionary ? dictionary : undefined}
        secondaryDictionary={useSecondaryDictionary ? secondaryDictionary : undefined}
        overrideLocale={overrideComponentLocale}
        testId="component-override"
      />
    </LocalizationProvider>
  )
}
