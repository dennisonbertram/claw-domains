const PONDER_URL = process.env.NEXT_PUBLIC_PONDER_URL || 'http://localhost:42069';

export async function queryPonder<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Ponder query failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || 'GraphQL error');
  }

  return json.data as T;
}
