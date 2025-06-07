'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <img 
                  src="/logos/gorilla-complete-balanced.svg" 
                  alt="速読ゴリラ" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className={`${
                  pathname === '/' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition-colors`}
              >
                ホーム
              </Link>
              <Link 
                href="/about" 
                className={`${
                  pathname === '/about' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition-colors`}
              >
                Fluencyについて
              </Link>
              <Link 
                href="/reading" 
                className={`${
                  pathname === '/reading' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition-colors`}
              >
                読解練習
              </Link>
              <Link 
                href="/admin" 
                className={`${
                  pathname === '/admin' ? 'text-blue-600' : 'text-gray-500'
                } hover:text-blue-600 transition-colors text-sm`}
              >
                管理
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}