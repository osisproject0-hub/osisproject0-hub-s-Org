import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { Event } from '../../types';
import Spinner from '../../components/Spinner';

const RegistrationModal: React.FC<{
    event: Event;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ event, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: insertError } = await supabase
            .from('event_registrations')
            .insert({ event_id: event.id, name, class: studentClass, email });

        if (insertError) {
            setError('Gagal mendaftar. Silakan coba lagi.');
            console.error(insertError);
        } else {
            onSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2">Pendaftaran: {event.title}</h2>
                <p className="text-gray-600 mb-6">Silakan isi data diri Anda untuk mendaftar.</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nama Lengkap</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Kelas</label>
                        <input type="text" value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full p-2 border rounded" required placeholder="Contoh: XI TKJ 2"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? <Spinner /> : 'Daftar Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AgendaPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

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

    const handleRegistrationSuccess = () => {
        setSelectedEvent(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
    };

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

                {showSuccess && (
                     <div className="max-w-4xl mx-auto bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Pendaftaran Berhasil!</p>
                        <p>Terima kasih telah mendaftar. Informasi lebih lanjut akan kami kirimkan melalui email.</p>
                    </div>
                )}

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8">
                        {events.length > 0 ? events.map(event => (
                            <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="flex flex-col md:flex-row">
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
                                <div className="bg-gray-50 px-6 py-4">
                                    <button onClick={() => setSelectedEvent(event)} className="w-full md:w-auto bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300">
                                        <i className="fas fa-edit mr-2"></i>Daftar Acara Ini
                                    </button>
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
            {selectedEvent && (
                <RegistrationModal 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
};

export default AgendaPage;