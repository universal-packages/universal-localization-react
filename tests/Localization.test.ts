import { Localization } from '../src'

// Inverted dictionary structure
const invertedDictionary = {
  hello: {
    en: 'Hello',
    'en-US': 'Howdy',
    es: 'Hola',
    'es-MX': 'Que onda',
    'fr-CM': 'Bonjour'
  },
  world: {
    en: 'World',
    'en-US': 'World',
    es: 'Mundo',
    'es-MX': 'Mundo',
    'fr-CM': 'Monde'
  },
  name: {
    hello: {
      en: 'Hello {{name}} {{emoji}}',
      'en-US': 'Howdy {{name}} {{emoji}}',
      es: 'Hola {{name}} {{emoji}}',
      'es-MX': 'Que onda {{name}} {{emoji}}',
      'fr-CM': 'Bonjour {{name}} {{emoji}}'
    }
  }
}

// Component-specific dictionary to test merging
const componentDictionary = {
  goodbye: {
    en: 'Goodbye',
    es: 'Adiós',
    fr: 'Au revoir'
  }
}

describe(Localization, (): void => {
  describe('with inverted dictionary structure', () => {
    it('translates by using the default and set locale', (): void => {
      const localization = new Localization(invertedDictionary)
  
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
  
    it('translates when no dictionary is provided', (): void => {
      const localization = new Localization()
      
      expect(localization.locale).toEqual('en')
      expect(localization.translate('hello')).toEqual('missing <hello>')
      expect(localization.translate('world')).toEqual('missing <world>')

      // Add translations after initialization
      localization.mergeDictionary({
        hello: { en: 'Hello', es: 'Hola' },
        world: { en: 'World', es: 'Mundo' }
      })

      expect(localization.translate('hello')).toEqual('Hello')
      expect(localization.translate('world')).toEqual('World')

      localization.setLocale('es')
      expect(localization.translate('hello')).toEqual('Hola')
      expect(localization.translate('world')).toEqual('Mundo')
    })

    it('merges dictionaries from different components', (): void => {
      const localization = new Localization(invertedDictionary)
      
      // Before merging
      expect(localization.translate('goodbye')).toEqual('missing <goodbye>')
      
      // After merging
      localization.mergeDictionary(componentDictionary)
      expect(localization.translate('hello')).toEqual('Hello')
      expect(localization.translate('goodbye')).toEqual('Goodbye')
      
      // Change locale
      localization.setLocale('es')
      expect(localization.translate('hello')).toEqual('Hola')
      expect(localization.translate('goodbye')).toEqual('Adiós')
      
      // Test with a locale that exists only in component dictionary
      localization.setLocale('fr')
      expect(localization.translate('goodbye')).toEqual('Au revoir')
    })

    it('handles locale fallbacks properly', (): void => {
      const localization = new Localization(invertedDictionary)
  
      // Fallback to language match
      localization.setLocale('fr')
      expect(localization.locale).toEqual('fr')
      expect(localization.translate('hello')).toEqual('Bonjour') // Should find fr-CM for 'fr'
      
      // Fallback when no exact region match
      localization.setLocale('es-AR')
      expect(localization.locale).toEqual('es-AR')
      expect(localization.translate('hello')).toEqual('Hola') // Should find 'es' for 'es-AR'
      
      // Fallback to first available if no match
      localization.setLocale('zh')
      expect(localization.locale).toEqual('zh')
      expect(localization.translate('hello')).toEqual('Hello') // Should use first available locale
    })
  })

  describe('error handling', () => {
    it('returns the same subject when no translation exists', (): void => {
      const localization = new Localization(invertedDictionary)
  
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
  })

  it('emits an event when the locale is changed', (): void => {
    const localization = new Localization(invertedDictionary)
    const callback = jest.fn()

    localization.on('locale', callback)
    localization.setLocale('es-MX')

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      event: 'locale',
      payload: expect.objectContaining({
        locale: 'es-MX'
      })
    }))
  })
})
