import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import type { Post, Program } from '../../types';
import Spinner from '../../components/Spinner';

const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [posts, setPosts] = useState<Post[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // Search in posts
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*')
                .or(`title.ilike.%${query}%,content.ilike.%${query}%`);
            
            if (postData) setPosts(postData);
            if (postError) console.error("Error searching posts:", postError);

            // Search in programs
            const { data: programData, error: programError } = await supabase
                .from('programs')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
                
            if (programData) setPrograms(programData);
            if (programError) console.error("Error searching programs:", programError);

            setLoading(false);
        };

        performSearch();
    }, [query]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Hasil Pencarian untuk: <span className="text-blue-600">"{query}"</span>
                </h1>
                <p className="text-gray-600 mb-8">
                    Ditemukan {posts.length + programs.length} hasil.
                </p>

                {loading ? <Spinner /> : (
                    <div>
                        {/* Posts Results */}
                        {posts.length > 0 && (
                            <section className="mb-12">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Berita & Artikel</h2>
                                <div className="space-y-6">
                                    {posts.map(post => (
                                        <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <Link to={`/blog/${post.id}`}>
                                                <h3 className="text-xl font-bold text-blue-700 hover:underline">{post.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-700 mt-2 line-clamp-2">{post.content}</p>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Programs Results */}
                        {programs.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">Program Kerja</h2>
                                <div className="space-y-6">
                                    {programs.map(program => (
                                         <div key={program.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <h3 className="text-xl font-bold text-gray-800">{program.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(program.date).toLocaleDateString()}
                                            </p>
                                            <p className="text-gray-700 mt-2 line-clamp-2">{program.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {posts.length === 0 && programs.length === 0 && (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                                <p className="text-xl text-gray-700">Tidak ada hasil yang ditemukan.</p>
                                <p className="text-gray-500 mt-2">Coba gunakan kata kunci yang berbeda.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;