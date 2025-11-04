import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { GalleryImage } from '../../types';
import Spinner from '../../components/Spinner';

const ManageGalleryPage: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
        if (data) setImages(data);
        if (error) console.error("Error fetching images:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }
        setUploading(true);

        const fileName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('gallery-images').upload(fileName, file);

        if (uploadError) {
            alert('Error uploading image: ' + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(uploadData.path);
        
        const { error: insertError } = await supabase.from('gallery_images').insert({
            image_url: publicUrl,
            caption: caption || null,
            category: category || null
        });

        if (insertError) {
            alert('Error saving image data: ' + insertError.message);
        } else {
            setCaption('');
            setCategory('');
            setFile(null);
            (document.getElementById('imageFile') as HTMLInputElement).value = '';
            fetchImages();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            const imageToDelete = images.find(img => img.id === id);
            if (imageToDelete) {
                const fileName = imageToDelete.image_url.split('/').pop();
                if (fileName) {
                    await supabase.storage.from('gallery-images').remove([fileName]);
                }
            }
            
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) alert('Error deleting image: ' + error.message);
            else fetchImages();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Galeri</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
                <form onSubmit={handleUpload}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input 
                            id="imageFile"
                            type="file" 
                            onChange={e => e.target.files && setFile(e.target.files[0])} 
                            className="col-span-1 p-2 border rounded" 
                            accept="image/*"
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Caption (optional)" 
                            value={caption} 
                            onChange={e => setCaption(e.target.value)}
                            className="col-span-1 p-2 border rounded"
                        />
                         <input 
                            type="text" 
                            placeholder="Kategori (e.g. Acara Sekolah)" 
                            value={category} 
                            onChange={e => setCategory(e.target.value)}
                            className="col-span-1 p-2 border rounded"
                        />
                        <button type="submit" disabled={uploading} className="col-span-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {uploading ? <Spinner /> : 'Upload'}
                        </button>
                    </div>
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
                                <button onClick={() => handleDelete(image.id)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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