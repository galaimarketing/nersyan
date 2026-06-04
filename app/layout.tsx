import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SeoSettings } from '@/components/seo-settings'
import { getSettings } from '@/lib/db'
import { defaultAppSettings } from '@/lib/settings-types'
import './globals.css'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
})

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nersyantaiba.com').replace(/\/+$/, '')
const OG_IMAGE = '/%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A.jpg'

/**
 * Server-rendered metadata. Reads the admin's SEO settings from the DB so the
 * title/description/keywords are in the initial HTML — visible to Google and to
 * social/WhatsApp scrapers that don't run JS. (SeoSettings still applies live
 * client-side overrides after the admin edits settings without a redeploy.)
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = (await getSettings().catch(() => null)) ?? defaultAppSettings
  const title = s.seoTitle?.trim() || defaultAppSettings.seoTitle!
  const description = s.seoDescription?.trim() || defaultAppSettings.seoDescription!
  const keywords = s.seoKeywords?.trim() || defaultAppSettings.seoKeywords!
  const siteName = s.hotelNameAr || 'نرسيان طيبة'

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${siteName}` },
    description,
    keywords,
    applicationName: siteName,
    alternates: {
      canonical: '/',
      languages: { 'ar-SA': '/', 'en-US': '/' },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    openGraph: {
      type: 'website',
      locale: 'ar_SA',
      alternateLocale: 'en_US',
      url: SITE_URL,
      siteName,
      title,
      description,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
    icons: {
      icon: { url: '/icon.svg', type: 'image/svg+xml' },
      shortcut: '/icon.svg',
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#0d7377',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const HOTEL_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'نرسيان طيبة',
  alternateName: 'Nersyan Taiba',
  description:
    'فندق ووحدات سكنية فاخرة قرب المسجد النبوي في المدينة المنورة. Luxurious hotel accommodation near Al-Masjid an-Nabawi in Madinah, Saudi Arabia.',
  url: SITE_URL,
  image: `${SITE_URL}${OG_IMAGE}`,
  logo: `${SITE_URL}/logo.svg`,
  priceRange: 'SAR',
  currenciesAccepted: 'SAR',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'المدينة المنورة',
    addressRegion: 'Al Madinah',
    addressCountry: 'SA',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 24.4672, longitude: 39.6112 },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free parking', value: true },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(HOTEL_JSON_LD) }}
        />
      </head>
      <body className={`${ibmPlexSansArabic.className} antialiased`}>
        <Script src="/seo-init.js?v=1" strategy="beforeInteractive" />
        <Script src="https://player.vimeo.com/api/player.js" strategy="beforeInteractive" />
        <SeoSettings />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
