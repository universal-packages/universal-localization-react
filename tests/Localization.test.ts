import Localization from '../src/Localization'

const primaryDictionary = {
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

const secondaryDictionary = {
  goodbye: {
    en: 'Goodbye',
    es: 'Adiós',
    fr: 'Au revoir'
  }
}

const incompleteDictionary = {
  hello: {
    en: 'Hello',
    'en-US': 'Howdy',
    es: 'Hola'
  },
  world: {
    en: 'World',
    'fr-CM': 'Monde'
  }
}

describe(Localization, (): void => {
  describe('initialization', (): void => {
    it('should initialize with primary dictionary', (): void => {
      const localization = new Localization({ primaryDictionary })
      expect(localization.dictionary).toEqual(primaryDictionary)
      expect(localization.locale).toEqual('en')
    })

    it('should merge dictionaries when both are provided', (): void => {
      const localization = new Localization({ primaryDictionary, secondaryDictionary })
      expect(localization.dictionary).toHaveProperty('hello')
      expect(localization.dictionary).toHaveProperty('goodbye')
    })

    it('should use default locale when provided', (): void => {
      const localization = new Localization({ primaryDictionary, defaultLocale: 'es' })
      expect(localization.locale).toEqual('es')
    })
  })

  describe('locale selection and fallback', (): void => {
    it('should fallback to base language if specific variant not found', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization({ primaryDictionary, defaultLocale: 'en-GB' })

      expect(localization.locale).toEqual('en')
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: expect.stringContaining('falling back to base language "en"')
        })
      )

      warningSpy.mockRestore()
    })

    it('should fallback to any language variant if base not found', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      // Create dictionary with only 'fr-CM' but no 'fr'
      const frenchOnlyDictionary = {
        hello: { 'fr-CM': 'Bonjour' }
      }
      const localization = new Localization({ primaryDictionary: frenchOnlyDictionary, defaultLocale: 'fr' })

      expect(localization.locale).toEqual('fr-CM')
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: expect.stringContaining('falling back to variant "fr-CM"')
        })
      )

      warningSpy.mockRestore()
    })

    it('should fallback to any available locale if no matching language found', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization({ primaryDictionary, defaultLocale: 'ja' })

      // It will pick any available locale (likely 'en' as first in our dictionary)
      expect(localization.locale).toBeTruthy()
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: expect.stringContaining('No "ja" or variants found')
        })
      )

      warningSpy.mockRestore()
    })
  })

  describe('validation', (): void => {
    it('should detect missing translations', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization({ primaryDictionary: incompleteDictionary })

      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: expect.stringContaining('missing translations for locales')
        })
      )

      warningSpy.mockRestore()
    })

    it('should emit error when no translations found', (): void => {
      const errorSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization({ primaryDictionary: {} })

      expect(errorSpy).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'No localizations found in dictionary'
        })
      )

      errorSpy.mockRestore()
    })
  })

  describe('setLocale', (): void => {
    it('should allow changing locale after initialization', (): void => {
      const localization = new Localization({ primaryDictionary })
      expect(localization.locale).toEqual('en')

      localization.setLocale('es-MX')
      expect(localization.locale).toEqual('es-MX')
    })
  })
})
