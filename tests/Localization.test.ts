import { Localization } from '../src/Localization'

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
    'en-US': 'Bye',
    es: 'Adiós',
    'es-MX': 'Camara',
    'fr-CM': 'Au revoir'
  },
  deep: {
    nested: {
      key: {
        en: 'Deep nested key',
        'en-US': 'Deep nested key',
        es: 'Clave anidada profunda',
        'es-MX': 'Clave nesteada profunda',
        'fr-CM': 'Clé imbriquée profonde'
      }
    }
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
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })
      expect(localization.dictionary).toEqual(primaryDictionary)
      expect(localization.locale).toEqual('en')
    })

    it('should merge dictionaries when both are provided', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary, secondaryDictionary })
      expect(localization.dictionary).toHaveProperty('hello')
      expect(localization.dictionary).toHaveProperty('goodbye')
    })

    it('should use default locale when provided', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary, defaultLocale: 'es' })
      expect(localization.locale).toEqual('es')
    })
  })

  describe('locale selection and fallback', (): void => {
    it('should fallback to base language if specific variant not found', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary, defaultLocale: 'en-GB' })

      expect(localization.locale).toEqual('en')
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'Locale "en-GB" not found, falling back to base language "en"'
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
      const localization = new Localization<typeof frenchOnlyDictionary>({ primaryDictionary: frenchOnlyDictionary, defaultLocale: 'fr' })

      expect(localization.locale).toEqual('fr-CM')
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'Base language "fr" not found, falling back to variant "fr-CM"'
        })
      )

      warningSpy.mockRestore()
    })

    it('should fallback to any available locale if no matching language found', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary, defaultLocale: 'ja' })

      // It will pick any available locale (likely 'en' as first in our dictionary)
      expect(localization.locale).toBeTruthy()
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'No "ja" or variants found, falling back to "en"'
        })
      )

      warningSpy.mockRestore()
    })
  })

  describe('validation', (): void => {
    it('should detect missing translations', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization<typeof incompleteDictionary>({ primaryDictionary: incompleteDictionary })

      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'Translation key "hello" is missing translations for locales: fr-CM'
        })
      )
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'Translation key "world" is missing translations for locales: en-US, es'
        })
      )

      warningSpy.mockRestore()
    })

    it('should emit error when no translations found', (): void => {
      const errorSpy = jest.spyOn(Localization.prototype, 'emit')
      const localization = new Localization<{}>({ primaryDictionary: {} })

      expect(errorSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'No localizations found in dictionary'
        })
      )

      errorSpy.mockRestore()
    })
  })

  describe('setLocale', (): void => {
    it('should allow changing locale after initialization', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })
      expect(localization.locale).toEqual('en')

      localization.setLocale('es-MX')
      expect(localization.locale).toEqual('es-MX')
    })
  })

  describe('translate', (): void => {
    it('should translate basic strings', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })
      expect(localization.translate.hello()).toEqual('Hello')
      expect(localization.translate.world()).toEqual('World')
    })

    it('should translate nested keys', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })
      expect(localization.translate.name.hello({ name: 'Ana', emoji: ':)' })).toEqual('Hello Ana :)')
    })

    it('should respect the current locale', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary, defaultLocale: 'es' })
      expect(localization.translate.hello()).toEqual('Hola')
      expect(localization.translate.world()).toEqual('Mundo')
      expect(localization.translate.name.hello({ name: 'Ana', emoji: ':)' })).toEqual('Hola Ana :)')
    })

    it('should update translations when locale changes', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })
      expect(localization.translate.hello()).toEqual('Hello')

      localization.setLocale('es-MX')
      expect(localization.translate.hello()).toEqual('Que onda')
    })

    it('should handle missing translations keys', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      // Define dictionary type with only 'hello' key
      type MinimalDict = {
        hello: {
          en: string
        }
      }

      const minimalDictionary: MinimalDict = {
        hello: { en: 'Hello' }
      }

      const localization = new Localization<MinimalDict>({
        primaryDictionary: minimalDictionary
      })

      // This should work
      expect(localization.translate.hello()).toEqual('Hello')

      // We need this for runtime testing of non-existent keys
      // Accessing a non-existent key at runtime through index access
      const nonExistentTranslationFn = (localization.translate as any)['nonExistentKey']
      expect(nonExistentTranslationFn()).toEqual('[invalid key: nonExistentKey]')

      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'Translation key "nonExistentKey" does not exist in dictionary'
        })
      )

      warningSpy.mockRestore()
    })

    it('should handle missing locale translations', (): void => {
      const warningSpy = jest.spyOn(Localization.prototype, 'emit')
      type EnOnlyDict = {
        hello: {
          en: string
        }
        world: {
          en: string
          es: string
        }
      }

      const enOnlyDictionary: EnOnlyDict = {
        hello: { en: 'Hello' },
        world: { en: 'World', es: 'Mundo' }
      }

      const localization = new Localization<EnOnlyDict>({
        primaryDictionary: enOnlyDictionary
      })

      localization.setLocale('es')

      // This should fallback to 'en' and emit a warning
      expect(localization.translate.hello()).toEqual('[missing translation: hello]')
      expect(warningSpy).toHaveBeenCalledWith(
        'warning',
        expect.objectContaining({
          message: 'No translation found for key "hello" in locale "es"'
        })
      )
      warningSpy.mockRestore()
    })

    it('should replace template variables', (): void => {
      type GreetingDict = {
        greeting: {
          en: string
        }
      }

      const greetingDictionary: GreetingDict = {
        greeting: {
          en: 'Hello {{name}}, today is {{day}}!'
        }
      }

      const localization = new Localization<GreetingDict>({
        primaryDictionary: greetingDictionary
      })

      expect(localization.translate.greeting({ name: 'John', day: 'Monday' })).toEqual('Hello John, today is Monday!')
    })
  })

  describe('secondary dictionary', (): void => {
    it('should properly type and access translations from both dictionaries', (): void => {
      // Explicitly define the types for both dictionaries
      const localization = new Localization<typeof primaryDictionary, typeof secondaryDictionary>({
        primaryDictionary,
        secondaryDictionary
      })

      // Access primary dictionary keys
      expect(localization.translate.hello()).toEqual('Hello')
      expect(localization.translate.name.hello({ name: 'Ana', emoji: ':)' })).toEqual('Hello Ana :)')

      // Access secondary dictionary keys
      expect(localization.translate.goodbye()).toEqual('Goodbye')
      expect(localization.translate.deep.nested.key()).toEqual('Deep nested key')

      // Change locale should apply to both dictionaries
      localization.setLocale('es')
      expect(localization.translate.hello()).toEqual('Hola')
      expect(localization.translate.goodbye()).toEqual('Adiós')
      expect(localization.translate.deep.nested.key()).toEqual('Clave anidada profunda')
    })
  })

  describe('non-string key access', (): void => {
    it('should handle Symbol keys in the proxy', (): void => {
      const localization = new Localization<typeof primaryDictionary>({ primaryDictionary })

      // Access the translate proxy with a Symbol key - should return undefined
      const symbol = Symbol('test')
      const result = (localization.translate as any)[symbol]

      expect(result).toBeUndefined()
    })

    it('should handle numeric keys in the proxy', (): void => {
      const numericDictionary = {
        '123': {
          en: 'Numeric key',
          es: 'Clave numérica'
        }
      }

      const localization = new Localization<typeof numericDictionary>({ primaryDictionary: numericDictionary })

      // This is actually a string key when used with bracket notation
      expect(localization.translate['123']()).toEqual('Numeric key')

      // JavaScript coerces numeric object keys to strings, so this actually works
      // and returns the same value as the string key
      const result = (localization.translate as any)[123]()
      expect(result).toEqual('Numeric key')
    })
  })

  describe('deep merge with nested objects', (): void => {
    it('should deeply merge nested objects in primary and secondary dictionaries', (): void => {
      const nestedPrimary = {
        settings: {
          options: {
            en: 'Options',
            es: 'Opciones'
          },
          theme: {
            en: 'Theme',
            es: 'Tema'
          }
        }
      }

      const nestedSecondary = {
        settings: {
          options: {
            fr: 'Options FR'
          },
          colors: {
            en: 'Colors',
            es: 'Colores',
            fr: 'Couleurs'
          }
        }
      }

      const localization = new Localization<typeof nestedPrimary, typeof nestedSecondary>({
        primaryDictionary: nestedPrimary,
        secondaryDictionary: nestedSecondary
      })

      // Original keys from primary should be intact
      expect(localization.translate.settings.theme()).toEqual('Theme')

      // Secondary keys should be merged
      expect((localization.translate as any).settings.colors()).toEqual('Colors')

      // Original primary values should be intact
      expect(localization.translate.settings.options()).toEqual('Options')

      // Switch to French to see merged values
      localization.setLocale('fr')

      // This should now return the French version from secondary
      expect(localization.translate.settings.options()).toEqual('Options FR')

      // Secondary French values should be available
      expect((localization.translate as any).settings.colors()).toEqual('Couleurs')

      // Original primary keys with no French shold warn the user
      expect(localization.translate.settings.theme()).toEqual('[missing translation: settings.theme]')
    })

    it('should handle complex nested merges with overlapping keys', (): void => {
      const complexPrimary = {
        deep: {
          nested: {
            structure: {
              en: 'Structure',
              es: 'Estructura'
            },
            level1: {
              level2: {
                en: 'Level 2',
                es: 'Nivel 2'
              }
            }
          }
        }
      }

      const complexSecondary = {
        deep: {
          nested: {
            structure: {
              fr: 'Structure FR'
            },
            level1: {
              level2: {
                fr: 'Niveau 2'
              },
              newKey: {
                en: 'New Key',
                fr: 'Nouvelle Clé'
              }
            }
          },
          additional: {
            en: 'Additional',
            fr: 'Supplémentaire'
          }
        }
      }

      const localization = new Localization<typeof complexPrimary, typeof complexSecondary>({
        primaryDictionary: complexPrimary,
        secondaryDictionary: complexSecondary
      })

      // Check merged access first level
      expect((localization.translate as any).deep.additional()).toEqual('Additional')

      // Check deep nested merged keys
      expect((localization.translate as any).deep.nested.level1.newKey()).toEqual('New Key')

      // Check merged translations when switching locale
      localization.setLocale('fr')

      // This should access the French version from secondary
      expect(localization.translate.deep.nested.structure()).toEqual('Structure FR')

      // This should access deep nested French version
      expect((localization.translate as any).deep.nested.level1.level2()).toEqual('Niveau 2')
    })
  })

  describe('inferDefault static method', (): void => {
    it('should return the default locale without requiring a full instance', (): void => {
      const locale = Localization.inferDefault({ primaryDictionary })
      expect(locale).toEqual('en')
    })

    it('should respect provided defaultLocale', (): void => {
      const locale = Localization.inferDefault({ primaryDictionary, defaultLocale: 'es' })
      expect(locale).toEqual('es')
    })

    it('should apply fallback logic for unavailable locales', (): void => {
      const locale = Localization.inferDefault({ primaryDictionary, defaultLocale: 'en-GB' })
      expect(locale).toEqual('en')
    })

    it('should fallback to base variants when base language not available', (): void => {
      // Dictionary with only 'fr-CM' but no 'fr'
      const frenchOnlyDictionary = {
        hello: { 'fr-CM': 'Bonjour' }
      }
      
      const locale = Localization.inferDefault({ 
        primaryDictionary: frenchOnlyDictionary, 
        defaultLocale: 'fr' 
      })
      
      expect(locale).toEqual('fr-CM')
    })
    
    it('should use first available locale when requested language has no match', (): void => {
      const locale = Localization.inferDefault({ primaryDictionary, defaultLocale: 'ja' })
      expect(locale).toEqual('en')
    })
  })
})
