import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function Layout() {
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar - Mobile */}
      <Sidebar
        isMobile={true}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSignOut={signOut}
      />

      {/* Sidebar - Desktop */}
      <Sidebar
        isMobile={false}
        isOpen={true}
        onClose={() => {}}
        onSignOut={signOut}
      />

      {/* Main Content */}
      <div className="md:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}