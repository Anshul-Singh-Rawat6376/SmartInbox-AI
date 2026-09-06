import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmartInboxAI | AI-Powered Email Assistant',
  description: 'AI-powered email management and automation platform',
  verification: {
    google: 'WsjSLWusN_atn6Sr3Y7QyCEzoqucF980hWxZpjdo05w',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="33c1bf17-17c9-411a-8b96-658ae59bbe60"></script>
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
