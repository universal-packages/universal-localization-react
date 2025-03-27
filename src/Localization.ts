import { EventEmitter } from '@universal-packages/event-emitter'
import { navigateObject } from '@universal-packages/object-navigation'
import { replaceVars } from '@universal-packages/variable-replacer'

import { Locale, LocalizationDictionary, NestedDictionary, LocaleDictionaryEntry } from './types'

export default class Localization extends EventEmitter {
  public get locale(): Locale {
    return this.internalLocale
  }

  public get defaultLocale(): Locale {
    return this.knownDefaultLocale
  }

  private dictionary: LocalizationDictionary
  private transformedDictionary: Record<string, any> = {}
  private providedDefaultLocale: Locale
  private knownDefaultLocale: Locale
  private internalLocale: Locale

  constructor(dictionary?: LocalizationDictionary, defaultLocale?: Locale) {
    super()
    this.dictionary = dictionary ? { ...dictionary } : {}
    this.providedDefaultLocale = defaultLocale || 'en'
    
    this.setLocale(this.providedDefaultLocale)
    this.knownDefaultLocale = this.internalLocale
  }

  public setLocale(locale?: Locale): void {
    this.internalLocale = locale ? locale : this.providedDefaultLocale
    this.transformedDictionary = this.createLocaleAccessor(this.dictionary, this.internalLocale)
    this.emit('locale', { payload: { locale: this.internalLocale, localeDictionary: this.transformedDictionary } })
  }

  public translate(subject: string | string[], locales?: Record<string, any>): string {
    const pathInfo = navigateObject(this.transformedDictionary, subject, { separator: '.' })

    if (pathInfo.error) return `missing <${pathInfo.path}>`

    const found = pathInfo.targetNode[pathInfo.targetKey]

    if (typeof found === 'string') {
      if (locales) return replaceVars(found, locales)
      return found
    } else {
      return `missing <${pathInfo.path}>`
    }
  }

  public mergeDictionary(dictionary: LocalizationDictionary): void {
    if (!dictionary) return
    
    this.dictionary = this.deepMerge(this.dictionary, dictionary)
    this.setLocale(this.internalLocale)
  }

  private createLocaleAccessor(dictionary: NestedDictionary, locale: Locale): Record<string, any> {
    const result: Record<string, any> = {}
    
    for (const key in dictionary) {
      const value = dictionary[key]
      
      if (this.isLocaleDictionaryEntry(value)) {
        // Get the correct locale or fallback locale
        result[key] = this.getLocaleValue(value as LocaleDictionaryEntry, locale)
      } else if (typeof value === 'object') {
        result[key] = this.createLocaleAccessor(value as NestedDictionary, locale)
      }
    }
    
    return result
  }

  private isLocaleDictionaryEntry(value: any): boolean {
    if (!value || typeof value !== 'object') return false
    
    // Check if any keys match locale pattern
    return Object.keys(value).some(key => this.isLocale(key))
  }

  private isLocale(key: string): boolean {
    // Simple check if the key matches locale pattern (e.g., 'en', 'en-US')
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(key)
  }

  private getLocaleValue(entry: LocaleDictionaryEntry, locale: Locale): string {
    // Direct match
    if (entry[locale]) return entry[locale] as string
    
    // Try language part only (e.g., 'en' for 'en-US')
    const language = locale.split('-')[0] as Locale
    if (entry[language]) return entry[language] as string
    
    // Find closest match
    const closestLocale = Object.keys(entry).find(key => key.startsWith(language))
    if (closestLocale) return entry[closestLocale as Locale] as string
    
    // Last resort - get first available translation
    const availableLocales = Object.keys(entry).filter(key => this.isLocale(key))
    if (availableLocales.length > 0) return entry[availableLocales[0] as Locale] as string
    
    return `missing <${locale}>`
  }
  
  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key])
        } else {
          result[key] = { ...source[key] }
        }
      } else {
        result[key] = source[key]
      }
    }
    
    return result
  }
}
