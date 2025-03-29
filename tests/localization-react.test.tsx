import '@testing-library/jest-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Locale, LocalizationProvider, useLocalization, useSetLocale } from '../src'

describe('localization-react', (): void => {
  beforeEach((): void => {
    cleanup()
  })

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

    cleanup()

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

    cleanup()

    render(<TestApp locale="es" />)
    expect(screen.getByText('Hola desde el componente')).toBeInTheDocument()
    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('Mundo')).toBeInTheDocument()
  })

  it('should update locale across components when using useSetLocale', async (): Promise<void> => {
    const dictionary = {
      hello: { en: 'Hello', es: 'Hola', fr: 'Bonjour' },
      world: { en: 'World', es: 'Mundo', fr: 'Monde' }
    }

    const LocaleSwitcher = () => {
      const setLocale = useSetLocale()
      return (
        <div>
          <button onClick={() => setLocale('en')}>English</button>
          <button onClick={() => setLocale('es')}>Spanish</button>
          <button onClick={() => setLocale('fr')}>French</button>
        </div>
      )
    }

    const Content = () => {
      const localization = useLocalization<typeof dictionary>()
      return (
        <div>
          <div data-testid="locale">{localization.locale}</div>
          <div>{localization.translate.hello()}</div>
          <div>{localization.translate.world()}</div>
        </div>
      )
    }

    const TestApp = () => {
      return (
        <LocalizationProvider dictionary={dictionary} locale="en">
          <LocaleSwitcher />
          <Content />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByTestId('locale')).toHaveTextContent('en')
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Spanish'))
    expect(screen.getByTestId('locale')).toHaveTextContent('es')
    expect(screen.getByText('Hola')).toBeInTheDocument()
    expect(screen.getByText('Mundo')).toBeInTheDocument()

    fireEvent.click(screen.getByText('French'))
    expect(screen.getByTestId('locale')).toHaveTextContent('fr')
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
    expect(screen.getByText('Monde')).toBeInTheDocument()
  })

  it('should handle nested translation keys', async (): Promise<void> => {
    const dictionary = {
      user: {
        profile: {
          title: { en: 'User Profile', es: 'Perfil de Usuario' },
          details: {
            name: { en: 'Name', es: 'Nombre' },
            email: { en: 'Email', es: 'Correo electrónico' }
          }
        }
      }
    }

    const UserProfile = () => {
      const localization = useLocalization<typeof dictionary>()
      return (
        <div>
          <h1>{localization.translate.user.profile.title()}</h1>
          <div>{localization.translate.user.profile.details.name()}: John Doe</div>
          <div>{localization.translate.user.profile.details.email()}: john@example.com</div>
        </div>
      )
    }

    const TestApp = (props: { locale?: Locale }) => {
      return (
        <LocalizationProvider dictionary={dictionary} locale={props.locale}>
          <UserProfile />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByText('User Profile')).toBeInTheDocument()
    expect(screen.getByText('Name: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()

    cleanup()

    render(<TestApp locale="es" />)
    expect(screen.getByText('Perfil de Usuario')).toBeInTheDocument()
    expect(screen.getByText('Nombre: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Correo electrónico: john@example.com')).toBeInTheDocument()
  })

  it('should handle variable replacement in translations', async (): Promise<void> => {
    const dictionary = {
      greeting: {
        en: 'Hello {{name}}!',
        es: '¡Hola {{name}}!'
      },
      message: {
        en: 'You have {{count}} new {{type}}',
        es: 'Tienes {{count}} {{type}} nuevo(s)'
      }
    }

    const Greeting = () => {
      const localization = useLocalization<typeof dictionary>()
      return (
        <div>
          <div>{localization.translate.greeting({ name: 'John' })}</div>
          <div>{localization.translate.message({ count: 5, type: 'messages' })}</div>
        </div>
      )
    }

    const TestApp = (props: { locale?: Locale }) => {
      return (
        <LocalizationProvider dictionary={dictionary} locale={props.locale}>
          <Greeting />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByText('Hello John!')).toBeInTheDocument()
    expect(screen.getByText('You have 5 new messages')).toBeInTheDocument()

    cleanup()

    render(<TestApp locale="es" />)
    expect(screen.getByText('¡Hola John!')).toBeInTheDocument()
    expect(screen.getByText('Tienes 5 messages nuevo(s)')).toBeInTheDocument()
  })

  it('should handle locale fallback when specific locale is not available', async (): Promise<void> => {
    // Dictionary with some locales missing certain translations
    const dictionary = {
      hello: { en: 'Hello', es: 'Hola', 'fr-CA': 'Bonjour' },
      world: { en: 'World', es: 'Mundo' },
      welcome: { en: 'Welcome', 'en-US': "Welcome y'all" }
    }

    const TestComponent = () => {
      const localization = useLocalization<typeof dictionary>()
      return (
        <div>
          <div>{localization.locale}</div>
          <div>{localization.translate.hello()}</div>
          <div>{localization.translate.world()}</div>
          <div>{localization.translate.welcome()}</div>
        </div>
      )
    }

    const TestApp = (props: { locale?: Locale }) => {
      return (
        <LocalizationProvider dictionary={dictionary} locale={props.locale}>
          <TestComponent />
        </LocalizationProvider>
      )
    }

    render(<TestApp locale="fr" />)

    expect(screen.getByText('fr-CA')).toBeInTheDocument()
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
    expect(screen.getByText('[missing translation: world]')).toBeInTheDocument()
    expect(screen.getByText('[missing translation: welcome]')).toBeInTheDocument()

    cleanup()

    render(<TestApp locale="en-US" />)

    expect(screen.getByText('[missing translation: hello]')).toBeInTheDocument()
    expect(screen.getByText('[missing translation: world]')).toBeInTheDocument()
    expect(screen.getByText("Welcome y'all")).toBeInTheDocument()

    cleanup()

    render(<TestApp locale="en" />)

    expect(screen.getByText('en')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('should allow overriding locale at component level', async (): Promise<void> => {
    const dictionary = {
      greeting: { en: 'Hello', es: 'Hola', fr: 'Bonjour' }
    }

    const ComponentWithOverride = () => {
      // Override locale with 'fr'
      const localization = useLocalization<typeof dictionary>(undefined, 'fr')
      return <div data-testid="override">{localization.translate.greeting()}</div>
    }

    const ComponentDefault = () => {
      const localization = useLocalization<typeof dictionary>()
      return <div data-testid="default">{localization.translate.greeting()}</div>
    }

    const TestApp = () => {
      return (
        <LocalizationProvider dictionary={dictionary} locale="en">
          <ComponentWithOverride />
          <ComponentDefault />
        </LocalizationProvider>
      )
    }

    render(<TestApp />)
    expect(screen.getByTestId('override')).toHaveTextContent('Bonjour')
    expect(screen.getByTestId('default')).toHaveTextContent('Hello')
  })
})
