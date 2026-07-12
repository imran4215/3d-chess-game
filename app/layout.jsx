import '@/app/globals.css'

export const metadata = {
  title: '3D Chess Game',
  description: 'Play 3D Chess against AI - Built with Next.js & Three.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
