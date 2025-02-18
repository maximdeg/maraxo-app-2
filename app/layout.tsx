import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

const poppinsFont = Poppins({ 
  subsets: ["latin"],
  weight: ['100', '300'] 
});

export const metadata: Metadata = {
  title: 'Maraxo APP',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppinsFont.className}>{children}</body>
    </html>
  );
}
