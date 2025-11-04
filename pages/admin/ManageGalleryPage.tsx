import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { GalleryImage } from '../../types';
import Spinner from '../../components/Spinner';

const ManageGalleryPage: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [category, setCategory] = useState('');

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
        if (!imageUrl.trim()) {
            alert('Please provide an image URL.');
            return;
        }
        setUploading(true);

        const { error: insertError } = await supabase.from('gallery_images').insert({
            image_url: imageUrl,
            caption: caption || null,
            category: category || null
        });

        if (insertError) {
            alert('Error saving image data: ' + insertError.message);
        } else {
            setImageUrl('');
            setCaption('');
            setCategory('');
            fetchImages();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) alert('Error deleting image: ' + error.message);
            else fetchImages();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Galeri</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Image</h2>
                <form onSubmit={handleUpload}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input 
                            type="text"
                            placeholder="Image URL"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            className="col-span-1 md:col-span-2 p-2 border rounded"
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
                        <button type="submit" disabled={uploading} className="col-span-1 md:col-span-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 mt-2">
                            {uploading ? <Spinner /> : 'Add Image'}
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