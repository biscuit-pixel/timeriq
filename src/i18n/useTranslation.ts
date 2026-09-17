import { useMemo } from 'react'
import { useTimerStore } from '../store/timerStore'
import { translations } from './translations'

type Dict = typeof translations.en
type DotPaths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : DotPaths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type TKey = DotPaths<Dict>

function resolve(dict: Dict, path: string): string {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], dict) as string
}

export function useTranslation() {
  const language = useTimerStore((s) => s.settings.language)
  const t = useMemo(() => {
    const dict = translations[language] as Dict
    return (key: TKey) => resolve(dict, key) ?? key
  }, [language])
  return { t, language }
}
