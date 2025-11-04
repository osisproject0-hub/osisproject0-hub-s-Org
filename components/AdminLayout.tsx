import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Sidebar from './Sidebar';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden">
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;