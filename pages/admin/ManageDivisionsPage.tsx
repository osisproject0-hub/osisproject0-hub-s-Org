import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Division } from '../../types';
import Spinner from '../../components/Spinner';
import { useNotification } from '../../App';

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Konfirmasi</button>
                </div>
            </div>
        </div>
    );
};

const DivisionForm: React.FC<{
    division: Partial<Division> | null;
    onSave: (division: Partial<Division>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ division, onSave, onCancel, loading }) => {
    const [name, setName] = useState(division?.name || '');
    const [description, setDescription] = useState(division?.description || '');
    const [displayOrder, setDisplayOrder] = useState(division?.display_order || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: division?.id, name, description, display_order: displayOrder });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{division?.id ? 'Edit Divisi' : 'Buat Divisi Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nama Divisi</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Deskripsi (Opsional)</label>
                        <textarea value={description || ''} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded h-24" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Urutan Tampil</label>
                        <input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value))} className="w-full p-2 border rounded" required />
                        <p className="text-xs text-gray-500 mt-1">Angka lebih kecil akan ditampilkan lebih dulu.</p>
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

const ManageDivisionsPage: React.FC = () => {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDivision, setEditingDivision] = useState<Partial<Division> | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [divisionToDelete, setDivisionToDelete] = useState<string | null>(null);
    const { addNotification } = useNotification();

    const fetchDivisions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('divisions').select('*').order('display_order', { ascending: true });
        if (data) setDivisions(data);
        if (error) addNotification(`Error fetching divisions: ${error.message}`, 'error');
        setLoading(false);
    }, [addNotification]);

    useEffect(() => {
        fetchDivisions();
    }, [fetchDivisions]);

    const handleSave = async (division: Partial<Division>) => {
        setFormLoading(true);
        
        const divisionData = { 
            name: division.name,
            description: division.description || null,
            display_order: division.display_order
        };

        if (division.id) {
            const { error } = await supabase.from('divisions').update(divisionData).eq('id', division.id);
            if (error) addNotification(`Error updating division: ${error.message}`, 'error');
            else addNotification('Divisi berhasil diperbarui!', 'success');
        } else {
            const { error } = await supabase.from('divisions').insert(divisionData);
            if (error) addNotification(`Error creating division: ${error.message}`, 'error');
            else addNotification('Divisi berhasil dibuat!', 'success');
        }
        
        setFormLoading(false);
        setShowForm(false);
        setEditingDivision(null);
        fetchDivisions();
    };

    const handleDeleteClick = async (id: string) => {
        const { count } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('division_id', id);
        
        if (count !== null && count > 0) {
            addNotification(`Tidak dapat menghapus divisi ini karena masih ada ${count} anggota di dalamnya.`, 'error');
            return;
        }

        setDivisionToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!divisionToDelete) return;
        const { error } = await supabase.from('divisions').delete().eq('id', divisionToDelete);
        if (error) addNotification(`Error deleting division: ${error.message}`, 'error');
        else {
            addNotification('Divisi berhasil dihapus!', 'success');
            fetchDivisions();
        }
        setIsModalOpen(false);
        setDivisionToDelete(null);
    };

    return (
        <div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus"
                message="Apakah Anda yakin ingin menghapus divisi ini secara permanen?"
            />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Divisi</h1>
                <button onClick={() => { setEditingDivision(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    <i className="fas fa-plus mr-2"></i>Buat Divisi Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {divisions.map(division => (
                                <tr key={division.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{division.display_order}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{division.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-md">{division.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingDivision(division); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDeleteClick(division.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <DivisionForm division={editingDivision} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
        </div>
    );
};

export default ManageDivisionsPage;