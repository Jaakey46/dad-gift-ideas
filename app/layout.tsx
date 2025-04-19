import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Dad Gift Finder | Perfect Gift Ideas',
  description: 'Find thoughtful gifts for dad - from tech and tools to sports and BBQ. Personalized gift suggestions for Father\'s Day, birthdays, Christmas and more. Expert gift recommendations for every budget.',
  keywords: 'dad gifts, father\'s day gifts, gifts for dad, dad birthday gifts, what to get dad, dad christmas gifts',
  openGraph: {
    title: 'Dad Gift Finder | Perfect Gift Ideas',
    description: 'Find thoughtful gifts for dad - personalized suggestions for every interest and budget.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dad Gift Finder | Perfect Gift Ideas',
    description: 'Find thoughtful gifts for dad - personalized suggestions for every interest and budget.',
  },
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
