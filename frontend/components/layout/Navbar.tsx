'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import {
  Inbox,
  Send,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  User,
  ChevronDown,
  Clock,
  Sparkle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/inbox', label: 'Inbox', icon: Inbox },
    { href: '/compose', label: 'Compose', icon: Send },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/followups', label: 'Follow-ups', icon: Clock },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2.5 outline-none group">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-sm border border-indigo-700/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
                <Sparkle className="h-4 w-4 text-white fill-white/20 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <span className="hidden text-[17px] font-semibold text-slate-900 tracking-tight sm:block">
                SmartInboxAI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 text-sm font-medium h-full transition-colors outline-none
                    ${active ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}
                  `}
                >
                  <Icon className={`h-[15px] w-[15px] ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-600 rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Profile */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 outline-none border border-transparent hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/30"
              >
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/50">
                  <User className="h-3.5 w-3.5" />
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-500 sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+4px)] z-50 w-56 rounded-xl bg-white border border-slate-200 shadow-lg shadow-black/[0.03] py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2.5 mb-1 border-b border-slate-100">
                    <p className="truncate text-[13px] font-medium text-slate-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="truncate text-xs text-slate-500 mt-0.5">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <div className="px-1">
                    <Link
                      href="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout?.();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-slate-600 hover:bg-slate-50 transition-colors outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
