import { Locale, LocalizationDictionary } from '@universal-packages/localization'

export interface LocalizationProviderProps extends React.PropsWithChildren {
  dictionary: LocalizationDictionary
  defaultLocale?: Locale
}
