import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StackCalc AI',
  description: 'Technical intelligence for software project estimation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
