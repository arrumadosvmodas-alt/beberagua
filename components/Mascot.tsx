'use client'

interface MascotProps {
  state: 'idle' | 'happy' | 'warning' | 'celebrate'
  size?: number
}

export default function Mascot({ state, size = 120 }: MascotProps) {
  // SVG proportions: 100x120
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300"
      >
        {/* State: Celebrate - Party Hat */}
        {state === 'celebrate' && (
          <g className="animate-bounce">
            {/* Cone */}
            <polygon points="50,5 35,30 65,30" fill="#ffa726" stroke="#fb8c00" strokeWidth="2" />
            {/* Pom-pom */}
            <circle cx="50" cy="5" r="5" fill="#ff7043" />
            {/* Details */}
            <circle cx="47" cy="18" r="2.5" fill="#ffeb3b" />
            <circle cx="53" cy="24" r="2.5" fill="#ff7043" />
          </g>
        )}

        {/* Droplet Body */}
        <path
          d="M50,15 C50,15 85,60 85,85 A35,35 0 0,1 15,85 C15,60 50,15 50,15 Z"
          fill="#1899d6"
          stroke="#127bb0"
          strokeWidth="3"
        />

        {/* Droplet Light Highlight */}
        <path
          d="M50,22 C50,22 75,58 75,78"
          fill="none"
          stroke="#5ac8fa"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Eyes & Mouth depending on state */}
        {state === 'idle' && (
          <g>
            {/* Eyes */}
            <circle cx="40" cy="75" r="5" fill="#3c3c3c" />
            <circle cx="60" cy="75" r="5" fill="#3c3c3c" />
            <circle cx="39" cy="73" r="1.5" fill="#ffffff" />
            <circle cx="59" cy="73" r="1.5" fill="#ffffff" />
            {/* Smile */}
            <path d="M43,83 Q50,90 57,83" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {state === 'happy' && (
          <g className="animate-pulse">
            {/* Joyful Eyes (^ ^) */}
            <path d="M35,76 Q40,70 45,76" fill="none" stroke="#3c3c3c" strokeWidth="4" strokeLinecap="round" />
            <path d="M55,76 Q60,70 65,76" fill="none" stroke="#3c3c3c" strokeWidth="4" strokeLinecap="round" />
            {/* Big Smile */}
            <path d="M40,84 Q50,95 60,84" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
            {/* Thumbs up hand */}
            <path
              d="M80,80 Q90,75 85,70 Q80,68 76,73"
              fill="#1899d6"
              stroke="#127bb0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {state === 'warning' && (
          <g className="animate-bounce">
            {/* Worried / Wide Eyes */}
            <circle cx="38" cy="74" r="7" fill="#ffffff" stroke="#3c3c3c" strokeWidth="2" />
            <circle cx="62" cy="74" r="7" fill="#ffffff" stroke="#3c3c3c" strokeWidth="2" />
            <circle cx="38" cy="74" r="3" fill="#3c3c3c" />
            <circle cx="62" cy="74" r="3" fill="#3c3c3c" />
            {/* Worried Eyebrows */}
            <path d="M32,64 Q38,68 44,64" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
            <path d="M56,64 Q62,68 68,64" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
            {/* Open Mouth (O shape) */}
            <circle cx="50" cy="88" r="5" fill="#3c3c3c" />
          </g>
        )}

        {state === 'celebrate' && (
          <g>
            {/* Excited Eyes (Winking / Stars or happy closed) */}
            <path d="M35,74 L45,79 L35,84" fill="none" stroke="#3c3c3c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65,74 L55,79 L65,84" fill="none" stroke="#3c3c3c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Laughing mouth */}
            <path d="M40,90 Q50,102 60,90 Z" fill="#d7263d" stroke="#3c3c3c" strokeWidth="3" />
            {/* Hands raised high */}
            <path d="M20,65 Q10,50 5,55" fill="none" stroke="#127bb0" strokeWidth="4" strokeLinecap="round" />
            <path d="M80,65 Q90,50 95,55" fill="none" stroke="#127bb0" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {/* Cute rosy cheeks for all except warning */}
        {state !== 'warning' && (
          <g opacity="0.4">
            <circle cx="30" cy="80" r="4" fill="#ff4b4b" />
            <circle cx="70" cy="80" r="4" fill="#ff4b4b" />
          </g>
        )}
      </svg>
    </div>
  )
}
