import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
       if (isOpen) setIsOpen(false);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-blue-500 hover:text-white'
    }`;
  
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-blue-500 hover:text-white'
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
               <div className="flex items-center space-x-2">
                 <img className="h-10 w-10" src="https://i.imgur.com/g826EZG.png" alt="OSIS Logo" />
                 <span className="font-bold text-xl text-blue-600 hidden sm:inline">OSIS SMK LPPMRI 2</span>
               </div>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              <NavLink to="/" className={navLinkClass}>Home</NavLink>
              <NavLink to="/about" className={navLinkClass}>Tentang</NavLink>
              <NavLink to="/programs" className={navLinkClass}>Program</NavLink>
              <NavLink to="/blog" className={navLinkClass}>Berita</NavLink>
              <NavLink to="/gallery" className={navLinkClass}>Galeri</NavLink>
              <NavLink to="/polls" className={navLinkClass}>Polling</NavLink>
              <NavLink to="/documents" className={navLinkClass}>Dokumen</NavLink>
              <NavLink to="/faq" className={navLinkClass}>FAQ</NavLink>
              <NavLink to="/contact" className={navLinkClass}>Kontak</NavLink>
            </div>
          </div>
           <div className="hidden md:block">
             <form onSubmit={handleSearchSubmit} className="relative">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berita..."
                    className="w-full pl-4 pr-10 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-blue-500">
                    <i className="fas fa-search"></i>
                </button>
            </form>
           </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-200 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-200 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <i className="fas fa-times h-6 w-6"></i>
              ) : (
                <i className="fas fa-bars h-6 w-6"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="p-2">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari..."
                        className="w-full pl-4 pr-10 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-blue-500">
                        <i className="fas fa-search"></i>
                    </button>
                </form>
            </div>
            <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Tentang</NavLink>
            <NavLink to="/programs" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Program</NavLink>
            <NavLink to="/blog" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Berita</NavLink>
            <NavLink to="/gallery" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Galeri</NavLink>
            <NavLink to="/polls" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Polling</NavLink>
            <NavLink to="/documents" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Dokumen</NavLink>
            <NavLink to="/faq" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>FAQ</NavLink>
            <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setIsOpen(false)}>Kontak</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;