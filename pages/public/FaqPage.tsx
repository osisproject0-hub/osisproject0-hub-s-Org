import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Faq } from '../../types';
import Spinner from '../../components/Spinner';

const FaqItem: React.FC<{ faq: Faq }> = ({ faq }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{faq.question}</span>
                <i className={`fas fa-chevron-down transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen mt-4' : 'max-h-0'}`}>
                <p className="text-gray-600 pl-2 border-l-2 border-blue-500">
                    {faq.answer}
                </p>
            </div>
        </div>
    );
};

const FaqPage: React.FC = () => {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) {
                setFaqs(data);
            }
            if (error) console.error("Error fetching FAQs: ", error.message);
            setLoading(false);
        };
        fetchFaqs();
    }, []);

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Pertanyaan yang Sering Diajukan (FAQ)</h1>
                    <p className="mt-4 text-lg text-gray-600">Temukan jawaban atas pertanyaan umum di sini.</p>
                </div>

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {faqs.length > 0 ? (
                            faqs.map(faq => <FaqItem key={faq.id} faq={faq} />)
                        ) : (
                            <div className="text-center bg-gray-50 p-10 rounded-lg">
                                <p className="text-gray-500">Belum ada pertanyaan yang ditambahkan.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaqPage;