import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Управление Компаниями и Сотрудниками",
  description: "Fullstack Next.js Application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-indigo-600 tracking-tight">
              TeamFlow
            </Link>
            <nav className="flex space-x-6 text-sm font-medium text-slate-600">
              <Link href="/companies" className="hover:text-indigo-600 transition-colors">Компании</Link>
              <Link href="/employees" className="hover:text-indigo-600 transition-colors">Сотрудники</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} TeamFlow. Все права защищены.
        </footer>
      </body>
    </html>
  );
}
