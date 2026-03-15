export const TEXT_RECORD_KEYS = [
  'avatar',
  'url',
  'email',
  'twitter',
  'github',
  'description',
] as const

export type TextRecordKey = typeof TEXT_RECORD_KEYS[number]
