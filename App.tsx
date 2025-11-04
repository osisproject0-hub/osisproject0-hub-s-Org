import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';

import { supabase } from './services/supabase';
import { SiteSettingsProvider } from './hooks/useSiteSettings';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProgramsPage from './pages/public/ProgramsPage';
import BlogPage from './pages/public/BlogPage';
import BlogPostPage from './pages/public/BlogPostPage';
import GalleryPage from './pages/public/GalleryPage';
import AgendaPage from './pages/public/AgendaPage';
import ContactPage from './pages/public/ContactPage';
import DocumentsPage from './pages/public/DocumentsPage';
import FaqPage from './pages/public/FaqPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import PollsPage from './pages/public/PollsPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ManageBlogPage from './pages/admin/ManageBlogPage';
import ManageProgramsPage from './pages/admin/ManageProgramsPage';
import ManageGalleryPage from './pages/admin/ManageGalleryPage';
import ManageAgendaPage from './pages/admin/ManageAgendaPage';
import ManageMembersPage from './pages/admin/ManageMembersPage';
import ManageDivisionsPage from './pages/admin/ManageDivisionsPage';
import FeedbackPage from './pages/admin/FeedbackPage';
import ManageDocumentsPage from './pages/admin/ManageDocumentsPage';
import ManageFaqsPage from './pages/admin/ManageFaqsPage';
import ManagePollsPage from './pages/admin/ManagePollsPage';
import ManageSettingsPage from './pages/admin/ManageSettingsPage';
import ManageTestimonialsPage from './pages/admin/ManageTestimonialsPage';

// --- Notification System ---
type NotificationType = 'success' | 'error' | 'info';
interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}
interface NotificationContextType {
  addNotification: (message: string, type?: NotificationType) => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem: React.FC<{ notification: Notification; onDismiss: (id: number) => void }> = ({ notification, onDismiss }) => {
    const { message, type } = notification;

    const baseClasses = "flex items-center justify-between w-full max-w-sm p-4 text-gray-500 bg-white rounded-lg shadow-lg animate-fade-in-up";
    const typeClasses = {
        success: "text-green-500 bg-green-100",
        error: "text-red-500 bg-red-100",
        info: "text-blue-500 bg-blue-100"
    };
    const iconClasses = {
        success: "fas fa-check-circle",
        error: "fas fa-exclamation-circle",
        info: "fas fa-info-circle"
    };

    return (
        <div className={baseClasses}>
            <div className="flex items-center">
                <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${typeClasses[type]} rounded-lg`}>
                    <i className={iconClasses[type]}></i>
                </div>
                <div className="ml-3 text-sm font-normal">{message}</div>
            </div>
            <button
                onClick={() => onDismiss(notification.id)}
                className="ml-4 -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};


const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  let idCounter = 0;

  const addNotification = useCallback((message: string, type: NotificationType = 'info') => {
    idCounter += 1;
    const newNotification = { id: idCounter, message, type };
    setNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setNotifications(nots => nots.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-3">
        {notifications.map(not => (
          <NotificationItem key={not.id} notification={not} onDismiss={removeNotification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};


function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Memuat Aplikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <SiteSettingsProvider>
      <NotificationProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:id" element={<BlogPostPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="polls" element={<PollsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="search" element={<SearchResultsPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute session={session}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="blog" element={<ManageBlogPage />} />
              <Route path="programs" element={<ManageProgramsPage />} />
              <Route path="agenda" element={<ManageAgendaPage />} />
              <Route path="gallery" element={<ManageGalleryPage />} />
              <Route path="members" element={<ManageMembersPage />} />
              <Route path="divisions" element={<ManageDivisionsPage />} />
              <Route path="documents" element={<ManageDocumentsPage />} />
              <Route path="faqs" element={<ManageFaqsPage />} />
              <Route path="polls" element={<ManagePollsPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="testimonials" element={<ManageTestimonialsPage />} />
              <Route path="settings" element={<ManageSettingsPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </NotificationProvider>
    </SiteSettingsProvider>
  );
}

export default App;