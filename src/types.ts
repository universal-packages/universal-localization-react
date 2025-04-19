import { Dictionary, Locale } from '@universal-packages/localization'

export interface LocalizationProviderProps extends React.PropsWithChildren {
  dictionary?: Dictionary<any>
  locale?: Locale
}

export interface LocalizationContext {
  dictionary?: Dictionary<any>
  locale: Locale
  defaultLocale: Locale
  setLocale: (locale: Locale) => void
}
