import React from 'react';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-950 border-t border-gray-800/80 py-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center gap-6">
        <Link to="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-xl">
          <Dumbbell className="w-6 h-6 text-accent" />
          <span>Fit<span className="text-accent">Forge</span></span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Link to="/plans" className="hover:text-accent transition-colors">Workout Plans</Link>
          <Link to="/generator" className="hover:text-accent transition-colors">Plan Generator</Link>
          <Link to="/nutrition" className="hover:text-accent transition-colors">Nutrition</Link>
          <Link to="/chat" className="hover:text-accent transition-colors">AI Coach</Link>
          <Link to="/progress" className="hover:text-accent transition-colors">Progress Tracker</Link>
        </div>

        <p className="text-gray-500 text-xs text-center max-w-md">
          © {new Date().getFullYear()} FitForge. All rights reserved. For educational and informational purposes only. Not medical advice.
        </p>
      </div>
    </footer>
  );
}
