'use client'

import { useState, useMemo } from 'react'
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import RecordRow from '@/components/RecordRow'
import {
  CONTRACT_ADDRESSES,
  CLAW_REGISTRY_ABI,
  CLAW_RESOLVER_ABI,
  TEXT_RECORD_KEYS,
  namehash,
  labelToId,
  isValidLabel,
  type TextRecordKey,
} from '@/lib/contracts'

const REGISTRY_ADDRESS = CONTRACT_ADDRESSES[5042002].registry
const RESOLVER_ADDRESS = CONTRACT_ADDRESSES[5042002].resolver

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

interface Props {
  label: string
}

/**
 * Domain profile page wired to on-chain data.
 * Reads owner, expiry, ETH address, and text records from registry/resolver.
 * Allows the domain owner to edit records via contract writes.
 */
export default function DomainClient({ label }: Props) {
  const { address } = useAccount()
  const { login } = usePrivy()
  const [editMode, setEditMode] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const tokenId = labelToId(label)
  const node = namehash(label)
  const isValid = isValidLabel(label)
  const coverGradient = getCoverGradient(label)

  // ── On-chain reads ──────────────────────────────────────────────────────

  const { data: owner, isLoading: loadingOwner, isError: ownerError } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: CLAW_REGISTRY_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  })

  const { data: expiresRaw, isLoading: loadingExpiry } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: CLAW_REGISTRY_ABI,
    functionName: 'nameExpires',
    args: [tokenId],
  })

  const { data: ethAddr } = useReadContract({
    address: RESOLVER_ADDRESS,
    abi: CLAW_RESOLVER_ABI,
    functionName: 'addr',
    args: [node],
  })

  // Batch-read all text records
  const textRecordCalls = TEXT_RECORD_KEYS.map((key) => ({
    address: RESOLVER_ADDRESS as `0x${string}`,
    abi: CLAW_RESOLVER_ABI,
    functionName: 'text' as const,
    args: [node, key] as const,
  }))

  const { data: textResults } = useReadContracts({
    contracts: textRecordCalls,
  })

  // Build text records from batch results
  const textRecords = useMemo(() => {
    const result: Record<string, string> = {}
    if (textResults) {
      TEXT_RECORD_KEYS.forEach((key, i) => {
        const res = textResults[i]
        if (res?.status === 'success' && res.result) {
          result[key] = res.result as string
        }
      })
    }
    return result
  }, [textResults])

  // ── Derived values ──────────────────────────────────────────────────────

  const expires = expiresRaw ? new Date(Number(expiresRaw) * 1000) : null
  const expiresDisplay = expires
    ? expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '\u2014'

  // Registered date: without an indexer we approximate as expires - 365 days.
  // TODO: Replace with real registration timestamp from an indexer.
  const registeredDisplay = expires
    ? new Date(expires.getTime() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '\u2014'

  const ownerStr = owner as string | undefined
  const isOwner =
    !!ownerStr && !!address && ownerStr.toLowerCase() === address.toLowerCase()

  const isLoading = loadingOwner || loadingExpiry
  // ownerOf reverts for non-existent tokens — treat error as "not found"
  const domainNotFound = !isLoading && ownerError

  // ── Contract writes ─────────────────────────────────────────────────────

  const {
    writeContract: writeRecord,
    data: writeTxHash,
    isPending: isWriting,
    reset: resetWrite,
  } = useWriteContract()

  const { isLoading: writeConfirming, isSuccess: writeConfirmed } =
    useWaitForTransactionReceipt({ hash: writeTxHash })

  const {
    writeContract: renewDomain,
    data: renewTxHash,
    isPending: isRenewing,
    reset: resetRenew,
  } = useWriteContract()

  const { isLoading: renewConfirming, isSuccess: renewConfirmed } =
    useWaitForTransactionReceipt({ hash: renewTxHash })

  // ── Handlers ────────────────────────────────────────────────────────────

  function startEdit(key: string, currentValue: string) {
    setEditingKey(key)
    setEditValue(currentValue)
    resetWrite()
  }

  function handleSaveRecord(key: string) {
    if (key === 'eth') {
      writeRecord({
        address: RESOLVER_ADDRESS,
        abi: CLAW_RESOLVER_ABI,
        functionName: 'setAddr',
        args: [node, editValue as `0x${string}`],
      })
    } else {
      writeRecord({
        address: RESOLVER_ADDRESS,
        abi: CLAW_RESOLVER_ABI,
        functionName: 'setText',
        args: [node, key, editValue],
      })
    }
    setEditingKey(null)
    setEditValue('')
  }

  function handleRenew() {
    renewDomain({
      address: REGISTRY_ADDRESS,
      abi: CLAW_REGISTRY_ABI,
      functionName: 'renew',
      args: [tokenId],
    })
  }

  // ── Build active records for display ────────────────────────────────────

  const ethAddrStr = ethAddr as string | undefined
  const activeRecords = [
    ethAddrStr && ethAddrStr !== '0x0000000000000000000000000000000000000000' && {
      key: 'eth',
      label: 'ETH Address',
      value: ethAddrStr,
    },
    ...TEXT_RECORD_KEYS.map((key) =>
      textRecords[key]
        ? { key, label: TEXT_KEY_LABELS[key], value: textRecords[key] }
        : null,
    ),
  ].filter(Boolean) as { key: string; label: string; value: string }[]

  // ── Render: invalid label ───────────────────────────────────────────────

  if (!isValid) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E5E5] p-10 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            {'\u26A0\uFE0F'}
          </div>
          <h1
            className="text-2xl font-bold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Invalid domain
          </h1>
          <p className="text-[#666666] text-sm mb-6">
            <code className="font-mono bg-[#F3F4F6] px-2 py-0.5 rounded text-[#EF4444]">
              {label}
            </code>{' '}
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

  // ── Render: loading state ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-8 h-8 animate-spin text-[#5B61FE]"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-[#666666] text-sm">Loading domain data...</p>
        </div>
      </div>
    )
  }

  // ── Render: domain not found ────────────────────────────────────────────

  if (domainNotFound) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E5E5E5] p-10 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">
            {'\uD83E\uDD7A'}
          </div>
          <h1
            className="text-2xl font-bold text-[#171717] mb-3"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
          >
            Domain not registered
          </h1>
          <p className="text-[#666666] text-sm mb-6">
            <span className="font-mono font-semibold">{label}.claw</span> has not
            been registered yet.
          </p>
          <Link
            href={`/register/${encodeURIComponent(label)}`}
            className="inline-flex items-center gap-2 bg-[#5B61FE] text-white font-semibold rounded-xl px-6 py-3 hover:bg-[#4A50E2] transition-colors"
          >
            Register it now
          </Link>
        </div>
      </div>
    )
  }

  // ── Render: domain profile ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FCFCFD] pt-20">
      {/* Cover */}
      <div
        className="w-full h-48 rounded-b-3xl"
        style={{ background: coverGradient }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Domain header -- overlaps cover */}
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
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                    aria-hidden="true"
                  />
                  Active
                </span>
                <Link
                  href="/"
                  className="text-xs text-[#A3A3A3] hover:text-[#666666] transition-colors"
                >
                  {'\u2190'} Back
                </Link>
              </div>
            </div>
            {/* Only show edit button if the connected wallet is the owner */}
            {isOwner && (
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
            )}
          </div>
        </div>

        {/* Tx status indicator */}
        {(isWriting || writeConfirming) && (
          <div className="mb-4 flex items-center gap-2 bg-[#EEF2FF] border border-[#5B61FE]/20 rounded-xl px-4 py-3 text-sm text-[#5B61FE]">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            {isWriting ? 'Confirm transaction in your wallet...' : 'Waiting for confirmation...'}
          </div>
        )}
        {writeConfirmed && (
          <div className="mb-4 flex items-center gap-2 bg-[#D1FAE5] border border-[#10B981]/20 rounded-xl px-4 py-3 text-sm text-[#065F46]">
            Record updated successfully.
          </div>
        )}

        {/* Renew tx status */}
        {(isRenewing || renewConfirming) && (
          <div className="mb-4 flex items-center gap-2 bg-[#EEF2FF] border border-[#5B61FE]/20 rounded-xl px-4 py-3 text-sm text-[#5B61FE]">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            {isRenewing ? 'Confirm renewal in your wallet...' : 'Waiting for confirmation...'}
          </div>
        )}
        {renewConfirmed && (
          <div className="mb-4 flex items-center gap-2 bg-[#D1FAE5] border border-[#10B981]/20 rounded-xl px-4 py-3 text-sm text-[#065F46]">
            Domain renewed successfully.
          </div>
        )}

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left -- stats */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] p-6"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <h2 className="text-sm font-bold text-[#A3A3A3] uppercase tracking-wider mb-4">
                Domain Info
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">
                    Registered
                  </dt>
                  <dd className="text-sm font-semibold text-[#171717]">
                    {registeredDisplay}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">
                    Expires
                  </dt>
                  <dd className="text-sm font-semibold text-[#171717]">
                    {expiresDisplay}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#A3A3A3] font-medium mb-1">
                    Owner
                  </dt>
                  <dd
                    className="text-sm font-semibold text-[#171717] font-mono truncate"
                    title={ownerStr ?? ''}
                  >
                    {ownerStr ? truncateAddress(ownerStr) : '\u2014'}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <button
                  onClick={handleRenew}
                  disabled={isRenewing || renewConfirming}
                  className="w-full flex items-center justify-center gap-2 bg-[#F3F4F6] hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed text-[#171717] text-sm font-semibold rounded-xl py-2.5 transition-colors"
                >
                  {isRenewing || renewConfirming ? 'Renewing...' : 'Renew domain'}
                </button>
              </div>
            </div>
          </div>

          {/* Right -- records */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden"
              style={{ boxShadow: '0px 4px 20px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
                <h2
                  className="font-bold text-[#171717]"
                  style={{
                    fontFamily: 'var(--font-outfit, Outfit, sans-serif)',
                  }}
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
                  <p className="text-[#A3A3A3] text-sm">
                    No records set yet.
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-3 text-sm text-[#5B61FE] hover:underline"
                    >
                      Add your first record
                    </button>
                  )}
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
                            onClick={() => handleSaveRecord(key)}
                            disabled={isWriting}
                            className="shrink-0 text-xs font-bold bg-[#5B61FE] text-white rounded-lg px-3 py-1.5 hover:bg-[#4A50E2] disabled:opacity-50 transition-colors"
                          >
                            {isWriting ? 'Saving...' : 'Save'}
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

              {/* Info note in edit mode */}
              {editMode && (
                <div className="px-6 py-4 border-t border-[#E5E5E5]">
                  <p className="text-xs text-[#A3A3A3]">
                    Changes are submitted as transactions to the resolver
                    contract on Arc.
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
