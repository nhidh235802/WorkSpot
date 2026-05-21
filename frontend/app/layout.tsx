import './globals.css';
import { Manrope } from 'next/font/google';
import { Toaster } from 'sonner';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={manrope.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}