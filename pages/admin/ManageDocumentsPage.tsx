import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Document } from '../../types';
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

const ManageDocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<{ id: string, fileUrl: string } | null>(null);
    const { addNotification } = useNotification();

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (data) setDocuments(data);
        if (error) addNotification(`Error fetching documents: ${error.message}`, 'error');
        setLoading(false);
    }, [addNotification]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addNotification('Silakan pilih file untuk diunggah.', 'error');
            return;
        }
        setUploading(true);

        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);

        if (uploadError) {
            addNotification(`Gagal mengunggah file: ${uploadError.message}`, 'error');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(uploadData.path);
        
        const { error: insertError } = await supabase.from('documents').insert({
            title,
            description,
            file_url: publicUrl,
        });

        if (insertError) {
            addNotification(`Gagal menyimpan data dokumen: ${insertError.message}`, 'error');
        } else {
            addNotification('Dokumen berhasil diunggah!', 'success');
            setTitle('');
            setDescription('');
            setFile(null);
            (document.getElementById('docFile') as HTMLInputElement).value = '';
            fetchDocuments();
        }
        setUploading(false);
    };

    const handleDeleteClick = (id: string, fileUrl: string) => {
        setDocToDelete({ id, fileUrl });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!docToDelete) return;

        const fileName = docToDelete.fileUrl.split('/').pop();
        if (fileName) {
            const { error: storageError } = await supabase.storage.from('documents').remove([fileName]);
            if (storageError) {
                 addNotification(`Gagal menghapus file dari storage: ${storageError.message}`, 'error');
            }
        }
        
        const { error: dbError } = await supabase.from('documents').delete().eq('id', docToDelete.id);
        if (dbError) addNotification(`Gagal menghapus dokumen: ${dbError.message}`, 'error');
        else {
            addNotification('Dokumen berhasil dihapus!', 'success');
            fetchDocuments();
        }
        setIsModalOpen(false);
        setDocToDelete(null);
    };

    return (
        <div>
             <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus"
                message="Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat diurungkan."
            />
            <h1 className="text-3xl font-bold mb-6">Manage Dokumen</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Unggah Dokumen Baru</h2>
                <form onSubmit={handleUpload}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Judul Dokumen</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-700">Deskripsi (Opsional)</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Pilih File</label>
                        <input id="docFile" type="file" onChange={e => e.target.files && setFile(e.target.files[0])} className="w-full p-2 border rounded" required />
                    </div>
                    <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                        {uploading ? <Spinner /> : 'Unggah'}
                    </button>
                </form>
            </div>

            {loading ? <Spinner /> : (
                 <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Unggah</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-900 mr-4">Lihat</a>
                                        <button onClick={() => handleDeleteClick(doc.id, doc.file_url)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageDocumentsPage;