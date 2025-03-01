import React from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fecha o sidebar quando a tela for redimensionada para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-acai-cream relative font-quicksand">
      {/* Botão do menu hamburguer - Visível apenas em telas menores */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-acai-primary text-white hover:bg-acai-secondary transition-colors duration-200"
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay do menu mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden z-30 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar com comportamento responsivo */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 transform lg:transform-none w-[280px] 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out z-40 lg:block ${!sidebarOpen && 'lg:static'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 pt-16 lg:pt-8 lg:p-8">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-2xl sm:text-3xl title-primary mb-4 sm:mb-8">
            {title}
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}