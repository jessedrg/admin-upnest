import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'upnest — Admin Console',
  description: 'Operator console for the upnest platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
