# Localization React

[![npm version](https://badge.fury.io/js/@universal-packages%2Flocalization-react.svg)](https://www.npmjs.com/package/@universal-packages/localization-react)
[![Testing](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-localization-react/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-localization-react)

React bindings for [Localization](https://github.com/universal-packages/universal-localization).

## Install

```shell
npm install @universal-packages/localization-react
```

> Localization react uses exclusively the react hooks API so make sure you are using a recent version of React.

## Dictionary Structure

The localization dictionary now follows an inverted structure with locales at the leaf level, providing a more natural organization:

```js
const dictionary = {
  welcome: {
    title: {
      en: 'Welcome to our app',
      es: 'Bienvenido a nuestra aplicación'
    },
    subtitle: {
      en: 'Get started now',
      es: 'Comienza ahora'
    }
  },
  navigation: {
    home: {
      en: 'Home',
      es: 'Inicio'
    },
    profile: {
      en: 'Profile',
      es: 'Perfil'
    }
  }
}
```

This structure makes it easier to keep translations organized by feature rather than by language.

## Provider

Wrap your application with the `LocalizationProvider`. The dictionary is now optional, allowing for dynamic dictionary loading or component-specific dictionaries.

```jsx
import { LocalizationProvider } from '@universal-packages/localization-react'

const App = () => {
  return (
    <LocalizationProvider dictionary={dictionary} defaultLocale="en">
      {/* Your application */}
    </LocalizationProvider>
  )
}
```

## Hooks

### **`useLocalization()`**

Gets the context provided instance of the localization.

```jsx
import { useLocalization } from '@universal-packages/localization-react'

const LanguageSwitcher = () => {
  const localization = useLocalization()

  const handleLanguageChange = (locale) => {
    localization.setLocale(locale)
  }

  return (
    <div>
      <button onClick={() => handleLanguageChange('en')}>English</button>
      <button onClick={() => handleLanguageChange('es')}>Spanish</button>
      <p>Current locale: {localization.locale}</p>
    </div>
  )
}
```

### **`useTranslate([dictionary], [locale])`**

The enhanced `useTranslate` hook supports property-based access with TypeScript autocompletion, component-specific dictionaries, and forced locales. The hook automatically handles memoization, so there's no need to wrap your inputs with `useMemo`.

#### Basic Usage:

```tsx
import { useTranslate } from '@universal-packages/localization-react'

// For TypeScript autocomplete and type checking
type AppDictionary = typeof dictionary;

const BasicComponent = () => {
  const translate = useTranslate<AppDictionary>()

  return (
    <div>
      {/* Property-based access */}
      <h1>{translate.welcome.title()}</h1>
      <p>{translate.welcome.subtitle()}</p>
    </div>
  )
}
```

#### Property-Based Access with TypeScript Autocomplete:

```tsx
import { useTranslate } from '@universal-packages/localization-react'

// For TypeScript autocomplete and type checking
type AppDictionary = typeof dictionary;

const ComponentWithAutocomplete = () => {
  // With property-based access (provides TypeScript autocomplete)
  const translate = useTranslate<AppDictionary>(dictionary)

  return (
    <div>
      {/* Property-based access with function call */}
      <h1>{translate.welcome.title()}</h1>
      <p>{translate.welcome.subtitle()}</p>
      
      {/* With parameters */}
      <p>{translate.user.greeting({ name: 'David' })}</p>
      
      {/* Nested properties are fully supported */}
      <p>{translate.deeply.nested.property()}</p>
      
      {/* TypeScript will catch invalid properties */}
      {/* This would cause a TypeScript error: */}
      {/* translate.nonexistent.property() */}
    </div>
  )
}
```

#### With Component-Specific Dictionary:

```tsx
import { useTranslate } from '@universal-packages/localization-react'

// Component-specific translations
const componentDictionary = {
  specialFeature: {
    title: {
      en: 'Special Feature',
      es: 'Característica Especial'
    },
    description: {
      en: 'This is a {{type}} feature',
      es: 'Esta es una característica {{type}}'
    }
  }
}

// Type for component dictionary
type ComponentDict = typeof componentDictionary;

const FeatureComponent = () => {
  // Automatically merges with global dictionary
  const translate = useTranslate<ComponentDict>(componentDictionary)

  return (
    <div>
      {/* Access component-specific translations */}
      <h2>{translate.specialFeature.title()}</h2>
      <p>{translate.specialFeature.description({ type: 'premium' })}</p>
      
      {/* Access global translations */}
      <footer>{translate.common.footer()}</footer>
    </div>
  )
}
```

#### With Forced Locale:

```tsx
import { useTranslate } from '@universal-packages/localization-react'

// For TypeScript autocomplete and type checking
type AppDictionary = typeof dictionary;

const AlwaysSpanishComponent = () => {
  // Force Spanish locale for this component regardless of the app locale
  const translate = useTranslate<AppDictionary>('es')

  return (
    <div>
      {/* Always in Spanish regardless of the app locale */}
      <p>{translate.welcome.title()}</p>
    </div>
  )
}
```

#### With Both Dictionary and Forced Locale:

```tsx
import { useTranslate } from '@universal-packages/localization-react'

const componentDictionary = {
  legalNotice: {
    title: {
      en: 'Legal Notice',
      fr: 'Mention Légale'
    },
    content: {
      en: 'This content is legally required to be in French in some regions.',
      fr: 'Ce contenu doit légalement être en français dans certaines régions.'
    }
  }
}

// Type for component dictionary
type ComponentDict = typeof componentDictionary;

const LegalComponent = () => {
  // Component dictionary with forced French locale
  const translate = useTranslate<ComponentDict>(componentDictionary, 'fr')

  return (
    <div>
      {/* Always in French */}
      <h3>{translate.legalNotice.title()}</h3>
      <p>{translate.legalNotice.content()}</p>
    </div>
  )
}
```

## Variable Replacement

Variable replacement works with property-based access:

```tsx
// Dictionary
const dictionary = {
  greeting: {
    welcome: {
      en: 'Welcome, {{name}}!',
      es: '¡Bienvenido, {{name}}!'
    }
  }
}

// Property-based usage
translate.greeting.welcome({ name: 'David' })
```

## TypeScript Support

This library is fully typed with TypeScript, providing autocomplete for your dictionary structure and type checking for valid paths:

```tsx
// Your dictionary will generate the proper type structure
type AppDictionary = typeof dictionary;

// The translate object will provide autocomplete for all dictionary keys
const translate = useTranslate<AppDictionary>(dictionary);

// Access with full TypeScript support
translate.welcome.title() // ✓ Valid
translate.welcome.invalid() // ✗ TypeScript error - property doesn't exist in dictionary
translate.nonexistent.path() // ✗ TypeScript error - path doesn't exist in dictionary
```

## Recent Improvements

- **Property-Based Access Only**: All translations now use property-based access with function calls at leaf nodes for improved consistency and type safety
- **Enhanced Type Checking**: TypeScript will now properly check that all accessed translation keys exist in your dictionary
- **Automatic Memorization**: Dictionary and locale inputs to `useTranslate` are automatically memoized, eliminating the need for manual `useMemo` calls
- **Improved TypeScript Support**: Deep nested properties are properly typed with full autocomplete support without needing type assertions
- **Simplified API**: Component-specific dictionaries and forced locales work seamlessly without any additional boilerplate
- **Better Performance**: Optimized rendering with React's hooks to minimize unnecessary renders when locale changes

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
