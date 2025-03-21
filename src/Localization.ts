import { EventEmitter } from '@universal-packages/event-emitter'
import { navigateObject } from '@universal-packages/object-navigation'
import { replaceVars } from '@universal-packages/variable-replacer'

import { Locale, LocalizationDictionary } from './types'

export default class Localization extends EventEmitter {
  public get locale(): Locale {
    return this.internalLocale
  }

  public get defaultLocale(): Locale {
    return this.knownDefaultLocale
  }

  private readonly dictionary: LocalizationDictionary
  private localeDictionary: Record<string, any> = {}
  private providedDefaultLocale: Locale
  private knownDefaultLocale: Locale
  private internalLocale: Locale

  constructor(dictionary: LocalizationDictionary, defaultLocale?: Locale) {
    super()
    this.dictionary = { ...dictionary }
    this.providedDefaultLocale = defaultLocale || 'en'
    this.setLocale(this.providedDefaultLocale)
    this.knownDefaultLocale = this.internalLocale
  }

  public setLocale(locale?: Locale): void {
    this.internalLocale = locale ? locale : this.providedDefaultLocale

    const dictionaryFromLocale = this.dictionary[this.internalLocale]

    if (dictionaryFromLocale) {
      this.localeDictionary = dictionaryFromLocale as any
    } else {
      const language = this.internalLocale.split('-')[0]
      const dictionaryFromLanguage = this.dictionary[language]

      if (dictionaryFromLanguage) {
        this.localeDictionary = dictionaryFromLanguage as any
        this.internalLocale = language as Locale
      } else {
        const availableLocales = Object.keys(this.dictionary)
        const closestLocale = availableLocales.find((locale) => locale.startsWith(language)) || availableLocales[0]

        if (closestLocale) {
          this.localeDictionary = this.dictionary[closestLocale] as any
          this.internalLocale = closestLocale as Locale
        } else {
          this.localeDictionary = {}
        }
      }
    }

    this.emit('locale', { payload: { locale: this.internalLocale, localeDictionary: this.localeDictionary } })
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
