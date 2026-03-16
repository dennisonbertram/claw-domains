import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Register a .claw domain'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const label = decodeURIComponent(name).toLowerCase()

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

        {/* Register title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-1px',
            display: 'flex',
          }}
        >
          Register {label}.claw
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#A5B4FC',
            marginTop: 16,
            display: 'flex',
          }}
        >
          Claim your .claw identity
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
