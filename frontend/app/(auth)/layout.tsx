import { Acme, Be_Vietnam_Pro, Manrope } from 'next/font/google'

const acme = Acme({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-acme',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '800'],
  variable: '--font-manrope',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin'],
  weight: ['400', '500', '600', '800'],
  variable: '--font-be-vietnam-pro',
})

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${acme.variable} ${manrope.variable} ${beVietnamPro.variable}`}>
      {children}
    </div>
  )
}
