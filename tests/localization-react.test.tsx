import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import TestApp, { secondaryDictionary, TestDisplay, dictionary } from './TestApp'
import { LocalizationProvider, useLocalization, useSetLocale, Locale } from '../src'

// Mock the useSetLocale hook to reset the global state before each test
jest.mock('../src/hooks', () => {
  const original = jest.requireActual('../src/hooks');
  return {
    ...original,
    useSetLocale: () => {
      const setLocale = original.useSetLocale();
      // Always reset to English at the beginning of each test
      React.useEffect(() => {
        setLocale('en');
      }, []);
      return setLocale;
    }
  };
});

describe('localization-react', (): void => {
  // Reset locale before each test to ensure consistent starting state
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('TestApp', (): void => {
    it('renders correctly with default settings', (): void => {
      render(<TestApp />)
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      expect(screen.getByTestId('provider-only-hello')).toHaveTextContent('Hello World')
    })

    it('changes locale when buttons are clicked', (): void => {
      render(<TestApp />)
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      
      // Click Spanish button
      fireEvent.click(screen.getByTestId('provider-only-es-button'))
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('Esto es una prueba')
      expect(screen.getByTestId('provider-only-hello')).toHaveTextContent('Hola World')
      
      // Click English button
      fireEvent.click(screen.getByTestId('provider-only-en-button'))
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
    })
  })

  describe('useLocalization hook', (): void => {
    it('uses the context dictionary when no dictionaries provided', (): void => {
      render(<TestApp provideDictionary={true} useLocaleDictionary={false} />)
      expect(screen.getByTestId('component-override-current-locale')).toHaveTextContent('Current locale: en')
      // Component doesn't show content because no dictionary was provided to it directly
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('No test key')
    })

    it('overrides context dictionary with provided dictionary', (): void => {
      render(<TestApp provideDictionary={false} useLocaleDictionary={true} />)
      
      // Provider section will not exist because no provider dictionary
      expect(screen.queryByTestId('provider-only')).not.toBeInTheDocument()
      
      // Component section will have content from its own dictionary
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('This is a test')
      expect(screen.getByTestId('component-override-hello')).toHaveTextContent('Hello World')
    })

    it('uses both primary and secondary dictionaries', (): void => {
      render(
        <TestApp 
          provideDictionary={false} 
          useLocaleDictionary={true} 
          useSecondaryDictionary={true}
        />
      )
      
      // Content from primary dictionary
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('This is a test')
      
      // Content from secondary dictionary
      expect(screen.getByTestId('component-override-goodbye')).toHaveTextContent('Goodbye')
    })

    it('falls back to empty dictionary when neither context nor parameters provide one', (): void => {
      // Create a component with TestDisplay directly with no dictionaries provided anywhere
      render(
        <LocalizationProvider>
          <TestDisplay testId="fallback-empty" />
        </LocalizationProvider>
      )
      
      // Should render with no errors, showing empty state
      expect(screen.getByTestId('fallback-empty-heading')).toHaveTextContent('No test key')
      expect(screen.getByTestId('fallback-empty-current-locale')).toHaveTextContent('Current locale: en')
    })

    it('overrides context locale with component locale', (): void => {
      render(
        <TestApp
          initialLocale="en"
          provideDictionary={true}
          useLocaleDictionary={true} 
          overrideComponentLocale="es"
        />
      )
      
      // Provider section uses context locale (en)
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      
      // Component section uses overridden locale (es)
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
      expect(screen.getByTestId('component-override-current-locale')).toHaveTextContent('Current locale: es')
    })

    it('handles missing translations with fallbacks', (): void => {
      // Create a component with TestDisplay directly for more control
      render(
        <LocalizationProvider locale="fr">
          <TestDisplay 
            primaryDictionary={{ hello: { en: 'Hello', es: 'Hola' } }}
            testId="fallback-test"
          />
        </LocalizationProvider>
      )
      
      // Should fallback to English even though we requested French
      expect(screen.getByTestId('fallback-test-hello')).toHaveTextContent('Hello')
    })

    it('respects locale changes while preserving override', (): void => {
      render(
        <TestApp
          initialLocale="en"
          provideDictionary={true}
          useLocaleDictionary={true} 
          overrideComponentLocale="es"
        />
      )
      
      // Initial state
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
      
      // Change context locale to Spanish
      fireEvent.click(screen.getByTestId('provider-only-es-button'))
      
      // Provider section should update to Spanish
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('Esto es una prueba')
      
      // Component section should remain Spanish (from override)
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
    })
  })

  describe('useSetLocale hook', (): void => {
    it('changes provider locale across components', (): void => {
      const { rerender } = render(
        <TestApp 
          initialLocale="en" 
          provideDictionary={true} 
          useLocaleDictionary={true} 
        />
      )
      
      // Force a re-render with the same props to ensure we get a fresh state
      rerender(
        <TestApp 
          initialLocale="en" 
          provideDictionary={true} 
          useLocaleDictionary={true} 
        />
      )
      
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('This is a test')
      
      // Change locale through one component
      fireEvent.click(screen.getByTestId('component-override-es-button'))
      
      // Both components should update
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('Esto es una prueba')
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
    })
    
    it('propagates locale changes to all components except those with overrides', (): void => {
      const { rerender } = render(
        <TestApp
          initialLocale="en"
          provideDictionary={true}
          useLocaleDictionary={true} 
          overrideComponentLocale="es"
        />
      )
      
      // Force a re-render with the same props to ensure we get a fresh state
      rerender(
        <TestApp
          initialLocale="en"
          provideDictionary={true}
          useLocaleDictionary={true} 
          overrideComponentLocale="es"
        />
      )
      
      // Initial state
      expect(screen.getByTestId('provider-only-heading')).toHaveTextContent('This is a test')
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
      
      // Change provider locale to French 
      fireEvent.click(screen.getByTestId('provider-only-fr-button'))
      
      // Provider component should update to fallback (since we don't have French)
      // Component with override should stay in Spanish
      expect(screen.getByTestId('component-override-heading')).toHaveTextContent('Esto es una prueba')
    })
  })
})
