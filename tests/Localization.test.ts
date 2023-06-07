import { Localization, LocalizationDictionary } from '../src'

const dictionary: LocalizationDictionary = {
  en: {
    hello: 'Hello',
    world: 'World',
    name: {
      hello: 'Hello {{name}} {{emoji}}'
    }
  },
  'en-US': {
    hello: 'Howdy',
    world: 'World',
    name: {
      hello: 'Howdy {{name}} {{emoji}}'
    }
  },
  es: {
    hello: 'Hola',
    world: 'Mundo',
    name: {
      hello: 'Hola {{name}} {{emoji}}'
    }
  },
  'es-MX': {
    hello: 'Que onda',
    world: 'Mundo',
    name: {
      hello: 'Que onda {{name}} {{emoji}}'
    }
  },
  'fr-CM': {
    hello: 'Bonjour',
    world: 'Monde',
    name: {
      hello: 'Bonjour {{name}} {{emoji}}'
    }
  }
}

describe(Localization, (): void => {
  it('translates by using the default and set locale', (): void => {
    const localization = new Localization(dictionary)

    expect(localization.locale).toEqual('en')
    expect(localization.translate('hello')).toEqual('Hello')
    expect(localization.translate('world')).toEqual('World')
    expect(localization.translate('name.hello', { name: 'John', emoji: '👋' })).toEqual('Hello John 👋')

    localization.setLocale('en-US')
    expect(localization.locale).toEqual('en-US')
    expect(localization.translate('hello')).toEqual('Howdy')
    expect(localization.translate('world')).toEqual('World')
    expect(localization.translate('name.hello', { name: 'John', emoji: '👋' })).toEqual('Howdy John 👋')

    localization.setLocale('es')
    expect(localization.locale).toEqual('es')
    expect(localization.translate('hello')).toEqual('Hola')
    expect(localization.translate('world')).toEqual('Mundo')
    expect(localization.translate('name.hello', { name: 'Juan', emoji: '👋' })).toEqual('Hola Juan 👋')

    localization.setLocale('es-MX')
    expect(localization.locale).toEqual('es-MX')
    expect(localization.translate('hello')).toEqual('Que onda')
    expect(localization.translate('world')).toEqual('Mundo')
    expect(localization.translate('name.hello', { name: 'Juanito', emoji: '👋' })).toEqual('Que onda Juanito 👋')
  })

  it('translates by using the default locale when no locale is passed on set', (): void => {
    const localization = new Localization(dictionary)

    localization.setLocale()
    expect(localization.locale).toEqual('en')
    expect(localization.translate('hello')).toEqual('Hello')
    expect(localization.translate('world')).toEqual('World')
    expect(localization.translate('name.hello', { name: 'John', emoji: '👋' })).toEqual('Hello John 👋')
  })

  it('translate by using the closest locale when the set locale is not found', (): void => {
    const localization = new Localization(dictionary)

    localization.setLocale('fr-CA')
    expect(localization.locale).toEqual('fr-CM')
    expect(localization.translate('hello')).toEqual('Bonjour')
    expect(localization.translate('world')).toEqual('Monde')
    expect(localization.translate('name.hello', { name: 'Jean', emoji: '👋' })).toEqual('Bonjour Jean 👋')

    localization.setLocale('fr')
    expect(localization.locale).toEqual('fr-CM')
    expect(localization.translate('hello')).toEqual('Bonjour')
    expect(localization.translate('world')).toEqual('Monde')
    expect(localization.translate('name.hello', { name: 'Jean', emoji: '👋' })).toEqual('Bonjour Jean 👋')

    localization.setLocale('es-AR')
    expect(localization.locale).toEqual('es')
    expect(localization.translate('hello')).toEqual('Hola')
    expect(localization.translate('world')).toEqual('Mundo')
    expect(localization.translate('name.hello', { name: 'Juan', emoji: '👋' })).toEqual('Hola Juan 👋')
  })

  it('translate by using the first found locale if no locale can by found closest to the requested one', (): void => {
    const localization = new Localization(dictionary, 'es-MX')

    localization.setLocale('ar')
    expect(localization.locale).toEqual('en')
    expect(localization.translate('hello')).toEqual('Hello')
    expect(localization.translate('world')).toEqual('World')
    expect(localization.translate('name.hello', { name: 'John', emoji: '👋' })).toEqual('Hello John 👋')
  })

  it('returns the same subject when no translation exists', (): void => {
    const localization = new Localization(dictionary)

    expect(localization.translate('foo')).toEqual('missing <foo>')
    expect(localization.translate('foo.bar')).toEqual('missing <foo.bar>')
    expect(localization.translate('foo.bar.baz')).toEqual('missing <foo.bar.baz>')
    expect(localization.translate('name', { name: 'John', emoji: '👋' })).toEqual('missing <name>')
  })

  it('returns the same subject when no translation exists and the default locale is not found', (): void => {
    const localization = new Localization({})

    localization.setLocale('ar')
    expect(localization.translate('foo')).toEqual('missing <foo>')
    expect(localization.translate('foo.bar')).toEqual('missing <foo.bar>')
    expect(localization.translate('foo.bar.baz')).toEqual('missing <foo.bar.baz>')
    expect(localization.translate('name', { name: 'John', emoji: '👋' })).toEqual('missing <name>')
  })

  it('emits an event when the locale is changed', (): void => {
    const localization = new Localization(dictionary)
    const callback = jest.fn()

    localization.on('locale', callback)
    localization.setLocale('es-MX')

    expect(callback).toHaveBeenCalledWith('es-MX', { hello: 'Que onda', world: 'Mundo', name: { hello: 'Que onda {{name}} {{emoji}}' } })
  })
})
