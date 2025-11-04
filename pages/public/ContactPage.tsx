import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import Spinner from '../../components/Spinner';

const ContactPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        const { error } = await supabase
            .from('feedback')
            .insert({ name, email, message });

        if (error) {
            setFeedback({ type: 'error', message: 'Terjadi kesalahan. Silakan coba lagi.' });
        } else {
            setFeedback({ type: 'success', message: 'Terima kasih! Pesan Anda telah terkirim.' });
            setName('');
            setEmail('');
            setMessage('');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Hubungi Kami</h1>
                    <p className="mt-4 text-lg text-gray-600">Punya pertanyaan, saran, atau masukan? Kami siap mendengarkan.</p>
                </div>

                <div className="max-w-2xl mx-auto bg-gray-50 p-8 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Alamat Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Pesan Anda</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {feedback && (
                            <div className={`p-4 rounded-md mb-4 text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {feedback.message}
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-blue-400"
                                disabled={loading}
                            >
                                {loading ? <Spinner /> : 'Kirim Pesan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
