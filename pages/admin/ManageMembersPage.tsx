import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Member, Division } from '../../types';
import Spinner from '../../components/Spinner';

// Member of the Month Modal Component
const MotmModal: React.FC<{
    member: Member;
    onSave: (memberId: string, bio: string) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ member, onSave, onCancel, loading }) => {
    const [bio, setBio] = useState(member.motm_bio || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(member.id, bio);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Jadikan Anggota Teladan</h2>
                <p className="mb-6">Anda akan menetapkan <span className="font-bold">{member.name}</span> sebagai Anggota Teladan Bulan Ini. Tuliskan kutipan atau alasan singkat.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Kutipan/Bio Singkat</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-2 border rounded h-24" required placeholder="Contoh: Selalu bersemangat dan menjadi inspirasi bagi anggota lain." />
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


// Member Form Component
const MemberForm: React.FC<{
    member: Partial<Member> | null;
    onSave: (member: Partial<Member>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ member, onSave, onCancel, loading }) => {
    const [name, setName] = useState(member?.name || '');
    const [position, setPosition] = useState(member?.position || '');
    const [photoUrl, setPhotoUrl] = useState(member?.photo_url || '');
    const [divisionId, setDivisionId] = useState<string | null>(member?.division_id || null);
    const [divisions, setDivisions] = useState<Division[]>([]);

    useEffect(() => {
        const fetchDivisions = async () => {
            const { data } = await supabase.from('divisions').select('*').order('name');
            if(data) setDivisions(data);
        };
        fetchDivisions();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: member?.id, name, position, photo_url: photoUrl, division_id: divisionId });
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
                        <label className="block text-gray-700">Divisi</label>
                        <select value={divisionId || ''} onChange={(e) => setDivisionId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>Pilih Divisi</option>
                            {divisions.map(div => (
                                <option key={div.id} value={div.id}>{div.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Jabatan di Divisi</label>
                        <input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full p-2 border rounded" required placeholder="Contoh: Ketua, Anggota"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Photo URL</label>
                        <input type="text" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full p-2 border rounded" placeholder="https://example.com/photo.png"/>
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
    const [showMotmForm, setShowMotmForm] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('members')
            .select('*, divisions(name)')
            .order('created_at', { ascending: true });
        if (data) setMembers(data as Member[]);
        if (error) console.error("Error fetching members:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleSave = async (member: Partial<Member>) => {
        setFormLoading(true);

        const memberData = { 
            name: member.name,
            position: member.position,
            photo_url: member.photo_url || null,
            division_id: member.division_id
        };

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

    const handleSetMotm = async (memberId: string, bio: string) => {
        setFormLoading(true);

        await supabase
            .from('members')
            .update({ is_member_of_the_month: false, motm_bio: null })
            .eq('is_member_of_the_month', true);

        const { error } = await supabase
            .from('members')
            .update({ is_member_of_the_month: true, motm_bio: bio })
            .eq('id', memberId);

        if (error) {
            alert('Gagal mengatur Anggota Teladan: ' + error.message);
        }

        setFormLoading(false);
        setShowMotmForm(false);
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.divisions?.name || 'Belum Diatur'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.position}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => { setEditingMember(member); setShowMotmForm(true); }} 
                                            className={`hover:text-yellow-500 mr-4 ${member.is_member_of_the_month ? 'text-yellow-400' : 'text-gray-300'}`}
                                            title="Jadikan Anggota Teladan"
                                        >
                                            <i className="fas fa-star"></i>
                                        </button>
                                        <button onClick={() => { setEditingMember(member); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <MemberForm member={editingMember} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingMember(null); }} loading={formLoading}/>}
            {showMotmForm && editingMember && <MotmModal member={editingMember} onSave={handleSetMotm} onCancel={() => { setShowMotmForm(false); setEditingMember(null); }} loading={formLoading}/>}
        </div>
    );
};

export default ManageMembersPage;