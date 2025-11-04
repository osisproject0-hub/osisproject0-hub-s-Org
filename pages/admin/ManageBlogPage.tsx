import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Post } from '../../types';
import Spinner from '../../components/Spinner';

// Define PostForm outside to prevent re-declaration on every render
const PostForm: React.FC<{
    post: Partial<Post> | null;
    onSave: (post: Partial<Post>, file: File | null) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ post, onSave, onCancel, loading }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [author, setAuthor] = useState(post?.author || 'Admin');
    const [category, setCategory] = useState(post?.category || '');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: post?.id, title, content, author, category }, imageFile);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{post?.id ? 'Edit Post' : 'Create Post'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Author</label>
                            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                         <div>
                            <label className="block text-gray-700">Category</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Akademik" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Content</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded h-40" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Image</label>
                        <input type="file" onChange={e => e.target.files && setImageFile(e.target.files[0])} className="w-full p-2 border rounded" accept="image/*" />
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

const ManageBlogPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (data) setPosts(data);
        if (error) console.error("Error fetching posts:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSave = async (post: Partial<Post>, file: File | null) => {
        setFormLoading(true);
        let imageUrl = post.image_url || null;

        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('post-images').upload(fileName, file);
            if (uploadError) {
                alert('Error uploading image: ' + uploadError.message);
                setFormLoading(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(uploadData.path);
            imageUrl = publicUrl;
        }

        const postData = { ...post, image_url: imageUrl };

        if (post.id) {
            const { error } = await supabase.from('posts').update(postData).eq('id', post.id);
            if (error) alert('Error updating post: ' + error.message);
        } else {
            const { error } = await supabase.from('posts').insert(postData);
            if (error) alert('Error creating post: ' + error.message);
        }
        
        setFormLoading(false);
        setShowForm(false);
        setEditingPost(null);
        fetchPosts();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) alert('Error deleting post: ' + error.message);
            else fetchPosts();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Berita</h1>
                <button onClick={() => { setEditingPost(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Create New Post
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {posts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => { setEditingPost(post); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <PostForm post={editingPost} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
        </div>
    );
};

export default ManageBlogPage;