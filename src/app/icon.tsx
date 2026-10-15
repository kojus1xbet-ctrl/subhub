import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          borderRadius: '112px',
          border: '12px solid #1e293b'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '280px',
            height: '280px',
            borderRadius: '64px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#ffffff',
            fontSize: '180px',
            fontWeight: 900,
            boxShadow: '0 20px 60px rgba(79, 70, 229, 0.4)'
          }}
        >
          S
        </div>
        <div
          style={{
            marginTop: '24px',
            color: '#ffffff',
            fontSize: '40px',
            fontWeight: 900,
            letterSpacing: '6px'
          }}
        >
          SUBHUB
        </div>
      </div>
    ),
    { ...size }
  );
}
