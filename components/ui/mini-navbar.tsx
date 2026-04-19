"use client";

import React, { useState, useEffect, useRef } from 'react';

const AnimatedNavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => {
  const defaultTextColor = 'text-gray-400';
  const hoverTextColor = 'text-white';
  const textSizeClass = 'text-[10px]';

  return (
    <a 
      href={href} 
      onClick={(e) => { e.preventDefault(); if(onClick) onClick(); }}
      className={`group relative inline-block overflow-hidden h-5 flex items-center ${textSizeClass} font-black uppercase tracking-widest cursor-pointer`}
    >
      <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
        <span className={defaultTextColor}>{children}</span>
        <span className={hoverTextColor}>{children}</span>
      </div>
    </a>
  );
};

export function Navbar({ onTabChange, activeTab }: { onTabChange: (id: string) => void, activeTab: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <div className="relative w-5 h-5 flex items-center justify-center">
      <div className="size-5 bg-blue-600 rounded flex items-center justify-center font-black text-[10px] italic text-white">CS</div>
    </div>
  );

  const navLinksData = [
    { label: 'Overview', id: 'home' },
    { label: 'Live Map', id: 'map' },
    { label: 'Alerts', id: 'alerts' },
    { label: 'Detector', id: 'detector' },
    { label: 'Vibe', id: 'vibe' },
    { label: 'Insights', id: 'insights' }
  ];

  const loginButtonElement = (
    <button className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-400 rounded-full hover:border-white/50 hover:text-white transition-colors duration-200 w-full sm:w-auto">
      System
    </button>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
       <div className="absolute inset-0 -m-1 rounded-full
                     hidden sm:block
                     bg-blue-500
                     opacity-20 filter blur-lg pointer-events-none
                     transition-all duration-300 ease-out
                     group-hover:opacity-40 group-hover:blur-xl group-hover:-m-2"></div>
       <button className="relative z-10 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-br from-blue-600 to-blue-800 rounded-full hover:from-blue-500 hover:to-blue-700 transition-all duration-200 w-full sm:w-auto">
         Secure
       </button>
    </div>
  );

  return (
    <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[200]
                       flex flex-col items-center
                       pl-6 pr-6 py-3 backdrop-blur-md
                       ${headerShapeClass}
                       border border-[#222] bg-[#0A0A0B]/80
                       w-[calc(100%-2rem)] sm:w-auto
                       transition-[border-radius] duration-300 ease-in-out`}>

      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-10">
        <div className="flex items-center">
           {logoElement}
        </div>

        <nav className="hidden sm:flex items-center space-x-6">
          {navLinksData.map((link) => (
            <AnimatedNavLink 
                key={link.id} 
                href={`#${link.id}`} 
                onClick={() => { onTabChange(link.id); if(isOpen) setIsOpen(false); }}
            >
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none" onClick={toggleMenu} aria-label={isOpen ? 'Close Menu' : 'Open Menu'}>
          {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      <div className={`sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                       ${isOpen ? 'max-h-[1000px] opacity-100 pt-6' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
        <nav className="flex flex-col items-center space-y-5 text-sm w-full">
          {navLinksData.map((link) => (
            <button 
                key={link.id} 
                onClick={() => { onTabChange(link.id); setIsOpen(false); }}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors w-full text-center ${activeTab === link.id ? 'text-blue-500' : 'text-gray-400 hover:text-white'}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-6 w-full">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
