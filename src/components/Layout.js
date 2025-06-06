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
                <svg width="120" height="40" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" className="h-8">
                  {/* Book pages */}
                  <rect x="15" y="25" width="18" height="22" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" rx="1"/>
                  <rect x="18" y="22" width="18" height="22" fill="#F8FAFC" stroke="#3B82F6" strokeWidth="1" rx="1"/>
                  <rect x="21" y="19" width="18" height="22" fill="white" stroke="#06B6D4" strokeWidth="1" rx="1"/>
                  {/* Page lines */}
                  <line x1="23" y1="23" x2="37" y2="23" stroke="#CBD5E1" strokeWidth="0.5"/>
                  <line x1="23" y1="26" x2="35" y2="26" stroke="#CBD5E1" strokeWidth="0.5"/>
                  <line x1="23" y1="29" x2="37" y2="29" stroke="#CBD5E1" strokeWidth="0.5"/>
                  <line x1="23" y1="32" x2="32" y2="32" stroke="#CBD5E1" strokeWidth="0.5"/>
                  <line x1="23" y1="35" x2="36" y2="35" stroke="#CBD5E1" strokeWidth="0.5"/>
                  <line x1="23" y1="38" x2="34" y2="38" stroke="#CBD5E1" strokeWidth="0.5"/>
                  
                  {/* Flowing letters */}
                  <text x="50" y="35" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6" transform="rotate(-3 50 35)">す</text>
                  <text x="65" y="30" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#06B6D4" transform="rotate(-1 65 30)">い</text>
                  <text x="80" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#0EA5E9" transform="rotate(2 80 32)">す</text>
                  <text x="95" y="28" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6" transform="rotate(1 95 28)">い</text>
                  
                  {/* Regular text */}
                  <text x="115" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#1E40AF">リーダー</text>
                  <text x="115" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748B">SuiSui Reader</text>
                </svg>
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