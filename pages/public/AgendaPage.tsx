import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Event } from '../../types';
import Spinner from '../../components/Spinner';

const AgendaPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('start_time', { ascending: true });

            if (data) {
                setEvents(data);
            }
            if (error) console.error("Error fetching events: ", error.message);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Agenda Kegiatan</h1>
                    <p className="mt-4 text-lg text-gray-600">Jadwal acara dan kegiatan yang akan datang dari OSIS.</p>
                </div>

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {events.length > 0 ? events.map(event => (
                            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
                                <div className="md:w-1/4 bg-blue-500 text-white p-6 flex flex-col justify-center items-center text-center">
                                    <p className="text-5xl font-bold">{new Date(event.start_time).getDate()}</p>
                                    <p className="text-xl font-semibold uppercase">{new Date(event.start_time).toLocaleString('id-ID', { month: 'short' })}</p>
                                    <p className="text-sm">{new Date(event.start_time).getFullYear()}</p>
                                </div>
                                <div className="p-6 flex-grow">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
                                    <p className="text-md text-gray-600 mb-4">
                                        <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>
                                        {formatDate(event.start_time)}
                                    </p>
                                    <p className="text-gray-700">{event.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center bg-white p-10 rounded-lg shadow-md">
                                <h3 className="text-xl text-gray-700">Belum ada agenda kegiatan yang akan datang.</h3>
                                <p className="text-gray-500 mt-2">Silakan cek kembali nanti!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgendaPage;
