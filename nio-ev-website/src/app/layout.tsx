import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NIO | Drive The Future Today',
  description: 'More than a car, it\'s a statement of progressive luxury. Experience the perfect blend of innovation and sustainable elegance with NIO electric vehicles.',
  keywords: ['NIO', 'electric vehicles', 'luxury cars', 'EV', 'sustainable', 'autonomous driving'],
  openGraph: {
    title: 'NIO | Drive The Future Today',
    description: 'Experience the perfect blend of innovation and sustainable elegance.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
