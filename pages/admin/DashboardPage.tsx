import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Link } from 'react-router-dom';
import type { Feedback } from '../../types';

const DashboardPage: React.FC = () => {
    const [counts, setCounts] = useState({ posts: 0, programs: 0, images: 0, members: 0, feedback: 0, documents: 0, faqs: 0, polls: 0 });
    const [latestFeedback, setLatestFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
            const { count: programsCount } = await supabase.from('programs').select('*', { count: 'exact', head: true });
            const { count: imagesCount } = await supabase.from('gallery_images').select('*', { count: 'exact', head: true });
            const { count: membersCount } = await supabase.from('members').select('*', { count: 'exact', head: true });
            const { count: documentsCount } = await supabase.from('documents').select('*', { count: 'exact', head: true });
            const { count: faqsCount } = await supabase.from('faqs').select('*', { count: 'exact', head: true });
            const { count: pollsCount } = await supabase.from('polls').select('*', { count: 'exact', head: true }).eq('is_active', true);
            const { count: feedbackCount, data: feedbackData } = await supabase.from('feedback').select('*', { count: 'exact' }).eq('is_read', false).order('created_at', { ascending: false }).limit(3);
            
            setCounts({
                posts: postsCount || 0,
                programs: programsCount || 0,
                images: imagesCount || 0,
                members: membersCount || 0,
                documents: documentsCount || 0,
                faqs: faqsCount || 0,
                polls: pollsCount || 0,
                feedback: feedbackCount || 0,
            });
            if (feedbackData) setLatestFeedback(feedbackData);

            setLoading(false);
        };
        fetchData();
    }, []);

    const StatCard: React.FC<{icon: string; label: string; value: number; color: string;}> = ({ icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color}`}>
                    <i className={`fas ${icon} fa-2x`}></i>
                </div>
                <div className="ml-4">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-800">{loading ? '...' : value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="fa-newspaper" label="Total Berita" value={counts.posts} color="bg-blue-100 text-blue-500" />
                <StatCard icon="fa-tasks" label="Total Program" value={counts.programs} color="bg-green-100 text-green-500" />
                <StatCard icon="fa-images" label="Total Galeri" value={counts.images} color="bg-purple-100 text-purple-500" />
                <StatCard icon="fa-users" label="Total Anggota" value={counts.members} color="bg-yellow-100 text-yellow-500" />
                <StatCard icon="fa-file-alt" label="Total Dokumen" value={counts.documents} color="bg-indigo-100 text-indigo-500" />
                <StatCard icon="fa-question-circle" label="Total FAQ" value={counts.faqs} color="bg-pink-100 text-pink-500" />
                <StatCard icon="fa-poll" label="Polling Aktif" value={counts.polls} color="bg-teal-100 text-teal-500" />
                <StatCard icon="fa-inbox" label="Feedback Baru" value={counts.feedback} color="bg-red-100 text-red-500" />
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Selamat Datang di Panel Admin</h2>
                    <p className="mt-2 text-gray-600">Gunakan menu di samping untuk mengelola konten website OSIS SMK LPPMRI 2 Kedungreja. Anda dapat menambah, mengubah, dan menghapus berita, program kerja, dan foto galeri.</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">Feedback Terbaru</h2>
                    {loading ? <p className="text-gray-600 mt-2">Memuat...</p> : latestFeedback.length > 0 ? (
                        <ul className="mt-2 space-y-3">
                            {latestFeedback.map(fb => (
                                <li key={fb.id} className="border-b pb-2 last:border-b-0">
                                    <p className="font-semibold">{fb.name}</p>
                                    <p className="text-gray-600 text-sm truncate">{fb.message}</p>
                                </li>
                            ))}
                             <Link to="/admin/feedback" className="text-blue-500 hover:underline mt-4 inline-block">Lihat semua feedback</Link>
                        </ul>
                    ) : (
                        <p className="mt-2 text-gray-600">Tidak ada feedback baru.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;