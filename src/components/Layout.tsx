import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, BookOpen, User, LogOut, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Nusantara Kuno</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-amber-800 text-amber-100' 
                    : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </Link>
              <Link
                to="/recipes"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/recipes') 
                    ? 'bg-amber-800 text-amber-100' 
                    : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Resep</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile') 
                    ? 'bg-amber-800 text-amber-100' 
                    : 'text-amber-200 hover:bg-amber-800 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profil</span>
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-amber-200">
                Halo, {user?.email?.split('@')[0] || 'Pengguna'}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-amber-200 hover:bg-amber-800 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-amber-800">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-amber-800 text-amber-100' 
                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Beranda</span>
            </Link>
            <Link
              to="/recipes"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/recipes') 
                  ? 'bg-amber-800 text-amber-100' 
                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Resep</span>
            </Link>
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive('/profile') 
                  ? 'bg-amber-800 text-amber-100' 
                  : 'text-amber-200 hover:bg-amber-800 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profil</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">
              &copy; 2024 Nusantara Kuno. Melestarikan warisan kuliner Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;