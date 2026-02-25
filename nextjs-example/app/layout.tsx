import '@/app/globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppSidebar } from '@/app/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'ThinkFeel Chat Cookbook',
  description: 'Barebones functional ThinkFeel multi-turn chat + quickstart demo built with Next.js and Vercel AI SDK.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset className="bg-background">
            <header className="flex shrink-0 items-center gap-3 border-b border-foreground/15 p-2 sm:p-4">
              <SidebarTrigger />
              <p className="mono-meta text-[10px] sm:text-xs">ThinkFeel AI SDK Cookbook</p>
            </header>
            <main id="main-content" className="min-h-0 flex-1 overflow-y-auto overscroll-none px-4 py-6 sm:px-8 sm:py-8">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
