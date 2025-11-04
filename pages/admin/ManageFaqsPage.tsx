import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Faq } from '../../types';
import Spinner from '../../components/Spinner';

const FaqForm: React.FC<{
    faq: Partial<Faq> | null;
    onSave: (faq: Partial<Faq>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ faq, onSave, onCancel, loading }) => {
    const [question, setQuestion] = useState(faq?.question || '');
    const [answer, setAnswer] = useState(faq?.answer || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: faq?.id, question, answer });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{faq?.id ? 'Edit FAQ' : 'Buat FAQ Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Pertanyaan</label>
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Jawaban</label>
                        <textarea value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-2 border rounded h-32" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? <Spinner /> : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageFaqsPage: React.FC = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Partial<Faq> | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('faqs').select('*').order('created_at', { ascending: false });
        if (data) setFaqs(data);
        if (error) console.error("Error fetching FAQs:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const handleSave = async (faq: Partial<Faq>) => {
        setFormLoading(true);
        if (faq.id) {
            const { error } = await supabase.from('faqs').update({ question: faq.question, answer: faq.answer }).eq('id', faq.id);
            if (error) alert('Error updating FAQ: ' + error.message);
        } else {
            const { error } = await supabase.from('faqs').insert({ question: faq.question, answer: faq.answer });
            if (error) alert('Error creating FAQ: ' + error.message);
        }
        setFormLoading(false);
        setShowForm(false);
        setEditingFaq(null);
        fetchFaqs();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Anda yakin ingin menghapus FAQ ini?')) {
            const { error } = await supabase.from('faqs').delete().eq('id', id);
            if (error) alert('Error deleting FAQ: ' + error.message);
            else fetchFaqs();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage FAQ</h1>
                <button onClick={() => { setEditingFaq(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Buat FAQ Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertanyaan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {faqs.map(faq => (
                                <tr key={faq.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{faq.question}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingFaq(faq); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <FaqForm faq={editingFaq} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading} />}
        </div>
    );
};

export default ManageFaqsPage;