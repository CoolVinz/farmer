'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ href, icon, label, isActive }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-green-100 text-green-800 font-semibold' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <div className="flex-shrink-0">
      {icon}
    </div>
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

interface SidebarProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const sidebarClasses = variant === 'compact' 
    ? `w-64 bg-white shadow-md rounded-xl p-4 ${className}`
    : `w-72 bg-white border-r border-gray-200 p-6 space-y-6 ${className}`;

  return (
    <aside className={`flex flex-col ${sidebarClasses}`}>
      <div className="flex flex-col gap-6">
        <h1 className="text-green-800 text-2xl font-bold leading-normal px-3 py-2">
          สวนวิสุทธิ์ศิริ
        </h1>
        
        <nav className="flex flex-col gap-2">
          <SidebarLink
            href="/"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            }
            label="Dashboard"
            isActive={isActive('/')}
          />
          
          <SidebarLink
            href="/logs"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            }
            label="บันทึกกิจกรรม"
            isActive={isActive('/logs')}
          />
          
          <SidebarLink
            href="/trees"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
              </svg>
            }
            label="จัดการต้นไม้"
            isActive={isActive('/trees')}
          />
          
          <SidebarLink
            href="/gallery"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v16H4z M6 6v12h12V6H6z M8 8h8v8H8V8z"/>
              </svg>
            }
            label="แกลเลอรี"
            isActive={isActive('/gallery')}
          />
          
          <SidebarLink
            href="/report"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3v18h18v-2H5V3H3z M21 19H7V5h14v14z M9 7v10h10V7H9z"/>
              </svg>
            }
            label="รายงาน"
            isActive={isActive('/report')}
          />
          
          <SidebarLink
            href="/sections"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h16v4H4V4z M4 10h16v4H4v-4z M4 16h16v4H4v-4z"/>
              </svg>
            }
            label="แปลงและแซก"
            isActive={isActive('/sections')}
          />
          
          <SidebarLink
            href="/admin"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 6.5V7.5C15 8.1 14.6 8.5 14 8.5S13 8.1 13 7.5V6.5L12 6.5L11 6.5V7.5C11 8.1 10.6 8.5 10 8.5S9 8.1 9 7.5V6.5L3 7V9H21Z"/>
              </svg>
            }
            label="ตั้งค่าระบบ"
            isActive={isActive('/admin')}
          />
        </nav>
        
        {variant === 'default' && (
          <div className="pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <Link 
                href="/logs/add-single" 
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                เพิ่มข้อมูลใหม่
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};