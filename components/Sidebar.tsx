import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 mt-4 text-gray-100 rounded-md hover:bg-gray-700 transition-colors duration-200 ${
      isActive ? 'bg-gray-700' : ''
    }`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsOpen(false);
    }
  }

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black opacity-50 transition-opacity lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-gray-800 lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'}`}>
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center">
            <span className="text-white text-2xl font-semibold">OSIS Admin</span>
          </div>
        </div>
        <nav className="mt-10 px-2">
          <NavLink to="/admin/dashboard" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-tachometer-alt w-6 h-6 mr-3"></i>
            Dashboard
          </NavLink>
          <NavLink to="/admin/blog" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-newspaper w-6 h-6 mr-3"></i>
            Manage Berita
          </NavLink>
          <NavLink to="/admin/programs" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-tasks w-6 h-6 mr-3"></i>
            Manage Program
          </NavLink>
          <NavLink to="/admin/agenda" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-calendar-alt w-6 h-6 mr-3"></i>
            Manage Agenda
          </NavLink>
          <NavLink to="/admin/gallery" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-images w-6 h-6 mr-3"></i>
            Manage Galeri
          </NavLink>
          <NavLink to="/admin/members" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-users w-6 h-6 mr-3"></i>
            Manage Anggota
          </NavLink>
           <NavLink to="/admin/documents" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-file-alt w-6 h-6 mr-3"></i>
            Manage Dokumen
          </NavLink>
          <NavLink to="/admin/faqs" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-question-circle w-6 h-6 mr-3"></i>
            Manage FAQ
          </NavLink>
          <NavLink to="/admin/polls" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-poll w-6 h-6 mr-3"></i>
            Manage Polling
          </NavLink>
          <NavLink to="/admin/testimonials" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-comment-alt w-6 h-6 mr-3"></i>
            Manage Testimoni
          </NavLink>
          <NavLink to="/admin/feedback" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-inbox w-6 h-6 mr-3"></i>
            Feedback
          </NavLink>
          <NavLink to="/admin/settings" className={navLinkClass} onClick={handleLinkClick}>
            <i className="fas fa-cog w-6 h-6 mr-3"></i>
            Pengaturan Website
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;