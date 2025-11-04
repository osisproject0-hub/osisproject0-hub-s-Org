import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Post } from '../../types';
import Spinner from '../../components/Spinner';

const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasLiked, setHasLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setPost(data);
                setLikeCount(data.likes_count);
                const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
                if (likedPosts.includes(id)) {
                    setHasLiked(true);
                }
            }
            if (error) console.error("Error fetching post: ", error.message);
            setLoading(false);
        };
        fetchPost();
    }, [id]);

    const handleLike = async () => {
        if (!id || hasLiked) return;

        setHasLiked(true);
        setLikeCount(prev => prev + 1);

        const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
        localStorage.setItem('liked_posts', JSON.stringify([...likedPosts, id]));

        await supabase.rpc('increment_post_like', { post_id: id });
    };

    if (loading) return <div className="h-96 flex justify-center items-center"><Spinner /></div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <article>
                    <header className="mb-8">
                        <Link to="/blog" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Kembali ke Berita</Link>
                        {post.category && <p className="text-blue-600 font-semibold text-lg">{post.category}</p>}
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mt-2">{post.title}</h1>
                        <div className="mt-4 flex justify-between items-center text-lg text-gray-500">
                            <p>
                                Diposting oleh {post.author || 'Admin'} pada {new Date(post.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <div className="flex items-center">
                                 <button
                                    onClick={handleLike}
                                    disabled={hasLiked}
                                    className={`flex items-center space-x-2 text-gray-500 ${!hasLiked ? 'hover:text-red-500' : 'cursor-default'}`}
                                    aria-label="Sukai postingan ini"
                                >
                                    <i className={`fas fa-heart ${hasLiked ? 'text-red-500' : 'text-gray-400'}`}></i>
                                    <span className="font-semibold">{likeCount}</span>
                                </button>
                            </div>
                        </div>
                    </header>

                    <img 
                        src={post.image_url || 'https://picsum.photos/seed/postdetail/800/400'} 
                        alt={post.title} 
                        className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8"
                    />

                    <div className="prose prose-lg max-w-none text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>
                        {post.content}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default BlogPostPage;