import { EventEmitter } from '@universal-packages/event-emitter'

import { Dictionary, LocaleTranslations, LocalizationOptions } from './types'

export default class Localization extends EventEmitter {
  public readonly options: LocalizationOptions
  public readonly dictionary: Dictionary
  public readonly availableLocales: Set<Locale> = new Set()

  get locale(): Locale {
    return this.internalLocale
  }

  private internalLocale: Locale

  constructor(options: LocalizationOptions) {
    super()

    this.options = { ...options }

    this.dictionary = this.mergeDictionaries(this.options.primaryDictionary, this.options.secondaryDictionary)

    // Find all available locales in the dictionary
    this.findAvailableLocales(this.dictionary)

    // Validate if translations are missing for any locale
    this.validateTranslations(this.dictionary)

    // Set the locale with smart fallback
    this.setLocale(this.options.defaultLocale || 'en')
  }

  private mergeDictionaries(primary: Dictionary, secondary?: Dictionary): Dictionary {
    if (!secondary) return primary
    return this.deepMerge(primary, secondary)
  }

  private deepMerge(target: Dictionary, source: Dictionary): Dictionary {
    const output = { ...target }

    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        output[key] = this.deepMerge(target[key] as Dictionary, source[key] as Dictionary)
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
    this.emit('error', { message: 'No localizations found in dictionary' })
    this.internalLocale = locale // Keep the requested locale even though it won't work
  }

