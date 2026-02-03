import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Robert & Amanda - Construindo um Casamento Feliz',
  description: 'Lista de presentes de casamento',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
