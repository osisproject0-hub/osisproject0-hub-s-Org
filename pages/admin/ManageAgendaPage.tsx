import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import type { Event, EventRegistration } from '../../types';
import Spinner from '../../components/Spinner';

const RegistrantsModal: React.FC<{
    event: Event;
    onClose: () => void;
}> = ({ event, onClose }) => {
    const [registrants, setRegistrants] = useState<EventRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrants = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', event.id)
                .order('created_at', { ascending: true });
            
            if (data) setRegistrants(data);
            if(error) console.error("Error fetching registrants: ", error);
            setLoading(false);
        };
        fetchRegistrants();
    }, [event.id]);

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4">Pendaftar untuk: {event.title}</h2>
                <div className="flex-grow overflow-y-auto">
                {loading ? <Spinner /> : (
                    registrants.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registrants.map(reg => (
                                    <tr key={reg.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{reg.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{reg.class}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{reg.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-10">Belum ada pendaftar untuk acara ini.</p>
                    )
                )}
                </div>
                <div className="text-right mt-6 border-t pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Tutup</button>
                </div>
            </div>
        </div>
    );
};

// Event Form Component
const EventForm: React.FC<{
    event: Partial<Event> | null;
    onSave: (event: Partial<Event>) => void;
    onCancel: () => void;
    loading: boolean;
}> = ({ event, onSave, onCancel, loading }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');
    const [startTime, setStartTime] = useState(event?.start_time ? event.start_time.substring(0, 16) : '');
    const [endTime, setEndTime] = useState(event?.end_time ? event.end_time.substring(0, 16) : '');


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: event?.id, title, description, start_time: startTime, end_time: endTime });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{event?.id ? 'Edit Agenda' : 'Buat Agenda Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Judul Acara</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700">Waktu Mulai</label>
                            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border rounded" required />
                        </div>
                        <div>
                            <label className="block text-gray-700">Waktu Selesai (Opsional)</label>
                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Deskripsi</label>
                        <textarea value={description || ''} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded h-32" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Batal</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? <Spinner /> : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManageAgendaPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
    const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('events').select('*').order('start_time', { ascending: false });
        if (data) setEvents(data);
        if (error) console.error("Error fetching events:", error);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSave = async (event: Partial<Event>) => {
        setFormLoading(true);
        const eventData = {
            title: event.title,
            description: event.description || null,
            start_time: event.start_time,
            end_time: event.end_time || null
        }
        
        if (event.id) {
            const { error } = await supabase.from('events').update(eventData).eq('id', event.id);
            if (error) alert('Error updating event: ' + error.message);
        } else {
            const { error } = await supabase.from('events').insert(eventData);
            if (error) alert('Error creating event: ' + error.message);
        }
        
        setFormLoading(false);
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Anda yakin ingin menghapus agenda ini? Semua data pendaftaran terkait akan terhapus.')) {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) alert('Error deleting event: ' + error.message);
            else fetchEvents();
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Agenda</h1>
                <button onClick={() => { setEditingEvent(null); setShowForm(true); }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    Buat Agenda Baru
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Mulai</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {events.map(event => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(event.start_time).toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setViewingEvent(event)} className="text-green-600 hover:text-green-900 mr-4">Lihat Pendaftar</button>
                                        <button onClick={() => { setEditingEvent(event); setShowForm(true); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showForm && <EventForm event={editingEvent} onSave={handleSave} onCancel={() => setShowForm(false)} loading={formLoading}/>}
            {viewingEvent && <RegistrantsModal event={viewingEvent} onClose={() => setViewingEvent(null)} />}
        </div>
    );
};

export default ManageAgendaPage;