import { queryPonder } from '@claw-domains/shared'

const PONDER_URL = process.env.CLAW_PONDER_URL || 'http://localhost:42069'

interface DomainResult {
  id: string
  name: string
  owner: string
  expires: string
  registeredAt: string
}

export async function lookupDomain(name: string): Promise<DomainResult | null> {
  const query = `
    query LookupDomain($name: String!) {
      domains(where: { name: $name }, limit: 1) {
        items {
          id
          name
          owner
          expires
          registeredAt
        }
      }
    }
  `
  const data = await queryPonder<{ domains: { items: DomainResult[] } }>(query, { name }, PONDER_URL)
  return data.domains.items[0] || null
}

export async function listDomainsByOwner(owner: string): Promise<DomainResult[]> {
  const query = `
    query ListDomains($owner: String!) {
      domains(where: { owner: $owner }) {
        items {
          id
          name
          owner
          expires
          registeredAt
        }
      }
    }
  `
  const data = await queryPonder<{ domains: { items: DomainResult[] } }>(query, { owner: owner.toLowerCase() }, PONDER_URL)
  return data.domains.items
}

interface TextRecordResult {
  key: string
  value: string
}

export async function getTextRecords(node: string): Promise<TextRecordResult[]> {
  const query = `
    query GetTextRecords($node: String!) {
      textRecords(where: { node: $node }) {
        items {
          key
          value
        }
      }
    }
  `
  const data = await queryPonder<{ textRecords: { items: TextRecordResult[] } }>(query, { node }, PONDER_URL)
  return data.textRecords.items
}

export async function getAddrRecord(node: string): Promise<string | null> {
  const query = `
    query GetAddrRecord($node: String!) {
      addrRecords(where: { node: $node }, limit: 1) {
        items {
          addr
        }
      }
    }
  `
  const data = await queryPonder<{ addrRecords: { items: { addr: string }[] } }>(query, { node }, PONDER_URL)
  return data.addrRecords.items[0]?.addr || null
}
