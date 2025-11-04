import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Member } from '../../types';
import Spinner from '../../components/Spinner';

// Member Form Component
const MemberForm: React.FC<{
    member: Partial<Member> | null;
    onSave: (member: Partial<Member>, file: File | null) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ member, onSave, onCancel, loading }) => {
    const [name, setName] = useState(member?.name || '');
    const [position, setPosition] = useState(member?.position || '');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: member?.id, name, position, photo_url: member?.photo_url }, imageFile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{member?.id ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nama Lengkap</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Jabatan</label>
                        <input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Foto</label>
                        <input type="file" onChange={e => e.target.files && setImageFile(e.target.files[0])} className="w-full p-2 border rounded" accept="image/*" />
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


const ManageMembersPage: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: true });
        if (data) setMembers(data);
        if (error) console.error("Error fetching members:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSave = async (member: Partial<Member>, file: File | null) => {
        setFormLoading(true);
        let imageUrl = member.photo_url || null;

        if (file) {
            const fileName = `member_${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('member-photos').upload(fileName, file);
            if (uploadError) {
                alert('Error uploading image: ' + uploadError.message);
                setFormLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('member-photos').getPublicUrl(uploadData.path);
            imageUrl = publicUrl;
        }

        const memberData = { ...member, photo_url: imageUrl };

        if (member.id) {
            const { error } = await supabase.from('members').update(memberData).eq('id', member.id);
            if (error) alert('Error updating member: ' + error.message);
        } else {
            const { error } = await supabase.from('members').insert(memberData);
            if (error) alert('Error creating member: ' + error.message);
        }
        
        setFormLoading(false);
        setShowForm(false);
        setEditingMember(null);
        fetchMembers();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Anda yakin ingin menghapus anggota ini?')) {
            const { error } = await supabase.from('members').delete().eq('id', id);
            if (error) alert('Error deleting member: ' + error.message);
            else fetchMembers();
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Anggota</h1>
                <button onClick={() => { setEditingMember(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Tambah Anggota Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        <img src={member.photo_url || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                                        {member.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingMember(member); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <MemberForm member={editingMember} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
        </div>
    );
};

export default ManageMembersPage;
