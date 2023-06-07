import { navigateObject } from '@universal-packages/object-navigation'
import { replaceVars } from '@universal-packages/variable-replacer'
import EventEmitter from 'events'

import { Locale, LocalizationDictionary } from './types'

export default class Localization extends EventEmitter {
  public locale: Locale

  private readonly dictionary: LocalizationDictionary
  private localeDictionary: Record<string, any> = {}
  private defaultLocale: Locale

  constructor(dictionary: LocalizationDictionary, defaultLocale?: Locale) {
    super()
    this.dictionary = { ...dictionary }
    this.defaultLocale = defaultLocale || 'en'
    this.setLocale(this.defaultLocale)
  }

  public setLocale(locale?: Locale): void {
    this.locale = locale ? locale : this.defaultLocale

    const dictionaryFromLocale = this.dictionary[this.locale]

    if (dictionaryFromLocale) {
      this.localeDictionary = dictionaryFromLocale as any
    } else {
      const language = this.locale.split('-')[0]
      const dictionaryFromLanguage = this.dictionary[language]

      if (dictionaryFromLanguage) {
        this.localeDictionary = dictionaryFromLanguage as any
        this.locale = language as Locale
      } else {
        const availableLocales = Object.keys(this.dictionary)
        const closestLocale = availableLocales.find((locale) => locale.startsWith(language)) || availableLocales[0]

        if (closestLocale) {
          this.localeDictionary = this.dictionary[closestLocale] as any
          this.locale = closestLocale as Locale
        } else {
          this.localeDictionary = {}
        }
      }
    }

    this.emit('locale', this.locale, this.localeDictionary)
  }

  public translate(subject: string | string[], locales?: Record<string, any>): string {
    const pathInfo = navigateObject(this.localeDictionary, subject, { separator: '.' })

    if (pathInfo.error) return `missing <${pathInfo.path}>`

    const found = pathInfo.targetNode[pathInfo.targetKey]

    if (typeof found === 'string') {
      if (locales) return replaceVars(found, locales)

      return found
    } else {
      return `missing <${pathInfo.path}>`
    }
  }
}
