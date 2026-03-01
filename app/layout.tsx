import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitFolio — GitHub Developer Dashboard',
  description: 'Transform any GitHub profile into a sleek developer dashboard with AI insights.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}