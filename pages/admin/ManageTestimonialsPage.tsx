import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Testimonial } from '../../types';
import Spinner from '../../components/Spinner';

const TestimonialForm: React.FC<{
    testimonial: Partial<Testimonial> | null;
    onSave: (testimonial: Partial<Testimonial>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ testimonial, onSave, onCancel, loading }) => {
    const [quote, setQuote] = useState(testimonial?.quote || '');
    const [author, setAuthor] = useState(testimonial?.author || '');
    const [role, setRole] = useState(testimonial?.role || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: testimonial?.id, quote, author, role });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{testimonial?.id ? 'Edit Testimoni' : 'Buat Testimoni Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Kutipan</label>
                        <textarea value={quote} onChange={e => setQuote(e.target.value)} className="w-full p-2 border rounded h-32" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                           <label className="block text-gray-700">Author</label>
                           <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                         <div>
                           <label className="block text-gray-700">Jabatan/Peran</label>
                           <input type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded" placeholder="Contoh: Siswa Kelas XI" />
                        </div>
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

const ManageTestimonialsPage: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial> | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchTestimonials = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
        if (data) setTestimonials(data);
        if (error) console.error("Error fetching testimonials:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleSave = async (testimonial: Partial<Testimonial>) => {
        setFormLoading(true);
        const dataToSave = {
            quote: testimonial.quote,
            author: testimonial.author,
            role: testimonial.role,
        };
        if (testimonial.id) {
            const { error } = await supabase.from('testimonials').update(dataToSave).eq('id', testimonial.id);
            if (error) alert('Error updating testimonial: ' + error.message);
        } else {
            const { error } = await supabase.from('testimonials').insert(dataToSave);
            if (error) alert('Error creating testimonial: ' + error.message);
        }
        setFormLoading(false);
        setShowForm(false);
        setEditingTestimonial(null);
        fetchTestimonials();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Anda yakin ingin menghapus testimoni ini?')) {
            const { error } = await supabase.from('testimonials').delete().eq('id', id);
            if (error) alert('Error deleting testimonial: ' + error.message);
            else fetchTestimonials();
        }
    };

    const toggleActive = async (testimonial: Testimonial) => {
        const { error } = await supabase.from('testimonials').update({ is_active: !testimonial.is_active }).eq('id', testimonial.id);
        if (error) alert('Error updating status: ' + error.message);
        else fetchTestimonials();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Testimoni</h1>
                <button onClick={() => { setEditingTestimonial(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Buat Testimoni Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kutipan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {testimonials.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 max-w-md truncate">{item.quote}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => toggleActive(item)} className="text-gray-600 hover:text-gray-900 mr-4">
                                            {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button onClick={() => { setEditingTestimonial(item); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <TestimonialForm testimonial={editingTestimonial} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading} />}
        </div>
    );
};

export default ManageTestimonialsPage;
