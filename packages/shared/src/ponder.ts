const DEFAULT_PONDER_URL = 'http://localhost:42069'

export async function queryPonder<T>(
  query: string,
  variables?: Record<string, unknown>,
  ponderUrl?: string,
): Promise<T> {
  const url = ponderUrl || process.env.CLAW_PONDER_URL || DEFAULT_PONDER_URL
  const res = await fetch(`${url}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Ponder query failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL error')
  }

  return json.data as T
}
