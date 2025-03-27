import React from 'react'

import { useLocalization } from './useLocalization'
import { DynamicTranslateProxy, Locale, LocalizationDictionary } from './types'

export function useTranslate<T extends LocalizationDictionary = LocalizationDictionary>(): DynamicTranslateProxy<T>
export function useTranslate<T extends LocalizationDictionary = LocalizationDictionary>(forcedLocale: Locale): DynamicTranslateProxy<T>
export function useTranslate<T extends LocalizationDictionary = LocalizationDictionary>(dictionary: T): DynamicTranslateProxy<T>
export function useTranslate<T extends LocalizationDictionary = LocalizationDictionary>(dictionary: T, forcedLocale: Locale): DynamicTranslateProxy<T>
export function useTranslate<T extends LocalizationDictionary = LocalizationDictionary>(
  dictionaryOrLocale?: T | Locale,
  forcedLocale?: Locale
): DynamicTranslateProxy<T> {
  const localization = useLocalization()
  const [_localeChanges, setLocaleChanges] = React.useState(0)
  const currentLocaleRef = React.useRef<Locale | null>(null)

  // Memoize the inputs to prevent unnecessary re-renders
  const memoizedDictionaryOrLocale = React.useMemo(() => dictionaryOrLocale, []);
  const memoizedForcedLocale = React.useMemo(() => forcedLocale, []);

  // Determine if first parameter is a dictionary or a locale
  const dictionary = typeof memoizedDictionaryOrLocale === 'object' ? memoizedDictionaryOrLocale : undefined
  const locale = typeof memoizedDictionaryOrLocale === 'string' ? memoizedDictionaryOrLocale : memoizedForcedLocale

  // Merge component dictionary with global if provided
  React.useEffect(() => {
    if (dictionary) {
      localization.mergeDictionary(dictionary)
    }
  }, [localization, dictionary])

  // Track current locale for optimizations
  React.useEffect(() => {
    currentLocaleRef.current = localization.locale
  }, [localization.locale])

  // Internal translate function for translating by path
  const translateByPath = React.useCallback(
    (path: string, locales?: Record<string, any>): string => {
      // If locale is forced but different from current, use a temporary locale switch
      if (locale && locale !== currentLocaleRef.current) {
        // Save current to reset after
        const actualLocale = localization.locale
        
        try {
          // Temporarily change locale without triggering state updates
          const tempLocalization = Object.create(localization)
          tempLocalization.setLocale = function(newLocale?: Locale) {
            // Call original but bypass event emitting
            this.internalLocale = newLocale || this.providedDefaultLocale
            this.transformedDictionary = this.createLocaleAccessor(this.dictionary, this.internalLocale)
          }
          
          // Set locale temporarily
          tempLocalization.setLocale(locale)
          
          // Translate with the temporary locale
          return tempLocalization.translate(path, locales)
        } finally {
          // Only reset if needed and it was actually changed
          if (localization.locale !== actualLocale) {
            localization.setLocale(actualLocale)
          }
        }
      }
      
      return localization.translate(path, locales)
    },
    [localization, locale, currentLocaleRef]
  )

  // Create proxy for autocomplete and property access
  const createProxy = React.useCallback((path: string[] = []): DynamicTranslateProxy<T> => {
    const proxyTarget = function(locales?: Record<string, any>): string {
      const subject = path.join('.')
      return translateByPath(subject, locales)
    }
    
    const handler: ProxyHandler<any> = {
      get: (target, prop) => {
        if (prop === 'apply' || prop === 'bind' || prop === 'call' || prop === 'constructor' || typeof prop === 'symbol') {
          return Reflect.get(target, prop)
        }
        
        return createProxy([...path, prop.toString()])
      }
    }
    
    return new Proxy(proxyTarget, handler) as DynamicTranslateProxy<T>
  }, [translateByPath]);

  // Memoize the proxy to prevent unnecessary recreations
  const translateProxy = React.useMemo(() => {
    return createProxy();
  }, [createProxy]);

  React.useEffect(() => {
    const listener = () => setLocaleChanges((prev) => prev + 1)

    localization.on('locale', listener)

    return () => {
      localization.removeListener('locale', listener)
    }
  }, [localization])

  // Always return the proxy for property access
  return translateProxy
}
