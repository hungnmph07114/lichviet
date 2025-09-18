import React from 'react';
import type { View } from '../types';

interface NavItem {
  readonly id: View;
  readonly label: string;
  readonly icon: React.ReactNode;
}

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  navItems: readonly NavItem[];
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, navItems }) => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-40 shadow-md shadow-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-amber-400">Lịch & Tử Vi AI</h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    currentView === item.id
                      ? 'bg-amber-500 text-slate-900'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
       {/* Mobile navigation */}
      <nav className="md:hidden flex justify-around p-2 border-t border-slate-700">
         {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs w-24 transition-colors duration-200 ${
                currentView === item.id
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </button>
          ))}
      </nav>
    </header>
  );
};
