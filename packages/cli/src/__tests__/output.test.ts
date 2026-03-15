import { describe, it, expect, vi, beforeEach } from 'vitest'
import { success, info } from '../output.js'

describe('output helpers', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('success outputs human-readable by default', () => {
    success('Done', { key: 'value' })
    expect(console.log).toHaveBeenCalledWith('\u2713 Done')
    expect(console.log).toHaveBeenCalledWith('  key: value')
  })

  it('success outputs JSON when --json', () => {
    success('Done', { key: 'value' }, { json: true })
    const call = (console.log as any).mock.calls[0][0]
    const parsed = JSON.parse(call)
    expect(parsed.success).toBe(true)
    expect(parsed.message).toBe('Done')
    expect(parsed.key).toBe('value')
  })

  it('info is suppressed in JSON mode', () => {
    info('Loading...', { json: true })
    expect(console.log).not.toHaveBeenCalled()
  })
})
