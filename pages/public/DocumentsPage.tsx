import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Document } from '../../types';
import Spinner from '../../components/Spinner';

const DocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setDocuments(data);
            }
            if (error) console.error("Error fetching documents: ", error.message);
            setLoading(false);
        };
        fetchDocuments();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Dokumen & Unduhan</h1>
                    <p className="mt-4 text-lg text-gray-600">Temukan dan unduh dokumen-dokumen penting yang kami sediakan.</p>
                </div>

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                        <ul className="divide-y divide-gray-200">
                            {documents.length > 0 ? documents.map(doc => (
                                <li key={doc.id} className="py-4 flex items-center justify-between">
                                    <div className="flex-grow">
                                        <h2 className="text-lg font-semibold text-gray-800">{doc.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">{doc.description || 'Tidak ada deskripsi.'}</p>
                                    </div>
                                    <a 
                                        href={doc.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="ml-4 flex-shrink-0 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        <i className="fas fa-download mr-2"></i>
                                        Unduh
                                    </a>
                                </li>
                            )) : (
                                <li className="text-center py-10">
                                    <p className="text-gray-500">Belum ada dokumen yang tersedia.</p>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentsPage;