import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Locale, LocalizationProvider, useLocalization, useSetLocale } from '../src'

describe('localization-react', (): void => {
  it('should share localization capabilities across all components', async (): Promise<void> => {
    const dictionary = {
      hello: { en: 'Hello', es: 'Hola' },
      world: { en: 'World', es: 'Mundo' }
    }

    const ComponentOne = () => {
      const localization = useLocalization<typeof dictionary>()
      return <div>{localization.translate.hello()}</div>
    }

    const ComponentTwo = () => {
      const localization = useLocalization<typeof dictionary>()
      return <div>{localization.translate.world()}</div>
    }

    const TestApp = (props: { locale?: Locale }) => {
      return (
        <LocalizationProvider dictionary={dictionary} locale={props.locale}>
          <ComponentOne />
          <ComponentTwo />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()

    render(<TestApp locale="es" />)
    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('Mundo')).toBeInTheDocument()
  })

  it('should be able to use component dedicated dictionary', async (): Promise<void> => {
    const dictionary = {
      hello: { en: 'Hello', es: 'Hola' },
      world: { en: 'World', es: 'Mundo' }
    }
    const componentDictionary = {
      greeting: { en: 'Hello from component', es: 'Hola desde el componente' }
    }

    const ComponentOne = () => {
      const localization = useLocalization<typeof componentDictionary, typeof dictionary>(componentDictionary)
      return (
        <div>
          <div>{localization.translate.greeting()}</div>
          <div>{localization.translate.hello()}</div>
          <div>{localization.translate.world()}</div>
        </div>
      )
    }

    const TestApp = (props: { locale?: Locale }) => {
      return (
        <LocalizationProvider dictionary={dictionary} locale={props.locale}>
          <ComponentOne />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByText('Hello from component')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()

    render(<TestApp locale="es" />)
    expect(screen.getByText('Hola desde el componente')).toBeInTheDocument()
    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('Mundo')).toBeInTheDocument()
  })
})
