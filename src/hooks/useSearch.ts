import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { Protocol } from '../types'

const AMBIGUOUS: Record<string, { question: string; matches: string[] }> = {
  'סוכר': { question: 'האם הכוונה ל-DKA או לטיפול בהיפוגליקמיה?', matches: ['dka', 'סוכרת', 'גלוקוז', 'אינסולין', 'היפוגליקמיה'] },
  'לחץ דם': { question: 'האם הכוונה להיפוטנסיה או להיפרטנסיה?', matches: ['היפוטנסיה', 'היפרטנסיה', 'לחץ דם'] },
  'נתרן': { question: 'האם הכוונה להיפונתרמיה או להיפרנתרמיה?', matches: ['היפונתרמיה', 'היפרנתרמיה', 'נתרן'] },
}

export function useSearch(protocols: Protocol[], query: string) {
  const fuse = useMemo(
    () =>
      new Fuse(protocols, {
        keys: [
          { name: 'title', weight: 0.5 },
          { name: 'tags', weight: 0.35 },
          { name: 'category', weight: 0.15 },
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
        useExtendedSearch: false,
      }),
    [protocols]
  )

  return useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return { results: protocols, ambiguous: null }

    const ambiguous = AMBIGUOUS[trimmed] ?? null
    const fuseResults = fuse.search(trimmed)
    const results = fuseResults.map((r) => r.item)

    return { results, ambiguous }
  }, [fuse, protocols, query])
}
