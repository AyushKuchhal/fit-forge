import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

export default function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#07090e] text-gray-100 overflow-x-hidden">
      {/* Fluid Liquid Ambient Background Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Liquid Magma Orb (Top-Right) */}
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] bg-gradient-to-br from-[#ff5722]/25 via-[#ff4500]/20 to-amber-500/15 blur-[110px] animate-fluid-1" />

        {/* Liquid Cyan/Azure Refraction Orb (Mid-Left) */}
        <div className="absolute top-1/4 -left-40 w-[38rem] h-[38rem] bg-gradient-to-tr from-cyan-500/15 via-blue-600/15 to-indigo-600/10 blur-[130px] animate-fluid-2" />

        {/* Liquid Amber/Violet Orb (Bottom-Center) */}
        <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-gradient-to-r from-orange-600/20 via-pink-600/15 to-purple-600/15 blur-[120px] animate-fluid-3" />

        {/* Fluid Caustic Shimmer Light */}
        <div className="absolute top-2/3 right-10 w-96 h-96 bg-accent/10 blur-[90px] animate-fluid-1" style={{ animationDelay: '-6s' }} />

        {/* Liquid Grid & Caustic Mesh Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />
      </div>

      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
