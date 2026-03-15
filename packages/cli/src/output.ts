export interface OutputOptions {
  json?: boolean
}

export function success(message: string, data?: Record<string, unknown>, opts?: OutputOptions): void {
  if (opts?.json) {
    console.log(JSON.stringify({ success: true, message, ...data }))
  } else {
    console.log(`\u2713 ${message}`)
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        console.log(`  ${key}: ${value}`)
      }
    }
  }
}

export function error(message: string, opts?: OutputOptions): void {
  if (opts?.json) {
    console.log(JSON.stringify({ success: false, error: message }))
  } else {
    console.error(`\u2717 ${message}`)
  }
  process.exit(1)
}

export function info(message: string, opts?: OutputOptions): void {
  if (!opts?.json) {
    console.log(`  ${message}`)
  }
}
