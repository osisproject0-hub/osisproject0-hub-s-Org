import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Post } from '../../types';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostsAndCategories = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setPosts(data);
                const uniqueCategories = ['All', ...Array.from(new Set(data.map(post => post.category).filter(Boolean) as string[]))];
                setCategories(uniqueCategories);
            }
             if(error) console.error("Error fetching posts: ", error.message);
            setLoading(false);
        };
        fetchPostsAndCategories();
    }, []);

    const filteredPosts = activeCategory === 'All'
        ? posts
        : posts.filter(post => post.category === activeCategory);

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Berita & Artikel</h1>
                    <p className="mt-4 text-lg text-gray-600">Ikuti perkembangan dan kegiatan terbaru dari OSIS kami.</p>
                </div>
                
                <div className="flex justify-center flex-wrap gap-2 mb-10">
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${activeCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                         Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg shadow-lg overflow-hidden flex flex-col">
                                <SkeletonLoader className="h-56 w-full" />
                                <div className="p-6 flex-grow">
                                    <SkeletonLoader className="h-4 w-1/4 mb-4" />
                                    <SkeletonLoader className="h-6 w-full mb-2" />
                                    <SkeletonLoader className="h-4 w-1/2 mb-4" />
                                    <SkeletonLoader className="h-4 w-full mb-2" />
                                    <SkeletonLoader className="h-4 w-3/4 mb-4" />
                                    <SkeletonLoader className="h-5 w-1/3" />
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredPosts.map(post => (
                             <div key={post.id} className="bg-gray-50 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
                                <Link to={`/blog/${post.id}`}>
                                  <img className="h-56 w-full object-cover" src={post.image_url || 'https://picsum.photos/seed/blog/400/300'} alt={post.title} />
                                </Link>
                                <div className="p-6 flex-grow flex flex-col">
                                    {post.category && <span className="text-sm font-semibold text-blue-600 mb-2">{post.category}</span>}
                                    <h3 className="font-bold text-xl mb-2 text-gray-800">{post.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                      Oleh {post.author || 'Admin'} &bull; {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-700 text-base line-clamp-4 flex-grow">{post.content}</p>
                                    <Link to={`/blog/${post.id}`} className="text-blue-500 hover:text-blue-700 font-semibold mt-4 inline-block self-start">
                                        Baca Selengkapnya &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;