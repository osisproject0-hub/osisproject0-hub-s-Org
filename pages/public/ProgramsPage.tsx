import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Program } from '../../types';
import Spinner from '../../components/Spinner';

const ProgramsPage: React.FC = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .order('date', { ascending: false });

            if (data) {
                setPrograms(data);
            }
            if(error) console.error("Error fetching programs: ", error.message);
            setLoading(false);
        };
        fetchPrograms();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Program Kerja OSIS</h1>
                    <p className="mt-4 text-lg text-gray-600">Inisiatif dan kegiatan yang kami selenggarakan untuk kemajuan siswa.</p>
                </div>

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map(program => (
                            <div key={program.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                <img 
                                    className="h-56 w-full object-cover" 
                                    src={program.image_url || 'https://picsum.photos/seed/program/400/300'} 
                                    alt={program.title}
                                />
                                <div className="p-6 flex-grow flex flex-col">
                                    <p className="text-sm text-blue-500 font-semibold">{new Date(program.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <h2 className="mt-2 text-xl font-bold text-gray-800">{program.title}</h2>
                                    <p className="mt-3 text-gray-600 flex-grow">{program.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgramsPage;