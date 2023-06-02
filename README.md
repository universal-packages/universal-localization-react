# Localization React

[![npm version](https://badge.fury.io/js/@universal-packages%2Flocalization-react.svg)](https://www.npmjs.com/package/@universal-packages/localization-react)
[![Testing](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-localization-react/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-localization-react/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-localization-react)

React bindings for [ Localization](https://github.com/universal-packages/universal-localization).

## Install

```shell
npm install @universal-packages/localization-react
```

> Localization react uses exclusively the react hooks API so make sure you are using a recent version of React.

## Provider

Make sure you wrap your application with the `LocalizationProvider` so the localization object is available for all components in the tree.

```js
import { LocalizationProvider } from '@universal-packages/localization-react'

const App = () => {

  return <LocalizationProvider dictionary={dictionary} defaultLocale="es-ES">
    /** Some other components */
  <LocalizationProvider>
}
```
## Hooks

#### **`useLocalization()`**

Gets the context provided instance of the localization.

```js
import { useLocalization } from '@universal-packages/localization-react'

const HappyComponent = () => {
  const localization = useLocalization()

  const handleClick = (): void => {
    localization.setLocale('es_MX')
  }

  return (
    <div>
      <button onClick={handleClick}>Change Locale</button>
    </div>
  )
}
```

#### **`useTranslate(subject: String, [locales: Object])`**

Observes localization changes and returns a function to use to translate the provided subject.

```js
import { useTranslate } from '@universal-packages/localization-react'

const HappyComponent = () => {
  const translate = useTranslate()

  return (
    <div>
      <h1>{translate('happy.title')}</h1>
      <p>{translate('happy.content')}</p>
    </div>
  )
}
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
