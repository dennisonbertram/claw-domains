'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RecordRow from '@/components/RecordRow'
import { isValidLabel, TEXT_RECORD_KEYS, type TextRecordKey } from '@/lib/contracts'

interface Props {
  label: string
}

// Mock domain data for demo
const MOCK_DOMAIN = {
  owner: '0x1234567890abcdef1234567890abcdef12345678',
  registered: 'Mar 12, 2025',
  expires: 'Mar 12, 2026',
  records: {
    eth: '0x1234567890abcdef1234567890abcdef12345678',
    url: 'https://example.com',
    twitter: '@example',
    github: 'example',
    email: '',
    description: 'My personal .claw domain',
    avatar: '',
  },
}

const TEXT_KEY_LABELS: Record<TextRecordKey, string> = {
  avatar: 'Avatar',
  url: 'Website',
  email: 'Email',
  twitter: 'Twitter',
  github: 'GitHub',
  description: 'Description',
}

/**
 * Generates a deterministic gradient from a domain label string.
 * Used for the cover image.
 */
function getCoverGradient(name: string): string {
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return `linear-gradient(135deg, hsl(${hue},70%,85%) 0%, hsl(${(hue + 60) % 360},80%,90%) 100%)`
}

function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

/**
 * Redesigned domain profile page.
 * Shows cover, domain name, stats, and records with edit mode.
 */
export default function DomainClient({ label }: Props) {
  const [editMode, setEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [records, setRecords] = useState(MOCK_DOMAIN.records)

  const isValid = isValidLabel(label)
  const coverGradient = getCoverGradient(label)

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E5E5] p-10 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h1
            className="text-2xl font-bold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Invalid domain
          </h1>
          <p className="text-[#666666] text-sm mb-6">
            <code className="font-mono bg-[#F3F4F6] px-2 py-0.5 rounded text-[#EF4444]">{label}</code>{' '}
            is not a valid .claw name.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#5B61FE] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#4A50E2] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    )
  }

  function startEdit(key: string, currentValue: string) {
    setEditingKey(key)
    setEditValue(currentValue)
  }

  function saveEdit(key: string) {
    if (key === 'eth') {
      setRecords((r) => ({ ...r, eth: editValue }))
    } else {
      setRecords((r) => ({ ...r, [key]: editValue }))
    }
    setEditingKey(null)
    setEditValue('')
  }

  const activeRecords = [
    records.eth && { key: 'eth', label: 'ETH Address', value: records.eth },
    records.url && { key: 'url', label: 'Website', value: records.url },
    records.twitter && { key: 'twitter', label: 'Twitter', value: records.twitter },
    records.github && { key: 'github', label: 'GitHub', value: records.github },
    records.email && { key: 'email', label: 'Email', value: records.email },
    records.description && { key: 'description', label: 'Description', value: records.description },
  ].filter(Boolean) as { key: string; label: string; value: string }[]

  return (
    <div className="min-h-screen bg-[#FCFCFD] pt-20">
      {/* Cover */}
      <div
        className="w-full h-48 rounded-b-3xl"
        style={{ background: coverGradient }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Domain header — overlaps cover */}
        <div className="-mt-8 mb-6 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-4xl font-bold text-[#171717]"
                style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}
              >
                {label}
                <span className="text-[#5B61FE]">.claw</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] text-xs font-bold rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                  Active
                </span>
                <Link
                  href="/"
                  className="text-xs text-[#A3A3A3] hover:text-[#666666] transition-colors"
                >
                  ← Back
                </Link>
              </div>
            </div>
            <motion.button
              onClick={() => setEditMode((e) => !e)}
              className={`h-10 px-5 rounded-xl font-semibold text-sm transition-colors ${
                editMode
                  ? 'bg-[#5B61FE] text-white hover:bg-[#4A50E2]'
                  : 'bg-white border border-[#E5E5E5] text-[#171717] hover:bg-[#F3F4F6]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {editMode ? 'Done editing' : 'Edit domain'}
            </motion.button>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — stats */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] p-6"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <h2
                className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-4"
              >
                Domain Info
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Registered</dt>
                  <dd className="text-sm font-semibold text-[#171717]">{MOCK_DOMAIN.registered}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Expires</dt>
                  <dd className="text-sm font-semibold text-[#171717]">{MOCK_DOMAIN.expires}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">Owner</dt>
                  <dd
                    className="text-sm font-semibold text-[#171717] font-mono truncate"
                    title={MOCK_DOMAIN.owner}
                  >
                    {truncateAddress(MOCK_DOMAIN.owner)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <Link
                  href={`/register/${label}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#F3F4F6] hover:bg-[#E5E5E5] text-[#171717] text-sm font-semibold rounded-xl py-2.5 transition-colors"
                >
                  Renew domain
                </Link>
              </div>
            </div>
          </div>

          {/* Right — records */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
                <h2
                  className="font-bold text-[#171717]"
                  style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
                >
                  Records
                </h2>
                {editMode && (
                  <span className="text-xs text-[#5B61FE] font-medium bg-[#EEF2FF] rounded-full px-2.5 py-1">
                    Edit mode
                  </span>
                )}
              </div>

              {activeRecords.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-[#A3A3A3] text-sm">No records set yet.</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-3 text-sm text-[#5B61FE] hover:underline"
                  >
                    Add your first record
                  </button>
                </div>
              ) : (
                <div>
                  {activeRecords.map(({ key, label: keyLabel, value }) => (
                    <div key={key}>
                      {editingKey === key ? (
                        <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E5] bg-[#F9FAFB]">
                          <span className="shrink-0 bg-[#EEF2FF] text-[#5B61FE] text-xs font-bold rounded-md px-2 py-1 min-w-[80px] text-center">
                            {keyLabel}
                          </span>
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 font-mono text-sm text-[#171717] bg-white border border-[#5B61FE] rounded-lg px-3 py-1.5 outline-none"
                            autoFocus
                            aria-label={`Edit ${keyLabel}`}
                          />
                          <button
                            onClick={() => saveEdit(key)}
                            className="shrink-0 text-xs font-bold bg-[#5B61FE] text-white rounded-lg px-3 py-1.5 hover:bg-[#4A50E2] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="shrink-0 text-xs font-medium text-[#666666] hover:text-[#171717] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <RecordRow
                          label={keyLabel}
                          value={value}
                          editable={editMode}
                          onEdit={() => startEdit(key, value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add record button in edit mode */}
              {editMode && (
                <div className="px-6 py-4 border-t border-[#E5E5E5]">
                  <p className="text-xs text-[#A3A3A3]">
                    In production, changes are submitted as transactions to the resolver contract.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
