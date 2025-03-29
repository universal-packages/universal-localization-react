# Localization React

[![npm version](https://badge.fury.io/js/@universal-packages%2Flocalization-react.svg)](https://www.npmjs.com/package/@universal-packages/localization-react)
[![Testing](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-localization-react/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-localization-react)

React bindings for [Localization](https://github.com/universal-packages/universal-localization).

## Install

```shell
npm install @universal-packages/localization-react
```

## LocalizationProvider

The `LocalizationProvider` component wraps your application to provide localization context to all components.

```tsx
import { LocalizationProvider } from '@universal-packages/localization-react'

const dictionary = {
  welcome: { en: 'Welcome', es: 'Bienvenido' },
  greeting: { en: 'Hello {{name}}', es: 'Hola {{name}}' }
}

function App() {
  return (
    <LocalizationProvider dictionary={dictionary} locale="en">
      <YourApp />
    </LocalizationProvider>
  )
}
```

## Using translations

### Basic usage

The `useLocalization` hook gives access to translations in any component:

```tsx
import { useLocalization } from '@universal-packages/localization-react'

function WelcomeMessage() {
  const { translate } = useLocalization()
  
  return (
    <div>
      <h1>{translate.welcome()}</h1>
      <p>{translate.greeting({ name: 'User' })}</p>
    </div>
  )
}
```

### Changing locale

The `useSetLocale` hook provides a function to change the active locale:

```tsx
import { useSetLocale } from '@universal-packages/localization-react'

function LanguageSwitcher() {
  const setLocale = useSetLocale()
  
  return (
    <div>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('es')}>Español</button>
    </div>
  )
}
```

### Component-level dictionary and locale override

Components can have their own dictionaries and even override the locale:

```tsx
import { useLocalization } from '@universal-packages/localization-react'

const componentDictionary = {
  submitButton: { en: 'Submit', es: 'Enviar' }
}

function Form() {
  // Optional: component dictionary and locale override
  const { translate } = useLocalization(componentDictionary, 'fr')
  
  return (
    <form>
      {/* Component-specific translations */}
      <button>{translate.submitButton()}</button>
      
      {/* Global translations are still accessible */}
      <h2>{translate.welcome()}</h2>
    </form>
  )
}
```

## Advanced features

### Nested translations

Translation keys can be deeply nested:

```tsx
const dictionary = {
  user: {
    profile: {
      title: { en: 'Profile', es: 'Perfil' },
      fields: {
        name: { en: 'Name', es: 'Nombre' }
      }
    }
  }
}

// Access using dot notation
translate.user.profile.title()
translate.user.profile.fields.name()
```

### Variable replacement

Include variables in your translations with double curly braces:

```tsx
const dictionary = {
  greeting: { 
    en: 'Hello {{name}}!',
    es: '¡Hola {{name}}!'
  },
  items: {
    en: 'You have {{count}} {{item}}',
    es: 'Tienes {{count}} {{item}}'
  }
}

translate.greeting({ name: 'John' })  // "Hello John!"
translate.items({ count: 5, item: 'messages' })  // "You have 5 messages"
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
