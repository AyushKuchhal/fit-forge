import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Dumbbell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/plans', label: 'Workout Plans' },
  { to: '/generator', label: 'Plan Generator' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/chat', label: 'AI Coach' },
  { to: '/progress', label: 'Progress' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#07090e]/60 backdrop-blur-2xl border-b border-white/[0.12] shadow-[0_4px_30px_rgba(0,0,0,0.5)] liquid-glare">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_15px_rgba(255,69,0,0.25)] group-hover:scale-105 transition-all">
              <Dumbbell className="w-5 h-5 text-accent" />
            </div>
            <span>Fit<span className="text-accent drop-shadow-[0_0_12px_rgba(255,69,0,0.4)]">Forge</span></span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-accent bg-accent/10 border border-accent/30 shadow-[0_0_15px_rgba(255,69,0,0.15)] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Auth Buttons */}
            {user && !user.isGuest ? (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs bg-white/[0.04] backdrop-blur-md text-gray-200 px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 font-medium max-w-[150px] truncate shadow-sm">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span className="truncate">{user.email}</span>
                </span>
                <button
                  onClick={logout}
                  className="bg-white/[0.04] hover:bg-red-500/20 hover:text-red-400 text-gray-400 p-2 rounded-xl border border-white/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 ml-4">
                <span className="text-[11px] bg-accent/15 text-accent border border-accent/30 px-3 py-1 rounded-full font-bold shadow-[0_0_12px_rgba(255,69,0,0.2)]">
                  Guest Mode
                </span>
                <Link
                  to="/login"
                  className="glass-button-accent text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-[#0c1018]/95 backdrop-blur-3xl border-t border-white/10 px-6 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-accent bg-accent/10 border border-accent/30'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user && !user.isGuest ? (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">{user.email}</span>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="text-xs text-red-400 font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block mt-3 glass-button-accent text-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
            >
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
