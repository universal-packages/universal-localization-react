import { EventEmitter } from '@universal-packages/event-emitter'
import { replaceVars } from '@universal-packages/variable-replacer'

import { Dictionary, Locale, LocaleTranslations, LocalizationOptions, MergedDictionary, TemplateVariables, TranslationProxy } from './types'

export default class Localization<T = any, S = {}> extends EventEmitter {
  public readonly options: LocalizationOptions<T, S>
  public readonly dictionary: MergedDictionary<T, S>
  public readonly availableLocales: Set<Locale> = new Set()
  public readonly translate: TranslationProxy<T, S>

  get locale(): Locale {
    return this.internalLocale
  }

  private internalLocale: Locale

  constructor(options: LocalizationOptions<T, S>) {
    super()

    this.options = { ...options }

    this.dictionary = this.mergeDictionaries(this.options.primaryDictionary, this.options.secondaryDictionary)

    // Find all available locales in the dictionary
    this.findAvailableLocales(this.dictionary)

    // Validate if translations are missing for any locale
    this.validateTranslations(this.dictionary)

    // Set the locale with smart fallback
    this.setLocale(this.options.defaultLocale || 'en')

    // Create the translate proxy
    this.translate = this.createTranslationProxy(this.dictionary) as TranslationProxy<T, S>
  }

  public static inferDefault(options: LocalizationOptions<any, any>): Locale {
    const localization = new this(options)
    return localization.locale
  }

  /**
   * Create a proxy that mirrors the dictionary structure but with translate functions as leaf nodes
   */
  private createTranslationProxy<D>(dictionary: Dictionary<D>, path: string[] = []): TranslationProxy<D> {
    return new Proxy({} as TranslationProxy<D>, {
      get: (_target, key) => {
        if (typeof key !== 'string') return undefined

        const value = dictionary[key as keyof D]
        const currentPath = [...path, key]

        if (this.isLocaleTranslations(value)) {
          // If it's a leaf node (translations), return a function
          return (variables?: TemplateVariables) => {
            const translation = (value as LocaleTranslations)[this.locale]

            if (!translation) {
              this.emit('warning', { message: `No translation found for key "${currentPath.join('.')}" in locale "${this.locale}"` })
              return `[missing translation: ${currentPath.join('.')}]`
            }

            if (variables) return replaceVars(translation, variables)

            return translation
          }
        } else if (value) {
          // If it's a nested dictionary, create a nested proxy
          return this.createTranslationProxy(value as Dictionary<any>, currentPath)
        }

        // If key doesn't exist
        this.emit('warning', { message: `Translation key "${currentPath.join('.')}" does not exist in dictionary` })
        return () => `[invalid key: ${currentPath.join('.')}]`
      }
    })
  }

  private mergeDictionaries(primary: Dictionary<T>, secondary?: Dictionary<S>): MergedDictionary<T, S> {
    if (!secondary) return primary as MergedDictionary<T, S>
    return this.deepMerge(primary, secondary) as MergedDictionary<T, S>
  }

  private deepMerge(target: Dictionary<any>, source: Dictionary<any>): Dictionary<any> {
    const output = { ...target }

    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        output[key] = this.deepMerge(target[key] as Dictionary<any>, source[key] as Dictionary<any>)
      } else {
        output[key] = source[key]
      }
    }

    return output
  }

  /**
   * Set locale with smart fallback strategy
   */
  public setLocale(locale: Locale): void {
    // If the locale exists in our translations, use it
    if (this.availableLocales.has(locale)) {
      this.internalLocale = locale
      return
    }

    // Try to find the base language (e.g., 'en' from 'en-US')
    const baseLanguage = locale.split('-')[0] as Locale
    if (this.availableLocales.has(baseLanguage)) {
      this.emit('warning', { message: `Locale "${locale}" not found, falling back to base language "${baseLanguage}"` })
      this.internalLocale = baseLanguage
      return
    }

    // Try to find any variant of the base language (e.g., any 'en-XX')
    const baseVariants = Array.from(this.availableLocales).filter((l) => l.startsWith(`${baseLanguage}-`))
    if (baseVariants.length > 0) {
      this.emit('warning', { message: `Base language "${baseLanguage}" not found, falling back to variant "${baseVariants[0]}"` })
      this.internalLocale = baseVariants[0]
      return
    }

    // As a last resort, use any available locale
    if (this.availableLocales.size > 0) {
      const fallbackLocale = Array.from(this.availableLocales)[0]
      this.emit('warning', { message: `No "${baseLanguage}" or variants found, falling back to "${fallbackLocale}"` })
      this.internalLocale = fallbackLocale
      return
    }

    // No translations available at all
    this.emit('warning', { message: 'No localizations found in dictionary' })
    this.internalLocale = locale // Keep the requested locale even though it won't work
  }

  /**
   * Find all available locales in the dictionary
   */
  private findAvailableLocales(dictionary: Dictionary<T>, path: string = ''): void {
    for (const key in dictionary) {
      const value = dictionary[key]
      const currentPath = path ? `${path}.${key}` : key

      if (this.isLocaleTranslations(value)) {
        // Found translations, add all locales to the set
        for (const locale in value) {
          this.availableLocales.add(locale as Locale)
        }
      } else {
        // Recurse into nested dictionaries
        this.findAvailableLocales(value as Dictionary<T>, currentPath)
      }
    }
  }

  /**
   * Validate if translations are missing for any locale
   */
  private validateTranslations(dictionary: Dictionary<T>, path: string = ''): void {
    for (const key in dictionary) {
      const value = dictionary[key]
      const currentPath = path ? `${path}.${key}` : key

      if (this.isLocaleTranslations(value)) {
        // Check if any locale is missing
        const translations = value as LocaleTranslations
        const missingLocales = Array.from(this.availableLocales).filter((locale) => !(locale in translations))

        if (missingLocales.length > 0) {
          this.emit('warning', { message: `Translation key "${currentPath}" is missing translations for locales: ${missingLocales.join(', ')}` })
        }
      } else {
        // Recurse into nested dictionaries
        this.validateTranslations(value as Dictionary<any>, currentPath)
      }
    }
  }

  /**
   * Type guard to check if an object is a LocaleTranslations
   */
  private isLocaleTranslations(obj: any): obj is LocaleTranslations {
    if (!obj || typeof obj !== 'object') return false

    // Check if at least one key is a valid locale
    for (const key in obj) {
      // If the value is a string and the key is in our Locale type
      if (typeof obj[key] === 'string') {
        return true
      }
    }

    return false
  }
}
