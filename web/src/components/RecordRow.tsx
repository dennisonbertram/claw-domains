'use client'

interface RecordRowProps {
  /** The record key label (e.g. "Website", "Twitter") */
  label: string
  /** The record value */
  value: string
  /** Whether to show copy/edit actions */
  editable?: boolean
  onEdit?: () => void
}

/**
 * A single record row for the domain profile page.
 * Shows key badge, value, and hover actions.
 *
 * Usage:
 *   <RecordRow label="Website" value="https://example.com" editable onEdit={() => {}} />
 */
export default function RecordRow({ label, value, editable, onEdit }: RecordRowProps) {
  function handleCopy() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(value)
    }
  }

  const isUrl = value.startsWith('http://') || value.startsWith('https://')

  return (
    <div className="flex items-center justify-between p-4 border-b border-[#E5E5E5] last:border-0 hover:bg-[#F3F4F6] transition-colors group">
      {/* Key */}
      <span className="shrink-0 bg-[#F3F4F6] text-[#666666] text-xs font-bold rounded-md px-2 py-1 min-w-[80px] text-center">
        {label}
      </span>

      {/* Value */}
      <div className="flex-1 mx-4 min-w-0">
        {isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#5B61FE] hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <span className="font-mono text-sm text-[#171717] truncate block">{value}</span>
        )}
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 shrink-0">
        <button
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          title="Copy to clipboard"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E5E5] transition-colors text-[#666666] hover:text-[#171717]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>

        {editable && onEdit && (
          <button
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            title="Edit"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#EEF2FF] hover:bg-[#5B61FE] hover:text-white transition-colors text-[#5B61FE]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
