import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Program } from '../../types';
import Spinner from '../../components/Spinner';

const ProgramForm: React.FC<{
    program: Partial<Program> | null;
    onSave: (program: Partial<Program>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ program, onSave, onCancel, loading }) => {
    const [title, setTitle] = useState(program?.title || '');
    const [description, setDescription] = useState(program?.description || '');
    const [date, setDate] = useState(program?.date || '');
    const [imageUrl, setImageUrl] = useState(program?.image_url || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: program?.id, title, description, date, image_url: imageUrl });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{program?.id ? 'Edit Program' : 'Create Program'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded h-32" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Image URL</label>
                        <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded" placeholder="https://example.com/image.png" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? <Spinner /> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManageProgramsPage: React.FC = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPrograms = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('programs').select('*').order('date', { ascending: false });
        if (data) setPrograms(data);
        if (error) console.error("Error fetching programs:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const handleSave = async (program: Partial<Program>) => {
        setFormLoading(true);
        
        const programData = {
            title: program.title,
            description: program.description,
            date: program.date,
            image_url: program.image_url || null
        };

        if (program.id) {
            const { error } = await supabase.from('programs').update(programData).eq('id', program.id);
            if (error) alert('Error updating program: ' + error.message);
        } else {
            const { error } = await supabase.from('programs').insert(programData);
            if (error) alert('Error creating program: ' + error.message);
        }
        
        setFormLoading(false);
        setShowForm(false);
        setEditingProgram(null);
        fetchPrograms();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            const { error } = await supabase.from('programs').delete().eq('id', id);
            if (error) alert('Error deleting program: ' + error.message);
            else fetchPrograms();
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Program Kerja</h1>
                <button onClick={() => { setEditingProgram(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Create New Program
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {programs.map(program => (
                                <tr key={program.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{program.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(program.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingProgram(program); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(program.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <ProgramForm program={editingProgram} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
        </div>
    );
};

export default ManageProgramsPage;