const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export class RateLimiter {
  private requests = new Map<string, number>()
  private cleanupInterval: ReturnType<typeof setInterval>

  constructor() {
    // Clean up expired entries every hour
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 60 * 1000)
  }

  isAllowed(key: string): boolean {
    const lastRequest = this.requests.get(key.toLowerCase())
    if (!lastRequest) return true
    return Date.now() - lastRequest >= WINDOW_MS
  }

  record(key: string): void {
    this.requests.set(key.toLowerCase(), Date.now())
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, timestamp] of this.requests) {
      if (now - timestamp >= WINDOW_MS) {
        this.requests.delete(key)
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
  }
}
