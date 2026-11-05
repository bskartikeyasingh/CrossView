import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  GitCompare,
  Clock,
  ShieldAlert,
  MessageSquare,
  Bookmark,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI News Feed', path: '/dashboard/feed', icon: Sparkles, badge: 'Live' },
    { name: 'Explore News', path: '/dashboard/explore', icon: Compass },
    { name: 'Perspective Comparison', path: '/dashboard/compare', icon: GitCompare },
    { name: 'Event Timelines', path: '/dashboard/timelines', icon: Clock },
    { name: 'Claim Analysis', path: '/dashboard/claims', icon: ShieldAlert },
    { name: 'Ask CrossView', path: '/dashboard/ask', icon: MessageSquare, badge: 'AI' },
    { name: 'Bookmarks', path: '/dashboard/bookmarks', icon: Bookmark },
    { name: 'Saved Reports', path: '/dashboard/saved-reports', icon: FileText },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-bold">
              <Radio className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-editorial text-xl font-bold tracking-tight text-primary leading-none block">
                CrossView
              </span>
              <span className="text-[9px] uppercase tracking-wider text-secondary font-semibold">
                Intelligence Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-secondary">
            Intelligence Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setMobileOpen && setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#263F65]/10 text-navy font-semibold border-l-4 border-navy'
                      : 'text-secondary hover:text-primary hover:bg-[#F7F7F5]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-navy/10 text-navy">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border bg-[#F7F7F5]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm uppercase">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">
                {user?.name || 'News Analyst'}
              </p>
              <p className="text-xs text-secondary truncate">
                {user?.email || 'analyst@crossview.news'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-secondary hover:text-red-600 hover:bg-red-50 rounded-md border border-border transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

