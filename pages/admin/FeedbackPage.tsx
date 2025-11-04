import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Feedback } from '../../types';
import Spinner from '../../components/Spinner';

const FeedbackPage: React.FC = () => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

    const fetchFeedback = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
        if (data) setFeedback(data);
        if (error) console.error("Error fetching feedback:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const handleView = async (item: Feedback) => {
        setSelectedFeedback(item);
        if (!item.is_read) {
            const { error } = await supabase.from('feedback').update({ is_read: true }).eq('id', item.id);
            if (error) {
                console.error("Error updating feedback status:", error);
            } else {
                fetchFeedback(); // Refresh list to update read status
            }
        }
    };

    const handleDelete = async (id: number) => {
         if (window.confirm('Anda yakin ingin menghapus pesan ini?')) {
            const { error } = await supabase.from('feedback').delete().eq('id', id);
            if (error) alert('Gagal menghapus pesan: ' + error.message);
            else fetchFeedback();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Kotak Masuk Feedback</h1>
            
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengirim</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjek Pesan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {feedback.map(item => (
                                <tr key={item.id} className={`${!item.is_read ? 'bg-blue-50 font-bold' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-sm">{item.message}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleView(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">Lihat</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={() => setSelectedFeedback(null)}>
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4">Detail Pesan</h2>
                        <div className="mb-4">
                            <p className="font-semibold">Dari: <span className="font-normal">{selectedFeedback.name}</span></p>
                            <p className="font-semibold">Email: <span className="font-normal">{selectedFeedback.email}</span></p>
                            <p className="font-semibold">Tanggal: <span className="font-normal">{new Date(selectedFeedback.created_at).toLocaleString('id-ID')}</span></p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>{selectedFeedback.message}</p>
                        </div>
                        <div className="text-right mt-6">
                            <button onClick={() => setSelectedFeedback(null)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;
