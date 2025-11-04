import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { GalleryImage } from '../../types';
import Spinner from '../../components/Spinner';

const GalleryPage: React.FC = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    useEffect(() => {
        const fetchImagesAndCategories = async () => {
            setLoading(true);
            
            let query = supabase.from('gallery_images').select('*').order('created_at', { ascending: false });
            
            const { data, error } = await query;

            if (data) {
                setImages(data);
                const uniqueCategories = ['All', ...Array.from(new Set(data.map(img => img.category).filter(Boolean) as string[]))];
                setCategories(uniqueCategories);
            }
            if (error) console.error("Error fetching images: ", error.message);
            setLoading(false);
        };
        fetchImagesAndCategories();
    }, []);

    const filteredImages = activeCategory === 'All' 
        ? images 
        : images.filter(image => image.category === activeCategory);
    
    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Galeri Kegiatan</h1>
                    <p className="mt-4 text-lg text-gray-600">Momen-momen berharga yang terekam dalam kegiatan kami.</p>
                </div>

                <div className="flex justify-center flex-wrap gap-2 mb-10">
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {loading ? <Spinner /> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => (
                            <div key={image.id} className="group relative cursor-pointer overflow-hidden rounded-lg" onClick={() => setSelectedImage(image)}>
                                <img 
                                    src={image.image_url} 
                                    alt={image.caption || 'Gallery image'}
                                    className="w-full h-full object-cover rounded-lg shadow-md aspect-square transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end p-4">
                                  <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm line-clamp-2">{image.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute -top-10 -right-2 md:-top-4 md:-right-10 bg-white text-black rounded-full h-8 w-8 flex items-center justify-center text-2xl z-10">&times;</button>
                        <img src={selectedImage.image_url} alt={selectedImage.caption || 'Enlarged view'} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"/>
                        {selectedImage.caption && <p className="text-white text-center mt-4 bg-black/50 p-2 rounded-md">{selectedImage.caption}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;