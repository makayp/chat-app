import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Toaster as Sonner } from 'sonner';
import { ThemeProvider } from '@/context/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Private Chat',
  description: 'A modern, minimalist private chat web app',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className='antialiased min-h-dvh flex flex-col'>
        <Toaster toastOptions={{ className: 'text-sm' }} />

        <Sonner className='' position='top-center' />
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
