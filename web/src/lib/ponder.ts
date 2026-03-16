import { queryPonder as _queryPonder } from '@claw-domains/shared'

const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || 'http://localhost:42069'

export function queryPonder<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return _queryPonder<T>(query, variables, PONDER_URL)
}
