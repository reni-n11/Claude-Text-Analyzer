import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TextLens — Анализ на текст',
  description: 'Извличайте тема, ключови думи, резюме и емоционална натовареност от вашия текст.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
