import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Poll, PollOption } from '../../types';
import Spinner from '../../components/Spinner';

// Poll Form Component
const PollForm: React.FC<{
    poll: Partial<Poll> | null;
    onSave: (question: string, options: string[]) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ onSave, onCancel, loading }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length < 2) {
            alert('Polling harus memiliki setidaknya 2 opsi jawaban.');
            return;
        }
        onSave(question, validOptions);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Buat Polling Baru</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Pertanyaan Polling</label>
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">Opsi Jawaban</label>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={e => handleOptionChange(index, e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder={`Opsi ${index + 1}`}
                                    required
                                />
                                <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="px-3 py-2 bg-red-500 text-white rounded disabled:bg-red-300">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="mt-2 px-4 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300">
                            Tambah Opsi
                        </button>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? <Spinner /> : 'Simpan Polling'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManagePollsPage: React.FC = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPolls = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('polls').select('*, poll_options(*)').order('created_at', { ascending: false });
        if (data) setPolls(data as Poll[]);
        if (error) console.error("Error fetching polls:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    const handleSave = async (question: string, options: string[]) => {
        setFormLoading(true);

        // Insert the poll question first
        const { data: pollData, error: pollError } = await supabase.from('polls').insert({ question }).select().single();

        if (pollError || !pollData) {
            alert('Error creating poll: ' + pollError?.message);
            setFormLoading(false);
            return;
        }

        // Prepare options with the new poll_id
        const optionsToInsert = options.map(opt => ({ poll_id: pollData.id, option_text: opt }));

        // Insert all options
        const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);

        if (optionsError) {
            alert('Error creating poll options: ' + optionsError.message);
        }
        
        setFormLoading(false);
        setShowForm(false);
        fetchPolls();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Anda yakin ingin menghapus polling ini? Semua data suara akan hilang.')) {
            const { error } = await supabase.from('polls').delete().eq('id', id); // Deletion cascades to options
            if (error) alert('Error deleting poll: ' + error.message);
            else fetchPolls();
        }
    };
    
    const toggleActive = async (poll: Poll) => {
        const { error } = await supabase.from('polls').update({ is_active: !poll.is_active }).eq('id', poll.id);
        if (error) alert('Error updating status: ' + error.message);
        else fetchPolls();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Polling</h1>
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Buat Polling Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertanyaan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Suara</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {polls.map(poll => {
                                const totalVotes = poll.poll_options.reduce((sum, opt) => sum + opt.votes, 0);
                                return (
                                <tr key={poll.id}>
                                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">{poll.question}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalVotes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${poll.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {poll.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => toggleActive(poll)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            {poll.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button onClick={() => handleDelete(poll.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <PollForm onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
        </div>
    );
};

export default ManagePollsPage;