  /**
   * Find all available locales in the dictionary
   */
  private findAvailableLocales(dictionary: Dictionary, path: string = ''): void {
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
        this.findAvailableLocales(value as Dictionary, currentPath)
      }
    }
  }

  /**
   * Validate if translations are missing for any locale
   */
  private validateTranslations(dictionary: Dictionary, path: string = ''): void {
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
        this.validateTranslations(value as Dictionary, currentPath)
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

export type Locale =
  | 'ar'
  | 'ar-AE'
  | 'ar-BH'
  | 'ar-DJ'
  | 'ar-DZ'
  | 'ar-EG'
  | 'ar-EH'
  | 'ar-ER'
  | 'ar-IL'
  | 'ar-IQ'
  | 'ar-IQ'
  | 'ar-JO'
  | 'ar-JO'
  | 'ar-KM'
  | 'ar-KW'
  | 'ar-LB'
  | 'ar-LY'
  | 'ar-MA'
  | 'ar-MR'
  | 'ar-OM'
  | 'ar-PS'
  | 'ar-QA'
  | 'ar-SA'
  | 'ar-SD'
  | 'ar-SO'
  | 'ar-SS'
  | 'ar-SY'
  | 'ar-TD'
  | 'ar-TN'
  | 'ar-YE'
  | 'as'
  | 'as-IN'
  | 'asa'
  | 'asa-TZ'
  | 'az'
  | 'az-Cyrl'
  | 'az-Cyrl-AZ'
  | 'az-Latn'
  | 'az-Latn-AZ'
  | 'bas'
  | 'bas-CM'
  | 'be'
  | 'be-BY'
  | 'bem'
  | 'bem-ZM'
  | 'bez'
  | 'bez-TZ'
  | 'bg'
  | 'bg-BG'
  | 'bm'
  | 'bm-ML'
  | 'bn'
  | 'bn'
  | 'bn-BD'
  | 'bn-BD'
  | 'bn-IN'
  | 'bn-IN'
  | 'bo'
  | 'bo-CN'
  | 'bo-IN'
  | 'br'
  | 'br-FR'
  | 'brx'
  | 'brx-IN'
  | 'bs'
  | 'bs-Cyrl'
  | 'bs-Cyrl-BA'
  | 'bs-Latn'
  | 'bs-Latn-BA'
  | 'ca'
  | 'ca-AD'
  | 'ca-ES'
  | 'ca-FR'
  | 'ca-IT'
  | 'ce'
  | 'ce-RU'
  | 'cgg'
  | 'cgg-UG'
  | 'chr'
  | 'chr-US'
  | 'cs'
  | 'cs-CZ'
  | 'cy'
  | 'cy-GB'
  | 'da'
  | 'da-DK'
  | 'dav'
  | 'dav-KE'
  | 'de'
  | 'de-AT'
  | 'de-BE'
  | 'de-CH'
  | 'de-DE'
  | 'de-IT'
  | 'de-LI'
  | 'de-LU'
  | 'de-LU'
  | 'dje'
  | 'dje-NE'
  | 'dsb'
  | 'dsb-DE'
  | 'dua'
  | 'dua-CM'
  | 'dyo'
  | 'dyo-SN'
  | 'dz'
  | 'dz-BT'
  | 'ebu'
  | 'ebu-KE'
  | 'ee'
  | 'ee-GH'
  | 'ee-TG'
  | 'el'
  | 'el-CY'
  | 'el-GR'
  | 'en'
  | 'en-AG'
  | 'en-AI'
  | 'en-AI'
  | 'en-AS'
  | 'en-AT'
  | 'en-AU'
  | 'en-AU'
  | 'en-BB'
  | 'en-BE'
  | 'en-BI'
  | 'en-BM'
  | 'en-BS'
  | 'en-BW'
  | 'en-BZ'
  | 'en-CA'
  | 'en-CA'
  | 'en-CC'
  | 'en-CH'
  | 'en-CK'
  | 'en-CM'
  | 'en-CX'
  | 'en-CY'
  | 'en-DE'
  | 'en-DG'
  | 'en-DK'
  | 'en-DM'
  | 'en-ER'
  | 'en-FI'
  | 'en-FJ'
  | 'en-FK'
  | 'en-FM'
  | 'en-GB'
  | 'en-GB'
  | 'en-GD'
  | 'en-GG'
  | 'en-GH'
  | 'en-GI'
  | 'en-GM'
  | 'en-GU'
  | 'en-GY'
  | 'en-HK'
  | 'en-IE'
  | 'en-IE'
  | 'en-IL'
  | 'en-IM'
  | 'en-IN'
  | 'en-IN'
  | 'en-IO'
  | 'en-JE'
  | 'en-JM'
  | 'en-KE'
  | 'en-KI'
  | 'en-KN'
  | 'en-KY'
  | 'en-LC'
  | 'en-LR'
  | 'en-LS'
  | 'en-MG'
  | 'en-MH'
  | 'en-MO'
  | 'en-MP'
  | 'en-MS'
  | 'en-MT'
  | 'en-MT'
  | 'en-MU'
  | 'en-MW'
  | 'en-MY'
  | 'en-NA'
  | 'en-NF'
  | 'en-NG'
  | 'en-NL'
  | 'en-NR'
  | 'en-NU'
  | 'en-NZ'
  | 'en-NZ'
  | 'en-PG'
  | 'en-PH'
  | 'en-PH'
  | 'en-PK'
  | 'en-PN'
  | 'en-PR'
  | 'en-PW'
  | 'en-RW'
  | 'en-SB'
  | 'en-SC'
  | 'en-SD'
  | 'en-SE'
  | 'en-SG'
  | 'en-SG'
  | 'en-SH'
  | 'en-SI'
  | 'en-SL'
  | 'en-SS'
  | 'en-SX'
  | 'en-SZ'
  | 'en-TC'
  | 'en-TK'
  | 'en-TO'
  | 'en-TT'
  | 'en-TV'
  | 'en-TZ'
  | 'en-UG'
  | 'en-UM'
  | 'en-US'
  | 'en-US'
  | 'en-VC'
  | 'en-VG'
  | 'en-VI'
  | 'en-VU'
  | 'en-WS'
  | 'en-ZA'
  | 'en-ZA'
  | 'en-ZM'
  | 'en-ZW'
  | 'eo'
  | 'es'
  | 'es-AR'
  | 'es-BO'
  | 'es-BR'
  | 'es-BZ'
  | 'es-CL'
  | 'es-CO'
  | 'es-CR'
  | 'es-CU'
  | 'es-DO'
  | 'es-EA'
  | 'es-EC'
  | 'es-ES'
  | 'es-GQ'
  | 'es-GT'
  | 'es-HN'
  | 'es-IC'
  | 'es-MX'
  | 'es-NI'
  | 'es-PA'
  | 'es-PE'
  | 'es-PR'
  | 'es-PY'
  | 'es-SV'
  | 'es-US'
  | 'es-UY'
  | 'es-VE'
  | 'et'
  | 'et-EE'
  | 'eu'
  | 'eu-ES'
  | 'ewo'
  | 'ewo-CM'
  | 'fa'
  | 'fa-AF'
  | 'fa-IR'
  | 'ff'
  | 'ff-CM'
  | 'ff-GN'
  | 'ff-MR'
  | 'ff-SN'
  | 'fi'
  | 'fi-FI'
  | 'fil'
  | 'fil-PH'
  | 'fo'
  | 'fo-DK'
  | 'fo-FO'
  | 'fr'
  | 'fr-BE'
  | 'fr-BF'
  | 'fr-BI'
  | 'fr-BJ'
  | 'fr-BL'
  | 'fr-CA'
  | 'fr-CD'
  | 'fr-CF'
  | 'fr-CG'
  | 'fr-CH'
  | 'fr-CI'
  | 'fr-CM'
  | 'fr-DJ'
  | 'fr-DZ'
  | 'fr-FR'
  | 'fr-GA'
  | 'fr-GF'
  | 'fr-GN'
  | 'fr-GP'
  | 'fr-GQ'
  | 'fr-HT'
  | 'fr-KM'
  | 'fr-LU'
  | 'fr-MA'
  | 'fr-MC'
  | 'fr-MF'
  | 'fr-MG'
  | 'fr-ML'
  | 'fr-MQ'
  | 'fr-MR'
  | 'fr-MU'
  | 'fr-NC'
  | 'fr-NE'
  | 'fr-PF'
  | 'fr-PM'
  | 'fr-RE'
  | 'fr-RW'
  | 'fr-SC'
  | 'fr-SN'
  | 'fr-SY'
  | 'fr-TD'
  | 'fr-TG'
  | 'fr-TN'
  | 'fr-VU'
  | 'fr-WF'
  | 'fr-YT'
  | 'fur'
  | 'fur-IT'
  | 'fy'
  | 'fy-NL'
  | 'ga'
  | 'ga'
  | 'ga-IE'
  | 'ga-IE'
  | 'gd'
  | 'gd-GB'
  | 'gl'
  | 'gl-ES'
  | 'gsw'
  | 'gsw-CH'
  | 'gsw-FR'
  | 'gsw-LI'
  | 'gu'
  | 'gu-IN'
  | 'guz'
  | 'guz-KE'
  | 'gv'
  | 'gv-IM'
  | 'ha'
  | 'ha-GH'
  | 'ha-NE'
  | 'ha-NG'
  | 'haw'
  | 'haw-US'
  | 'he'
  | 'he-IL'
  | 'hi'
  | 'hi-IN'
  | 'hr'
  | 'hr-BA'
  | 'hr-HR'
  | 'hsb'
  | 'hsb-DE'
  | 'hu'
  | 'hu-HU'
  | 'hy'
  | 'hy-AM'
  | 'ig'
  | 'ig-NG'
  | 'ii'
  | 'ii-CN'
  | 'in'
  | 'in-ID'
  | 'is'
  | 'is-IS'
  | 'it'
  | 'it-CH'
  | 'it-IT'
  | 'it-SM'
  | 'it-VA'
  | 'iw'
  | 'iw-IL'
  | 'ja'
  | 'ja-JP'
  | 'jgo'
  | 'jgo-CM'
  | 'jmc'
  | 'jmc-TZ'
  | 'ka'
  | 'ka-GE'
  | 'kab'
  | 'kab-DZ'
  | 'kam'
  | 'kam-KE'
  | 'kde'
  | 'kde-TZ'
  | 'kea'
  | 'kea-CV'
  | 'khq'
  | 'khq-ML'
  | 'ki'
  | 'ki-KE'
  | 'kk'
  | 'kk-KZ'
  | 'kkj'
  | 'kkj-CM'
  | 'kl'
  | 'kl-GL'
  | 'kln'
  | 'kln-KE'
  | 'km'
  | 'km-KH'
  | 'kn'
  | 'kn-IN'
  | 'ko'
  | 'ko'
  | 'ko-KP'
  | 'ko-KR'
  | 'ko-KR'
  | 'kok'
  | 'kok-IN'
  | 'ks'
  | 'ks-IN'
  | 'ksb'
  | 'ksb-TZ'
  | 'ksf'
  | 'ksf-CM'
  | 'ksh'
  | 'ksh-DE'
  | 'kw'
  | 'kw-GB'
  | 'ky'
  | 'ky-KG'
  | 'lag'
  | 'lag-TZ'
  | 'lt'
  | 'lt-LT'
  | 'lb'
  | 'lb-LU'
  | 'lv'
  | 'lv-LV'
  | 'lg'
  | 'lg-UG'
  | 'mk'
  | 'mk-MK'
  | 'ms'
  | 'ms-MY'
  | 'mt'
  | 'mt-MT'
  | 'nl'
  | 'nl-BE'
  | 'nl-NL'
  | 'no'
  | 'no-NO'
  | 'no-NO-NY'
  | 'pl'
  | 'pl-PL'
  | 'pt'
  | 'pt-AO'
  | 'pt-BR'
  | 'pt-CH'
  | 'pt-CV'
  | 'pt-GQ'
  | 'pt-GW'
  | 'pt-LU'
  | 'pt-MO'
  | 'pt-MZ'
  | 'pt-PT'
  | 'pt-ST'
  | 'pt-TL'
  | 'ro'
  | 'ro-RO'
  | 'ru'
  | 'ru-BY'
  | 'ru-KG'
  | 'ru-KZ'
  | 'ru-MD'
  | 'ru-RU'
  | 'ru-UA'
  | 'sk'
  | 'sk-SK'
  | 'sl'
  | 'sl-SI'
  | 'sq'
  | 'sq-AL'
  | 'sr'
  | 'sr-BA'
  | 'sr-CS'
  | 'sr-ME'
  | 'sr-RS'
  | 'sv'
  | 'sv-SE'
  | 'th'
  | 'th-TH'
  | 'th-TH-TH'
  | 'tr'
  | 'tr-TR'
  | 'uk'
  | 'uk-UA'
  | 'vi'
  | 'vi-VN'
  | 'zh'
  | 'zh-Hans'
  | 'zh-Hans-HK'
  | 'zh-Hans-MO'
  | 'zh-Hans-SG'
  | 'zh-Hant'
  | 'zh-Hant-HK'
  | 'zh-Hant-MO'
  | 'zh-Hant-TW'
  | 'zh-HK'
  | 'zu'
  | 'zu-ZA'
