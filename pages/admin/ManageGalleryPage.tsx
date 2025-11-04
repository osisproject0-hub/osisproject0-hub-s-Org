import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { GalleryImage } from '../../types';
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

const ManageGalleryPage: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<{ id: string, imageUrl: string } | null>(null);
    const { addNotification } = useNotification();

    const fetchImages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
        if (data) setImages(data);
        if (error) addNotification(`Error fetching images: ${error.message}`, 'error');
        setLoading(false);
    }, [addNotification]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addNotification('Silakan pilih file untuk diunggah.', 'error');
            return;
        }
        setUploading(true);

        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('gallery_images').upload(fileName, file);

        if (uploadError) {
            addNotification(`Gagal mengunggah file: ${uploadError.message}`, 'error');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('gallery_images').getPublicUrl(uploadData.path);
        
        const { error: insertError } = await supabase.from('gallery_images').insert({
            image_url: publicUrl,
            caption: caption || null,
            category: category || null
        });

        if (insertError) {
            addNotification(`Gagal menyimpan data gambar: ${insertError.message}`, 'error');
        } else {
            addNotification('Gambar berhasil diunggah!', 'success');
            setFile(null);
            setCaption('');
            setCategory('');
            if (document.getElementById('galleryFile')) {
                (document.getElementById('galleryFile') as HTMLInputElement).value = '';
            }
            fetchImages();
        }
        setUploading(false);
    };

    const handleDeleteClick = (id: string, imageUrl: string) => {
        setImageToDelete({ id, imageUrl });
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        const fileName = imageToDelete.imageUrl.split('/').pop();
        if (fileName) {
            await supabase.storage.from('gallery_images').remove([fileName]);
        }

        const { error } = await supabase.from('gallery_images').delete().eq('id', imageToDelete.id);
        if (error) addNotification(`Error deleting image: ${error.message}`, 'error');
        else {
            addNotification('Image deleted successfully!', 'success');
            fetchImages();
        }

        setIsModalOpen(false);
        setImageToDelete(null);
    };

    return (
        <div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Konfirmasi Hapus"
                message="Apakah Anda yakin ingin menghapus gambar ini? Tindakan ini tidak dapat diurungkan."
            />
            <h1 className="text-3xl font-bold mb-6">Manage Galeri</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Tambah Gambar Baru</h2>
                <form onSubmit={handleUpload}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                             <label className="block text-gray-700 text-sm font-medium mb-1">File Gambar</label>
                             <input 
                                id="galleryFile"
                                type="file"
                                accept="image/*"
                                onChange={e => e.target.files && setFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                        </div>
                        <div>
                             <label className="block text-gray-700 text-sm font-medium mb-1">Caption (Opsional)</label>
                             <input 
                                type="text" 
                                placeholder="Deskripsi singkat gambar..."
                                value={caption} 
                                onChange={e => setCaption(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                         <div>
                             <label className="block text-gray-700 text-sm font-medium mb-1">Kategori (Opsional)</label>
                             <input 
                                type="text" 
                                placeholder="Contoh: Lomba 17 Agustus" 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={uploading} className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                        {uploading ? <Spinner /> : 'Unggah Gambar'}
                    </button>
                </form>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map(image => (
                        <div key={image.id} className="relative bg-white rounded-lg shadow-md overflow-hidden group">
                            <img src={image.image_url} alt={image.caption || ''} className="w-full h-40 object-cover" />
                            <div className="p-3">
                                <p className="text-sm text-gray-600 truncate font-semibold">{image.caption || 'No caption'}</p>
                                <p className="text-xs text-blue-500 bg-blue-100 rounded-full px-2 py-1 inline-block mt-1">{image.category || 'Uncategorized'}</p>
                            </div>
                            <div className="absolute top-2 right-2">
                                <button onClick={() => handleDeleteClick(image.id, image.image_url)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageGalleryPage;