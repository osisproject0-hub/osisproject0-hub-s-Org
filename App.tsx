import React, { useState, useEffect } from 'react';
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
import FeedbackPage from './pages/admin/FeedbackPage';
import ManageDocumentsPage from './pages/admin/ManageDocumentsPage';
import ManageFaqsPage from './pages/admin/ManageFaqsPage';
import ManagePollsPage from './pages/admin/ManagePollsPage';
import ManageSettingsPage from './pages/admin/ManageSettingsPage';
import ManageTestimonialsPage from './pages/admin/ManageTestimonialsPage';


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
            <Route path="documents" element={<ManageDocumentsPage />} />
            <Route path="faqs" element={<ManageFaqsPage />} />
            <Route path="polls" element={<ManagePollsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="testimonials" element={<ManageTestimonialsPage />} />
            <Route path="settings" element={<ManageSettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </SiteSettingsProvider>
  );
}

export default App;