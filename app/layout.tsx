import type { Metadata } from 'next'
import { Outfit, Geist_Mono } from 'next/font/google'
import './globals.css'
import RegisterSW from './register-sw'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AguaQuero - Water Tracker',
  description: 'Rastreie sua hidratação diária com lembretes divertidos no estilo Duolingo',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AguaQuero',
  },
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: '/icon-180.png',
  },
}

export const viewport = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <head>
        <meta name="theme-color" content="#1899d6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
        <RegisterSW />
        {children}
      </body>
    </html>
  )
}
