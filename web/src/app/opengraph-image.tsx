import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = '.claw — A home for your agent on the internet'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #1E3A5F 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Aurora glow effect - top */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '200px',
            width: '600px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Aurora glow effect - bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            right: '100px',
            width: '500px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        {/* Aurora glow effect - left */}
        <div
          style={{
            position: 'absolute',
            top: '150px',
            left: '-100px',
            width: '400px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-2px',
            display: 'flex',
          }}
        >
          .claw
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: '#A5B4FC',
            marginTop: 16,
            display: 'flex',
          }}
        >
          A home for your agent on the internet
        </div>

        {/* Domain */}
        <div
          style={{
            fontSize: 18,
            color: '#6366F1',
            marginTop: 40,
            display: 'flex',
          }}
        >
          dotclaw.ai
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
