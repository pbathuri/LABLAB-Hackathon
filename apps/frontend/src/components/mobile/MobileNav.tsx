'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  TrendingUp, 
  ShieldCheck, 
  Menu,
  X,
  Settings,
  ScrollText,
  Atom,
  Bell,
  Search,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';

interface MobileNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
}

export function MobileBottomNav({ currentScreen, onNavigate }: MobileNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'ai-assistant', label: 'AI', icon: Bot },
    { id: 'verifications', label: 'Verify', icon: ShieldCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0F1629]/95 backdrop-blur-xl border-t border-[#00D9FF]/10 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#00D9FF]' 
                  : 'text-[#8892A7]'
              }`}
            >
              <div className={`relative p-2 rounded-xl transition-all ${
                isActive ? 'bg-[#00D9FF]/10' : ''
              }`}>
                <Icon size={22} />
                {isActive && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00FF94]" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface MobileDrawerProps extends MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose, currentScreen, onNavigate, onLogout }: MobileDrawerProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & metrics' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, description: 'Chat with Captain Whiskers' },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp, description: 'Optimization & allocation' },
    { id: 'quantum-insights', label: 'Quantum Insights', icon: Atom, description: 'Deep analytics' },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheck, description: 'BFT consensus' },
    { id: 'activity-logs', label: 'Activity Logs', icon: ScrollText, description: 'Audit trail' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Preferences' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#0F1629] z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#00D9FF]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#7B61FF] flex items-center justify-center text-xl">
              🐱‍🚀
            </div>
            <div>
              <p className="font-semibold text-sm">Captain Whiskers</p>
              <p className="text-xs text-[#8892A7]">Quantum Treasury</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00D9FF]/20 to-[#7B61FF]/20 border border-[#00D9FF]/30'
                      : 'hover:bg-[#151C2C]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-[#00D9FF]/20 text-[#00D9FF]' : 'bg-[#151C2C] text-[#8892A7]'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isActive ? 'text-[#00D9FF]' : 'text-white'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-[#8892A7]">{item.description}</p>
                  </div>
                  {isActive && <Sparkles size={14} className="text-[#00FF94]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#00D9FF]/10">
          {/* Status */}
          <div className="flex items-center gap-2 mb-4 p-3 bg-[#151C2C] rounded-xl">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-[#00FF94]" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#00FF94] animate-ping" />
            </div>
            <span className="text-xs text-[#00FF94]">All systems operational</span>
          </div>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 text-[#FF4757] hover:bg-[#FF4757]/10 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function MobileHeader({ title, onMenuClick, showSearch = true, showNotifications = true }: MobileHeaderProps) {
  const [showSearchInput, setShowSearchInput] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0E17]/95 backdrop-blur-xl border-b border-[#00D9FF]/10 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
          >
            <Menu size={22} />
          </button>
          {!showSearchInput && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
        </div>

        {showSearchInput ? (
          <div className="flex-1 mx-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892A7]" />
              <input
                type="text"
                placeholder="Search..."
                autoFocus
                onBlur={() => setShowSearchInput(false)}
                className="w-full pl-9 pr-4 py-2 bg-[#151C2C] border border-[#00D9FF]/20 rounded-lg text-sm text-white placeholder-[#8892A7] focus:border-[#00D9FF] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {showSearch && (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all"
              >
                <Search size={20} />
              </button>
            )}
            {showNotifications && (
              <button className="relative p-2 rounded-lg text-[#8892A7] hover:text-white hover:bg-[#151C2C] transition-all">
                <Bell size={20} />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4757]" />
              </button>
            )}
            <button className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#7B61FF] flex items-center justify-center">
              <User size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
